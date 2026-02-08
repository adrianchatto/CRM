# How to Populate Database with Sample Data

## Quick Instructions

Run this **after** you've installed the backend dependencies but **before** starting the app for the first time (or anytime you want to add data).

```bash
cd /Users/adrianchatto/Documents/Projects/CRM/backend

# Make sure virtual environment is activated
source venv/bin/activate

# Run the seed script
python seed_data.py
```

That's it! The script will add 50 contacts to your database.

## What Gets Added

The script creates **50 realistic contacts**:
- **25 Individuals** (50%) - People with UK names, emails, phone numbers
- **15 Businesses** (30%) - Companies like "Ace Accounting Ltd", "Sterling Investments"
- **10 Estates** (20%) - Family trusts and estates

### Realistic Details:
- UK-style phone numbers (mobile and landline)
- Realistic email addresses
- Company names for some individuals
- Notes on about 60% of contacts (referral sources, client status, etc.)
- Varied creation dates (spread over last 6 months)
- Not all contacts have complete info (more realistic)

## When to Run This

**Best time:** Right before you show your wife tonight!

1. Install backend dependencies
2. **Run seed_data.py** ← Do this
3. Start the backend
4. Start the frontend
5. Show her a dashboard with 50 contacts already in it 🎉

## Running It Multiple Times

The script will ask if you want to add more if the database already has data. You can say "no" to keep existing data, or "yes" to add another 50.

## Example Output

```
============================================================
CRM Database Seeding Script
============================================================

Generating 50 contacts...
  Created 10 contacts...
  Created 20 contacts...
  Created 30 contacts...
  Created 40 contacts...
  Created 50 contacts...

✅ Successfully added 50 contacts to the database!

Database now contains:
  Total: 50 contacts
  Individuals: 25
  Businesses: 15
  Estates: 10

Done! Start the backend and frontend to see the contacts.
============================================================
```

## Pro Tip

With 50 contacts:
- The dashboard will show meaningful statistics
- The contact list will look like a real working system
- You can show search/filter functionality feels smooth
- It's much more impressive than an empty database!

This makes the demo feel like a "real" system rather than a toy.
