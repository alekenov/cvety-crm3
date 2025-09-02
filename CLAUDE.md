# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CRM3 is a React-based customer relationship management system for cvety.kz (a flower delivery service in Kazakhstan). The application manages products (vitrina and catalog types), orders, and inventory for the flower shop business.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Install dependencies
npm install
```

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM v7
- **State**: useState/useEffect patterns (no external state management)
- **API**: Custom fetch wrapper with cvety.kz backend integration
- **Build**: Vite with code splitting and optimization

### Directory Structure

```
src/
├── api/              # API integration layer
│   ├── client.ts     # HTTP client with auth
│   ├── config.ts     # API configuration  
│   ├── products.ts   # Product API methods
│   └── orders.ts     # Order API methods
├── components/       # React components
│   ├── ui/           # shadcn/ui components
│   └── [business]    # Business logic components
├── pages/            # Page-level components (lazy-loaded)
└── assets/           # Static images (Figma exports)
```

### API Integration

The app integrates with cvety.kz FastAPI backend through:
- Proxy configuration in vite.config.ts (`/api` → `https://cvety.kz`)
- Authentication via `access_token` query parameter
- Custom API client with error handling and JSON parsing

### Key Data Models

**Product Types:**
- `vitrina`: Simple products with image, dimensions (width/height), price
- `catalog`: Complex products with multiple images/videos, composition, colors, production time

**Order Statuses:**
- `new` → `paid` → `accepted` → `assembled` → `in-transit` → `completed`

### Component Patterns

1. **Page Components**: Lazy-loaded in `/pages/` directory
2. **Business Components**: Domain-specific logic in `/components/`
3. **UI Components**: Reusable shadcn/ui components in `/components/ui/`
4. **Form Handling**: React Hook Form with TypeScript validation
5. **Image Handling**: Custom ImageUploader with preview and Figma asset integration

### Navigation Structure

- Main tab interface with Products/Orders/Inventory sections
- Nested routing for CRUD operations
- Screen state management via URL routing
- Breadcrumb navigation patterns

### Build Configuration

- **Code Splitting**: Vendor chunks (React, Radix UI, Lucide icons)
- **Asset Optimization**: Image assets from Figma with aliases
- **Development**: Hot reload, proxy to production API
- **Production**: Tree-shaking, console.log removal

## Key Implementation Notes

### API Authentication
All API calls include `access_token` query parameter from environment variable `VITE_API_TOKEN`.

### Image Management
- Figma assets are aliased in vite.config.ts
- Custom ImageUploader component handles file uploads
- Multiple image support for catalog products

### Form Architecture
Forms follow consistent patterns:
- TypeScript interfaces for data models
- Form validation and error handling
- Optimistic UI updates with error rollback

### Mobile-First Design
- Tailwind CSS responsive design
- Touch-friendly interface patterns
- Optimized for Kazakhstan market (Russian/Kazakh language support)

## Development Guidelines

### File Size Limits
- Frontend components: Maximum 200 lines
- If exceeding limit, split into smaller modules
- Prefer readability over performance optimizations

### API Error Handling
The API client handles multiple response patterns:
- FastAPI success/error objects
- HTTP status codes
- JSON parsing errors

### Environment Configuration
Set these variables in .env:
```
VITE_API_BASE=https://cvety.kz/api
VITE_API_TOKEN=your_token_here  
VITE_CITY_ID=1  # Almaty by default
```

### Component Development
When creating new components:
1. Check existing patterns in similar components
2. Use shadcn/ui components for consistency
3. Follow TypeScript strict typing
4. Implement proper error boundaries

### Testing Integration
Use phone `77015211545` with code `1234` for testing authentication flows.

## Business Context

This system serves the Kazakhstan flower delivery market with specific requirements:
- Kaspi Pay payment integration
- WhatsApp/Telegram customer communication
- Russian language interface
- Seasonal demand patterns for holidays
- Real-time order tracking and delivery coordination