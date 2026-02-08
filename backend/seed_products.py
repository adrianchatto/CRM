"""
Seed script to add products and customer-product relationships
Run this after seed_data.py and seed_campaigns.py
"""
import random
from datetime import datetime, timedelta
from main import SessionLocal, Contact, Product, CustomerProduct, Base, engine

PRODUCTS = [
    {
        "name": "Annual Tax Return Preparation",
        "description": "Complete tax return preparation service for individuals and businesses",
        "product_type": "Tax Services",
        "base_price": "500.00",
        "billing_frequency": "annual"
    },
    {
        "name": "Quarterly Bookkeeping",
        "description": "Professional bookkeeping services on a quarterly basis",
        "product_type": "Bookkeeping",
        "base_price": "750.00",
        "billing_frequency": "quarterly"
    },
    {
        "name": "VAT Returns",
        "description": "VAT return filing and compliance services",
        "product_type": "Tax Services",
        "base_price": "300.00",
        "billing_frequency": "quarterly"
    },
    {
        "name": "Estate Planning Consultation",
        "description": "Comprehensive estate planning and structuring advice",
        "product_type": "Estate Planning",
        "base_price": "1200.00",
        "billing_frequency": "one-time"
    },
    {
        "name": "Payroll Management",
        "description": "Full payroll processing and HMRC compliance",
        "product_type": "Payroll Services",
        "base_price": "400.00",
        "billing_frequency": "monthly"
    },
    {
        "name": "Financial Statement Audit",
        "description": "Independent audit of annual financial statements",
        "product_type": "Audit Services",
        "base_price": "2500.00",
        "billing_frequency": "annual"
    },
    {
        "name": "Trust Administration",
        "description": "Ongoing trust administration and compliance services",
        "product_type": "Trust Services",
        "base_price": "1500.00",
        "billing_frequency": "annual"
    },
    {
        "name": "Self-Assessment Tax Returns",
        "description": "Individual self-assessment tax return preparation and filing",
        "product_type": "Tax Services",
        "base_price": "350.00",
        "billing_frequency": "annual"
    },
    {
        "name": "Business Advisory Services",
        "description": "Strategic business planning and financial advisory",
        "product_type": "Advisory",
        "base_price": "1000.00",
        "billing_frequency": "monthly"
    },
    {
        "name": "Corporation Tax Services",
        "description": "Corporation tax computation and filing",
        "product_type": "Tax Services",
        "base_price": "800.00",
        "billing_frequency": "annual"
    }
]

def seed_products():
    """Add products and link them to customers"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("=" * 60)
        print("Adding Products and Customer Relationships")
        print("=" * 60)

        # Get all contacts
        all_contacts = db.query(Contact).all()
        businesses = [c for c in all_contacts if c.contact_type == "business"]
        estates = [c for c in all_contacts if c.contact_type == "estate"]
        individuals = [c for c in all_contacts if c.contact_type == "individual"]

        print(f"\nFound {len(businesses)} businesses, {len(estates)} estates, {len(individuals)} individuals")

        # Create products
        print("\nCreating products...")
        created_products = []

        for product_data in PRODUCTS:
            # Products created over the last 2 years
            days_ago = random.randint(30, 730)
            created_date = (datetime.now() - timedelta(days=days_ago)).isoformat()

            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                status="active",
                product_type=product_data["product_type"],
                version=1,
                parent_product_id=None,
                effective_date=created_date,
                created_at=created_date,
                updated_at=created_date,
                base_price=product_data["base_price"],
                currency="GBP",
                billing_frequency=product_data["billing_frequency"]
            )
            db.add(product)
            db.flush()  # Get the ID
            created_products.append(product)

        db.commit()
        print(f"  ✅ Created {len(created_products)} products")

        # Link products to customers
        print("\nLinking products to customers...")
        customer_products_created = 0

        # Link tax and bookkeeping products to businesses
        tax_products = [p for p in created_products if "Tax" in p.product_type or "Bookkeeping" in p.product_type]
        for business in businesses:
            # Each business has 2-4 products
            num_products = random.randint(2, min(4, len(tax_products)))
            selected_products = random.sample(tax_products, num_products)

            for product in selected_products:
                # Products started 1-12 months ago
                days_ago = random.randint(30, 365)
                start_date = (datetime.now() - timedelta(days=days_ago)).isoformat()

                # 80% active, 15% ended, 5% suspended
                rand = random.random()
                if rand < 0.80:
                    status = "active"
                    end_date = None
                elif rand < 0.95:
                    status = "ended"
                    # Ended 0-60 days ago
                    end_days_ago = random.randint(0, 60)
                    end_date = (datetime.now() - timedelta(days=end_days_ago)).isoformat()
                else:
                    status = "suspended"
                    end_date = None

                # Some customers get discounted pricing
                actual_price = product.base_price if random.random() > 0.3 else str(float(product.base_price) * 0.9)

                cp = CustomerProduct(
                    contact_id=business.id,
                    product_id=product.id,
                    status=status,
                    start_date=start_date,
                    end_date=end_date,
                    notes=f"Long-standing client discount" if actual_price != product.base_price else None,
                    actual_price=actual_price if actual_price != product.base_price else None
                )
                db.add(cp)
                customer_products_created += 1

        # Link estate planning and trust services to estates
        estate_products = [p for p in created_products if "Estate" in p.product_type or "Trust" in p.product_type]
        for estate in estates:
            # Each estate has 1-2 products
            num_products = random.randint(1, min(2, len(estate_products)))
            selected_products = random.sample(estate_products, num_products)

            for product in selected_products:
                days_ago = random.randint(180, 730)  # Estates tend to be longer term
                start_date = (datetime.now() - timedelta(days=days_ago)).isoformat()

                # Estates are more stable - 90% active
                status = "active" if random.random() < 0.90 else "ended"
                end_date = None if status == "active" else (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()

                cp = CustomerProduct(
                    contact_id=estate.id,
                    product_id=product.id,
                    status=status,
                    start_date=start_date,
                    end_date=end_date,
                    notes="Annual review scheduled" if status == "active" else "Service completed"
                )
                db.add(cp)
                customer_products_created += 1

        # Link self-assessment products to some businesses (for owner-managed businesses)
        self_assessment = [p for p in created_products if "Self-Assessment" in p.name]
        if self_assessment:
            for business in random.sample(businesses, min(15, len(businesses))):
                days_ago = random.randint(30, 365)
                start_date = (datetime.now() - timedelta(days=days_ago)).isoformat()

                cp = CustomerProduct(
                    contact_id=business.id,
                    product_id=self_assessment[0].id,
                    status="active",
                    start_date=start_date,
                    notes="Owner's personal tax return"
                )
                db.add(cp)
                customer_products_created += 1

        db.commit()
        print(f"  ✅ Created {customer_products_created} customer-product relationships")

        # Print summary
        print("\n" + "=" * 60)
        print("Summary")
        print("=" * 60)

        for product in created_products:
            customer_products = db.query(CustomerProduct).filter(
                CustomerProduct.product_id == product.id
            ).all()

            total = len(customer_products)
            active = sum(1 for cp in customer_products if cp.status == "active")
            ended = sum(1 for cp in customer_products if cp.status == "ended")
            suspended = sum(1 for cp in customer_products if cp.status == "suspended")

            print(f"\n{product.name}")
            print(f"  Type: {product.product_type}")
            print(f"  Price: £{product.base_price} ({product.billing_frequency})")
            print(f"  Total Customers: {total}")
            print(f"  Active: {active}")
            if ended > 0:
                print(f"  Ended: {ended}")
            if suspended > 0:
                print(f"  Suspended: {suspended}")

        print("\n" + "=" * 60)
        print("✅ Successfully added products and customer relationships!")
        print("=" * 60)
        print("\nRun the backend server and navigate to:")
        print("  http://localhost:5173 → Products tab")
        print("  Or check organisation details to see their products")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
