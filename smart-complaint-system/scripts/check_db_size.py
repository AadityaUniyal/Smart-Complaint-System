import os
import sys
import psycopg2
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

def get_database_size():
    """Get current database size and usage statistics"""
    try:
        # Connect to database
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        cur = conn.cursor()
        
        # Get database size
        cur.execute("""
            SELECT 
                pg_size_pretty(pg_database_size(current_database())) as db_size,
                pg_database_size(current_database()) as db_size_bytes
        """)
        db_size, db_size_bytes = cur.fetchone()
        
        # Get table sizes
        cur.execute("""
            SELECT 
                schemaname,
                tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
        """)
        tables = cur.fetchall()
        
        # Get row counts
        table_counts = {}
        for schema, table, size, size_bytes in tables:
            cur.execute(f"SELECT COUNT(*) FROM {schema}.{table}")
            count = cur.fetchone()[0]
            table_counts[table] = count
        
        # Get connection info
        cur.execute("SELECT version()")
        version = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        return {
            'database_size': db_size,
            'database_size_bytes': db_size_bytes,
            'tables': tables,
            'table_counts': table_counts,
            'version': version,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        return {'error': str(e)}

def check_size_limits(size_bytes):
    """Check if database size is approaching limits"""
    # Neon free tier limit is 512MB
    FREE_TIER_LIMIT = 512 * 1024 * 1024  # 512MB in bytes
    WARNING_THRESHOLD = 0.8  # 80% of limit
    CRITICAL_THRESHOLD = 0.9  # 90% of limit
    
    usage_percentage = (size_bytes / FREE_TIER_LIMIT) * 100
    
    if usage_percentage >= CRITICAL_THRESHOLD * 100:
        return 'CRITICAL', usage_percentage
    elif usage_percentage >= WARNING_THRESHOLD * 100:
        return 'WARNING', usage_percentage
    else:
        return 'OK', usage_percentage

def main():
    print("🔍 Checking Neon Database Size and Usage...")
    print("=" * 60)
    
    # Get database info
    db_info = get_database_size()
    
    if 'error' in db_info:
        print(f"❌ Error connecting to database: {db_info['error']}")
        return 1
    
    # Display basic info
    print(f"📊 Database Size: {db_info['database_size']}")
    print(f"🕒 Checked at: {db_info['timestamp']}")
    print(f"🗄️ PostgreSQL Version: {db_info['version'][:50]}...")
    
    # Check size limits
    status, usage_percentage = check_size_limits(db_info['database_size_bytes'])
    
    print(f"\n📈 Usage Analysis:")
    print(f"   Size: {db_info['database_size']} ({db_info['database_size_bytes']:,} bytes)")
    print(f"   Usage: {usage_percentage:.1f}% of free tier limit (512MB)")
    
    if status == 'CRITICAL':
        print(f"   🚨 Status: {status} - Approaching limit!")
    elif status == 'WARNING':
        print(f"   ⚠️ Status: {status} - Monitor closely")
    else:
        print(f"   ✅ Status: {status} - Within safe limits")
    
    # Display table information
    print(f"\n📋 Table Breakdown:")
    print(f"{'Table':<20} {'Size':<12} {'Rows':<10}")
    print("-" * 45)
    
    for schema, table, size, size_bytes in db_info['tables']:
        row_count = db_info['table_counts'].get(table, 0)
        print(f"{table:<20} {size:<12} {row_count:<10}")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    if status == 'CRITICAL':
        print("   • Consider upgrading to paid plan")
        print("   • Archive old complaint data")
        print("   • Implement data retention policies")
    elif status == 'WARNING':
        print("   • Monitor database growth")
        print("   • Consider data cleanup strategies")
        print("   • Plan for potential upgrade")
    else:
        print("   • Continue monitoring regularly")
        print("   • Current usage is healthy")
    
    print(f"\n🔗 Neon Dashboard: https://console.neon.tech/")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())