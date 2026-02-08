# CRM MVP - Setup Instructions

A simple, local CRM for managing contacts. Built with FastAPI (Python) and React (TypeScript).

## What This Demo Shows

- ✅ Dashboard with contact statistics
- ✅ Add, edit, and delete contacts
- ✅ Three contact types: Individual, Business, Estate
- ✅ Clean, professional UI
- ✅ All data stored locally (SQLite)

## Quick Start (15 minutes)

### Prerequisites

Make sure you have these installed:
- Python 3.11 or higher
- Node.js 18 or higher

Check your versions:
```bash
python3 --version
node --version
```

### Step 1: Set Up Backend (5 minutes)

Open a terminal and navigate to the project folder:

```bash
cd /Users/adrianchatto/Documents/Projects/CRM

# Go to backend folder
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# OPTIONAL: Add 50 sample contacts (recommended for demo!)
python seed_data.py

# Start the backend server
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open!** The backend needs to stay running.

### Step 2: Set Up Frontend (5 minutes)

Open a **NEW terminal** (keep the backend running in the first one):

```bash
cd /Users/adrianchatto/Documents/Projects/CRM

# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser

Open your browser and go to:
**http://localhost:5173**

You should see the CRM dashboard!

## Populating with Sample Data (Recommended!)

To make the demo more impressive, add 50 realistic contacts:

```bash
cd backend
source venv/bin/activate
python seed_data.py
```

This adds:
- 25 Individuals with UK names
- 15 Businesses (accounting firms, consultancies)
- 10 Family estates and trusts
- Realistic emails, phone numbers, and notes

**Much more impressive than an empty database!** See [SEED_DATABASE.md](SEED_DATABASE.md) for details.

## How to Use It

1. **Dashboard Tab**: See statistics about your contacts
2. **Contacts Tab**: View all contacts, add new ones, edit, or delete
3. **Add Contact**: Click "Add Contact" button, fill in the form
4. **Edit Contact**: Click "Edit" next to any contact
5. **Delete Contact**: Click "Delete" (it will ask for confirmation)

## What to Show Your Wife Tonight

1. **The Dashboard**: "This shows how many contacts we have at a glance"
2. **Add a Contact**: "Let's add one of your clients" - show the form
3. **Contact Types**: "We can track individuals, businesses, and estates"
4. **Edit/Delete**: "Easy to update or remove contacts"
5. **Clean Interface**: "Much better than Excel spreadsheets, right?"

## For Discussion

Ask her:
- Does this feel useful?
- What's missing that you'd want to see?
- Would your team actually use this instead of Excel?
- What about tracking campaigns - how important is that?

## Next Steps (After Feedback)

Based on her feedback, you can add:
- Campaign tracking (link contacts to marketing campaigns)
- Response tracking (did they respond? convert?)
- Simple reporting/charts
- Export to CSV
- Basic login (so only your team can access it)

## Troubleshooting

### Backend won't start
- Make sure Python 3.11+ is installed
- Check you're in the virtual environment (you should see `(venv)` in your terminal)
- Try: `pip install --upgrade pip` then `pip install -r requirements.txt` again

### Frontend won't start
- Make sure Node.js 18+ is installed
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again
- Check the backend is running on port 8000

### Can't see any contacts
- Check the browser console for errors (F12 key)
- Make sure both backend (port 8000) and frontend (port 5173) are running
- Try adding a contact - the database is empty initially

### Database file
The SQLite database file (`crm.db`) will be created automatically in the `backend` folder when you first run the backend. All your data is stored there.

## Stopping the App

When you're done:
1. In the frontend terminal: Press `Ctrl + C`
2. In the backend terminal: Press `Ctrl + C`
3. Deactivate the Python environment: `deactivate`

## Starting Again Later

Backend:
```bash
cd /Users/adrianchatto/Documents/Projects/CRM/backend
source venv/bin/activate
python main.py
```

Frontend (new terminal):
```bash
cd /Users/adrianchatto/Documents/Projects/CRM/frontend
npm run dev
```

---

**Built with:** FastAPI, React, TypeScript, Tailwind CSS, SQLite
**Status:** MVP Demo (Phase 0)
**Next:** Get feedback, iterate, add campaigns
