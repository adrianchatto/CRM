"""
Seed script to populate the database with dummy contacts
Run this once to add 50 sample contacts
"""
import random
from datetime import datetime, timedelta
from main import SessionLocal, Contact

# Sample data for generating realistic contacts
FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Nancy", "Daniel", "Lisa",
    "Matthew", "Margaret", "Anthony", "Betty", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Dorothy", "Andrew", "Kimberly", "Paul", "Emily", "Joshua", "Donna",
    "Kenneth", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas",
    "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris",
    "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen",
    "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter"
]

BUSINESS_NAMES = [
    "Ace Accounting Ltd", "Premier Financial Services", "Summit Consulting Group",
    "Heritage Property Management", "Crown Estate Services", "Sterling Investments",
    "Riverside Business Solutions", "Oakwood Financial Advisors", "Pinnacle Wealth Management",
    "Beacon Trust Services", "Horizon Capital Partners", "Atlas Property Holdings",
    "Emerald Group Ltd", "Apex Business Consultants", "Legacy Estate Planning",
    "Windsor Financial Group", "Meridian Accounting Services", "Cornerstone Advisors",
    "Prestige Property Solutions", "Elite Business Management", "Sovereign Wealth Advisors",
    "Noble Estate Services", "Royal Financial Planning", "Empire Business Group"
]

ESTATE_NAMES = [
    "The Morrison Family Trust", "Ashworth Estate", "Pemberton Family Holdings",
    "The Blackwood Trust", "Hartley Estate Management", "Wellington Family Trust",
    "The Fairfax Estate", "Thornbury Family Holdings", "Kensington Trust",
    "The Beaumont Estate", "Stratford Family Trust", "Lancaster Estate Holdings",
    "The Whitmore Trust", "Ashford Family Estate", "Canterbury Holdings",
    "The Westbrook Trust", "Marlborough Estate", "Cheltenham Family Trust"
]

DOMAINS = ["gmail.com", "outlook.com", "yahoo.co.uk", "btinternet.com", "hotmail.co.uk"]

NOTES_TEMPLATES = [
    "Met at networking event in {}. Interested in estate planning services.",
    "Referred by {}. Looking for tax optimization advice.",
    "Existing client since {}. Annual review scheduled for next quarter.",
    "Initial consultation completed. Follow-up call scheduled.",
    "High-value client. Requires white-glove service.",
    "Family business with complex structure. Needs specialist advice.",
    "Recently inherited property. Requires probate services.",
    "Expanding business. Considering restructuring options.",
    "Long-term client. Very satisfied with services.",
    "New client. Onboarding in progress."
]

def generate_uk_phone():
    """Generate a realistic UK phone number"""
    prefixes = ["020", "0161", "0113", "0117", "0131", "0141", "01223", "01865", "07700", "07800", "07900"]
    prefix = random.choice(prefixes)
    if prefix.startswith("07"):  # Mobile
        return f"{prefix} {random.randint(100000, 999999)}"
    else:  # Landline
        return f"{prefix} {random.randint(1000000, 9999999)}"

def generate_contact(contact_type):
    """Generate a single contact"""
    contact = {}

    if contact_type == "individual":
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        contact["full_name"] = f"{first_name} {last_name}"
        contact["contact_type"] = "individual"

        # 80% have email
        if random.random() < 0.8:
            email_name = f"{first_name.lower()}.{last_name.lower()}"
            contact["email"] = f"{email_name}@{random.choice(DOMAINS)}"

        # 70% have phone
        if random.random() < 0.7:
            contact["phone"] = generate_uk_phone()

        # 30% have company name (they work somewhere)
        if random.random() < 0.3:
            contact["company_name"] = random.choice(BUSINESS_NAMES)

    elif contact_type == "business":
        contact["full_name"] = random.choice(BUSINESS_NAMES)
        contact["contact_type"] = "business"
        contact["company_name"] = contact["full_name"]

        # 90% of businesses have email
        if random.random() < 0.9:
            domain = contact["full_name"].lower().replace(" ", "").replace("ltd", "")
            contact["email"] = f"info@{domain}.co.uk"

        # 85% have phone
        if random.random() < 0.85:
            contact["phone"] = generate_uk_phone()

    else:  # estate
        contact["full_name"] = random.choice(ESTATE_NAMES)
        contact["contact_type"] = "estate"

        # 70% have email
        if random.random() < 0.7:
            first_name = random.choice(FIRST_NAMES).lower()
            contact["email"] = f"{first_name}@estatetrust.co.uk"

        # 60% have phone
        if random.random() < 0.6:
            contact["phone"] = generate_uk_phone()

    # 60% have notes
    if random.random() < 0.6:
        note_template = random.choice(NOTES_TEMPLATES)
        if "{}" in note_template:
            if "networking event" in note_template:
                note = note_template.format(random.choice(["London", "Manchester", "Birmingham", "Edinburgh"]))
            elif "Referred by" in note_template:
                note = note_template.format(f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}")
            elif "client since" in note_template:
                year = random.randint(2018, 2023)
                note = note_template.format(str(year))
            else:
                note = note_template
        else:
            note = note_template
        contact["notes"] = note

    # Random creation date within last 6 months
    days_ago = random.randint(0, 180)
    created_at = datetime.now() - timedelta(days=days_ago)
    contact["created_at"] = created_at.isoformat()

    return contact

def seed_database():
    """Populate database with 50 contacts"""
    # Import Base and engine to ensure tables are created
    from main import Base, engine

    # Create all tables if they don't exist
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if database already has contacts
        existing_count = db.query(Contact).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} contacts.")
            response = input("Do you want to add 50 more? (yes/no): ")
            if response.lower() != "yes":
                print("Aborted.")
                return

        # Generate contacts with a good mix
        # 50% individuals, 30% businesses, 20% estates
        contact_types = (
            ["individual"] * 25 +
            ["business"] * 15 +
            ["estate"] * 10
        )
        random.shuffle(contact_types)

        print("Generating 50 contacts...")

        for i, contact_type in enumerate(contact_types, 1):
            contact_data = generate_contact(contact_type)
            contact = Contact(**contact_data)
            db.add(contact)

            if i % 10 == 0:
                print(f"  Created {i} contacts...")

        db.commit()
        print(f"\n✅ Successfully added 50 contacts to the database!")

        # Print summary
        total = db.query(Contact).count()
        individuals = db.query(Contact).filter(Contact.contact_type == "individual").count()
        businesses = db.query(Contact).filter(Contact.contact_type == "business").count()
        estates = db.query(Contact).filter(Contact.contact_type == "estate").count()

        print(f"\nDatabase now contains:")
        print(f"  Total: {total} contacts")
        print(f"  Individuals: {individuals}")
        print(f"  Businesses: {businesses}")
        print(f"  Estates: {estates}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("CRM Database Seeding Script")
    print("=" * 60)
    print()
    seed_database()
    print()
    print("Done! Start the backend and frontend to see the contacts.")
    print("=" * 60)
