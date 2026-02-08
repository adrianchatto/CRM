"""
Seed script to add campaigns, relationships, and campaign responses
Run this after seed_data.py to add campaign functionality
"""
import random
from datetime import datetime, timedelta
from main import SessionLocal, Contact, Campaign, CampaignContact, Relationship, Base, engine

CAMPAIGN_NAMES = [
    ("Tax Year End Planning 2024", "Annual tax planning services reminder"),
    ("Estate Planning Workshop Invitation", "Invitation to our quarterly estate planning seminar"),
    ("New Wealth Management Services", "Introduction to our expanded wealth management offerings"),
    ("Year-End Financial Review", "Annual portfolio review and planning session"),
    ("Trust Administration Update", "Important updates to trust administration services"),
]

def seed_campaigns_and_relationships():
    """Add campaigns, link contacts, and create relationships"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("=" * 60)
        print("Adding Campaigns and Relationships")
        print("=" * 60)

        # Get all contacts
        all_contacts = db.query(Contact).all()
        individuals = [c for c in all_contacts if c.contact_type == "individual"]
        businesses = [c for c in all_contacts if c.contact_type == "business"]
        estates = [c for c in all_contacts if c.contact_type == "estate"]

        print(f"\nFound {len(individuals)} individuals, {len(businesses)} businesses, {len(estates)} estates")

        # Create relationships - link individuals to businesses and estates
        print("\nCreating relationships...")
        relationships_created = 0

        # Link some individuals to businesses (employees/partners)
        for business in businesses[:10]:  # First 10 businesses
            # Each business has 2-4 people associated
            num_people = random.randint(2, min(4, len(individuals)))
            selected_people = random.sample(individuals, num_people)

            for person in selected_people:
                rel = Relationship(
                    from_contact_id=person.id,
                    to_contact_id=business.id,
                    relationship_type="works_for"
                )
                db.add(rel)
                relationships_created += 1

        # Link some individuals to estates (family members)
        for estate in estates:
            # Each estate has 2-5 family members
            num_people = random.randint(2, min(5, len(individuals)))
            selected_people = random.sample(individuals, num_people)

            for person in selected_people:
                rel = Relationship(
                    from_contact_id=person.id,
                    to_contact_id=estate.id,
                    relationship_type="member_of"
                )
                db.add(rel)
                relationships_created += 1

        db.commit()
        print(f"  ✅ Created {relationships_created} relationships")

        # Create campaigns
        print("\nCreating campaigns...")
        campaigns = []

        for i, (name, description) in enumerate(CAMPAIGN_NAMES):
            # Campaigns sent over the last 6 months
            days_ago = random.randint(30, 180)
            send_date = (datetime.now() - timedelta(days=days_ago)).date().isoformat()

            campaign = Campaign(
                name=name,
                description=description,
                channel="email",
                send_date=send_date,
                status="completed",
                created_at=(datetime.now() - timedelta(days=days_ago + 5)).isoformat()
            )
            db.add(campaign)
            db.flush()  # Get the ID
            campaigns.append(campaign)

        db.commit()
        print(f"  ✅ Created {len(campaigns)} campaigns")

        # Link contacts to campaigns with responses
        print("\nLinking contacts to campaigns...")

        for campaign in campaigns:
            # Each campaign sent to 15-30 contacts
            num_recipients = random.randint(15, 30)
            recipients = random.sample(all_contacts, min(num_recipients, len(all_contacts)))

            for contact in recipients:
                # Realistic response distribution:
                # 10-15% converted
                # 15-20% responded (interested but not yet converted)
                # 5-10% not interested
                # Rest pending
                rand = random.random()
                if rand < 0.12:
                    response_status = "converted"
                    response_date = (datetime.fromisoformat(campaign.send_date) +
                                     timedelta(days=random.randint(1, 7))).isoformat()
                elif rand < 0.30:
                    response_status = "responded"
                    response_date = (datetime.fromisoformat(campaign.send_date) +
                                     timedelta(days=random.randint(1, 14))).isoformat()
                elif rand < 0.38:
                    response_status = "not_interested"
                    response_date = (datetime.fromisoformat(campaign.send_date) +
                                     timedelta(days=random.randint(1, 3))).isoformat()
                else:
                    response_status = "pending"
                    response_date = None

                campaign_contact = CampaignContact(
                    campaign_id=campaign.id,
                    contact_id=contact.id,
                    response_status=response_status,
                    response_date=response_date,
                    notes=f"Campaign sent via {campaign.channel}" if response_status != "pending" else None
                )
                db.add(campaign_contact)

        db.commit()
        print("  ✅ Linked contacts to campaigns with realistic responses")

        # Print summary
        print("\n" + "=" * 60)
        print("Summary")
        print("=" * 60)

        for campaign in campaigns:
            campaign_contacts = db.query(CampaignContact).filter(
                CampaignContact.campaign_id == campaign.id
            ).all()

            total = len(campaign_contacts)
            responded = sum(1 for cc in campaign_contacts if cc.response_status == "responded")
            converted = sum(1 for cc in campaign_contacts if cc.response_status == "converted")
            not_interested = sum(1 for cc in campaign_contacts if cc.response_status == "not_interested")
            pending = total - responded - converted - not_interested

            response_rate = (responded + converted) / total * 100 if total > 0 else 0

            print(f"\n{campaign.name}")
            print(f"  Sent to: {total} contacts")
            print(f"  Converted: {converted} ({converted/total*100:.1f}%)")
            print(f"  Responded: {responded} ({responded/total*100:.1f}%)")
            print(f"  Not Interested: {not_interested}")
            print(f"  Pending: {pending}")
            print(f"  Response Rate: {response_rate:.1f}%")

        print("\n" + "=" * 60)
        print("✅ Successfully added campaigns and relationships!")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_campaigns_and_relationships()
