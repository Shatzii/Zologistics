# Zologistics - Global AI-Powered Logistics Platform

## Overview
Zologistics is an enterprise-grade global logistics platform leveraging AI, IoT, and advanced collaboration to revolutionize freight operations. It integrates dispatch management with blockchain smart contracts, autonomous vehicle support, and a cross-company driver collaboration network across trucking, sea, and air freight. The platform aims to provide intelligent load matching, real-time rate optimization, predictive analytics, and a driver-centric experience, targeting a significant share of the global freight market with a strong focus on autonomous operations and ghost load optimization.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
-   **Framework**: React 18 with TypeScript
-   **Styling**: Tailwind CSS with Radix UI components
-   **State Management**: TanStack Query
-   **Real-time Updates**: WebSocket connections
-   **Mobile Support**: Progressive Web App (PWA)

### Backend
-   **Runtime**: Node.js 20 with Express.js
-   **Language**: TypeScript
-   **API Design**: RESTful APIs with WebSocket support
-   **Authentication**: JWT-based with bcrypt
-   **Session Management**: Express sessions with PostgreSQL storage

### Database
-   **Primary Database**: PostgreSQL 16 with Drizzle ORM
-   **Schema Management**: Drizzle Kit
-   **Connection Pooling**: Neon serverless PostgreSQL

### Key Features and Design
-   **Core Dispatch**: AI-optimized load matching, comprehensive driver and fleet management, customer portal.
-   **Advanced AI**: Self-hosted AI engine (5 specialized models), GPT-4 powered rate optimization, predictive analytics, voice assistant.
-   **Collaboration**: Cross-company driver network, real-time multi-user dispatch, blockchain smart contracts for payments, trust-based partnership matching.
-   **IoT Integration**: ELD, GPS, fuel/temperature sensors, autonomous vehicle support (Level 3-5), predictive maintenance, safety monitoring.
-   **Driver-Centric**: Wellness system, personalized load matching, instant payments, paperwork automation.
-   **Multi-modal Logistics**: Comprehensive support for trucking, sea freight, and air freight with distinct revenue opportunities.
-   **Deployment**: Dockerized development, Replit autoscale production deployment, managed PostgreSQL, CDN, monitoring, and security measures (Helmet.js, compression, rate limiting).

## External Dependencies

### AI and Machine Learning
-   **OpenAI GPT-4o**: For market analysis and natural language processing.
-   **Self-Hosted Models**: For core AI functions and computer vision (document/cargo inspection).

### Integrations
-   **Load Boards**: DAT, Truckstop, 123LoadBoard APIs, and a comprehensive database covering global markets.
-   **Weather Services**: Real-time weather data.
-   **Mapping Services**: Route optimization and navigation.
-   **Payment Processing**: Instant payment solutions and blockchain integration.
-   **IoT Devices**: ELD integrations (e.g., Samsara, KeepTruckin).

### Infrastructure
-   **WebSocket Server**: For real-time communication.
-   **File Storage**: For documents and images.
-   **Email/SMS Services**: For notifications and alerts.