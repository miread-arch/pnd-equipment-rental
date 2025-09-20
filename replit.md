# IT Equipment Rental Management System - P&D Inc

## Overview

This is a comprehensive IT equipment rental management system designed for P&D Inc (피앤디아이앤씨), built as a full-stack web application with React frontend and Node.js/Express backend. The system manages the rental lifecycle of IT equipment including routers, switches, wireless devices, transceivers, and consumables with a multi-tier approval workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with Material Design principles
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with `/api` prefix
- **Session Management**: Session-based authentication with 8-hour timeout
- **File Structure**: Modular approach with separate routes and storage layers

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Comprehensive relational design with enums for categories, statuses, and roles
- **Key Tables**:
  - `users`: Authentication and role management (admin/user)
  - `items`: Equipment inventory with category-based serial number requirements
  - `rentals`: Rental requests and lifecycle tracking
  - `approvals`: Multi-tier approval workflow for consumables

### Authentication System
- **Method**: Simple login with Daou Office ID (email prefix) + name + department
- **Authorization**: Role-based access (admin vs user) with department-specific permissions
- **Admin Access**: Password-protected for "상품운용팀" (Product Operations Team)
- **Session Storage**: Server-side session management

### Design System
- **Theme**: Material Design with enterprise focus
- **Color Palette**: Primary blue (210 100% 50%) with status-specific colors
- **Typography**: Roboto font family
- **Responsive**: PC browser optimized with mobile considerations
- **Dark Mode**: Built-in support with CSS custom properties

### Business Logic Architecture
- **Equipment Categories**: Router, Switch, Wireless, 트랜시버, 소모품
- **Serial Number Management**: Required for hardware, optional for consumables
- **Approval Workflow**: 
  - Single admin approval for hardware
  - Dual admin approval required for consumables
- **Status Tracking**: Complete lifecycle from request to return
- **Notification System**: SMTP email alerts for approvals and overdue items

### File Organization
- **Shared Schema**: Common TypeScript types and database schema in `/shared`
- **Client**: React application in `/client` with component-based architecture
- **Server**: Express backend in `/server` with route and storage abstraction
- **Assets**: Company logo and static assets management

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing

### UI Component Libraries
- **@radix-ui/***: Headless UI primitives for accessibility
- **class-variance-authority**: Type-safe component variant management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Consistent icon library

### Form and Validation
- **react-hook-form**: Performant form handling
- **@hookform/resolvers**: Form validation resolvers
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle and Zod

### Development Tools
- **vite**: Fast development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

### Utility Libraries
- **date-fns**: Modern date utility library
- **clsx**: Utility for constructing className strings
- **nanoid**: URL-safe unique string ID generator

### Email Integration
- **SMTP Configuration**: Ready for email notification system integration
- **Connect-pg-simple**: PostgreSQL session store for Express

### Deployment Architecture
- **Target Platform**: Synology DS1821+ NAS with Docker
- **Container**: Docker Compose setup
- **Port**: 8090 (configured for NAS deployment)
- **Database**: PostgreSQL with 5-year data retention policy