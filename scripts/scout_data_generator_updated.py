#!/usr/bin/env python3
"""
Scout Dashboard Data Generator - Updated Version
- 360-day rolling data window
- Realistic market shares: JTI 40%, TBWA 20%, Competitors 40%
- Authentic Philippine retail patterns
"""

import json
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import argparse
import csv

# Realistic market share distribution
MARKET_SEGMENTS = {
    'jti': {
        'share': 0.40,  # 40% market share
        'brands': ['Winston', 'Camel', 'Mevius', 'LD', 'Mighty', 'Glamour', 'Caster', 'Salem', 'More', 'Seven Stars'],
        'handshake_range': (0.70, 0.85),
        'campaign_influence': 0.25,
        'branded_rate': 0.70
    },
    'tbwa_non_jti': {
        'share': 0.20,  # 20% market share
        'brands': [
            # Liwayway (corrected count)
            'Oishi', 'Smart C+', 'V-Fresh', 'Wafer', 'Bread Pan', 'Kirei',
            'Sponge', 'Sunflower Crackers', 'Pillows', 'Potato Fries', 'Fishda', 'Ngohiong',
            # Del Monte
            'Del Monte Ketchup', 'Del Monte Spaghetti Sauce', 'Del Monte Tomato Sauce',
            'Today\'s', 'Fiesta', 'Quick n Easy', 'Del Monte Juice', 'Fit n Right', 'Heart Smart',
            # Snow
            'Snow Milk', 'Snow Yogurt', 'Snow Cheese',
            # Home Care
            'Downy', 'Tide', 'Ariel', 'Joy', 'Safeguard', 'Head & Shoulders'
        ],
        'handshake_range': (0.60, 0.75),
        'campaign_influence': 0.15,
        'branded_rate': 0.55
    },
    'competitor': {
        'share': 0.40,  # 40% market share
        'brands': [
            'Philip Morris', 'Japan Tobacco', 'British American Tobacco', 'Fortune Tobacco',
            'Unilever', 'Nestle', 'Coca-Cola', 'Pepsi', 'Alaska', 'Monde Nissin',
            'Universal Robina', 'Century Pacific', 'San Miguel', 'Emperador', 'Tanduay'
        ],
        'handshake_range': (0.40, 0.65),
        'campaign_influence': 0.05,
        'branded_rate': 0.25
    }
}

# Philippine regions with realistic population distribution
REGIONS = [
    {'name': 'NCR', 'weight': 0.30, 'urban_rate': 1.0},
    {'name': 'Region III', 'weight': 0.15, 'urban_rate': 0.7},
    {'name': 'Region IV-A', 'weight': 0.20, 'urban_rate': 0.8},
    {'name': 'Region VII', 'weight': 0.10, 'urban_rate': 0.6},
    {'name': 'Region XI', 'weight': 0.08, 'urban_rate': 0.5},
    {'name': 'Region VI', 'weight': 0.06, 'urban_rate': 0.4},
    {'name': 'Region I', 'weight': 0.04, 'urban_rate': 0.3},
    {'name': 'Region IX', 'weight': 0.03, 'urban_rate': 0.3},
    {'name': 'ARMM', 'weight': 0.02, 'urban_rate': 0.2},
    {'name': 'Region XII', 'weight': 0.02, 'urban_rate': 0.3}
]

# Product categories with realistic distribution
CATEGORIES = {
    'Tobacco': {'weight': 0.40, 'price_range': (20, 150), 'jti_dominant': True},
    'Snacks': {'weight': 0.15, 'price_range': (10, 50), 'jti_dominant': False},
    'Beverages': {'weight': 0.20, 'price_range': (15, 80), 'jti_dominant': False},
    'Dairy': {'weight': 0.10, 'price_range': (30, 120), 'jti_dominant': False},
    'Home Care': {'weight': 0.15, 'price_range': (25, 200), 'jti_dominant': False}
}

# Time patterns
TIME_PATTERNS = {
    'morning': {'hours': range(6, 12), 'weight': 0.25},
    'afternoon': {'hours': range(12, 17), 'weight': 0.30},
    'evening': {'hours': range(17, 21), 'weight': 0.35},  # Peak tobacco sales
    'night': {'hours': range(21, 24), 'weight': 0.10}
}

# Demographics
AGE_BRACKETS = [
    {'bracket': '18-24', 'weight': 0.20},
    {'bracket': '25-34', 'weight': 0.35},
    {'bracket': '35-44', 'weight': 0.25},
    {'bracket': '45-54', 'weight': 0.15},
    {'bracket': '55+', 'weight': 0.05}
]

def generate_location() -> Dict:
    """Generate realistic Philippine location"""
    region = random.choices(
        [r['name'] for r in REGIONS],
        weights=[r['weight'] for r in REGIONS]
    )[0]
    
    region_data = next(r for r in REGIONS if r['name'] == region)
    is_urban = random.random() < region_data['urban_rate']
    
    # Generate city based on region
    cities = {
        'NCR': ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'],
        'Region III': ['Angeles', 'San Fernando', 'Olongapo', 'Malolos'],
        'Region IV-A': ['Calamba', 'San Pablo', 'Antipolo', 'Batangas City'],
        'Region VII': ['Cebu City', 'Mandaue', 'Lapu-Lapu', 'Tagbilaran'],
        'Region XI': ['Davao City', 'Tagum', 'Digos', 'Panabo']
    }
    
    city_list = cities.get(region, ['Provincial Capital', 'Municipality'])
    city = random.choice(city_list)
    
    return {
        'region': region,
        'city': city,
        'is_urban': is_urban,
        'barangay': f'Barangay {random.randint(1, 50)}'
    }

def select_market_segment() -> str:
    """Select market segment based on realistic distribution"""
    segments = list(MARKET_SEGMENTS.keys())
    weights = [MARKET_SEGMENTS[s]['share'] for s in segments]
    return random.choices(segments, weights=weights)[0]

def generate_transaction(transaction_date: datetime) -> Dict:
    """Generate a single transaction with realistic market share"""
    # Select market segment
    segment = select_market_segment()
    segment_data = MARKET_SEGMENTS[segment]
    
    # Select brand from segment
    brand = random.choice(segment_data['brands'])
    
    # Determine if JTI brand
    is_jti_brand = segment == 'jti'
    is_tbwa_client = segment in ['jti', 'tbwa_non_jti']
    
    # Select category (JTI dominates tobacco)
    if is_jti_brand:
        category = 'Tobacco' if random.random() < 0.85 else random.choice(list(CATEGORIES.keys()))
    else:
        # Non-tobacco brands avoid tobacco category
        non_tobacco_categories = [c for c in CATEGORIES.keys() if c != 'Tobacco']
        category = random.choice(non_tobacco_categories)
    
    category_data = CATEGORIES[category]
    
    # Generate time based on patterns (tobacco peaks in evening)
    if category == 'Tobacco':
        # Bias towards evening hours
        hour = random.choices([17, 18, 19, 20], weights=[0.2, 0.3, 0.3, 0.2])[0]
    else:
        # Normal distribution
        time_period = random.choices(
            list(TIME_PATTERNS.keys()),
            weights=[TIME_PATTERNS[p]['weight'] for p in TIME_PATTERNS]
        )[0]
        hour = random.choice(list(TIME_PATTERNS[time_period]['hours']))
    
    # Create timestamp
    timestamp = transaction_date.replace(
        hour=hour,
        minute=random.randint(0, 59),
        second=random.randint(0, 59)
    )
    
    # Generate location
    location = generate_location()
    
    # Demographics
    age_bracket = random.choices(
        [a['bracket'] for a in AGE_BRACKETS],
        weights=[a['weight'] for a in AGE_BRACKETS]
    )[0]
    
    # Purchase behavior
    handshake_score = random.uniform(*segment_data['handshake_range'])
    is_branded_request = random.random() < segment_data['branded_rate']
    campaign_influenced = random.random() < segment_data['campaign_influence']
    
    # Transaction value (JTI tobacco typically higher value)
    if is_jti_brand and category == 'Tobacco':
        base_price = random.uniform(80, 150)  # Premium tobacco
    else:
        base_price = random.uniform(*category_data['price_range'])
    
    quantity = random.choices([1, 2, 3, 5, 10], weights=[0.4, 0.3, 0.15, 0.1, 0.05])[0]
    total_value = base_price * quantity
    
    return {
        'id': f'TRX-{uuid.uuid4().hex[:8].upper()}',
        'timestamp': timestamp.isoformat(),
        'location': json.dumps(location),
        'region': location['region'],
        'city': location['city'],
        'is_urban': location['is_urban'],
        'brand': brand,
        'category': category,
        'market_segment': segment,
        'is_jti_brand': is_jti_brand,
        'is_tbwa_client': is_tbwa_client,
        'quantity': quantity,
        'peso_value': round(total_value, 2),
        'payment_method': random.choice(['Cash', 'GCash', 'Cash', 'Cash']),  # Cash dominant
        'age_bracket': age_bracket,
        'gender': random.choice(['M', 'F']),
        'handshake_score': round(handshake_score, 2),
        'is_branded_request': is_branded_request,
        'campaign_influenced': campaign_influenced,
        'time_of_day': 'evening' if hour >= 17 and hour <= 21 else 'day',
        'day_of_week': timestamp.strftime('%A')
    }

def generate_dataset(num_transactions: int, days: int = 360) -> List[Dict]:
    """Generate complete dataset with 360-day spread"""
    transactions = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    print(f"Generating {num_transactions:,} transactions from {start_date.date()} to {end_date.date()}")
    
    # Distribute transactions across days
    for i in range(num_transactions):
        # Random date within range
        days_offset = random.randint(0, days)
        transaction_date = end_date - timedelta(days=days_offset)
        
        transaction = generate_transaction(transaction_date)
        transactions.append(transaction)
        
        if (i + 1) % 10000 == 0:
            print(f"Generated {i + 1:,} transactions...")
    
    # Verify market shares
    jti_count = sum(1 for t in transactions if t['is_jti_brand'])
    tbwa_non_jti_count = sum(1 for t in transactions if t['is_tbwa_client'] and not t['is_jti_brand'])
    competitor_count = sum(1 for t in transactions if not t['is_tbwa_client'])
    
    print(f"\nMarket Share Verification:")
    print(f"JTI: {jti_count:,} ({jti_count/len(transactions)*100:.1f}%)")
    print(f"TBWA (non-JTI): {tbwa_non_jti_count:,} ({tbwa_non_jti_count/len(transactions)*100:.1f}%)")
    print(f"Competitors: {competitor_count:,} ({competitor_count/len(transactions)*100:.1f}%)")
    
    return transactions

def save_dataset(transactions: List[Dict], format: str, output_prefix: str):
    """Save dataset in specified format"""
    if format == 'json':
        filename = f"{output_prefix}.json"
        with open(filename, 'w') as f:
            json.dump(transactions, f, indent=2)
        print(f"Saved {len(transactions):,} transactions to {filename}")
    
    elif format == 'csv':
        filename = f"{output_prefix}.csv"
        if transactions:
            keys = transactions[0].keys()
            with open(filename, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=keys)
                writer.writeheader()
                writer.writerows(transactions)
            print(f"Saved {len(transactions):,} transactions to {filename}")

def main():
    parser = argparse.ArgumentParser(description='Generate Scout Dashboard data with realistic market shares')
    parser.add_argument('--transactions', type=int, default=50000, help='Number of transactions to generate')
    parser.add_argument('--days', type=int, default=360, help='Number of days to spread data across')
    parser.add_argument('--format', choices=['json', 'csv'], default='json', help='Output format')
    parser.add_argument('--output', default='scout_realistic_data', help='Output file prefix')
    parser.add_argument('--seed', type=int, help='Random seed for reproducibility')
    
    args = parser.parse_args()
    
    if args.seed:
        random.seed(args.seed)
    
    # Generate dataset
    transactions = generate_dataset(args.transactions, args.days)
    
    # Save dataset
    save_dataset(transactions, args.format, args.output)
    
    # Print summary statistics
    print(f"\nDataset Summary:")
    print(f"Total transactions: {len(transactions):,}")
    print(f"Date range: {args.days} days")
    print(f"Average daily transactions: {len(transactions)/args.days:.0f}")
    
    # Regional distribution
    region_counts = {}
    for t in transactions:
        region = t['region']
        region_counts[region] = region_counts.get(region, 0) + 1
    
    print(f"\nRegional Distribution:")
    for region, count in sorted(region_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {region}: {count:,} ({count/len(transactions)*100:.1f}%)")

if __name__ == '__main__':
    main()