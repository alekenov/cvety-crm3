# Complete Backup Documentation: cvety.kz CRM Products System

**Generated on:** August 31, 2025  
**Purpose:** Comprehensive backup and analysis of legacy Bitrix CRM system  
**Target:** Future restoration and migration reference  

## Overview

This document provides a complete backup of the cvety.kz CRM products system, including both the legacy Bitrix implementation and the modern React-based CRM3 replacement.

### System Architecture Comparison

| Component | Legacy System | Modern CRM3 |
|-----------|---------------|-------------|
| Frontend | Bitrix PHP Framework | React 18 + TypeScript |
| Backend | Bitrix CRM + FastAPI | FastAPI + Supabase |
| Database | MySQL | PostgreSQL (Supabase) |
| Auth | Session-based | Token-based |
| UI Framework | Bitrix Templates | Tailwind + shadcn/ui |
| Build System | Traditional PHP | Vite + ESM |

## Directory Structure

```
backup/
├── frontend/           # Legacy Bitrix frontend components
├── api/               # API documentation and schemas  
├── database/          # Database schemas and sample data
├── architecture/      # System architecture diagrams
├── migration/         # Migration guides and scripts
└── improvements/      # Identified enhancement opportunities
```

---

## Table of Contents

1. [Legacy Bitrix Frontend](#legacy-bitrix-frontend)
2. [Database Schema Documentation](#database-schema)
3. [API Documentation](#api-documentation)
4. [Architecture and Data Flows](#architecture)
5. [Migration Analysis](#migration-analysis)
6. [Improvement Opportunities](#improvements)
7. [Restoration Procedures](#restoration)

---