# System Restoration Procedures

## Overview

This document provides step-by-step procedures for restoring the cvety.kz CRM system from backup, including both legacy Bitrix and modern CRM3 systems.

---

## Emergency Contact Information

**System Administrator**: root@185.125.90.141  
**Database**: dbcvety (usercvety/QQlPCtTA@z2%mhy)  
**Primary Domain**: https://cvety.kz  
**Backup Location**: This documentation repository  

---

## Legacy Bitrix System Restoration

### Prerequisites

- Root server access (185.125.90.141)
- MySQL database access
- Bitrix license key
- File system backup

### Step 1: Server Environment Setup

```bash
# Connect to server
ssh root@185.125.90.141

# Install required packages
apt-get update
apt-get install apache2 php7.4 php7.4-mysql php7.4-gd php7.4-curl php7.4-zip mysql-server

# Configure Apache
a2enmod rewrite
a2enmod php7.4
systemctl restart apache2
```

### Step 2: Database Restoration

```bash
# Connect to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE dbcvety CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'usercvety'@'localhost' IDENTIFIED BY 'QQlPCtTA@z2%mhy';
GRANT ALL PRIVILEGES ON dbcvety.* TO 'usercvety'@'localhost';
FLUSH PRIVILEGES;

# Restore from backup (if available)
mysql -u usercvety -p dbcvety < /backup/database/cvety_backup.sql
```

### Step 3: Bitrix Files Restoration

```bash
# Extract Bitrix files to web root
cd /var/www/html
tar -xzf /backup/bitrix/bitrix_files.tar.gz

# Set permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
chmod -R 777 /var/www/html/upload
chmod -R 777 /var/www/html/bitrix/cache
chmod -R 777 /var/www/html/bitrix/managed_cache
chmod -R 777 /var/www/html/bitrix/stack_cache
```

### Step 4: Bitrix Configuration

```bash
# Restore configuration files
cp /backup/bitrix/.settings.php /var/www/html/bitrix/.settings.php
cp /backup/bitrix/dbconn.php /var/www/html/bitrix/php_interface/dbconn.php

# Update database connection
nano /var/www/html/bitrix/php_interface/dbconn.php
```

```php
<?php
define("BX_USE_MYSQLI", true);
$DBType = "mysql";
$DBHost = "localhost";
$DBLogin = "usercvety";
$DBPassword = "QQlPCtTA@z2%mhy";
$DBName = "dbcvety";
$DBDebug = false;
$DBDebugToFile = false;
?>
```

### Step 5: Apache Virtual Host Configuration

```bash
nano /etc/apache2/sites-available/cvety.conf
```

```apache
<VirtualHost *:80>
    ServerName cvety.kz
    ServerAlias www.cvety.kz
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/cvety_error.log
    CustomLog ${APACHE_LOG_DIR}/cvety_access.log combined
</VirtualHost>
```

```bash
# Enable site
a2ensite cvety.conf
a2dissite 000-default
systemctl reload apache2
```

### Step 6: SSL Configuration (Production)

```bash
# Install Certbot
apt-get install certbot python3-certbot-apache

# Obtain SSL certificate
certbot --apache -d cvety.kz -d www.cvety.kz
```

---

## Modern CRM3 System Restoration

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Environment variables
- API access tokens

### Step 1: Project Setup

```bash
# Clone project repository
git clone https://github.com/your-repo/crm3.git
cd crm3

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
```

### Step 2: Environment Configuration

```bash
# Edit environment variables
nano .env.local
```

```env
VITE_API_BASE=https://cvety.kz/api
VITE_API_TOKEN=ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144
VITE_CITY_ID=1

# Production environment
NODE_ENV=production
VITE_APP_VERSION=1.0.0
```

### Step 3: Build and Deployment

#### Development Server
```bash
# Start development server
npm run dev

# Access at http://localhost:5173
```

#### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to static hosting (Vercel, Netlify, etc.)
npm run deploy
```

### Step 4: Cloudflare Deployment (Recommended)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to Cloudflare Pages
wrangler pages publish dist --project-name=cvety-crm
```

### Step 5: API Backend Setup

If using separate FastAPI backend:

```bash
# Setup Python environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/cvety
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
JWT_SECRET=your-jwt-secret
```

```bash
# Run database migrations
alembic upgrade head

# Start API server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Database Restoration Procedures

### MySQL to PostgreSQL Migration

```bash
# Export MySQL data
mysqldump -u usercvety -p dbcvety > mysql_backup.sql

# Convert to PostgreSQL format
python mysql_to_postgres_converter.py mysql_backup.sql > postgres_data.sql

# Import to PostgreSQL
psql -U postgres -d cvety_new -f postgres_data.sql
```

### Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note project URL and API keys

2. **Run Schema Migration**
```sql
-- Use the schema from docs/backup/database/mysql-schema.sql
-- Adapted for PostgreSQL syntax
```

3. **Configure Row Level Security (RLS)**
```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view products in their city" ON products
FOR SELECT USING (auth.jwt() ->> 'city_id' = city_id::text);
```

---

## File and Asset Restoration

### Image and Video Files

```bash
# Restore uploaded files
mkdir -p /var/www/html/upload/products
mkdir -p /var/www/html/upload/videos
mkdir -p /var/www/html/upload/temp

# Extract from backup
tar -xzf /backup/files/uploads.tar.gz -C /var/www/html/upload/

# Set permissions
chown -R www-data:www-data /var/www/html/upload/
chmod -R 755 /var/www/html/upload/
```

### CDN Migration (Modern System)

```bash
# Upload to Cloudflare R2 or AWS S3
aws s3 sync /var/www/html/upload/ s3://cvety-assets/

# Update image URLs in database
UPDATE products 
SET image = REPLACE(image, '/upload/', 'https://cdn.cvety.kz/')
WHERE image LIKE '/upload/%';
```

---

## Configuration Backup and Restore

### Bitrix Configuration Files

Key files to backup/restore:
- `/bitrix/.settings.php` - Main configuration
- `/bitrix/php_interface/dbconn.php` - Database connection
- `/.htaccess` - URL rewriting rules
- `/local/` - Custom components and templates

### CRM3 Configuration Files

Key files to backup/restore:
- `.env` or `.env.local` - Environment variables
- `vite.config.ts` - Build configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript configuration

---

## Testing Restoration

### Functional Tests

1. **Database Connectivity**
```bash
# Test database connection
mysql -u usercvety -p dbcvety -e "SELECT COUNT(*) FROM products;"
```

2. **Web Server**
```bash
# Test web server response
curl -I https://cvety.kz/
curl -I https://cvety.kz/crm/products/
```

3. **API Endpoints**
```bash
# Test API functionality
curl "https://cvety.kz/api/v2/products/?access_token=ABE7142D-D8AB-76AF-8D6C-2C4FAEA9B144"
```

4. **File Uploads**
```bash
# Test file upload directory
ls -la /var/www/html/upload/products/
```

### Performance Tests

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://cvety.kz/

# Database performance
mysql -u usercvety -p dbcvety -e "EXPLAIN SELECT * FROM products WHERE is_available = true LIMIT 20;"
```

---

## Backup Maintenance

### Automated Backup Script

```bash
#!/bin/bash
# /backup/scripts/daily_backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/daily"
DB_BACKUP="$BACKUP_DIR/db_backup_$DATE.sql"
FILES_BACKUP="$BACKUP_DIR/files_backup_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u usercvety -p'QQlPCtTA@z2%mhy' dbcvety > $DB_BACKUP

# Files backup
tar -czf $FILES_BACKUP /var/www/html/upload /var/www/html/local /var/www/html/bitrix/php_interface

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Crontab Setup

```bash
# Edit crontab
crontab -e

# Add backup schedule
0 2 * * * /backup/scripts/daily_backup.sh >> /var/log/backup.log 2>&1
0 4 * * 0 /backup/scripts/weekly_backup.sh >> /var/log/backup.log 2>&1
```

---

## Disaster Recovery Procedures

### Complete System Failure

1. **Assessment Phase** (15 minutes)
   - Identify failure cause
   - Determine data integrity
   - Assess hardware status

2. **Emergency Response** (30 minutes)
   - Activate backup server if available
   - Notify stakeholders
   - Preserve any recoverable data

3. **Restoration Phase** (2-4 hours)
   - Follow restoration procedures above
   - Restore from most recent backup
   - Verify system functionality

4. **Recovery Phase** (1-2 hours)
   - Update DNS if needed
   - Test all system components
   - Monitor for issues

### Partial Data Loss

1. **Stop Application**
```bash
systemctl stop apache2
```

2. **Restore Specific Components**
```bash
# Restore only products table
mysql -u usercvety -p dbcvety < /backup/products_table.sql

# Restore only uploaded files
tar -xzf /backup/uploads_recent.tar.gz -C /var/www/html/
```

3. **Verify and Restart**
```bash
# Test database integrity
mysql -u usercvety -p dbcvety -e "CHECK TABLE products;"

# Restart services
systemctl start apache2
```

---

## Monitoring and Alerting

### Health Check Scripts

```bash
#!/bin/bash
# /backup/scripts/health_check.sh

# Check database
mysql -u usercvety -p'QQlPCtTA@z2%mhy' dbcvety -e "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Database connection failed" | mail -s "ALERT: Database Down" admin@cvety.kz
fi

# Check web server
curl -f https://cvety.kz/ > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Web server not responding" | mail -s "ALERT: Web Server Down" admin@cvety.kz
fi
```

### Log Monitoring

```bash
# Monitor error logs
tail -f /var/log/apache2/cvety_error.log

# Monitor MySQL slow queries
tail -f /var/log/mysql/mysql-slow.log
```

This restoration guide provides comprehensive procedures to recover the cvety.kz CRM system in various failure scenarios.