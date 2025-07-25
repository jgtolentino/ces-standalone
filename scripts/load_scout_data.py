#!/usr/bin/env python3
"""
Load Scout realistic market share data to Supabase
Requires: pip install supabase pandas python-dotenv
"""

import os
import sys
import pandas as pd
import json
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env.local')

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def load_scout_data(csv_file='scout_realistic_data.csv'):
    """Load Scout data from CSV to Supabase"""
    
    print(f"📥 Loading Scout data from {csv_file}...")
    
    # Read CSV
    df = pd.read_csv(csv_file)
    print(f"📊 Found {len(df):,} transactions")
    
    # Verify market shares
    jti_count = df['is_jti_brand'].sum()
    tbwa_non_jti = ((df['is_tbwa_client'] == True) & (df['is_jti_brand'] == False)).sum()
    competitor_count = (df['is_tbwa_client'] == False).sum()
    
    print(f"\n📈 Market Share Verification:")
    print(f"JTI: {jti_count:,} ({jti_count/len(df)*100:.1f}%)")
    print(f"TBWA (non-JTI): {tbwa_non_jti:,} ({tbwa_non_jti/len(df)*100:.1f}%)")
    print(f"Competitors: {competitor_count:,} ({competitor_count/len(df)*100:.1f}%)")
    
    # Clear existing data
    print("\n🗑️ Clearing existing Scout data...")
    try:
        supabase.table('scout_transaction_items').delete().neq('transaction_item_id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('scout_transactions').delete().neq('transaction_id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('scout_customers').delete().neq('customer_id', '00000000-0000-0000-0000-000000000000').execute()
    except Exception as e:
        print(f"Warning: Could not clear existing data: {e}")
    
    # Process customers
    print("\n👥 Processing customers...")
    unique_customers = []
    customer_map = {}
    
    for idx, (age, gender, location_str) in enumerate(df[['age_bracket', 'gender', 'location']].drop_duplicates().values):
        location = json.loads(location_str)
        import uuid
        customer_id = str(uuid.uuid4())
        customer_map[f"{age}_{gender}_{location['region']}"] = customer_id
        
        unique_customers.append({
            'customer_id': customer_id,
            'full_name': f"Customer {idx+1}",
            'gender': gender,
            'age_group': age,
            'region': location['region'],
            'city': location['city']
        })
    
    # Load customers in chunks
    chunk_size = 500
    for i in range(0, len(unique_customers), chunk_size):
        chunk = unique_customers[i:i+chunk_size]
        try:
            supabase.table('scout_customers').insert(chunk).execute()
            print(f"✅ Loaded customer chunk {i//chunk_size + 1}/{(len(unique_customers) + chunk_size - 1)//chunk_size}")
        except Exception as e:
            print(f"❌ Error loading customers: {e}")
    
    # Process stores
    print("\n🏪 Setting up stores...")
    stores = {
        'NCR': {'store_id': 'STO00001', 'store_name': 'Metro Manila Hub'},
        'Region III': {'store_id': 'STO00002', 'store_name': 'Central Luzon Store'},
        'Region IV-A': {'store_id': 'STO00003', 'store_name': 'CALABARZON Center'},
        'Region VII': {'store_id': 'STO00004', 'store_name': 'Central Visayas Outlet'},
        'Region XI': {'store_id': 'STO00005', 'store_name': 'Davao Region Store'}
    }
    
    # Process transactions
    print("\n💳 Processing transactions...")
    transactions = []
    transaction_items = []
    
    # Get brand and category mappings
    brands_data = supabase.table('master_brands').select('brand_id,brand_name').execute()
    brands_map = {b['brand_name']: b['brand_id'] for b in brands_data.data}
    
    categories_data = supabase.table('master_categories').select('category_id,category_name').execute()
    categories_map = {c['category_name']: c['category_id'] for c in categories_data.data}
    
    for idx, row in df.iterrows():
        location = json.loads(row['location'])
        
        # Get store
        store_data = stores.get(row['region'], stores['NCR'])
        
        # Get customer
        customer_key = f"{row['age_bracket']}_{row['gender']}_{location['region']}"
        customer_id = customer_map.get(customer_key, 'CUST_000001')
        
        # Create transaction
        transaction_id = row['id']
        transactions.append({
            'transaction_id': transaction_id,
            'store_id': store_data['store_id'],
            'customer_id': customer_id,
            'transaction_date': row['timestamp'],
            'total_amount': float(row['peso_value']),
            'payment_method': row['payment_method']
        })
        
        # Create transaction item
        brand_id = brands_map.get(row['brand'], list(brands_map.values())[0])
        category_id = categories_map.get(row['category'], list(categories_map.values())[0])
        
        transaction_items.append({
            'transaction_item_id': str(uuid.uuid4()),
            'transaction_id': transaction_id,
            'brand_id': brand_id,
            'category_id': category_id,
            'quantity': int(row['quantity']),
            'unit_price': float(row['peso_value']) / int(row['quantity'])
        })
        
        # Load in chunks
        if len(transactions) >= chunk_size:
            try:
                supabase.table('scout_transactions').insert(transactions).execute()
                supabase.table('scout_transaction_items').insert(transaction_items).execute()
                print(f"✅ Loaded transaction chunk {(idx//chunk_size) + 1}")
                transactions = []
                transaction_items = []
            except Exception as e:
                print(f"❌ Error loading transactions: {e}")
                transactions = []
                transaction_items = []
    
    # Load remaining data
    if transactions:
        try:
            supabase.table('scout_transactions').insert(transactions).execute()
            supabase.table('scout_transaction_items').insert(transaction_items).execute()
            print("✅ Loaded final transaction chunk")
        except Exception as e:
            print(f"❌ Error loading final chunk: {e}")
    
    print("\n🎉 Data loading complete!")
    
    # Verify data
    print("\n🧪 Verifying data load...")
    trans_count = supabase.table('scout_transactions').select('count', count='exact').execute()
    print(f"Total transactions loaded: {trans_count.count:,}")
    
    # Test market share view
    try:
        result = supabase.rpc('get_market_share_kpis').execute()
        print("\n📊 Market Share KPIs:")
        for kpi in result.data:
            print(f"{kpi['metric_name']}: JTI={kpi['jti_value']}%, TBWA={kpi['tbwa_value']}%, Competitors={kpi['competitor_value']}%")
    except Exception as e:
        print(f"Could not fetch KPIs: {e}")

if __name__ == "__main__":
    # Check if CSV exists
    csv_file = 'scout_realistic_data.csv'
    if not os.path.exists(csv_file):
        print(f"❌ {csv_file} not found. Run scout_data_generator_updated.py first.")
        sys.exit(1)
    
    load_scout_data(csv_file)