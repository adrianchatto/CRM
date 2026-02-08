from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./crm.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    contact_type = Column(String)  # individual, business, estate
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    from_contact_id = Column(Integer, index=True)
    to_contact_id = Column(Integer, index=True)
    relationship_type = Column(String)  # works_for, member_of, manages
    created_at = Column(String, default=lambda: datetime.now().isoformat())

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    channel = Column(String)  # email, phone, mail
    send_date = Column(String)
    status = Column(String)  # draft, sent, completed
    created_at = Column(String, default=lambda: datetime.now().isoformat())

class CampaignContact(Base):
    __tablename__ = "campaign_contacts"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, index=True)
    contact_id = Column(Integer, index=True)
    response_status = Column(String)  # pending, responded, converted, not_interested
    response_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.now().isoformat())

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models for API
class ContactBase(BaseModel):
    full_name: str
    contact_type: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None
    channel: str
    send_date: str
    status: str

class CampaignCreate(CampaignBase):
    pass

class CampaignResponse(CampaignBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI(title="CRM MVP", version="0.1.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "CRM API is running", "version": "0.1.0"}

@app.get("/api/contacts", response_model=List[ContactResponse])
def get_contacts(db: Session = Depends(get_db)):
    """Get all contacts"""
    contacts = db.query(Contact).all()
    return contacts

@app.get("/api/contacts/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Get a specific contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact

@app.post("/api/contacts", response_model=ContactResponse)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Create a new contact"""
    db_contact = Contact(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.put("/api/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, contact: ContactUpdate, db: Session = Depends(get_db)):
    """Update a contact"""
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for key, value in contact.dict().items():
        setattr(db_contact, key, value)

    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.delete("/api/contacts/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Delete a contact"""
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(db_contact)
    db.commit()
    return {"message": "Contact deleted successfully"}

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get basic statistics"""
    total_contacts = db.query(Contact).count()
    individuals = db.query(Contact).filter(Contact.contact_type == "individual").count()
    businesses = db.query(Contact).filter(Contact.contact_type == "business").count()
    estates = db.query(Contact).filter(Contact.contact_type == "estate").count()
    total_campaigns = db.query(Campaign).count()

    return {
        "total_contacts": total_contacts,
        "total_campaigns": total_campaigns,
        "by_type": {
            "individual": individuals,
            "business": businesses,
            "estate": estates
        }
    }

@app.get("/api/contacts/{contact_id}/relationships")
def get_contact_relationships(contact_id: int, db: Session = Depends(get_db)):
    """Get all contacts related to this contact"""
    # Get relationships where this contact is the source
    relationships = db.query(Relationship).filter(
        Relationship.from_contact_id == contact_id
    ).all()

    related_contacts = []
    for rel in relationships:
        contact = db.query(Contact).filter(Contact.id == rel.to_contact_id).first()
        if contact:
            related_contacts.append({
                "id": contact.id,
                "full_name": contact.full_name,
                "contact_type": contact.contact_type,
                "relationship_type": rel.relationship_type,
                "email": contact.email,
                "phone": contact.phone
            })

    return related_contacts

@app.get("/api/campaigns", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    """Get all campaigns"""
    campaigns = db.query(Campaign).all()
    return campaigns

@app.get("/api/campaigns/{campaign_id}")
def get_campaign_details(campaign_id: int, db: Session = Depends(get_db)):
    """Get campaign with response statistics"""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get campaign contacts and statistics
    campaign_contacts = db.query(CampaignContact).filter(
        CampaignContact.campaign_id == campaign_id
    ).all()

    total_sent = len(campaign_contacts)
    responded = sum(1 for cc in campaign_contacts if cc.response_status == "responded")
    converted = sum(1 for cc in campaign_contacts if cc.response_status == "converted")
    not_interested = sum(1 for cc in campaign_contacts if cc.response_status == "not_interested")
    pending = total_sent - responded - converted - not_interested

    response_rate = (responded + converted) / total_sent * 100 if total_sent > 0 else 0

    return {
        "id": campaign.id,
        "name": campaign.name,
        "description": campaign.description,
        "channel": campaign.channel,
        "send_date": campaign.send_date,
        "status": campaign.status,
        "created_at": campaign.created_at,
        "stats": {
            "total_sent": total_sent,
            "responded": responded,
            "converted": converted,
            "not_interested": not_interested,
            "pending": pending,
            "response_rate": round(response_rate, 1)
        }
    }

@app.get("/api/contacts/export/csv")
def export_contacts_csv(db: Session = Depends(get_db)):
    """Export all contacts as CSV"""
    from fastapi.responses import Response
    import csv
    from io import StringIO

    contacts = db.query(Contact).all()

    output = StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(["Full Name", "Contact Type", "Email", "Phone", "Company", "Notes"])

    # Write data
    for contact in contacts:
        writer.writerow([
            contact.full_name,
            contact.contact_type,
            contact.email or "",
            contact.phone or "",
            contact.company_name or "",
            contact.notes or ""
        ])

    csv_content = output.getvalue()
    output.close()

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=contacts.csv"}
    )

@app.get("/api/campaigns/{campaign_id}/contacts")
def get_campaign_contacts(campaign_id: int, status: Optional[str] = None, db: Session = Depends(get_db)):
    """Get contacts for a campaign, optionally filtered by response status"""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Build query for campaign contacts
    query = db.query(CampaignContact).filter(CampaignContact.campaign_id == campaign_id)

    if status:
        query = query.filter(CampaignContact.response_status == status)

    campaign_contacts = query.all()

    # Get full contact details and relationships for each
    results = []
    for cc in campaign_contacts:
        contact = db.query(Contact).filter(Contact.id == cc.contact_id).first()
        if contact:
            # Get relationships for this contact
            relationships = db.query(Relationship).filter(
                Relationship.from_contact_id == contact.id
            ).all()

            relationship_summary = []
            for rel in relationships:
                related_contact = db.query(Contact).filter(Contact.id == rel.to_contact_id).first()
                if related_contact:
                    relationship_summary.append({
                        "type": rel.relationship_type,
                        "organisation": related_contact.full_name
                    })

            results.append({
                "id": contact.id,
                "full_name": contact.full_name,
                "contact_type": contact.contact_type,
                "email": contact.email,
                "phone": contact.phone,
                "response_status": cc.response_status,
                "response_date": cc.response_date,
                "relationships": relationship_summary
            })

    return results

@app.get("/api/organisations")
def get_organisations(db: Session = Depends(get_db)):
    """Get all business and estate contacts"""
    organisations = db.query(Contact).filter(
        Contact.contact_type.in_(["business", "estate"])
    ).all()

    # Add count of linked people for each org
    results = []
    for org in organisations:
        # Count relationships where this org is the target
        linked_people = db.query(Relationship).filter(
            Relationship.to_contact_id == org.id
        ).count()

        results.append({
            "id": org.id,
            "full_name": org.full_name,
            "contact_type": org.contact_type,
            "email": org.email,
            "phone": org.phone,
            "notes": org.notes,
            "linked_people_count": linked_people
        })

    return results

@app.get("/api/organisations/{org_id}")
def get_organisation_detail(org_id: int, db: Session = Depends(get_db)):
    """Get organisation detail with all linked people"""
    org = db.query(Contact).filter(Contact.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")

    if org.contact_type not in ["business", "estate"]:
        raise HTTPException(status_code=400, detail="Contact is not a business or estate")

    # Get all relationships where this org is the target (people linked TO this org)
    relationships = db.query(Relationship).filter(
        Relationship.to_contact_id == org_id
    ).all()

    linked_people = []
    for rel in relationships:
        person = db.query(Contact).filter(Contact.id == rel.from_contact_id).first()
        if person:
            linked_people.append({
                "relationship_id": rel.id,
                "person_id": person.id,
                "full_name": person.full_name,
                "contact_type": person.contact_type,
                "email": person.email,
                "phone": person.phone,
                "relationship_type": rel.relationship_type,
                "created_at": rel.created_at
            })

    return {
        "id": org.id,
        "full_name": org.full_name,
        "contact_type": org.contact_type,
        "email": org.email,
        "phone": org.phone,
        "notes": org.notes,
        "created_at": org.created_at,
        "linked_people": linked_people
    }

class RelationshipCreate(BaseModel):
    from_contact_id: int
    to_contact_id: int
    relationship_type: str

@app.post("/api/relationships")
def create_relationship(relationship: RelationshipCreate, db: Session = Depends(get_db)):
    """Create a new relationship between contacts"""
    # Verify both contacts exist
    from_contact = db.query(Contact).filter(Contact.id == relationship.from_contact_id).first()
    to_contact = db.query(Contact).filter(Contact.id == relationship.to_contact_id).first()

    if not from_contact or not to_contact:
        raise HTTPException(status_code=404, detail="One or both contacts not found")

    # Check if relationship already exists
    existing = db.query(Relationship).filter(
        Relationship.from_contact_id == relationship.from_contact_id,
        Relationship.to_contact_id == relationship.to_contact_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Relationship already exists")

    db_relationship = Relationship(**relationship.dict())
    db.add(db_relationship)
    db.commit()
    db.refresh(db_relationship)

    return {
        "id": db_relationship.id,
        "from_contact_id": db_relationship.from_contact_id,
        "to_contact_id": db_relationship.to_contact_id,
        "relationship_type": db_relationship.relationship_type,
        "created_at": db_relationship.created_at
    }

@app.delete("/api/relationships/{relationship_id}")
def delete_relationship(relationship_id: int, db: Session = Depends(get_db)):
    """Delete a relationship"""
    relationship = db.query(Relationship).filter(Relationship.id == relationship_id).first()
    if not relationship:
        raise HTTPException(status_code=404, detail="Relationship not found")

    db.delete(relationship)
    db.commit()
    return {"message": "Relationship deleted successfully"}

@app.get("/api/contacts/{contact_id}/organisations")
def get_contact_organisations(contact_id: int, db: Session = Depends(get_db)):
    """Get all organisations linked to this contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Get relationships where this contact is the source
    relationships = db.query(Relationship).filter(
        Relationship.from_contact_id == contact_id
    ).all()

    organisations = []
    for rel in relationships:
        org = db.query(Contact).filter(Contact.id == rel.to_contact_id).first()
        if org:
            organisations.append({
                "relationship_id": rel.id,
                "organisation_id": org.id,
                "full_name": org.full_name,
                "contact_type": org.contact_type,
                "relationship_type": rel.relationship_type
            })

    return organisations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
