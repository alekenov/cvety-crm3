# System Architecture Documentation: cvety.kz CRM

## Overview

This document provides comprehensive architecture documentation for the cvety.kz flower delivery CRM system, covering both legacy Bitrix implementation and modern CRM3 React replacement.

## Architecture Comparison

### Legacy System (Current Production)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bitrix CRM    │    │  FastAPI Bridge │    │  MySQL Database │
│  (PHP Framework)│◄──►│   (Migration)   │◄──►│   (Legacy Data) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │ WhatsApp/Telegram│    │  External APIs  │
│ (Server Render) │    │      Bots       │    │  (Kaspi Pay)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Modern CRM3 System (Target Architecture)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   FastAPI       │    │   Supabase      │
│ (TypeScript/Vite)│◄──►│   Backend      │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloudflare     │    │ External APIs   │    │  File Storage   │
│  (CDN/Deploy)   │    │(WhatsApp/Kaspi) │    │  (Images/Videos)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Data Flow Diagrams

### Product Management Flow

#### Legacy Bitrix Flow
```
┌───────────────┐
│  Bitrix Admin │
│   Interface   │
└───────┬───────┘
        │
        ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  PHP Backend  │───►│ MySQL Product │───►│  File System  │
│  Processing   │    │    Tables     │    │ (Images/Docs) │
└───────────────┘    └───────────────┘    └───────────────┘
        │
        ▼
┌───────────────┐    ┌───────────────┐
│  Webhook Sync │───►│   FastAPI     │
│   to Bridge   │    │    Bridge     │
└───────────────┘    └───────────────┘
```

#### Modern CRM3 Flow
```
┌───────────────┐
│  React CRM3   │
│   Interface   │
└───────┬───────┘
        │
        ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  FastAPI      │───►│  Supabase     │───►│  Cloudflare   │
│  Backend      │    │  Database     │    │  File Storage │
└───────────────┘    └───────────────┘    └───────────────┘
        │
        ▼
┌───────────────┐
│   Real-time   │
│   Updates     │
└───────────────┘
```

### Order Processing Flow

#### Complete Order Lifecycle
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Customer    │───►│   Order     │───►│   Payment   │
│ Places Order│    │  Creation   │    │ Processing  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ WhatsApp/   │◄───│   Order     │───►│ Kaspi Pay   │
│ Telegram    │    │    Status   │    │Integration  │
│Notification │    │   Tracking  │    └─────────────┘
└─────────────┘    └─────────────┘
                           │
                           ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Florist    │───►│  Assembly   │───►│  Courier    │
│ Assignment  │    │   Process   │    │ Assignment  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Delivery   │◄───│   Order     │───►│ Completion  │
│  Tracking   │    │  Delivery   │    │& Feedback   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Authentication & Security Flow

#### Modern Token-Based Authentication
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───►│   Login     │───►│   FastAPI   │
│ Application │    │   Request   │    │   Backend   │
└─────────────┘    └─────────────┘    └─────────────┘
        ▲                                      │
        │                                      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ API Calls   │◄───│ JWT Token   │◄───│   Token     │
│with Token   │    │  Storage    │    │ Generation  │
└─────────────┘    └─────────────┘    └─────────────┘
```

#### Legacy Session Authentication
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Bitrix    │───►│  Session    │───►│   MySQL     │
│   Client    │    │  Creation   │    │  Sessions   │
└─────────────┘    └─────────────┘    └─────────────┘
        ▲                                      │
        │                                      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Server    │◄───│Session      │◄───│ Validation  │
│  Rendering  │    │Cookie       │    │ & Lookup    │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## Component Architecture

### Legacy Bitrix Components
```
bitrix/
├── components/
│   ├── crm/
│   │   ├── system.auth.authorize/
│   │   ├── product.list/
│   │   └── order.management/
│   └── custom/
├── templates/
│   └── cvety.crm/
│       ├── header.php
│       ├── footer.php
│       └── css/main.css
└── modules/
    ├── catalog/
    ├── crm/
    └── custom.integration/
```

### Modern CRM3 Components
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── products/        # Product management
│   ├── orders/          # Order processing
│   └── layout/          # Layout components
├── pages/               # Route pages (lazy-loaded)
├── api/                 # API client layer
│   ├── client.ts        # HTTP client
│   ├── products.ts      # Product endpoints
│   └── orders.ts        # Order endpoints
└── assets/              # Static assets
```

### Data Layer Architecture

#### Legacy Data Access
```
PHP Controllers ──► Bitrix ORM ──► MySQL ──► File System
      │                 │            │           │
      └─► Session ──────┘            │           │
      └─► Template Rendering ────────┘           │
      └─► File Uploads ──────────────────────────┘
```

#### Modern Data Access
```
React Components ──► API Client ──► FastAPI ──► Supabase
      │                   │           │           │
      └─► React State ────┘           │           │
      └─► Form Management ────────────┘           │
      └─► File Uploads ──────────────────────────┘
```

---

## Integration Patterns

### External Service Integration

#### WhatsApp Business API Integration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │───►│  WhatsApp Bot   │───►│   CRM System    │
│   Messages      │    │   (Webhook)     │    │   (Order API)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       │                       │
         │                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Automated     │◄───│   Message       │◄───│   Status        │
│   Responses     │    │   Processing    │    │   Updates       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Kaspi Pay Integration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Order Total   │───►│   Kaspi Pay     │───►│   Payment       │
│   Calculation   │    │   Gateway       │    │   Confirmation  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       │                       │
         │                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Order Status  │◄───│   Webhook       │◄───│   Transaction   │
│   Update        │    │   Callback      │    │   Status        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Synchronization Architecture

#### Bitrix ↔ FastAPI Sync
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Bitrix CRM    │───►│   Sync Service  │───►│   FastAPI       │
│   (Legacy)      │    │   (Bidirectional)    │   (Modern)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       │                       │
         │                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  MySQL Legacy   │◄───│   Data Mapping  │───►│   Supabase      │
│   Database      │    │   & Transform   │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Deployment Architecture

### Current Production (Legacy)
```
┌─────────────────┐
│   Root Server   │
│ 185.125.90.141  │
├─────────────────┤
│   Apache/Nginx  │
│   PHP 7.4+      │
│   Bitrix        │
│   MySQL         │
└─────────────────┘
```

### Target Deployment (Modern)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │───►│   Vercel/       │───►│   Supabase      │
│   (CDN/Edge)    │    │   Netlify       │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static        │    │   FastAPI       │    │   File Storage  │
│   React Build   │    │   Backend       │    │   (Images/Vids) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Performance Architecture

### Caching Strategy

#### Legacy System
```
Browser ──► Apache Cache ──► PHP OPcache ──► MySQL Query Cache
   │              │                │                │
   └─► Static ────┘                │                │
   └─► Session Data ───────────────┘                │
   └─► Database Results ──────────────────────────────┘
```

#### Modern System
```
Browser ──► Cloudflare CDN ──► Vercel Edge ──► Supabase
   │              │                 │             │
   └─► React ─────┘                 │             │
   └─► API Cache ───────────────────┘             │
   └─► Database Connection Pool ──────────────────┘
```

### Scalability Patterns

#### Horizontal Scaling
```
Load Balancer
    │
    ├─► FastAPI Instance 1
    ├─► FastAPI Instance 2
    └─► FastAPI Instance N
         │
         └─► Supabase (Auto-scaling)
```

#### Database Scaling
```
┌─────────────────┐    ┌─────────────────┐
│   Write Master  │───►│  Read Replicas  │
│   (Supabase)    │    │  (Auto-scaled)  │
└─────────────────┘    └─────────────────┘
```

---

## Security Architecture

### Authentication & Authorization
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───►│   Auth Service  │───►│   Role-Based    │
│   (React)       │    │   (JWT/OAuth)   │    │   Permissions   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───►│   Token         │───►│   Resource      │
│   (Rate Limit)  │    │   Validation    │    │   Access        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Protection
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTPS/TLS     │───►│   Encrypted     │───►│   Backup        │
│   Transport     │    │   Storage       │    │   Encryption    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Monitoring & Observability

### System Monitoring
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───►│   Metrics       │───►│   Alerting      │
│   Logs          │    │   Collection    │    │   System        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Error         │    │   Performance   │    │   Business      │
│   Tracking      │    │   Monitoring    │    │   Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Business Intelligence
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Order Data    │───►│   Analytics     │───►│   Dashboards    │
│   Collection    │    │   Processing    │    │   & Reports     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

This architecture documentation provides complete understanding of both legacy and modern system structures, enabling informed decisions about migration, improvements, and system restoration.