# GitHub Copilot Build Prompt - Personal Load Arbitrage Platform

## Project Overview
Build a simple, automated freight load arbitrage platform that generates $15K-25K monthly profit through AI-powered load board scanning and automated booking. This is a personal money-making tool, not an enterprise platform.

## Core Functionality
- Scan multiple load boards every 30 seconds for profitable opportunities
- Calculate profit margins automatically (target $200+ per load)
- Book profitable loads instantly before competitors
- Match loads with pre-vetted carrier network
- Track payments and daily/monthly profits
- Simple dashboard showing personal income metrics

## Technical Requirements

### Backend (Node.js + Express)
```javascript
// Create these core services:
// 1. LoadScanner - scans DAT, Truckstop, 123LoadBoard APIs every 30 seconds
// 2. ProfitCalculator - calculates margins (shipper rate - carrier cost - fees)
// 3. AutoBooker - books loads automatically if profit > $200
// 4. CarrierMatcher - finds best available carrier for each load
// 5. PaymentTracker - tracks payments and collections
// 6. ProfitDashboard API - serves daily/monthly profit data
```

### Database Schema (PostgreSQL)
```sql
-- Create 4 simple tables:
-- loads: id, load_number, origin, destination, shipper_rate, carrier_cost, profit, status, created_at
-- carriers: id, company_name, contact_email, phone, dot_number, rate_per_mile, available
-- bookings: id, load_id, carrier_id, booked_at, profit_amount, status
-- daily_profits: date, total_loads, total_profit, average_profit
```

### Frontend (React)
```javascript
// Create simple dashboard with:
// 1. Today's profit counter (large, prominent display)
// 2. Monthly profit tracker
// 3. Loads processed today
// 4. Recent profitable bookings table
// 5. Carrier availability status
// 6. System health indicators
```

## Key Features to Build

### 1. Load Board Scanner
```javascript
// Implement continuous scanning service that:
// - Connects to major load board APIs (DAT, Truckstop, 123LoadBoard)
// - Filters for profitable opportunities (min $200 profit)
// - Runs every 30 seconds
// - Logs all scanned loads for analysis
// - Alerts on high-value opportunities ($500+ profit)
```

### 2. Automated Booking System
```javascript
// Create booking automation that:
// - Calculates profit in real-time
// - Books load automatically if profit > threshold
// - Assigns best available carrier
// - Sends confirmation emails
// - Updates booking status
// - Records profit for tracking
```

### 3. Carrier Management
```javascript
// Build carrier network system:
// - Store carrier contact info and rates
// - Track availability and performance
// - Calculate best carrier for each load
// - Automated carrier assignment
// - Performance scoring system
```

### 4. Profit Tracking
```javascript
// Implement comprehensive profit tracking:
// - Real-time profit calculations
// - Daily profit summaries
// - Monthly profit reports
// - Average profit per load
// - Best performing routes/carriers
// - Payment status tracking
```

### 5. Simple Dashboard
```javascript
// Create clean, focused dashboard showing:
// - Large daily profit counter
// - Monthly progress toward goals
// - Number of loads processed
// - Average profit per load
// - Recent booking activity
// - System status indicators
```

## API Integrations Needed

### Load Board APIs
```javascript
// Integrate with:
// - DAT iQ API for load searching
// - Truckstop.com API for additional loads
// - 123LoadBoard API for more coverage
// - Handle rate limits and authentication
// - Parse load data consistently
```

### Payment Processing
```javascript
// Simple payment tracking:
// - Track invoice status
// - Monitor payment due dates
// - Calculate outstanding receivables
// - Alert on overdue payments
// - Integration with factoring if needed
```

## Business Logic

### Profit Calculation
```javascript
// Implement smart profit calculation:
// profit = shipperRate - (carrierRate * miles) - fees - insurance - margin
// factors: fuel costs, route difficulty, carrier reliability
// minimum profit threshold: $200
// ideal profit range: $300-500
```

### Automated Decision Making
```javascript
// Create decision engine for:
// - Which loads to book (profit threshold)
// - Which carrier to assign (rate + reliability)
// - When to book (timing optimization)
// - Risk assessment (shipper credit, load value)
```

## Revenue Targets
- Daily: $7,500 profit (25 loads × $300 average)
- Monthly: $225,000 gross profit
- Annual: $2.7M gross profit
- Time investment: 15 minutes daily monitoring

## Technical Stack
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Frontend: React + TypeScript
- Hosting: DigitalOcean Droplet ($25/month)
- APIs: Load board integrations
- Monitoring: Simple logging and alerts

## File Structure
```
load-arbitrage/
├── server/
│   ├── services/
│   │   ├── loadScanner.js
│   │   ├── profitCalculator.js
│   │   ├── autoBooker.js
│   │   ├── carrierMatcher.js
│   │   └── paymentTracker.js
│   ├── routes/
│   │   ├── loads.js
│   │   ├── carriers.js
│   │   ├── bookings.js
│   │   └── profits.js
│   └── index.js
├── client/
│   ├── components/
│   │   ├── ProfitDashboard.jsx
│   │   ├── LoadsTable.jsx
│   │   ├── CarrierList.jsx
│   │   └── BookingHistory.jsx
│   └── App.jsx
├── database/
│   └── schema.sql
└── package.json
```

## Development Priorities
1. **Week 1**: Core load scanning and profit calculation
2. **Week 2**: Automated booking system
3. **Week 3**: Carrier management and matching
4. **Week 4**: Dashboard and monitoring

## Success Metrics
- Process 25+ loads daily
- Maintain $300+ average profit per load
- 90%+ automated booking success rate
- 15-minute daily oversight maximum
- $150K+ monthly profit generation

## Build Instructions for Copilot
Please generate a complete, production-ready codebase for this personal load arbitrage platform. Focus on:
- Simple, maintainable code
- Automated profit generation
- Minimal manual oversight required
- Real-time load processing
- Comprehensive profit tracking
- Clean, focused dashboard

This should be a complete working application that can generate significant monthly income through automated freight load arbitrage.