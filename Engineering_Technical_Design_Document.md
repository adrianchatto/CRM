# Engineering & Technical Design Document

## 0. Read This First: Simplified Learning-Based MVP

**IMPORTANT:** This document contains the "complete" architecture, but **you should NOT build all of this initially**. Here's your actual learning path:

### Phase 0: "Hello World" (Month 1-3) - PROVE YOU CAN BUILD
**Goal:** Get something working, anything working.

**Build:**
- React frontend with ONE page (contact list)
- FastAPI backend with ONE endpoint (get contacts)
- SQLite database (not PostgreSQL)
- Simple password auth (no MFA, no JWT)
- Run locally only

**Learn:**
- React basics & TypeScript
- FastAPI basics
- SQLAlchemy basics
- How to connect frontend to backend

**Skip entirely:**
- Complex authentication
- Audit logging
- Multi-tenancy considerations
- Production deployment
- Analytics/dashboards

**Success = Your wife can open http://localhost:3000 and see a contact list**

### Phase 1: Basic CRUD (Month 4-6) - MAKE IT USEFUL
**Add:**
- Create/edit/delete contacts
- Simple login (username/password, session cookies)
- Basic styling (Tailwind CSS)
- Deploy to free hosting (Railway or Fly.io)

**Still skip:**
- Campaigns
- Relationships
- MFA
- Audit logs

**Success = Wife's team uses it instead of Excel for contacts**

### Phase 2: Campaign Basics (Month 7-12) - ADD CORE VALUE
**Add:**
- Create campaigns
- Link contacts to campaigns
- Mark response status
- Basic campaign list view

**Still skip:**
- Analytics dashboard
- Complex relationships
- MFA
- Advanced security

**Success = Can track which campaign generated which response**

### Phase 3: Polish & Secure (Month 13-18) - PRODUCTION READY
**Now add:**
- MFA (if compliance requires)
- Proper JWT authentication
- Basic audit logging
- Campaign effectiveness charts
- Switch SQLite → PostgreSQL
- Proper production setup

### Phase 4: Multi-Tenant (Month 19-24) - IF SELLING TO OTHERS
Only if you're actually selling to other firms.

---

## 1. Architecture Overview

The system is a modern web application built with a **React frontend**, **Python FastAPI backend**, and **PostgreSQL database**. The architecture follows a clean separation of concerns with RESTful API communication between layers.

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│          Frontend (React + TypeScript)           │
│  - SPA with React Router                        │
│  - State management (Context/Redux)             │
│  - UI Components                                 │
└────────────────┬────────────────────────────────┘
                 │ HTTPS/REST
                 │
┌────────────────▼────────────────────────────────┐
│          Backend (FastAPI + Python)              │
│  - RESTful API endpoints                        │
│  - Authentication & Authorization               │
│  - Business logic layer                         │
│  - Data validation                              │
└────────────────┬────────────────────────────────┘
                 │ SQL
                 │
┌────────────────▼────────────────────────────────┐
│          Database (PostgreSQL)                   │
│  - Relational data storage                      │
│  - ACID transactions                            │
│  - Audit logs                                   │
└─────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Simplified Stack (Phase 0-1) - START HERE

**Why Simplified:**
- Fewer moving parts = faster learning
- Can always upgrade later
- SQLite → PostgreSQL is straightforward migration
- Simple auth → JWT/MFA is additive

**Start With:**
- **Frontend:** React 18 + TypeScript (use Vite create template)
- **Styling:** Tailwind CSS (utility-first, easier than custom CSS)
- **Backend:** FastAPI + Python 3.11+
- **ORM:** SQLAlchemy 2.0
- **Database:** SQLite (single file, no server to manage)
- **Auth:** FastAPI session cookies (not JWT initially)
- **Hosting:** Railway free tier or Fly.io (easier than VPS)

**Upgrade Later (Phase 3+):**
- SQLite → PostgreSQL (when you have >1000 contacts)
- Session auth → JWT + MFA (when compliance clarified)
- Railway → VPS (when you need more control)

### Full Stack (Phase 3+) - Upgrade When Needed

### Frontend
- **Framework:** React 18+ with TypeScript
- **Routing:** React Router v6
- **State Management:** React Context API / Redux Toolkit
- **UI Library:** Material-UI / Tailwind CSS
- **Charts:** Recharts / Chart.js
- **HTTP Client:** Axios
- **Build Tool:** Vite

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy 2.0
- **Authentication:** FastAPI Security + JWT tokens
- **MFA:** PyOTP (TOTP)
- **Validation:** Pydantic v2
- **Testing:** Pytest
- **API Documentation:** Auto-generated OpenAPI/Swagger

### Database
- **Primary Database:** PostgreSQL 15+
- **Migration Tool:** Alembic
- **Connection Pooling:** SQLAlchemy pool

### Infrastructure
- **Hosting:** Linux VPS (Ubuntu 22.04 LTS)
- **Web Server:** Nginx (reverse proxy)
- **WSGI Server:** Uvicorn
- **Process Manager:** Systemd / Supervisor
- **SSL/TLS:** Let's Encrypt certificates
- **Future:** Azure migration-ready architecture

---

## 3. Database Schema

### Phase 0-1 Simplified Schema (START WITH THIS)

**Only build these tables initially:**

#### users (minimal)
```sql
users
  - id (INTEGER PRIMARY KEY)  -- SQLite auto-increment
  - email (TEXT UNIQUE)
  - password_hash (TEXT)
  - full_name (TEXT)
  - created_at (TEXT)  -- SQLite uses TEXT for dates
```

#### contacts (minimal)
```sql
contacts
  - id (INTEGER PRIMARY KEY)
  - contact_type (TEXT)  -- 'individual', 'business', or 'estate'
  - full_name (TEXT)
  - email (TEXT)
  - phone (TEXT)
  - notes (TEXT)
  - created_at (TEXT)
```

**Skip these until Phase 2+:**
- relationships table
- campaigns table
- campaign_contacts table
- audit_logs table
- tenants table

**Note:** UUIDs are better, but INTEGER PRIMARY KEY is simpler to start. You can migrate later.

---

### Full Schema (Phase 2+) - Add When Ready

#### Users
```sql
users
  - id (UUID, PK)
  - email (VARCHAR, UNIQUE)
  - password_hash (VARCHAR)
  - full_name (VARCHAR)
  - role (ENUM: admin, user, viewer)
  - mfa_enabled (BOOLEAN)
  - mfa_secret (VARCHAR, ENCRYPTED)
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

#### Contacts
```sql
contacts
  - id (UUID, PK)
  - contact_type (ENUM: individual, business, estate)
  - first_name (VARCHAR)
  - last_name (VARCHAR)
  - company_name (VARCHAR)
  - email (VARCHAR)
  - phone (VARCHAR)
  - address (TEXT)
  - notes (TEXT)
  - created_by (UUID, FK → users.id)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

#### Relationships
```sql
relationships
  - id (UUID, PK)
  - from_contact_id (UUID, FK → contacts.id)
  - to_contact_id (UUID, FK → contacts.id)
  - relationship_type (ENUM: works_for, owns, manages, related_to)
  - notes (TEXT)
  - created_at (TIMESTAMP)
```

#### Campaigns
```sql
campaigns
  - id (UUID, PK)
  - name (VARCHAR)
  - description (TEXT)
  - channel (ENUM: email, phone, mail)
  - send_date (DATE)
  - status (ENUM: draft, sent, completed)
  - created_by (UUID, FK → users.id)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
```

#### Campaign Contacts
```sql
campaign_contacts
  - id (UUID, PK)
  - campaign_id (UUID, FK → campaigns.id)
  - contact_id (UUID, FK → contacts.id)
  - response_status (ENUM: pending, responded, converted, not_interested)
  - response_date (TIMESTAMP)
  - notes (TEXT)
  - created_at (TIMESTAMP)
```

#### Audit Logs
```sql
audit_logs
  - id (UUID, PK)
  - user_id (UUID, FK → users.id)
  - action (VARCHAR)
  - entity_type (VARCHAR)
  - entity_id (UUID)
  - changes (JSONB)
  - ip_address (VARCHAR)
  - created_at (TIMESTAMP)
```

---

## 4. API Design

### Authentication Endpoints
```
POST   /api/auth/register          - User registration (admin only)
POST   /api/auth/login             - Login with email/password
POST   /api/auth/mfa/setup         - Enable MFA
POST   /api/auth/mfa/verify        - Verify MFA token
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh           - Refresh JWT token
```

### Contact Endpoints
```
GET    /api/contacts               - List all contacts (paginated)
GET    /api/contacts/:id           - Get contact details
POST   /api/contacts               - Create contact
PUT    /api/contacts/:id           - Update contact
DELETE /api/contacts/:id           - Delete contact
GET    /api/contacts/:id/relationships - Get contact relationships
```

### Campaign Endpoints
```
GET    /api/campaigns              - List all campaigns
GET    /api/campaigns/:id          - Get campaign details
POST   /api/campaigns              - Create campaign
PUT    /api/campaigns/:id          - Update campaign
DELETE /api/campaigns/:id          - Delete campaign
GET    /api/campaigns/:id/contacts - Get campaign contacts
POST   /api/campaigns/:id/contacts - Add contacts to campaign
PUT    /api/campaigns/:id/contacts/:contactId - Update response status
```

### Analytics Endpoints
```
GET    /api/analytics/dashboard    - Dashboard summary
GET    /api/analytics/campaigns/:id - Campaign performance metrics
```

---

## 5. Security Architecture

### Authentication & Authorization
- **JWT Tokens:** Access tokens (15 min) + Refresh tokens (7 days)
- **MFA:** TOTP-based two-factor authentication
- **Password Policy:** Minimum 12 characters, complexity requirements
- **Session Management:** Secure cookie storage, httpOnly flags

### Role-Based Access Control (RBAC)
| Role   | Permissions |
|--------|-------------|
| Admin  | Full access: create users, manage all data, view audit logs |
| User   | CRUD contacts, campaigns, view own data |
| Viewer | Read-only access to contacts and campaigns |

### Data Protection
- **Encryption at Rest:** Database encryption (PostgreSQL native)
- **Encryption in Transit:** TLS 1.3 (Let's Encrypt)
- **Sensitive Data:** MFA secrets encrypted with Fernet
- **API Rate Limiting:** 100 requests/minute per user

### Audit Logging
All critical actions logged:
- User login/logout
- Contact/campaign CRUD operations
- Permission changes
- Failed authentication attempts

---

## 6. Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── MFASetup.tsx
│   ├── contacts/
│   │   ├── ContactList.tsx
│   │   ├── ContactForm.tsx
│   │   └── ContactDetails.tsx
│   ├── campaigns/
│   │   ├── CampaignList.tsx
│   │   ├── CampaignForm.tsx
│   │   └── CampaignDashboard.tsx
│   └── shared/
│       ├── Layout.tsx
│       └── DataTable.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Contacts.tsx
│   └── Campaigns.tsx
├── services/
│   ├── api.ts
│   └── auth.ts
├── hooks/
│   └── useAuth.ts
└── types/
    └── index.ts
```

### State Management
- **Global State:** User authentication, theme preferences
- **Local State:** Form inputs, UI toggles
- **Server State:** React Query for API data caching

---

## 7. Deployment Strategy

### Development Environment
- Local PostgreSQL database
- FastAPI development server
- Vite development server with HMR

### Production Environment
```
┌─────────────────────────────────────────┐
│         Nginx (Port 80/443)             │
│  - SSL termination                      │
│  - Reverse proxy                        │
│  - Static file serving                  │
└──────────┬──────────────┬───────────────┘
           │              │
    ┌──────▼──────┐  ┌───▼──────────┐
    │   FastAPI   │  │  React Build │
    │  (Uvicorn)  │  │  (Static)    │
    │  Port 8000  │  │              │
    └──────┬──────┘  └──────────────┘
           │
    ┌──────▼──────────┐
    │   PostgreSQL    │
    │   Port 5432     │
    └─────────────────┘
```

### CI/CD Pipeline (Future)
1. **Build:** Run tests, type checking
2. **Deploy:** Blue-green deployment
3. **Monitoring:** Health checks, error tracking

---

## 8. Scalability & Multi-Tenancy

### Phase 1: Single Tenant (MVP)
- One database for one organization
- Simple deployment

### Phase 2: Multi-Tenant Architecture
**Approach:** Shared database with tenant isolation

```sql
-- Add to all tables
tenant_id (UUID, FK → tenants.id)

tenants
  - id (UUID, PK)
  - name (VARCHAR)
  - subdomain (VARCHAR, UNIQUE)
  - azure_tenant_id (VARCHAR)
  - is_active (BOOLEAN)
  - created_at (TIMESTAMP)
```

**Benefits:**
- Row-level security (PostgreSQL RLS)
- Single codebase
- Easier maintenance
- Cost-effective

---

## 9. Testing Strategy

### Backend Testing
- **Unit Tests:** Business logic, utilities
- **Integration Tests:** API endpoints, database operations
- **Coverage Target:** >80%

### Frontend Testing
- **Unit Tests:** Components, hooks
- **Integration Tests:** User flows
- **E2E Tests:** Critical paths (Playwright/Cypress)

---

## 10. Monitoring & Maintenance

### Logging
- Application logs: Structured JSON logs
- Error tracking: Sentry integration
- Performance monitoring: Response times, slow queries

### Backups
- **Database:** Daily automated backups (7-day retention)
- **Config:** Version controlled in Git

### Health Checks
- `/health` endpoint for uptime monitoring
- Database connection check
- Disk space monitoring

---

## 11. Future Enhancements

### Phase 2+
- Azure AD SSO integration
- Email sending integration (SendGrid/AWS SES)
- Advanced reporting & analytics
- Mobile-responsive PWA
- Export to Excel/PDF
- Bulk import from CSV
- Custom fields per tenant

---

## 12. Getting Started: Development Environment Setup

### Prerequisites
- Install Python 3.11+ from [python.org](https://www.python.org/)
- Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Install VS Code (recommended IDE) from [code.visualstudio.com](https://code.visualstudio.com/)
- Install Git from [git-scm.com](https://git-scm.com/)

### Backend Setup (15 minutes)
```bash
# Create project folder
mkdir crm-mvp && cd crm-mvp

# Create backend
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy

# Create first file: main.py
# (Start with FastAPI "Hello World" example)

# Run it
uvicorn main:app --reload
```

### Frontend Setup (10 minutes)
```bash
# In project root
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm run dev
```

### Your First Goal
Get backend returning JSON at http://localhost:8000 and frontend displaying it. That's it. One API call working = huge victory.

### Learning Resources
- **FastAPI:** https://fastapi.tiangolo.com/tutorial/
- **React:** https://react.dev/learn
- **SQLAlchemy:** https://docs.sqlalchemy.org/en/20/tutorial/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

### When You Get Stuck
1. Read error messages carefully (they're usually helpful)
2. Google the exact error message
3. Ask Claude Code for help with specific errors
4. Check Stack Overflow
5. If stuck >2 hours, ask in Discord/Reddit communities:
   - r/FastAPI
   - r/reactjs
   - FastAPI Discord

---

## 13. Build Order (Detailed Week-by-Week)

### Week 1-2: Environment & Hello World
- [ ] Set up Python environment
- [ ] Set up Node environment
- [ ] Create FastAPI "Hello World"
- [ ] Create React "Hello World"
- [ ] Get them talking (one API call)

### Week 3-6: First Database Operations
- [ ] Create SQLite database
- [ ] Define Contact model in SQLAlchemy
- [ ] Create "get all contacts" endpoint
- [ ] Create "create contact" endpoint
- [ ] Display contacts in React (hardcoded data first)
- [ ] Connect React to real API

### Week 7-10: CRUD Complete
- [ ] Add edit contact endpoint
- [ ] Add delete contact endpoint
- [ ] Build contact form in React
- [ ] Add basic styling with Tailwind

### Week 11-12: Simple Authentication
- [ ] Create users table
- [ ] Password hashing (bcrypt)
- [ ] Login endpoint
- [ ] Session management (FastAPI session cookies)
- [ ] Protect contact endpoints (require login)

### Week 13: First Deployment
- [ ] Sign up for Railway/Fly.io
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test live URL with wife's team

**If you get here in 3 months, you're doing GREAT.**

### Month 4-6: Campaigns (Phase 2)
Only start this after Phase 1 is working and being used.

### Month 7+: Polish & Advanced Features
Only after campaigns are working.

---

## 14. Development Timeline (Realistic for Learning While Building)

**Assumptions:** 5-10 hours/week, learning as you go

| Phase | Deliverable | Time | Cumulative |
|-------|-------------|------|------------|
| 0 | Environment setup + Hello World | 2-4 weeks | 1 month |
| 0 | First database operations (read contacts) | 4-6 weeks | 3 months |
| 1 | Complete contact CRUD | 6-8 weeks | 5 months |
| 1 | Simple authentication | 2-4 weeks | 6 months |
| 1 | First deployment + user testing | 2 weeks | 6.5 months |
| 2 | Campaign creation & tracking | 8-10 weeks | 9 months |
| 2 | Campaign response tracking | 4-6 weeks | 11 months |
| 3 | Dashboard & analytics | 6-8 weeks | 13 months |
| 3 | MFA & advanced security | 4-6 weeks | 15 months |
| 3 | Production hardening | 4-6 weeks | 17 months |
| 4 | Multi-tenancy (if needed) | 8-12 weeks | 20 months |

**Total Realistic Timeline: 15-20 months for full MVP**

**Buffer:** Add 20-30% for life happening (holidays, busy work periods, etc.)

**Reality Check:** If you're not making steady progress after 6 months, revisit the fallback options in the Project Initiation document.

---

## 15. When to Add Complexity (Decision Tree)

### Should I add MFA?
**Add it if:**
- Compliance audit explicitly requires it
- Storing highly sensitive financial data
- Firm has been breached before

**Skip it if:**
- Just using it internally with team you trust
- No compliance requirement
- Phase 0-1 (focus on getting it working first)

**Timeline:** Add in Phase 3 (month 13+)

---

### Should I use PostgreSQL vs SQLite?
**Use PostgreSQL if:**
- >1000 contacts
- Multiple concurrent users (>5)
- Preparing for multi-tenancy

**Use SQLite if:**
- <500 contacts
- Small team (<5 users)
- Just getting started

**Timeline:** Start SQLite, migrate to PostgreSQL in Phase 3 if needed

---

### Should I add audit logging?
**Add it if:**
- Compliance explicitly requires it
- Need to prove who changed what
- Regulated industry requirement

**Skip it if:**
- Trust your small team
- No compliance requirement
- Phase 0-2

**Timeline:** Add in Phase 3 (month 13+) if needed

---

### Should I build multi-tenancy?
**Only build if:**
- Actually have 2+ firms ready to use it
- Planning to sell it commercially
- Have proof of demand

**Don't build if:**
- Only one firm using it
- Just solving your own problem
- Haven't validated market demand

**Timeline:** Phase 4 (month 19+) and only if actually selling

---

### The Pattern: Start Simple, Add When Needed
**Key principle:** Start simple. Add complexity when you have a specific, validated reason. Not before.

- Build the simplest thing that could work
- Get it into users' hands
- Learn what they actually need
- Add complexity based on real usage, not hypothetical futures
