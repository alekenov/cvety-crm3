<?php if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) {
    die();
}

use Crm\Florist;
use Crm\Helper;
use Crm\Product;
use Crm\ProductNew;

class ProductListNew
    extends \ControllerableComponent
{
    public function configureActions()
    {
        return [
            'getList' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'getDetail' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'add' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'addToFavorite' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'removeFromFavorite' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'addAdditional' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'editAdditional' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'edit' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'remove' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'removeOffer' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'setInStock' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'unsetInStock' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'addOffer' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'editOffer' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'addOfferNew' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'editOfferNew' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'addSimpleProduct' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'searchProductsForUnion' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'saveUnionProducts' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'getUnionProducts' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'setFreeDelivery' =>
            [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'changeTopProduct' =>
            [
                'prefilters' => [],
                'postfilters' => [],
            ],
            'loadOldUnion' => [
                'prefilters' => [],
                'postfilters' => [],
            ],
        ];
    }

    public function loadOldUnionAction()
    {
        $shopId = \Crm\Shops::getShopId();

        $result = \Orm\UnionProductsTable::getItemsShop($shopId);


        return [
            'unions' => array_values($result),
        ];
    }


    public function getListAction($offset, $params = [])
    {
        Product::setProductListFilter($params);

        return $this->getProducts($offset, Product::getProductListFilter(),$params['shopId']);
    }

    /**
     * Для params доступны следующие значения:
     *      $params[phrase]
     *      $params[productId]
     *
     * @param array $params
     */
    public function searchProductsForUnionAction($params = [])
    {
        $filter = [
            '=IBLOCK_ID' => IBLOCK_ID_CATALOG,
            '=ID' => $params['productId'],
        ];
        $select = [
            'IBLOCK_SECTION_ID',
            'PROPERTY_SELLER',
        ];
        $item = CIBlockElement::GetList([], $filter, false, ['nTopCount' => 1], $select)->fetch();

        $filter = [
            'search' => $params['phrase'],
        ];

        if ($sectionId = $item['IBLOCK_SECTION_ID']) {
            $filter['sectionIds'] = [$sectionId];
        }

        if ($shopId = $item['PROPERTY_SELLER_VALUE']) {
            $filter['shopId'] = $shopId;
        } else {
            $filter['shopId'] = \Crm\Shops::getShopId();
        }

        if (!$filter['shopId']) {
            $filter['shopId'] = 17008;
        }

        $iterator = CIBlockElement::GetList(
            [],
            [
                '%NAME' => $filter['search'],
                '=ACTIVE' => 'Y',
                '=IBLOCK_ID' => IBLOCK_ID_CATALOG,
                '=PROPERTY_SELLER' => $filter['shopId'],
                '=PROPERTY_IS_REMOVED' => [0, false],
            ],
            false,
            false,
            [
                'ID',
                'NAME',
                'PREVIEW_PICTURE',
            ]
        );

        $arResult = [];
        $arFileIdsMap = [];
        while ($item = $iterator->fetch()) {
            $arResult[$item['ID']] = [
                'id' => (int)$item['ID'],
                'name' => htmlspecialchars_decode($item['NAME']),
                'image' => '',
            ];

            if ($fileId = $item['PREVIEW_PICTURE']) {
                $arFileIdsMap[$item['ID']] = $fileId;
            }
        }

        if ($arFileIdsMap) {
            $images = get_images($arFileIdsMap);

            foreach ($arFileIdsMap as $id => $fileId) {
                if ($src = $images[$fileId]) {
                    $arResult[$id]['image'] = $src;
                }
            }
        }

        return [
            'items' => array_values($arResult),
        ];
    }

    public function getUnionProductsAction($productId)
    {
        return [
            'items' => ProductNew::getUnionProducts($productId),
        ];
    }

    public function saveUnionProductsAction($productId,$union,$titleUnion,$unionId)
    {
        $shopId = \Crm\Shops::getShopId();
      /*  foreach ($items as $item)
        {
            if($item['id'] === 'new')
            {
                $result = \Orm\UnionProductsTable::addUnion($item['products'],$shopId);
            }
            else
            {
                $result = \Orm\UnionProductsTable::saveUnion($item['id'],$item['products']);
            }
        }*/
        $p = [
            'products' => json_decode($union, true),
            'unionId' => $unionId,
            'title' => $titleUnion,
            'id' => $productId
        ];

        if (is_array($p['products']) && count($p['products']) > 0) {
            \Orm\UnionProductsTable::addUnionProduct($p['id'], $p['products'], $p['unionId'], $p['title']);
        } else {
            \Orm\UnionProductsTable::removeProduct($p['id']);
        }



        \CBitrixComponent::clearComponentCache('bitrix:catalog.element');
    }

    public function getDetailAction($id)
    {
        return ProductNew::getDetail($id);
    }

    public function addAction()
    {
        $request = $this->request;
        $files = $this->request->getFileList()->toArray();

        $params = [
            'name'        => $request['name'],
            'price'       => $request['price'],
            'quantity'    => $request['quantity'],
            'percent'     => $request['percent'],
            'description' => $request['description'],
            'images'      => explodeFiles($files['images']),
            'sectionId'   => $request['sectionId'],
            'user_id'     => cur_user_id(),
            'properties'  => $request['prop'],
            'files'       => $files,
            'colorsVariant' => $request['colorsVariant'],
            'bigCard' => $request['bigCard']
        ];

        if (Florist::isAdmin()) {
            $params['shopId'] = $request['shopId'];
        }

        if (isset($request['consist'])) {
            $params['consist'] = json_decode($request['consist'], true);
        }

        $result = ProductNew::add($params);

        if (!$result->isSuccess()) {
            $this->addErrors($result->getErrors());

            return false;
        }
        else {
            $id = $result->getId();

            return $this->getDetailAction($id);
        }
    }

    public function addToFavoriteAction($id)
    {
        $this->setFromResult(ProductNew::addToFavorite($id));
    }

    public function removeFromFavoriteAction($id)
    {
        $this->setFromResult(ProductNew::removeFromFavorite($id));
    }

    public function addAdditionalAction()
    {
        $params = [
            'name'     => $this->request->get('name'),
            'price'    => $this->request->get('price'),
            'sort'     => $this->request->get('sort'),
            'discount' => $this->request->get('discount'),
            'image'    => $this->request->getFile('image'),
        ];

        if (Florist::isAdmin()) {
            $params['shopId'] = $this->request['shopId'];
        }

        $result = ProductNew::addAdditional($params);

        if (!$result->isSuccess()) {
            $this->addErrors($result->getErrors());

            return false;
        }
    }

    public function editAdditionalAction()
    {
        $params = [
            'id'       => $this->request->get('id'),
            'name'     => $this->request->get('name'),
            'price'    => $this->request->get('price'),
            'sort'     => $this->request->get('sort'),
            'discount' => $this->request->get('discount'),
        ];
        if ($image = $this->request->getFile('image')) {
            $params['image'] = $image;
        }

        if ($delImageId = $this->request->get('image')) {
            $params['delImage'] = $delImageId;
        }

        if (Florist::isAdmin()) {
            $params['shopId'] = $this->request['shopId'];
        }

        $result = ProductNew::updateAdditional($params);
        if (!$result->isSuccess()) {
            $this->addErrors($result->getErrors());

            return false;
        }
    }

    public function editAction()
    {
        $request = $this->request;
        $files = $this->request->getFileList()->toArray();

        $params = [
            'id'          => $request['id'],
            'name'        => $request['name'],
            'isActive'    => $request['isActive'] == 'Y',
            'price'       => $request['price'],
            'description' => $request['description'],
            'images'      => explodeFiles($files['images']),
            'delImages'   => (array)$request['delImages'],
            'sectionId'   => $request['sectionId'],
            'images_sort' => $request['images_sort'],
            'properties'  => $request['prop'],
            'files'       => $files,
            'quantity'    => $request['quantity'],
            'percent'     => $request['percent'],
            'isBouquetsGroup' => $request['isBouquetsGroup'],
            'priceGroup' => $request['priceGroup'],
            'countGroup' => $request['countGroup'],
            'colorsVariant' => $request['colorsVariant'],
            'bigCard' => $request['bigCard']
        ];

        if (isset($request['consist'])) {
            $params['consist'] = json_decode($request['consist'], true);
        }

        if (Florist::isAdmin() && $request['shopId']) {
            $params['shopId'] = $request['shopId'];
        }

        $result = ProductNew::update($params);

        if (!$result->isSuccess()) {
            $this->addErrors($result->getErrors());

            return false;
        }
        else {
            return $this->getDetailAction($params['id']);
        }
    }

    public function removeAction($id)
    {
        ProductNew::delete($id);
    }

    public function removeOfferAction($id, $productId)
    {
        ProductNew::delete($id);

        return $this->getDetailAction($productId);
    }

    public function setInStockAction($productId)
    {
        Product::setInStock($productId);
        if (Product::isProductShopActivated($productId)) {
            Product::activate($productId);
        }
    }


    public function setFreeDeliveryAction($productId,$checked)
    {
        $checked = parse_bool($checked);

        Product::freeDeilvery($productId,$checked);
    }

    public function changeTopProductAction($productId,$checked)
    {
        $checked = parse_bool($checked);

        Product::changeTopProduct($productId,$checked);
    }

    public function unsetInStockAction($productId)
    {
        Product::unsetInStock($productId);
    }

    public function addOfferNewAction()
    {
        $request = $this->request->toArray();
        $files = $this->request->getFileList()->toArray();

        $params = [
            'name' => $request['name'],
            'price' => $request['price'],
            'productId' => $request['productId'],
            'images' => explodeFiles($files['images']),
            'properties' => $request['prop'],
            'files' => $files,
        ];

        if (isset($request['consist'])) {
            $params['consist'] = json_decode($request['consist'], true);
        }

        $result = ProductNew::addOffer($params);

        if ($result->isSuccess()) {
            return $this->getDetailAction($request['productId']);
        }

        $this->addErrors($result->getErrors());
    }

    public function editOfferNewAction()
    {
        $request = $this->request->toArray();
        $files = $this->request->getFileList()->toArray();

        $params = [
            'id' => $request['id'],
            'name' => $request['name'],
            'price' => $request['price'],
            'images' => explodeFiles($files['images']),
            'delImages'   => (array)$request['images'],
            'productId' => $request['productId'],
            'properties' => $request['prop'],
            'files' => $files,
        ];

        if (isset($request['consist'])) {
            $params['consist'] = json_decode($request['consist'], true);
        }

        $result = ProductNew::updateOffer($params);
        if ($result->isSuccess()) {
            return $this->getDetailAction($params['productId']);
        }
        $this->addErrors($result->getErrors());
    }

    public function addOfferAction()
    {
        $request = $this->request->toArray();
        $files = explodeFiles($this->request->getFileList()->toArray()['image']);
        $params = [
            'name'      => $request['name'],
            'price'     => $request['price'],
            'productId' => $request['productId'],
            'type'      => $request['typeBouquet'],
            'count'     => $request['quantityFlower'],
            'images'    => $files,
            'consist'   => json_decode($request['consist'], true),
        ];

        $result = Product::addOffer($params);
        if ($result->isSuccess() === false) {
            $this->addErrors($result->getErrors());

            return false;
        }

        $product = $this->getDetailAction($request['productId']);

        $product['lastOfferId'] = $result->getId();

        return $product;
    }

    public function editOfferAction()
    {
        $request = $this->request->toArray();
        $files = explodeFiles($this->request->getFileList()->toArray()['image']);

        $params = [
            'id'        => $request['id'],
            'name'      => $request['name'],
            'price'     => $request['price'],
            'type'      => $request['typeBouquet'],
            'count'     => $request['quantityFlower'],
            'images'    => $files,
            'delImages' => json_decode($request['delImages'], true),
            'consist'   => json_decode($request['consist'], true),
        ];

        $result = Product::updateOffer($params);
        if ($result->isSuccess() === false) {
            $this->addErrors($result->getErrors());
        }

        $product = $this->getDetailAction($request['productId']);
        $product['$params'] = $params;

        return $product;
    }

    public function addSimpleProductAction()
    {
        $fields = [
            'name' => $this->request['name'],
            // 'discount' => $this->request['discount'],
            'cityId' => $this->request['cityId'],
            'images' => explodeFiles($this->request->getFile('images')),
            'price' => $this->request['price'],
            'names' => json_decode($this->request->get('names') ? : '[]', true),
            'occasion' => json_decode($this->request->get('occasion') ? : '[]', true),
            'checkName' => true,
        ];
        if ($consist = $this->request['consist']) {
            $fields['consist'] = json_decode($consist, true);
        }

        if ($video = $this->request->getFile('video')) {
            $fields['video'] = $video;
        }

        if (Florist::isAdmin()) {
            if ($userId = $this->request['userId']) {
                $fields['userId'] = $userId;
            }
        }

        $result = Product::addSimple($fields);
        if (!$result->isSuccess()) {
            $this->addErrors($result->getErrors());
        }

        return [$fields, $result->getData()];
    }

    /**
     * @param int   $offset
     * @param array $params
     * @var int     $params ['shopId']
     * @var string  $params ['search']
     * @var string  $params ['sectionIds']
     * @var string  $params ['inStock']
     *
     * @return array
     */
    protected function getProducts($offset = 1, $params = [],$shopId = false)
    {
        global $USER;

        $getListParams = [
            'userId' => $USER->GetId(),
            'limit'  => 20,
            'offset' => (int)$offset,
            'search' => $params['search'],
        ];


        if ((Florist::isAdmin() || Florist::isCvetyMainFlorist()) && $params['shopId']) {
            $getListParams['shopId'] = $params['shopId'];

            if($shopId)
            {
                $getListParams['shopId'] = $shopId;
            }
        }
        else {
            $getListParams['shopId'] = \Crm\Shops::getShopId();
        }


        if ($params['sectionIds']) {

            foreach ($params['sectionIds'] as $id => $sectionId) {
                if(!in_array($sectionId, ['10','14','19','21','35','72'])) {
                    unset($params['sectionIds'][$id]);
                }
            }

            if($params['sectionIds'])
            {
                $getListParams['sectionIds'] = $params['sectionIds'];
            }
        }
        if ($params['inStock']) {
            $getListParams['inStock'] = $params['inStock'];
        }
        $result = ProductNew::getList($getListParams);

        $result['params'] = $getListParams;

        return $result;
    }

    protected function prepareResult()
    {
        global $USER;
        $userId = $USER->GetId();

        $info = $this->getProducts(1, Product::getProductListFilter());

        $partners = [];
        if (Florist::isAdmin()) {
            $current = ['id' => (int) $userId, 'name' => 'Текущий пользователь'];

            $partners = array_merge([$current], Florist::getShortList());
        }

        $sections = ProductNew::getIElementGroupedProperties(IBLOCK_ID_CATALOG);
		$sections = array_map(function($sect) {
            if ($sect['id'] == 10) {
                $sect['name'] = 'Цветы';
            }

            return $sect;
        }, $sections);

        $offersSections = ProductNew::getIElementGroupedProperties(IBLOCK_ID_CATALOG_OFFERS);
        foreach ($sections['sectionProperties'] as $index => $section) {
            if ($section['id'] == 10) {
                $sections['sectionProperties'][$index]['name'] = 'Цветы';
            } else if ($section['id'] == 73) {
                $sections['sectionProperties'][$index]['name'] = 'Доп. товары';
            }
            $sections['sectionProperties'][$index]['offersProperties'] = $offersSections['sectionProperties'][$index]['properties'];
        }

        $sections['grouped'] = array_map(function ($section) {
            if ($section['id'] == 10) {
                $section['name'] = 'Цветы';
            } else if ($section['id'] == 73) {
                $section['name'] = 'Доп. товары';
            }

            return $section;
        }, $sections['grouped']);


        $this->arResult = [
            'sections' => $sections['sectionProperties'],
            'grouped' => $sections['grouped'],
            'products' => $info['products'],
            'cities' => (array)\Crm\Shops::getById(\Crm\Shops::getShopId())['cities'],
            'occasions' => \Crm\Internals\OccasionTable::getActiveOptions(),
            'pageNav' => $info['pageNav'],
            'typeBouquets' => Helper::getBouquetTypes(),
            'quantityFlowers' => Helper::getOfferFlowersCount(),
            'shopFrontUrl' => \Crm\ShopFront::getUrl($userId),
            'partners' => $partners,
            'isAdmin' => Florist::isAdmin(),
            'floristCvetykz' => \Crm\Shops::getShopId() == 17008 ,//Florist::isCvetyMainFlorist(),
            'shops' => \Crm\Shops::getShops(true),
            'selectedShop' => \Crm\Shops::getMainShopId(),
            'filter' => Product::getProductListFilter(),
            'hasProducts' => ProductNew::hasProducts(),
            'shopId' => \Crm\Shops::getShopId()
        ];
    }

    public function executeComponent()
    {
        $this->prepareResult();

        $this->includeComponentTemplate();
    }
}