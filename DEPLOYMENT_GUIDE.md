# TruckFlow AI - GitHub Deployment Guide

This guide covers deploying TruckFlow AI from GitHub to various platforms including Replit, Railway, Vercel, and self-hosted environments.

## 🚀 Quick Deploy Options

### Option 1: Replit (Recommended for Development)

1. **Fork on GitHub**
   ```bash
   # Fork the repository to your GitHub account
   # Then import to Replit
   ```

2. **Import to Replit**
   - Go to [Replit](https://replit.com)
   - Click "Import from GitHub"
   - Select your forked repository
   - Choose Node.js template

3. **Configure Environment**
   - Add environment variables in Replit Secrets
   - Database will be automatically provisioned

4. **Deploy**
   ```bash
   npm install
   npm run db:push
   npm run dev
   ```

### Option 2: Railway (Recommended for Production)

1. **Connect GitHub Repository**
   - Visit [Railway](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select TruckFlow AI repository

2. **Configure Services**
   ```yaml
   # railway.json (already included)
   {
     "deploy": {
       "startCommand": "npm start",
       "healthcheckPath": "/api/health"
     }
   }
   ```

3. **Environment Variables**
   - Set all required environment variables in Railway dashboard
   - PostgreSQL will be automatically provisioned

4. **Custom Domain**
   - Add your custom domain in Railway settings
   - SSL certificates are automatically managed

### Option 3: Vercel (Frontend + Serverless)

1. **Deploy Frontend**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Configure Serverless Functions**
   - API routes will be automatically converted to serverless functions
   - Configure environment variables in Vercel dashboard

### Option 4: Self-Hosted Docker

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/truckflow-ai.git
   cd truckflow-ai
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Core Configuration
DATABASE_URL=postgresql://user:pass@host:port/db
SESSION_SECRET=your_secure_session_secret

# AI Services
OPENAI_API_KEY=sk-your_openai_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key

# Email Service
SENDGRID_API_KEY=SG.your_sendgrid_key

# Authentication (for Replit Auth)
REPL_ID=your_repl_id
REPLIT_DOMAINS=your-domain.replit.app
```

### Optional Integrations

```env
# Load Board APIs
DAT_API_KEY=your_dat_api_key
TRUCKSTOP_API_KEY=your_truckstop_key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_key

# Communication
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# External Services
WEATHER_API_KEY=your_weather_key
MAPS_API_KEY=your_maps_key
```

## 🗄️ Database Setup

### PostgreSQL Schema

The application uses Drizzle ORM with automatic migrations:

```bash
# Push schema to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate
```

### Database Providers

**Recommended Providers:**
- **Neon** (Serverless PostgreSQL) - Free tier available
- **Railway PostgreSQL** - Included with Railway deployment
- **Supabase** - Free tier with additional features
- **PlanetScale** - Serverless MySQL alternative

## 🔐 Security Configuration

### SSL/TLS Setup

For production deployments:

```nginx
# nginx.conf (included in repository)
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    
    location / {
        proxy_pass http://app:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment Security

- Use strong session secrets (minimum 32 characters)
- Rotate API keys regularly
- Enable rate limiting in production
- Use HTTPS only in production

## 📊 Monitoring & Logging

### Health Checks

The application includes built-in health check endpoints:

```bash
GET /api/health              # Basic health check
GET /api/health/database     # Database connectivity
GET /api/health/services     # External service status
```

### Logging Configuration

```env
# Logging levels: error, warn, info, debug
LOG_LEVEL=info

# Error tracking (optional)
SENTRY_DSN=your_sentry_dsn
```

### Performance Monitoring

```bash
# Built-in performance metrics
GET /api/metrics/performance
GET /api/metrics/usage
GET /api/metrics/revenue
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The repository includes a complete CI/CD pipeline:

1. **Testing**: Automated tests on pull requests
2. **Security**: Vulnerability scanning with Trivy
3. **Building**: Docker image creation and registry push
4. **Deployment**: Automatic deployment to staging/production

### Deployment Triggers

- **Push to `main`**: Deploy to staging
- **Push to `production`**: Deploy to production
- **Pull Request**: Run tests and security scans

## 🚢 Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Monitoring and alerting set up

### Post-Deployment

- [ ] Health checks passing
- [ ] Application loads correctly
- [ ] Database connections working
- [ ] External API integrations functional
- [ ] Email delivery working
- [ ] Performance metrics normal

## 🆘 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check connection string format
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Test connection
npm run db:push
```

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 20+
```

**Environment Variable Issues**
```bash
# Verify all required variables are set
npm run env:check

# Check variable loading
console.log(process.env.DATABASE_URL)
```

### Performance Issues

**High Memory Usage**
- Check for memory leaks in long-running processes
- Optimize database queries
- Implement connection pooling

**Slow API Responses**
- Enable database query logging
- Implement caching strategies
- Optimize AI service calls

### Support Resources

- **Documentation**: [docs.truckflow.ai](https://docs.truckflow.ai)
- **GitHub Issues**: Report bugs and feature requests
- **Discord Community**: Real-time support and discussions
- **Email Support**: support@truckflow.ai

## 📈 Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  app:
    deploy:
      replicas: 3
    
  nginx:
    image: nginx:alpine
    depends_on:
      - app
```

### Database Scaling

- Implement read replicas for heavy read workloads
- Use connection pooling (PgBouncer)
- Consider database sharding for massive scale

### CDN Configuration

- Use CloudFlare or AWS CloudFront
- Cache static assets and API responses
- Implement edge computing for global performance

---

**TruckFlow AI** is production-ready and designed for enterprise-scale deployment.

For deployment assistance, contact our support team or join our Discord community.