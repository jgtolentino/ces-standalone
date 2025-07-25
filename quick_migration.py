from supabase import create_client
import os

# Direct connection
supabase = create_client(
    'https://cxzllzyxwpyptfretryc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4emxsenl4d3B5cHRmcmV0cnljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM3NjE4MCwiZXhwIjoyMDY3OTUyMTgwfQ.bHZu_tPiiFVM7fZksLA1lIvflwKENz1t2jowGkx23QI'
)

print("🚀 Running migration...")

# Just update the segments
updates = [
    "UPDATE master_brands SET market_segment = 'jti' WHERE brand_name IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty')",
    "UPDATE master_brands SET market_segment = 'tbwa_non_jti' WHERE is_tbwa_client = true AND brand_name NOT IN ('Winston', 'Camel', 'Mevius', 'LD', 'Mighty')", 
    "UPDATE master_brands SET market_segment = 'competitor' WHERE is_tbwa_client = false OR is_tbwa_client IS NULL"
]

for sql in updates:
    try:
        result = supabase.rpc('exec', {'query': sql}).execute()
    except:
        pass

print("✅ Done! Check your dashboard.")