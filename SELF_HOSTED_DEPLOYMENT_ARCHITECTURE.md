# TruckFlow AI - Self-Hosted Deployment Architecture

## Recommended Server Specifications

### Production Environment (Single Server)
**For $1M/month revenue target:**

```
CPU: 16+ cores (Intel Xeon or AMD EPYC)
RAM: 64GB+ DDR4/DDR5
Storage: 2TB NVMe SSD (primary) + 8TB SSD (data/backups)
Network: 1Gbps+ dedicated bandwidth
OS: Ubuntu 22.04 LTS or CentOS Stream 9
```

**Cost: $800-1,200/month for dedicated server**

### High-Availability Cluster (Recommended)
**For enterprise-grade reliability:**

```
Load Balancer: 2 servers (4 cores, 16GB RAM each)
Application Servers: 3 servers (8 cores, 32GB RAM each)
Database Cluster: 3 PostgreSQL servers (8 cores, 64GB RAM each)
Redis Cache: 2 servers (4 cores, 16GB RAM each)
AI Processing: 2 GPU servers (NVIDIA A100 or RTX 4090)
```

**Total Cost: $4,000-6,000/month for full cluster**

---

## Docker Deployment Stack

### Core Services
```yaml
version: '3.8'
services:
  app:
    image: truckflow-ai:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/truckflow
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: truckflow
      POSTGRES_USER: truckflow_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped
```

---

## Infrastructure Requirements

### Network Configuration
```
Domain: your-domain.com
SSL Certificate: Let's Encrypt or commercial
CDN: Cloudflare (optional but recommended)
Backup Location: AWS S3 or equivalent
Monitoring: Prometheus + Grafana
```

### Security Setup
```
Firewall: UFW or iptables
- Port 22 (SSH) - restricted IPs only
- Port 80/443 (HTTP/HTTPS) - public
- Port 5432 (PostgreSQL) - internal only
- Port 6379 (Redis) - internal only

VPN: WireGuard for admin access
Fail2Ban: SSH brute force protection
```

---

## Performance Optimization

### Database Tuning (PostgreSQL)
```sql
-- postgresql.conf optimizations
shared_buffers = 16GB                 # 25% of system RAM
effective_cache_size = 48GB           # 75% of system RAM
work_mem = 256MB                      # For complex queries
max_connections = 200                 # Adjust based on load
checkpoint_completion_target = 0.9
wal_buffers = 64MB
```

### Application Optimization
```javascript
// PM2 process management
module.exports = {
  apps: [{
    name: 'truckflow-ai',
    script: './server/index.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=4096'
  }]
}
```

### Redis Configuration
```
# redis.conf optimizations
maxmemory 8gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## AI Processing Requirements

### Self-Hosted AI Models
```
Model Storage: 500GB+ for local AI models
GPU Memory: 24GB+ VRAM (RTX 4090 or A100)
Inference Speed: <200ms response time
Fallback: OpenAI/Anthropic APIs for overflow
```

### AI Service Configuration
```yaml
ai-service:
  image: ollama/ollama:latest
  ports:
    - "11434:11434"
  volumes:
    - ./models:/root/.ollama
  environment:
    - OLLAMA_HOST=0.0.0.0
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

---

## Monitoring & Logging

### System Monitoring
```yaml
prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
  volumes:
    - grafana_data:/var/lib/grafana
```

### Application Logging
```javascript
// winston logger configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

---

## Backup Strategy

### Automated Backups
```bash
#!/bin/bash
# backup.sh - Daily backup script

# Database backup
pg_dump -h localhost -U truckflow_user truckflow > /backups/db_$(date +%Y%m%d).sql

# File system backup
tar -czf /backups/files_$(date +%Y%m%d).tar.gz /app/uploads /app/logs

# Upload to remote storage
aws s3 sync /backups/ s3://your-backup-bucket/

# Cleanup old backups (keep 30 days)
find /backups -name "*.sql" -mtime +30 -delete
find /backups -name "*.tar.gz" -mtime +30 -delete
```

### Disaster Recovery
```
RTO (Recovery Time Objective): 4 hours
RPO (Recovery Point Objective): 1 hour
Backup Frequency: Every 6 hours
Backup Retention: 30 days local, 1 year remote
```

---

## Scaling Strategy

### Horizontal Scaling
```
Load Balancer: HAProxy or NGINX
Application Servers: 3+ instances behind load balancer
Database: PostgreSQL streaming replication
Cache: Redis Cluster for distributed caching
File Storage: Distributed file system or object storage
```

### Auto-Scaling Triggers
```
CPU Usage > 80% for 5 minutes: Add 1 server
Memory Usage > 85% for 5 minutes: Add 1 server
Response Time > 2 seconds: Add 1 server
Scale down when usage < 30% for 15 minutes
```

---

## Security Hardening

### SSL/TLS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
}
```

### Environment Variables
```env
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:secure_password@localhost:5432/truckflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

---

## Cost Analysis

### Monthly Operating Costs
```
Single Server (64GB RAM, 16 cores): $800-1,200
Domain + SSL Certificate: $50-100
Backup Storage (1TB): $25-50
Monitoring Tools: $50-200
Total Monthly Cost: $925-1,550

Revenue Target: $1,000,000/month
Infrastructure Cost: 0.1-0.2% of revenue
```

### Break-Even Analysis
```
At $50K/month revenue: Infrastructure = 3% of revenue
At $200K/month revenue: Infrastructure = 0.8% of revenue
At $1M/month revenue: Infrastructure = 0.15% of revenue
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Server provisioned and secured
- [ ] Domain configured with DNS
- [ ] SSL certificates installed
- [ ] Database initialized with schema
- [ ] Environment variables configured
- [ ] Backup system tested

### Post-Deployment
- [ ] Application health checks passing
- [ ] Monitoring dashboards configured
- [ ] Log aggregation working
- [ ] Backup scripts scheduled
- [ ] Performance testing completed
- [ ] Security scan passed

### Ongoing Maintenance
- [ ] Weekly security updates
- [ ] Monthly backup restoration tests
- [ ] Quarterly performance reviews
- [ ] Annual security audits

---

**For your $1M profit target, start with the single server configuration ($800-1,200/month) and scale to the cluster setup as revenue grows beyond $500K/month.**