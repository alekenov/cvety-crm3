"""
FastAPI router patch for /api/v2/products to support shop filtering and enrich detail with shopId.

Drop this file into your backend codebase and include the router:

    from fastapi import FastAPI
    from products_router import router as products_router

    app = FastAPI()
    app.include_router(products_router, prefix="/api/v2")

Assumptions:
- You already have internal services to fetch products ("new" API shape).
- As a safe fallback, we can use the legacy endpoint /api/v2/product/list/ to get shopId per product.
  This keeps behavior consistent with existing production while enabling shop filtering.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException
import os
import httpx

router = APIRouter()

CVETY_API_BASE = os.getenv("CVETY_API_BASE", "https://cvety.kz")
CVETY_API_TOKEN = os.getenv("CVETY_API_TOKEN", "")


async def get_legacy_products(
    *,
    ptype: Optional[str] = None,
    limit: int = 100,
    product_id: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """Fetch legacy products from /api/v2/product/list/ (Bitrix-backed).
    Returns items with fields including `shopId`, `created_at`, etc.
    """
    params = {
        "access_token": CVETY_API_TOKEN,
        "limit": limit,
    }
    if ptype:
        params["type"] = ptype
    if product_id:
        params["id"] = product_id

    url = f"{CVETY_API_BASE}/api/v2/product/list/"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url, params=params)
        res.raise_for_status()
        data = res.json()
        if not data or data.get("status") is not True:
            return []
        return data.get("data", {}).get("items", [])


def build_success(data: Any, pagination: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return {"success": True, "data": data, **({"pagination": pagination} if pagination else {})}


@router.get("/products")
async def list_products(
    type: Optional[str] = Query(None, regex="^(vitrina|catalog)$"),
    isAvailable: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0,
    shop_id: Optional[int] = Query(None, description="Filter by shop ID"),
    ownerId: Optional[int] = Query(None, description="Alias for shop/owner filter (kept for compatibility)"),
) -> Dict[str, Any]:
    """List products with optional filtering by shop.
    If `shop_id` (or `ownerId`) is provided, we filter the result server-side.
    """
    # 1) Fetch from your primary source (replace with your service/db call)
    # Here we call the same public endpoint to demonstrate shape.
    params = {"access_token": CVETY_API_TOKEN, "limit": limit, "offset": offset}
    if type:
        params["type"] = type
    if isAvailable is not None:
        params["isAvailable"] = str(isAvailable).lower()

    url = f"{CVETY_API_BASE}/api/v2/products"
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url, params=params)
        res.raise_for_status()
        payload = res.json()
        if not payload or not payload.get("success"):
            raise HTTPException(status_code=502, detail="Upstream products error")

    products: List[Dict[str, Any]] = payload.get("data", [])

    # 2) If shop filter set, narrow by shop using legacy list to get shopId map
    effective_shop = shop_id or ownerId
    if effective_shop is not None and products:
        # Bulk legacy fetch to build id->shopId map
        legacy_items = await get_legacy_products(ptype=type or "catalog", limit=max(limit, 100))
        id_to_shop: Dict[int, int] = {int(item["id"]): int(item.get("shopId")) for item in legacy_items if item.get("shopId") is not None}

        # Some items may not be in the first page; fetch by id selectively
        missing_ids = [p["id"] for p in products if p["id"] not in id_to_shop]
        if missing_ids:
            # Fetch individually (batched) to enrich mapping
            for pid in missing_ids[:50]:  # cap to avoid excess calls
                byid = await get_legacy_products(ptype=type or "catalog", limit=1, product_id=pid)
                if byid:
                    id_to_shop[int(byid[0]["id"])] = int(byid[0].get("shopId")) if byid[0].get("shopId") is not None else None

        # Filter products and attach shopId for transparency
        filtered: List[Dict[str, Any]] = []
        for p in products:
            sid = id_to_shop.get(int(p["id"]))
            if sid is None:
                continue  # skip unknown shop
            if sid == effective_shop:
                p = dict(p)
                p["shopId"] = sid
                filtered.append(p)

        products = filtered

    pagination = payload.get("pagination") or {"total": len(products), "limit": limit, "offset": offset, "hasMore": False}
    return build_success(products, pagination)


@router.get("/products/detail")
async def product_detail(id: int) -> Dict[str, Any]:
    """Return product detail and enrich with shopId from legacy.
    """
    # 1) Fetch detail from primary source
    url = f"{CVETY_API_BASE}/api/v2/products/detail"
    params = {"access_token": CVETY_API_TOKEN, "id": id}
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        res = await client.get(url, params=params)
        res.raise_for_status()
        payload = res.json()
        if not payload or not payload.get("success"):
            raise HTTPException(status_code=404, detail="Product not found")

    data = payload.get("data") or {}

    # 2) Enrich with shopId from legacy
    legacy = await get_legacy_products(ptype=data.get("type") or "catalog", limit=1, product_id=id)
    if legacy:
        sid = legacy[0].get("shopId")
        if sid is not None:
            data["shopId"] = int(sid)

    return build_success(data)

