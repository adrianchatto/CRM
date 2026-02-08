1. Project Initiation Document (PID)

Project Name

Lightweight Secure CRM for Accountancy & Estate Management Firms

⸻

Background & Problem Statement

Right now, outbound campaigns are tracked manually in Excel and CSV files.
This causes daily frustration, errors, and zero visibility on what actually works.

Real example:
A campaign goes out → someone replies → nobody can clearly attribute that response back to a campaign without manual digging.

This is inefficient, risky, and doesn’t scale.

⸻

Objectives

Primary goal (MVP):
	•	Replace spreadsheets with a simple, secure web app for:
	•	Contacts
	•	Relationships
	•	Campaign tracking
	•	Campaign effectiveness

Secondary goal (future):
	•	Make it multi-tenant so it can be sold to other firms later.

⸻

Target Users

MVP (Phase 1)
	•	One firm
	•	Admin user only (you)
	•	Small number of internal users created by admin

Future (Phase 2+)
	•	Multiple firms
	•	Each firm isolated (data separation)
	•	Azure SSO per organisation

  Key User Problems to Solve

  Problem
Impact
No CRM
Manual work, errors
CSV exports
Time-consuming
No relationship tracking
Poor client understanding
No campaign attribution
Marketing guesswork
Security concerns
Cannot use consumer tools

In-Scope Features (MVP)

Contact Management
	•	Create/edit contacts
	•	Contact types:
	•	Private business
	•	Family estate
	•	Individual
	•	Relationships:
	•	Person ↔ Business
	•	Business ↔ Estate

Campaign Tracking
	•	Campaign creation
	•	Campaign send date
	•	Campaign channel (email)
	•	Contacts linked to campaign

Campaign Response Tracking
	•	Mark contact as:
	•	Responded
	•	Converted
	•	Not interested
	•	Attribute response to specific campaign

Visuals & Reporting
	•	Simple dashboard:
	•	Campaigns sent vs responses
	•	Response rate per campaign
	•	Visuals:
	•	Bar chart
	•	Timeline

Security (Non-Negotiable)
	•	MFA from day one
	•	Role-based access
	•	Secure authentication
	•	Audit logging (basic)

⸻

Out of Scope (For Now)
	•	Full email sending engine
	•	Complex marketing automation
	•	Billing & subscriptions
	•	Mobile app

⸻

Success Criteria

The MVP is successful if:
	•	No spreadsheets are needed
	•	Campaign responses are visible in one place
	•	A non-technical user can use it daily
	•	It feels lighter than Salesforce, not heavier

⸻

Commercial Opportunity (Reality Check)

Typical market pricing (benchmarks):
	•	£10–£30 per user / month for small CRM tools
	•	£50+ per user / month for “secure / enterprise” tools

Your angle:
	•	Niche (accountancy & estates)
	•	Simple
	•	Secure
	•	UK-friendly

That’s a real, sellable gap.
