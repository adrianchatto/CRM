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

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    status = Column(String)  # active, inactive, archived
    product_type = Column(String, nullable=True)  # Freeform text
    version = Column(Integer, default=1)
    parent_product_id = Column(Integer, nullable=True, index=True)  # Links to previous version
    effective_date = Column(String)
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    updated_at = Column(String, default=lambda: datetime.now().isoformat())
    base_price = Column(String, nullable=True)
    currency = Column(String, nullable=True, default="GBP")
    billing_frequency = Column(String, nullable=True)

class CustomerProduct(Base):
    __tablename__ = "customer_products"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, index=True)
    product_id = Column(Integer, index=True)
    status = Column(String)  # active, ended, cancelled, suspended
    start_date = Column(String)
    end_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    updated_at = Column(String, default=lambda: datetime.now().isoformat())
    actual_price = Column(String, nullable=True)
    renewal_date = Column(String, nullable=True)

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

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"
    product_type: Optional[str] = None
    effective_date: Optional[str] = None
    base_price: Optional[str] = None
    currency: Optional[str] = "GBP"
    billing_frequency: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    version: int
    parent_product_id: Optional[int] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class CustomerProductBase(BaseModel):
    contact_id: int
    product_id: int
    status: str = "active"
    start_date: str
    end_date: Optional[str] = None
    notes: Optional[str] = None
    actual_price: Optional[str] = None

class CustomerProductCreate(CustomerProductBase):
    pass

class CustomerProductUpdate(BaseModel):
    status: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None
    actual_price: Optional[str] = None

class CustomerProductResponse(CustomerProductBase):
    id: int
    created_at: str
    updated_at: str

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

@app.get("/api/contacts/search")
def search_contacts(q: str, db: Session = Depends(get_db)):
    """Global contact search across name, email, and company name"""
    if not q or len(q.strip()) == 0:
        return []

    search_term = f"%{q.lower()}%"

    # Search across full_name, email, and company_name
    contacts = db.query(Contact).filter(
        (Contact.full_name.ilike(search_term)) |
        (Contact.email.ilike(search_term)) |
        (Contact.company_name.ilike(search_term))
    ).limit(10).all()

    # Build results with linked organisations
    results = []
    for contact in contacts:
        # Get linked organisations (for individuals)
        linked_orgs = []
        if contact.contact_type == "individual":
            relationships = db.query(Relationship).filter(
                Relationship.from_contact_id == contact.id
            ).all()

            for rel in relationships:
                org = db.query(Contact).filter(Contact.id == rel.to_contact_id).first()
                if org:
                    linked_orgs.append({
                        "name": org.full_name,
                        "type": rel.relationship_type
                    })

        results.append({
            "id": contact.id,
            "full_name": contact.full_name,
            "contact_type": contact.contact_type,
            "email": contact.email,
            "company_name": contact.company_name,
            "linked_organisations": linked_orgs
        })

    return results

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

@app.get("/api/campaigns/overview")
def get_campaigns_overview(campaign_ids: Optional[str] = None, db: Session = Depends(get_db)):
    """Get aggregate statistics across all campaigns or selected campaigns"""
    query = db.query(CampaignContact)

    # Filter by campaign IDs if provided
    if campaign_ids:
        id_list = [int(id.strip()) for id in campaign_ids.split(',') if id.strip()]
        query = query.filter(CampaignContact.campaign_id.in_(id_list))

    campaign_contacts = query.all()

    total_contacts = len(campaign_contacts)
    total_responded = sum(1 for cc in campaign_contacts if cc.response_status == "responded")
    total_converted = sum(1 for cc in campaign_contacts if cc.response_status == "converted")
    total_not_interested = sum(1 for cc in campaign_contacts if cc.response_status == "not_interested")
    total_pending = sum(1 for cc in campaign_contacts if cc.response_status == "pending")

    # Calculate response rate
    response_rate = ((total_responded + total_converted) / total_contacts * 100) if total_contacts > 0 else 0

    return {
        "total_contacts": total_contacts,
        "total_responded": total_responded,
        "total_converted": total_converted,
        "total_not_interested": total_not_interested,
        "total_pending": total_pending,
        "response_rate": round(response_rate, 1)
    }

@app.get("/api/campaigns/contacts/filter")
def get_filtered_campaign_contacts(
    campaign_ids: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get contacts across multiple campaigns with optional status filter"""
    query = db.query(CampaignContact)

    # Filter by campaign IDs if provided
    if campaign_ids:
        id_list = [int(id.strip()) for id in campaign_ids.split(',') if id.strip()]
        query = query.filter(CampaignContact.campaign_id.in_(id_list))

    # Filter by status if provided
    if status:
        query = query.filter(CampaignContact.response_status == status)

    campaign_contacts = query.all()

    # Get full contact details
    results = []
    for cc in campaign_contacts:
        contact = db.query(Contact).filter(Contact.id == cc.contact_id).first()
        if contact:
            # Get campaign name
            campaign = db.query(Campaign).filter(Campaign.id == cc.campaign_id).first()

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
                "campaign_name": campaign.name if campaign else None,
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

# ==================== Product Endpoints ====================

@app.get("/api/products")
def get_products(status: Optional[str] = None, product_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all products with optional filtering"""
    query = db.query(Product)

    # Exclude archived by default unless specifically requested
    if status:
        query = query.filter(Product.status == status)
    else:
        query = query.filter(Product.status != "archived")

    if product_type:
        query = query.filter(Product.product_type == product_type)

    products = query.all()

    # Add active customers count for each product
    results = []
    for product in products:
        active_count = db.query(CustomerProduct).filter(
            CustomerProduct.product_id == product.id,
            CustomerProduct.status == "active"
        ).count()

        product_dict = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "status": product.status,
            "product_type": product.product_type,
            "version": product.version,
            "parent_product_id": product.parent_product_id,
            "effective_date": product.effective_date,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
            "base_price": product.base_price,
            "currency": product.currency,
            "billing_frequency": product.billing_frequency,
            "active_customers_count": active_count
        }
        results.append(product_dict)

    return results

@app.post("/api/products", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    db_product = Product(
        name=product.name,
        description=product.description,
        status=product.status,
        product_type=product.product_type,
        version=1,
        parent_product_id=None,
        effective_date=product.effective_date or datetime.now().isoformat(),
        base_price=product.base_price,
        currency=product.currency,
        billing_frequency=product.billing_frequency
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/api/products/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    """Get product details with list of customers"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get all customer-product relationships
    customer_products = db.query(CustomerProduct).filter(
        CustomerProduct.product_id == product_id
    ).all()

    customers = []
    for cp in customer_products:
        contact = db.query(Contact).filter(Contact.id == cp.contact_id).first()
        if contact:
            customers.append({
                "customer_product_id": cp.id,
                "contact_id": contact.id,
                "full_name": contact.full_name,
                "contact_type": contact.contact_type,
                "email": contact.email,
                "status": cp.status,
                "start_date": cp.start_date,
                "end_date": cp.end_date,
                "actual_price": cp.actual_price,
                "notes": cp.notes
            })

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "status": product.status,
        "product_type": product.product_type,
        "version": product.version,
        "parent_product_id": product.parent_product_id,
        "effective_date": product.effective_date,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "base_price": product.base_price,
        "currency": product.currency,
        "billing_frequency": product.billing_frequency,
        "customers": customers
    }

# ==================== Customer-Product Endpoints ====================

@app.get("/api/contacts/{contact_id}/products")
def get_contact_products(contact_id: int, db: Session = Depends(get_db)):
    """Get all products for a specific contact"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    customer_products = db.query(CustomerProduct).filter(
        CustomerProduct.contact_id == contact_id
    ).all()

    results = []
    for cp in customer_products:
        product = db.query(Product).filter(Product.id == cp.product_id).first()
        if product:
            results.append({
                "customer_product_id": cp.id,
                "product_id": product.id,
                "product_name": product.name,
                "product_type": product.product_type,
                "status": cp.status,
                "start_date": cp.start_date,
                "end_date": cp.end_date,
                "actual_price": cp.actual_price,
                "notes": cp.notes,
                "created_at": cp.created_at
            })

    return results

@app.post("/api/customer-products", response_model=CustomerProductResponse)
def create_customer_product(customer_product: CustomerProductCreate, db: Session = Depends(get_db)):
    """Assign a product to a customer"""
    # Verify contact exists
    contact = db.query(Contact).filter(Contact.id == customer_product.contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Verify product exists and is active
    product = db.query(Product).filter(Product.id == customer_product.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.status != "active":
        raise HTTPException(status_code=400, detail="Product is not active")

    # Check for duplicate active relationship
    existing = db.query(CustomerProduct).filter(
        CustomerProduct.contact_id == customer_product.contact_id,
        CustomerProduct.product_id == customer_product.product_id,
        CustomerProduct.status == "active"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Customer already has an active relationship with this product")

    db_customer_product = CustomerProduct(**customer_product.dict())
    db.add(db_customer_product)
    db.commit()
    db.refresh(db_customer_product)
    return db_customer_product

@app.put("/api/customer-products/{customer_product_id}", response_model=CustomerProductResponse)
def update_customer_product(customer_product_id: int, update: CustomerProductUpdate, db: Session = Depends(get_db)):
    """Update a customer-product relationship"""
    cp = db.query(CustomerProduct).filter(CustomerProduct.id == customer_product_id).first()
    if not cp:
        raise HTTPException(status_code=404, detail="Customer-product relationship not found")

    # Update only provided fields
    for key, value in update.dict(exclude_unset=True).items():
        setattr(cp, key, value)

    cp.updated_at = datetime.now().isoformat()
    db.commit()
    db.refresh(cp)
    return cp

@app.delete("/api/customer-products/{customer_product_id}")
def delete_customer_product(customer_product_id: int, db: Session = Depends(get_db)):
    """Delete a customer-product relationship"""
    cp = db.query(CustomerProduct).filter(CustomerProduct.id == customer_product_id).first()
    if not cp:
        raise HTTPException(status_code=404, detail="Customer-product relationship not found")

    db.delete(cp)
    db.commit()
    return {"message": "Customer-product relationship deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
