# Zologistics - Developer Site Specifications

## 🚀 Technical Overview

Zologistics is a full-stack enterprise logistics platform built with modern web technologies, featuring AI-powered dispatch automation, real-time analytics, and multi-modal transport coordination.

---

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Express API   │    │  PostgreSQL DB  │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ - TypeScript    │    │ - Node.js 20    │    │ - Drizzle ORM   │
│ - Tailwind CSS  │    │ - REST/WebSocket│    │ - Row Security  │
│ - TanStack Query│    │ - JWT Auth      │    │ - Multi-tenant  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   AI Services   │
                    │   (External)    │
                    │                 │
                    │ - OpenAI GPT-4  │
                    │ - Anthropic     │
                    │ - Custom Models │
                    └─────────────────┘
```

---

## 💻 Technology Stack

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.4.x with Radix UI components
- **State Management**: TanStack Query (React Query) 5.60.5
- **Routing**: Wouter 3.3.5 (lightweight React router)
- **Forms**: React Hook Form 7.55.0 with Zod validation
- **Charts**: Recharts 2.15.2
- **Icons**: Lucide React 0.453.0
- **Animations**: Framer Motion 11.13.1

### Backend Stack
- **Runtime**: Node.js 20.x (ESM modules)
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL with Drizzle ORM 0.39.1
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0
- **Validation**: Zod 3.24.2
- **Real-time**: WebSocket (ws 8.18.0)
- **Rate Limiting**: express-rate-limit 7.5.0
- **Security**: Helmet 8.1.0
- **Compression**: compression 1.8.0

### AI & External Services
- **OpenAI**: openai 5.2.0 (GPT-4, Whisper)
- **Anthropic**: @anthropic-ai/sdk 0.37.0
- **Email**: @sendgrid/mail 8.1.5
- **Payments**: Stripe (@stripe/stripe-js 7.4.0, stripe 18.3.0)
- **Blockchain**: ethers 6.14.4
- **PDF Generation**: puppeteer 24.10.0
- **QR Codes**: qrcode 1.5.4
- **2FA**: speakeasy 2.0.0

### Development Tools
- **Type Checking**: TypeScript 5.x
- **Linting**: ESLint
- **Testing**: Jest + React Testing Library
- **Database**: Drizzle Kit for migrations
- **Process Management**: PM2 (ecosystem.config.js)
- **Containerization**: Docker + Docker Compose

---

## 📁 Project Structure

```
zologistics/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Base UI components (Radix)
│   │   │   ├── forms/               # Form components
│   │   │   └── layout/              # Layout components
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/                # Authentication pages
│   │   │   ├── dashboard/           # Dashboard pages
│   │   │   ├── loads/               # Load management
│   │   │   └── drivers/             # Driver management
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts           # Authentication hook
│   │   │   ├── useLoads.ts          # Load management hook
│   │   │   └── useWebSocket.ts      # WebSocket hook
│   │   ├── lib/                     # Utilities
│   │   │   ├── api.ts               # API client
│   │   │   ├── utils.ts             # Helper functions
│   │   │   ├── validations.ts       # Zod schemas
│   │   │   └── constants.ts         # App constants
│   │   ├── types/                   # TypeScript types
│   │   └── App.tsx                  # Main app component
│   ├── public/                      # Static assets
│   ├── index.html                   # HTML template
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── components.json              # shadcn/ui config
│   └── package.json                 # Frontend dependencies
├── server/                          # Node.js backend
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API routes
│   ├── storage.ts                   # Database operations
│   ├── middleware/                  # Express middleware
│   │   ├── auth.ts                  # Authentication middleware
│   │   ├── cors.ts                  # CORS configuration
│   │   ├── rateLimit.ts             # Rate limiting
│   │   └── validation.ts            # Request validation
│   ├── services/                    # Business logic
│   │   ├── ai/                      # AI services
│   │   ├── auth/                    # Authentication services
│   │   ├── loads/                   # Load management services
│   │   ├── drivers/                 # Driver services
│   │   └── payments/                # Payment processing
│   ├── types/                       # TypeScript types
│   ├── utils/                       # Utility functions
│   └── package.json                 # Backend dependencies
├── shared/                          # Shared code
│   ├── types/                       # Shared TypeScript types
│   ├── schemas/                     # Shared Zod schemas
│   └── constants/                   # Shared constants
├── database/                        # Database files
│   ├── migrations/                  # Drizzle migrations
│   ├── schema.ts                    # Database schema
│   └── seed.ts                      # Database seeding
├── docs/                            # Documentation
├── docker/                          # Docker files
├── .env.example                     # Environment variables template
├── docker-compose.yml               # Docker Compose config
├── drizzle.config.ts                # Drizzle configuration
├── ecosystem.config.js              # PM2 configuration
├── package.json                     # Root package.json
└── README.md                        # Project documentation
```

---

## 🔧 Core Features & Technical Implementation

### 1. Authentication & Authorization
**Technical Implementation:**
- **JWT Strategy**: Stateless authentication with refresh tokens
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure HTTP-only cookies
- **Multi-Factor Authentication**: TOTP via speakeasy
- **OAuth Integration**: Support for Google, Azure AD, Okta
- **Role-Based Access Control**: Hierarchical permissions system

**Key Files:**
- `server/services/auth/jwt.ts` - JWT token management
- `server/services/auth/oauth.ts` - OAuth2/OIDC integration
- `server/middleware/auth.ts` - Authentication middleware
- `client/src/hooks/useAuth.ts` - Frontend auth hook

### 2. Real-Time Communication
**Technical Implementation:**
- **WebSocket Protocol**: Native WebSocket for low-latency communication
- **Connection Management**: Automatic reconnection with exponential backoff
- **Message Routing**: Topic-based message distribution
- **Presence System**: Real-time user presence tracking
- **Load Balancing**: WebSocket connection distribution

**Key Files:**
- `server/services/websocket/index.ts` - WebSocket server
- `client/src/hooks/useWebSocket.ts` - WebSocket client hook
- `server/routes/realtime.ts` - Real-time API routes

### 3. Database Layer
**Technical Implementation:**
- **ORM**: Drizzle ORM with TypeScript integration
- **Schema Design**: Normalized relational schema with foreign keys
- **Migrations**: Version-controlled schema changes
- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Indexed queries with EXPLAIN analysis
- **Multi-Tenant Support**: Row-Level Security (RLS) policies

**Key Files:**
- `database/schema.ts` - Database schema definition
- `database/migrations/` - Migration files
- `server/storage/index.ts` - Database operations
- `drizzle.config.ts` - Drizzle configuration

### 4. AI Integration
**Technical Implementation:**
- **OpenAI GPT-4**: Natural language processing for dispatch optimization
- **Anthropic Claude**: Advanced reasoning for complex logistics scenarios
- **Custom Models**: Fine-tuned models for load matching and pricing
- **Caching Layer**: Redis for AI response caching
- **Rate Limiting**: API quota management with circuit breakers
- **Fallback System**: Graceful degradation when AI services are unavailable

**Key Files:**
- `server/services/ai/openai.ts` - OpenAI integration
- `server/services/ai/anthropic.ts` - Anthropic integration
- `server/services/ai/cache.ts` - AI response caching
- `server/services/ai/fallback.ts` - Fallback mechanisms

### 5. Payment Processing
**Technical Implementation:**
- **Stripe Integration**: Secure payment processing with webhooks
- **Smart Contracts**: Ethereum-based automated payments
- **Escrow System**: Secure fund holding for transactions
- **Multi-Currency**: Support for USD, EUR, GBP, CAD
- **Invoice Generation**: Automated PDF invoice creation
- **Subscription Management**: Recurring billing with proration

**Key Files:**
- `server/services/payments/stripe.ts` - Stripe integration
- `server/services/payments/crypto.ts` - Cryptocurrency payments
- `server/routes/payments.ts` - Payment API routes
- `client/src/components/payments/` - Payment UI components

---

## 🔒 Security Specifications

### Authentication Security
- **Password Requirements**: Minimum 12 characters, complexity rules
- **JWT Configuration**: 15-minute access tokens, 7-day refresh tokens
- **Session Security**: HTTP-only, secure, same-site cookies
- **Brute Force Protection**: Progressive delays and IP blocking
- **Account Lockout**: Temporary lockout after failed attempts

### API Security
- **Rate Limiting**: 100 requests per minute per IP
- **CORS Configuration**: Strict origin validation
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content Security Policy (CSP) headers

### Data Security
- **Encryption at Rest**: AES-256 encryption for sensitive data
- **Encryption in Transit**: TLS 1.3 for all communications
- **Data Masking**: PII masking in logs and responses
- **Backup Security**: Encrypted backups with access controls
- **Data Retention**: Configurable retention policies

### Infrastructure Security
- **Container Security**: Non-root user, minimal base images
- **Network Security**: VPC isolation, security groups
- **Secret Management**: Environment variables, no hardcoded secrets
- **Monitoring**: Real-time security event monitoring
- **Compliance**: SOC 2, GDPR, CCPA compliance frameworks

---

## 📊 Performance Specifications

### Frontend Performance
- **Bundle Size**: <500KB gzipped for initial load
- **Time to Interactive**: <3 seconds on 3G connections
- **Lighthouse Score**: >90 for all categories
- **Memory Usage**: <100MB for typical usage
- **Core Web Vitals**: All metrics in good range

### Backend Performance
- **API Response Time**: <200ms for 95th percentile
- **Concurrent Users**: Support for 10,000+ concurrent users
- **Database Queries**: <50ms average query time
- **Memory Usage**: <2GB for normal operation
- **CPU Usage**: <70% under normal load

### Database Performance
- **Connection Pool**: 10-50 connections based on load
- **Query Optimization**: All queries use appropriate indexes
- **Read Replicas**: Automatic read distribution
- **Caching Strategy**: Redis for frequently accessed data
- **Backup Performance**: <1 hour for full backup

### Scalability Metrics
- **Horizontal Scaling**: Stateless design for easy scaling
- **Load Balancing**: Round-robin distribution
- **Auto-scaling**: CPU/memory-based scaling triggers
- **CDN Integration**: Global content delivery
- **Caching Layers**: Multi-level caching strategy

---

## 🚀 Deployment Specifications

### Development Environment
```bash
# Local development setup
npm install                    # Install all dependencies
npm run db:push               # Push database schema
npm run dev                   # Start development server
```

### Production Deployment
```bash
# Build process
npm run build                 # Build for production
npm run db:generate          # Generate migrations
npm start                     # Start production server
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
BCRYPT_ROUNDS=12

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# External Services
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
SENDGRID_API_KEY=your_sendgrid_key

# Security
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=your_session_secret

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: zologistics
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
```

---

## 🔄 API Specifications

### REST API Endpoints

#### Authentication
```
POST   /api/auth/login              # User login
POST   /api/auth/register           # User registration
POST   /api/auth/refresh            # Refresh access token
POST   /api/auth/logout             # User logout
GET    /api/auth/me                 # Get current user
POST   /api/auth/forgot-password    # Password reset request
POST   /api/auth/reset-password     # Password reset confirmation
```

#### Loads Management
```
GET    /api/loads                   # Get loads with filters
POST   /api/loads                   # Create new load
GET    /api/loads/:id               # Get load details
PUT    /api/loads/:id               # Update load
DELETE /api/loads/:id               # Delete load
POST   /api/loads/:id/book          # Book load for driver
POST   /api/loads/:id/complete      # Mark load as completed
```

#### Driver Management
```
GET    /api/drivers                 # Get drivers list
POST   /api/drivers                 # Create new driver
GET    /api/drivers/:id             # Get driver details
PUT    /api/drivers/:id             # Update driver
DELETE /api/drivers/:id             # Delete driver
GET    /api/drivers/:id/performance # Get driver performance
```

#### Real-Time WebSocket Events
```
load:created        # New load posted
load:updated        # Load information updated
load:booked         # Load booked by driver
driver:location     # Driver location update
message:new         # New chat message
notification:new    # New notification
```

### API Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456"
}
```

---

## 🧪 Testing Strategy

### Unit Testing
- **Framework**: Jest with ts-jest
- **Coverage**: >80% code coverage required
- **Mocking**: Mock external services and database calls
- **Assertions**: Comprehensive assertion libraries

### Integration Testing
- **API Testing**: Supertest for endpoint testing
- **Database Testing**: Test database operations
- **External Services**: Mock external API calls
- **End-to-End**: Playwright for critical user journeys

### Performance Testing
- **Load Testing**: k6 for concurrent user simulation
- **Stress Testing**: Identify breaking points
- **Memory Testing**: Detect memory leaks
- **Database Testing**: Query performance validation

---

## 📈 Monitoring & Observability

### Application Monitoring
- **Error Tracking**: Sentry for error monitoring
- **Performance Monitoring**: New Relic APM
- **Custom Metrics**: Application-specific KPIs
- **Health Checks**: Automated health verification

### Infrastructure Monitoring
- **Server Monitoring**: CPU, memory, disk usage
- **Database Monitoring**: Query performance, connection pools
- **Network Monitoring**: Latency, throughput, error rates
- **Log Aggregation**: Centralized logging with ELK stack

### Business Monitoring
- **User Analytics**: User behavior and conversion tracking
- **Revenue Metrics**: Real-time revenue and profit tracking
- **Operational KPIs**: Load completion rates, driver utilization
- **System Health**: Overall platform health dashboard

---

## 🔧 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create pull request
```

### Code Quality
- **Pre-commit Hooks**: ESLint, Prettier, TypeScript checks
- **CI/CD Pipeline**: Automated testing and deployment
- **Code Reviews**: Required for all pull requests
- **Documentation**: Update docs for API changes

### Release Process
1. **Feature Development**: Develop features in feature branches
2. **Testing**: Comprehensive testing including E2E
3. **Staging**: Deploy to staging environment
4. **Production**: Automated deployment to production
5. **Monitoring**: Post-deployment monitoring and alerting

---

## 🚨 Emergency Procedures

### Incident Response
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Impact and severity evaluation
3. **Communication**: Stakeholder notification
4. **Resolution**: Implement fix and rollback if needed
5. **Post-Mortem**: Root cause analysis and prevention

### Rollback Procedures
```bash
# Quick rollback to previous version
git checkout previous-commit-hash
npm run build
npm run db:rollback  # If database changes
npm restart
```

### Data Recovery
- **Automated Backups**: Daily database backups
- **Point-in-Time Recovery**: Restore to specific timestamp
- **Data Validation**: Verify data integrity after recovery
- **Business Continuity**: Redundant systems and failover

---

## 📚 Additional Resources

### Documentation
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Development Setup](./docs/development.md)
- [Architecture Overview](./docs/architecture.md)

### External Dependencies
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

### Support
- **Technical Support**: dev-support@zologistics.ai
- **Documentation Issues**: docs@zologistics.ai
- **Security Issues**: security@zologistics.ai

---

**Zologistics** - Enterprise-grade logistics platform built for scale and performance.

*Last Updated: September 15, 2025*</content>
<parameter name="filePath">/home/runner/workspace/DEVELOPER_SITE_SPECS.md