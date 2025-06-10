# TruckFlow AI - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying TruckFlow AI to production environments. The platform has been thoroughly tested and is ready for enterprise deployment with proper configuration.

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Production database server (PostgreSQL 14+)
- [ ] Application server (Node.js 20+)
- [ ] Load balancer with SSL termination
- [ ] CDN for static assets
- [ ] Monitoring and logging infrastructure
- [ ] Backup and disaster recovery systems

### Security Requirements
- [ ] SSL certificates installed
- [ ] API rate limiting configured
- [ ] Database encryption enabled
- [ ] Audit logging implemented
- [ ] Access controls established
- [ ] Security scanning completed

### Integration Requirements
- [ ] OpenAI API key provisioned
- [ ] Third-party API integrations tested
- [ ] External service health checks configured
- [ ] Data migration scripts validated
- [ ] Backup procedures tested

## Environment Configuration

### Production Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/truckflow_prod
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=truckflow_prod_user
PGPASSWORD=secure_password
PGDATABASE=truckflow_production

# Application Configuration
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-secure-session-secret-min-32-chars

# API Keys
OPENAI_API_KEY=your-openai-api-key
WEATHER_API_KEY=your-weather-service-key
MAPS_API_KEY=your-google-maps-key

# Security Configuration
ENCRYPTION_KEY=your-256-bit-encryption-key
JWT_SECRET=your-jwt-signing-secret
API_RATE_LIMIT=100

# External Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
```

### Database Setup

1. **Create Production Database**
```sql
CREATE DATABASE truckflow_production;
CREATE USER truckflow_prod_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE truckflow_production TO truckflow_prod_user;
```

2. **Run Database Migrations**
```bash
npm run db:push
```

3. **Verify Database Schema**
```bash
npm run db:verify
```

### SSL Configuration

1. **Install SSL Certificates**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Deployment Steps

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -r -s /bin/bash truckflow
sudo mkdir -p /opt/truckflow
sudo chown truckflow:truckflow /opt/truckflow
```

### 2. Application Deployment

```bash
# Clone or upload application code
cd /opt/truckflow
git clone https://github.com/your-org/truckflow-ai.git .

# Install dependencies
npm ci --production

# Build application
npm run build

# Set file permissions
sudo chown -R truckflow:truckflow /opt/truckflow
```

### 3. Process Management

Create PM2 ecosystem file:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'truckflow-ai',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/truckflow/error.log',
    out_file: '/var/log/truckflow/out.log',
    log_file: '/var/log/truckflow/combined.log',
    time: true
  }]
};
```

Start application:
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 4. Load Balancer Configuration

```nginx
upstream truckflow_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    location / {
        proxy_pass http://truckflow_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location /static/ {
        alias /opt/truckflow/client/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Monitoring and Logging

### 1. Application Monitoring

```javascript
// Add to server/index.js
import { monitoringConfig } from './production-config.js';

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await monitoringConfig.healthCheck.database();
  const services = await monitoringConfig.healthCheck.externalServices();
  
  res.json({
    status: health.status === 'healthy' ? 'ok' : 'error',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: health,
    services: services
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(monitoringConfig.metrics);
});
```

### 2. Log Management

```bash
# Create log directories
sudo mkdir -p /var/log/truckflow
sudo chown truckflow:truckflow /var/log/truckflow

# Configure log rotation
sudo tee /etc/logrotate.d/truckflow << EOF
/var/log/truckflow/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
```

### 3. System Monitoring

Install and configure monitoring tools:
```bash
# Install monitoring agents
curl -sSL https://repos.insights.digitalocean.com/install.sh | sudo bash

# Configure alerts
sudo tee /etc/systemd/system/truckflow-monitor.service << EOF
[Unit]
Description=TruckFlow Monitoring Service
After=network.target

[Service]
Type=simple
User=truckflow
ExecStart=/usr/bin/node /opt/truckflow/monitoring/monitor.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

## Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Database Security

```sql
-- Create read-only user for monitoring
CREATE USER truckflow_monitor WITH PASSWORD 'monitor_password';
GRANT CONNECT ON DATABASE truckflow_production TO truckflow_monitor;
GRANT USAGE ON SCHEMA public TO truckflow_monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO truckflow_monitor;

-- Enable row-level security
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_isolation ON loads USING (company_id = current_setting('app.current_company')::int);
```

### 3. API Security

```javascript
// Add to server/routes.js
import { productionMiddleware, productionValidation } from './production-config.js';

// Apply security middleware
app.use(productionMiddleware.security);
app.use(productionMiddleware.compression);
app.use('/api/', productionMiddleware.rateLimiter);
app.use('/api/auth/', productionMiddleware.strictRateLimiter);

// Input validation
app.use('/api/', productionValidation.sanitizeInput);
app.use('/api/', productionValidation.validateApiKey);
```

## Backup and Recovery

### 1. Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backup/truckflow"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="truckflow_backup_${TIMESTAMP}.sql"

# Create backup
pg_dump -h $PGHOST -U $PGUSER -d $PGDATABASE > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_DIR}/${BACKUP_FILE}

# Remove backups older than 30 days
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.gz s3://your-backup-bucket/database/
```

### 2. Application Backups

```bash
# Backup application and configuration
tar -czf /backup/truckflow/app_backup_$(date +%Y%m%d).tar.gz \
    /opt/truckflow \
    /etc/nginx/sites-available/truckflow \
    /etc/systemd/system/truckflow*
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_loads_status ON loads(status);
CREATE INDEX CONCURRENTLY idx_loads_company ON loads(company_id);
CREATE INDEX CONCURRENTLY idx_drivers_status ON drivers(status);
CREATE INDEX CONCURRENTLY idx_negotiations_status ON negotiations(status);

-- Analyze tables
ANALYZE loads;
ANALYZE drivers;
ANALYZE negotiations;
```

### 2. Caching Configuration

```javascript
// Add Redis caching
import Redis from 'redis';

const redis = Redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Cache middleware
const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, ttl, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

## Testing in Production

### 1. Smoke Tests

```bash
# Test basic functionality
curl -k https://your-domain.com/health
curl -k https://your-domain.com/api/system-status
curl -k https://your-domain.com/api/metrics
```

### 2. Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: https://your-domain.com
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/loads"
      - get:
          url: "/api/drivers"
      - get:
          url: "/api/metrics"
EOF

# Run load test
artillery run load-test.yml
```

## Rollback Procedures

### 1. Application Rollback

```bash
# Stop current version
pm2 stop truckflow-ai

# Switch to previous version
cd /opt/truckflow
git checkout previous-tag

# Reinstall dependencies
npm ci --production

# Restart application
pm2 start truckflow-ai
```

### 2. Database Rollback

```bash
# Restore from backup
gunzip -c /backup/truckflow/truckflow_backup_YYYYMMDD_HHMMSS.sql.gz | \
psql -h $PGHOST -U $PGUSER -d $PGDATABASE
```

## Maintenance Procedures

### 1. Regular Maintenance

```bash
# Weekly maintenance script
#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart application
pm2 restart truckflow-ai

# Clean up logs
find /var/log/truckflow -name "*.log" -mtime +7 -delete

# Database maintenance
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "VACUUM ANALYZE;"

# Check disk space
df -h
```

### 2. Security Updates

```bash
# Monthly security audit
npm audit
npm audit fix

# Update PM2
pm2 update

# Review access logs
tail -100 /var/log/nginx/access.log | grep -E "(4[0-9]{2}|5[0-9]{2})"
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check DATABASE_URL environment variable
   - Verify database server accessibility
   - Review connection pool settings

2. **High Memory Usage**
   - Monitor PM2 process memory
   - Check for memory leaks
   - Adjust cluster instances

3. **API Rate Limiting**
   - Review rate limit configuration
   - Check client request patterns
   - Adjust limits if necessary

4. **SSL Certificate Issues**
   - Verify certificate expiration
   - Check certificate chain
   - Update certificate files

### Support Contacts

- **Technical Support**: support@truckflow.ai
- **Emergency Hotline**: 1-800-TRUCKFLOW-911
- **Documentation**: docs.truckflow.ai
- **Status Page**: status.truckflow.ai

This deployment guide ensures a secure, scalable, and maintainable production environment for TruckFlow AI.