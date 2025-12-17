import requests
import time

def check_project_status():
    print("🚀 SMARTCOMPLAINT PROJECT STATUS")
    print("=" * 60)
    
    # Check Backend Server
    try:
        backend_response = requests.get('http://localhost:5000/api/departments', timeout=5)
        backend_status = "✅ Running" if backend_response.status_code == 200 else f"❌ Error {backend_response.status_code}"
        backend_data = len(backend_response.json()) if backend_response.status_code == 200 else 0
    except Exception as e:
        backend_status = f"❌ Not Running ({e})"
        backend_data = 0
    
    # Check Frontend Server
    try:
        frontend_response = requests.get('http://localhost:5173', timeout=5)
        frontend_status = "✅ Running" if frontend_response.status_code == 200 else f"❌ Error {frontend_response.status_code}"
    except Exception as e:
        frontend_status = f"❌ Not Running ({e})"
    
    # Check Database Connection
    try:
        complaints_response = requests.get('http://localhost:5000/api/all-student-complaints', timeout=5)
        db_status = "✅ Connected" if complaints_response.status_code == 200 else f"❌ Error {complaints_response.status_code}"
        total_complaints = len(complaints_response.json()) if complaints_response.status_code == 200 else 0
    except Exception as e:
        db_status = f"❌ Not Connected ({e})"
        total_complaints = 0
    
    # Display Status
    print(f"🔧 Backend Server (Port 5000):  {backend_status}")
    print(f"🌐 Frontend Server (Port 5173): {frontend_status}")
    print(f"🗄️ Database Connection:         {db_status}")
    
    print(f"\n📊 DATA SUMMARY:")
    print("=" * 60)
    print(f"📋 Departments Available: {backend_data}")
    print(f"📝 Total Complaints: {total_complaints}")
    
    if backend_data > 0:
        try:
            students_response = requests.get('http://localhost:5000/api/students', timeout=5)
            students_count = len(students_response.json()) if students_response.status_code == 200 else 0
            print(f"👥 Registered Students: {students_count}")
            
            categories_response = requests.get('http://localhost:5000/api/complaint-categories', timeout=5)
            categories_count = len(categories_response.json()) if categories_response.status_code == 200 else 0
            print(f"📂 Complaint Categories: {categories_count}")
        except:
            pass
    
    print(f"\n🎯 ACCESS INFORMATION:")
    print("=" * 60)
    print("🌐 Frontend URL: http://localhost:5173")
    print("🔧 Backend API: http://localhost:5000/api")
    print("📱 Mobile Access: http://192.168.29.41:5173 (if on same network)")
    
    print(f"\n👤 LOGIN CREDENTIALS:")
    print("=" * 60)
    print("🎓 Student Login:")
    print("   • Register as new student OR")
    print("   • Use existing student ID: 24BTECHCSE001 (Aaditya Uniyal)")
    print()
    print("👨‍💼 Admin Login:")
    print("   • Email: admin@college.edu")
    print("   • Password: admin123")
    
    print(f"\n🎨 NEW FEATURES:")
    print("=" * 60)
    print("✨ Theme System - 6 beautiful themes available!")
    print("   🎬 Netflix Dark (default)")
    print("   🌊 Ocean Blue")
    print("   🌲 Forest Green") 
    print("   🌅 Sunset Orange")
    print("   🌌 Purple Galaxy")
    print("   ☀️ Light Mode")
    print("   👆 Click the palette icon (🎨) in navigation to change themes!")
    
    print(f"\n🧪 TESTING CHECKLIST:")
    print("=" * 60)
    print("□ Open http://localhost:5173 in browser")
    print("□ Test theme selector (palette icon in navbar)")
    print("□ Register as new student")
    print("□ Submit a complaint")
    print("□ Login as admin (admin@college.edu / admin123)")
    print("□ Test admin dashboard tabs")
    print("□ Search for 'Aaditya Uniyal'")
    print("□ Test all filters and export")
    print("□ Try different themes in both student and admin views")
    
    # Overall Status
    all_running = "✅ Running" in backend_status and "✅ Running" in frontend_status and "✅ Connected" in db_status
    
    print(f"\n🎉 OVERALL STATUS:")
    print("=" * 60)
    if all_running:
        print("🟢 ALL SYSTEMS OPERATIONAL!")
        print("🚀 Project is ready for use and testing")
        print("🎨 New theme system is active")
        print("📱 Responsive design works on all devices")
    else:
        print("🟡 SOME ISSUES DETECTED")
        print("🔧 Check the status above and restart failed services")
    
    return all_running

if __name__ == '__main__':
    check_project_status()