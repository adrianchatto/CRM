# Project Initiation Document (PID)

## Project Name

**Lightweight Secure CRM for Accountancy & Estate Management Firms**

---

## Background & Problem Statement

Right now, outbound campaigns are tracked manually in Excel and CSV files. This causes daily frustration, errors, and zero visibility on what actually works.

**Real example:**
A campaign goes out → someone replies → nobody can clearly attribute that response back to a campaign without manual digging.

This is inefficient, risky, and doesn't scale.

---

## Objectives

### Primary Goal (MVP)
Replace spreadsheets with a simple, secure web app for:
- Contacts
- Relationships
- Campaign tracking
- Campaign effectiveness

### Secondary Goal (Future)
- Make it multi-tenant so it can be sold to other firms later

---

## Project Constraints & Reality Check

### Development Capacity
- **Developer:** Solo developer, learning modern stack
- **Time Available:** 5-10 hours/week
- **Budget:** £0 (DIY only, no contractors)
- **Realistic Timeline:** 12-24 months for full MVP

### This Means
- Prioritize ruthlessly - can't build everything
- Focus on learning while building
- Accept that progress will be incremental
- Celebrate small wins
- Be ready to simplify if timeline slips

---

## Target Users

### MVP (Phase 1)
- One firm
- Admin user only (you)
- Small number of internal users created by admin

### Future (Phase 2+)
- Multiple firms
- Each firm isolated (data separation)
- Azure SSO per organisation

---

## Key User Problems to Solve

| Problem | Impact |
|---------|--------|
| No CRM | Manual work, errors |
| CSV exports | Time-consuming |
| No relationship tracking | Poor client understanding |
| No campaign attribution | Marketing guesswork |
| Security concerns | Cannot use consumer tools |

---

## ## In-Scope Features (MVP)

### Contact Management
- Create/edit contacts
- **Contact types:**
  - Private business
  - Family estate
  - Individual
- **Relationships:**
  - Person ↔ Business
  - Business ↔ Estate

### Campaign Tracking
- Campaign creation
- Campaign send date
- Campaign channel (email)
- Contacts linked to campaign

### Campaign Response Tracking
- **Mark contact as:**
  - Responded
  - Converted
  - Not interested
- Attribute response to specific campaign

### Visuals & Reporting
- **Simple dashboard:**
  - Campaigns sent vs responses
  - Response rate per campaign
- **Visuals:**
  - Bar chart
  - Timeline

### Security (Non-Negotiable)
- MFA from day one
- Role-based access
- Secure authentication
- Audit logging (basic)

---

## Out of Scope (For Now)
- Full email sending engine
- Complex marketing automation
- Billing & subscriptions
- Mobile app

---

## Compliance Requirements (MUST CLARIFY BEFORE LAUNCH)

**Action Required:** Meet with firm's compliance officer or solicitor to determine:

- [ ] Is GDPR data processing agreement required?
- [ ] Do clients explicitly require SOC 2 or ISO 27001 certification?
- [ ] Are there FCA regulations for storing client financial data?
- [ ] What is the firm's data retention policy?
- [ ] Are there specific security measures in existing contracts?
- [ ] Is cyber insurance required? What are their security requirements?
- [ ] Can data be stored on cloud VPS, or must it be UK-hosted?

**Until clarified:** Build with GDPR basics (data export, deletion), but don't over-engineer for certifications you may not need.

---

## Success Criteria

### Phase 0 Success (First 3 Months - Learning Foundation)
- Development environment set up and working
- Can create/read/update/delete ONE contact
- Basic authentication working (even if simple)
- Deployed somewhere accessible
- **This is success** - proves you can build in the stack

### Phase 1 Success (6 Months Total)
- All contact management features working
- Can log in securely
- Wife's team can actually use it daily

### Phase 2 Success (12 Months Total)
- Campaign tracking functional
- Can link contacts to campaigns
- Basic reporting dashboard

### Phase 3 Success (18 Months Total)
- Campaign effectiveness tracking
- Complete MVP feature set
- No spreadsheets needed
- It feels lighter than Salesforce, not heavier

---

## Key Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Learning curve too steep | Project abandoned after 3 months | Start with simplest possible version, celebrate small wins |
| Time constraints (life happens) | Project stalls for months | Keep scope tiny so any progress = value |
| Technical blockers | Stuck for weeks on one problem | Active online communities, Claude Code assistance, budget for 1-2 hours of contractor help if truly stuck |
| Wife's firm loses patience | Switch back to Excel | Deliver Phase 0 quickly (3 months), get them using SOMETHING |
| Compliance requirements too complex | Can't launch | Clarify requirements BEFORE building, may need to budget for compliance consultant |

---

## Commercial Opportunity (Reality Check)

### Typical Market Pricing (Benchmarks)
- £10–£30 per user/month for small CRM tools
- £50+ per user/month for "secure/enterprise" tools

### Your Angle
- Niche (accountancy & estates)
- Simple
- Secure
- UK-friendly

**That's a real, sellable gap.**

---

## Fallback Options (If This Takes Too Long)

If after 6 months progress is slower than hoped:

1. **Pause & Hire:** Save £3-5k and hire Upwork contractor to accelerate
2. **Simplify Stack:** Switch to PHP/Laravel (leverage existing skills)
3. **No-Code Bridge:** Use Airtable temporarily while continuing to learn
4. **Reframe Timeline:** Accept this is a 2-3 year learning journey

**The goal is to solve the problem** - whether that's through this build or another path.
