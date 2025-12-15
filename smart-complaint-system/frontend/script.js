// App variables
let currentUser = null;
let departments = [];
let courses = [];
let categories = [];
let complaints = [];

// API Base URL
const API_BASE = 'http://localhost:5000/api';

// Page elements
const loadingScreen = document.getElementById('loading-screen');
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const loginModal = document.getElementById('login-modal');
const modalBody = document.getElementById('modal-body');
const toast = document.getElementById('toast');

// App startup
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Show loading
    showLoading();
    
    // Load data
    await loadInitialData();
    
    // Setup events
    setupEventListeners();
    
    // Start counters
    setTimeout(() => {
        animateCounters();
    }, 1000);
    
    // Hide loading
    setTimeout(() => {
        hideLoading();
    }, 2000);
    
    // Check login status
    checkAuthStatus();
}

function showLoading() {
    loadingScreen.classList.remove('hidden');
}

function hideLoading() {
    loadingScreen.classList.add('hidden');
}

// Event setup
function setupEventListeners() {
    // Mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Navbar scroll
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Smooth scroll links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Modal close on outside click
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                hideLoginModal();
            }
        });
    }
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    
    // Hamburger animation
    const bars = navToggle.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
        if (navMenu.classList.contains('active')) {
            if (index === 0) {
                bar.style.transform = 'rotate(45deg) translate(6px, 6px)';
            } else if (index === 1) {
                bar.style.opacity = '0';
            } else {
                bar.style.transform = 'rotate(-45deg) translate(6px, -6px)';
            }
        } else {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        }
    });
}

function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target.toLocaleString() + (target === 24 ? '/7' : target >= 1000 ? 'K+' : '');
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current).toLocaleString();
                    }
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

// API Functions
async function loadInitialData() {
    try {
        const [deptResponse, courseResponse] = await Promise.all([
            fetch(`${API_BASE}/departments`),
            fetch(`${API_BASE}/courses`)
        ]);
        
        if (deptResponse.ok) {
            departments = await deptResponse.json();
        }
        
        if (courseResponse.ok) {
            courses = await courseResponse.json();
        }
    } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('Failed to load data. Please refresh the page.', 'error');
    }
}

async function registerStudent(formData) {
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                role: 'student'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            showToast('Registration successful! Your data has been saved to the system.', 'success');
            hideLoginModal();
            showStudentDashboard();
            
            // Immediately update the dashboard with fresh data
            setTimeout(() => {
                loadUserComplaints();
                updateLastUpdatedTime();
            }, 500);
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message, 'error');
    }
}

async function loginAdmin(email, password) {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login_type: 'admin',
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            showToast('Login successful!', 'success');
            hideLoginModal();
            showAdminDashboard();
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message, 'error');
    }
}

async function submitComplaint(complaintData) {
    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(complaintData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Complaint submitted successfully!', 'success');
            loadUserComplaints();
            return data;
        } else {
            throw new Error(data.error || 'Failed to submit complaint');
        }
    } catch (error) {
        console.error('Submit complaint error:', error);
        showToast(error.message, 'error');
    }
}

async function loadUserComplaints() {
    if (!currentUser) return;
    
    try {
        // Always try to load from CSV file first for real-time updates
        if (currentUser.student_id) {
            const csvResponse = await fetch(`${API_BASE}/student-complaints/${currentUser.student_id}`);
            if (csvResponse.ok) {
                const csvComplaints = await csvResponse.json();
                // Convert CSV data to match expected format
                const newComplaints = csvComplaints.map(complaint => ({
                    id: complaint.complaint_id,
                    complaint_id: complaint.complaint_id,
                    title: complaint.title,
                    description: complaint.description,
                    status: complaint.status,
                    priority: complaint.priority,
                    urgency_level: complaint.urgency_level,
                    category_name: complaint.category,
                    department_name: complaint.department,
                    created_at: complaint.created_at,
                    updated_at: complaint.updated_at,
                    resolved_at: complaint.resolved_at,
                    student_name: complaint.student_name,
                    student_id: complaint.student_id
                }));
                
                // Check for new complaints
                if (previousComplaintCount > 0 && newComplaints.length > previousComplaintCount) {
                    const newCount = newComplaints.length - previousComplaintCount;
                    showToast(`${newCount} new complaint${newCount > 1 ? 's' : ''} detected!`, 'success');
                }
                
                previousComplaintCount = newComplaints.length;
                complaints = newComplaints;
                updateComplaintsDisplay();
                return;
            }
        }
        
        // Fallback to database API if CSV fails
        const response = await fetch(`${API_BASE}/complaints?user_id=${currentUser.id}`);
        if (response.ok) {
            const newComplaints = await response.json();
            
            // Check for new complaints
            if (previousComplaintCount > 0 && newComplaints.length > previousComplaintCount) {
                const newCount = newComplaints.length - previousComplaintCount;
                showToast(`${newCount} new complaint${newCount > 1 ? 's' : ''} detected!`, 'success');
            }
            
            previousComplaintCount = newComplaints.length;
            complaints = newComplaints;
            updateComplaintsDisplay();
        }
    } catch (error) {
        console.error('Failed to load complaints:', error);
        showToast('Failed to load complaints. Please refresh the page.', 'error');
    }
}

async function loadDepartmentCategories(departmentId) {
    try {
        const response = await fetch(`${API_BASE}/departments/${departmentId}/categories`);
        if (response.ok) {
            categories = await response.json();
            return categories;
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        return [];
    }
}

// Modal Functions
function showLoginModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showRoleSelection();
}

function hideLoginModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showRoleSelection() {
    modalBody.innerHTML = `
        <div class="text-center" style="margin-bottom: 2rem;">
            <h2 style="font-size: 2rem; margin-bottom: 1rem; color: #e50914;">Welcome to SmartComplaint</h2>
            <p style="color: #b3b3b3;">Please select your role to continue</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <button class="btn btn-netflix btn-large" onclick="showStudentRegistration()" style="width: 100%; justify-content: space-between; padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-user-graduate" style="font-size: 1.5rem;"></i>
                    <div style="text-align: left;">
                        <div style="font-weight: 600; font-size: 1.1rem;">Student</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">Register and submit complaints</div>
                    </div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </button>
            
            <button class="btn btn-prime btn-large" onclick="showAdminLogin()" style="width: 100%; justify-content: space-between; padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-shield-alt" style="font-size: 1.5rem;"></i>
                    <div style="text-align: left;">
                        <div style="font-weight: 600; font-size: 1.1rem;">Admin</div>
                        <div style="font-size: 0.9rem; opacity: 0.8;">Manage and resolve complaints</div>
                    </div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

function showStudentRegistration() {
    modalBody.innerHTML = `
        <div class="text-center" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #e50914;">Student Registration</h2>
            <p style="color: #b3b3b3;">Please fill in your details</p>
        </div>
        
        <form id="student-registration-form">
            <!-- Personal Information -->
            <h3 style="color: #e50914; margin-bottom: 1rem; font-size: 1.1rem;">Personal Information</h3>
            
            <div class="form-group">
                <input type="text" class="form-input" placeholder="Full Name" name="name" required>
            </div>
            
            <div class="form-group">
                <input type="email" class="form-input" placeholder="Email Address" name="email" required>
            </div>
            
            <div class="form-group">
                <input type="tel" class="form-input" placeholder="Phone Number" name="phone" required>
            </div>
            
            <div class="form-row">
                <select class="form-select" name="gender" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                
                <input type="date" class="form-input" name="date_of_birth" required>
            </div>
            
            <!-- Academic Information -->
            <h3 style="color: #00a8e1; margin: 2rem 0 1rem; font-size: 1.1rem;">Academic Information</h3>
            
            <div class="form-group">
                <select class="form-select" name="course_id" id="course-select" required>
                    <option value="">Select Course</option>
                    ${courses.map(course => `<option value="${course.id}">${course.name} (${course.code})</option>`).join('')}
                </select>
            </div>
            
            <div class="form-row-3">
                <select class="form-select" name="year" required>
                    <option value="">Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                </select>
                
                <select class="form-select" name="semester" required>
                    <option value="">Semester</option>
                    ${[1,2,3,4,5,6,7,8].map(sem => `<option value="${sem}">${sem}</option>`).join('')}
                </select>
                
                <input type="text" class="form-input" placeholder="Admission Year" name="admission_year" required>
            </div>
            
            <div class="form-group">
                <input type="text" class="form-input" placeholder="Roll Number" name="roll_number" required>
            </div>
            
            <!-- Additional Information -->
            <h3 style="color: #ffa726; margin: 2rem 0 1rem; font-size: 1.1rem;">Additional Information</h3>
            
            <div class="form-group">
                <textarea class="form-textarea" placeholder="Address" name="address" required></textarea>
            </div>
            
            <div class="form-row">
                <input type="text" class="form-input" placeholder="Parent/Guardian Name" name="parent_name" required>
                <input type="tel" class="form-input" placeholder="Parent Phone" name="parent_phone" required>
            </div>
            
            <div class="form-row-3">
                <input type="text" class="form-input" placeholder="Hostel Room (Optional)" name="hostel_room">
                
                <select class="form-select" name="blood_group">
                    <option value="">Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                </select>
                
                <select class="form-select" name="category" required>
                    <option value="">Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button type="button" class="btn btn-secondary" onclick="showRoleSelection()" style="flex: 1;">
                    Back
                </button>
                <button type="submit" class="btn btn-netflix" style="flex: 1;">
                    <i class="fas fa-user-plus"></i>
                    Register
                </button>
            </div>
        </form>
    `;
    
    // Setup form submission
    document.getElementById('student-registration-form').addEventListener('submit', handleStudentRegistration);
    
    // Setup course selection change
    document.getElementById('course-select').addEventListener('change', function() {
        const courseId = this.value;
        const course = courses.find(c => c.id === parseInt(courseId));
        if (course) {
            this.setAttribute('data-department-id', course.department_id);
        }
    });
}

function showAdminLogin() {
    modalBody.innerHTML = `
        <div class="text-center" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #00a8e1;">Admin Login</h2>
            <p style="color: #b3b3b3;">Enter your credentials</p>
        </div>
        
        <form id="admin-login-form">
            <div class="form-group">
                <input type="email" class="form-input" placeholder="Admin Email" name="email" required>
            </div>
            
            <div class="form-group">
                <input type="password" class="form-input" placeholder="Password" name="password" required>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button type="button" class="btn btn-secondary" onclick="showRoleSelection()" style="flex: 1;">
                    Back
                </button>
                <button type="submit" class="btn btn-prime" style="flex: 1;">
                    <i class="fas fa-sign-in-alt"></i>
                    Login
                </button>
            </div>
        </form>
        
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="text-align: center; color: #b3b3b3; font-size: 0.9rem; margin-bottom: 1rem;">Quick Demo Access</p>
            <button class="btn btn-secondary" onclick="fillDemoCredentials()" style="width: 100%;">
                <i class="fas fa-shield-alt"></i>
                Use Demo Admin Credentials
            </button>
        </div>
    `;
    
    document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
}

function fillDemoCredentials() {
    document.querySelector('input[name="email"]').value = 'admin@college.edu';
    document.querySelector('input[name="password"]').value = 'admin123';
}

// Form Handlers
async function handleStudentRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const courseSelect = document.getElementById('course-select');
    data.department_id = courseSelect.getAttribute('data-department-id');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;
    
    try {
        await registerStudent(data);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
        await loginAdmin(email, password);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Dashboard Functions
let currentView = 'dashboard'; // 'dashboard', 'new-complaint', 'my-complaints'
let selectedDepartment = null;
let selectedCategory = null;
let complaintComments = {};

function showStudentDashboard() {
    document.body.innerHTML = `
        <div class="dashboard-container">
            <nav class="dashboard-nav">
                <div class="nav-container">
                    <div class="nav-brand">
                        <div class="brand-icon">
                            <i class="fas fa-building"></i>
                        </div>
                        <span class="brand-text">SmartComplaint</span>
                    </div>
                    
                    <div class="nav-actions">
                        <span style="color: #b3b3b3;">Welcome, ${currentUser.name}</span>
                        <div style="display: flex; gap: 1rem;">
                            ${currentView !== 'dashboard' ? `
                                <button class="btn btn-secondary" onclick="setDashboardView('dashboard')">
                                    <i class="fas fa-tachometer-alt"></i>
                                    Dashboard
                                </button>
                            ` : ''}
                            <button class="btn btn-secondary" onclick="refreshDashboard()" title="Refresh data">
                                <i class="fas fa-sync-alt"></i>
                                Refresh
                            </button>
                            <button class="btn btn-secondary" onclick="logout()">
                                <i class="fas fa-sign-out-alt"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            
            <main class="dashboard-main">
                <div class="container">
                    <div class="dashboard-header">
                        <h1 class="gradient-text">Student Dashboard</h1>
                        <p style="color: #b3b3b3; margin-bottom: 1rem;">Welcome back, ${currentUser.name}! 👋</p>
                        <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: #666; justify-content: center; flex-wrap: wrap;">
                            <span style="background: rgba(229, 9, 20, 0.2); padding: 0.25rem 0.75rem; border-radius: 15px; color: #e50914;">${currentUser.student_id}</span>
                            <span>•</span>
                            <span>${currentUser.course_name || 'N/A'}</span>
                            <span>•</span>
                            <span>Year ${currentUser.year || 'N/A'}</span>
                            <span>•</span>
                            <span id="last-updated" style="color: #4ade80;">Live Data</span>
                        </div>
                    </div>
                    
                    <div id="dashboard-content">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            </main>
        </div>
    `;
    
    loadDashboardView();
    loadUserComplaints();
    
    // Start auto-refresh for real-time updates
    startAutoRefresh();
}

function setDashboardView(view) {
    currentView = view;
    loadDashboardView();
}

function loadDashboardView() {
    const dashboardContent = document.getElementById('dashboard-content');
    
    switch(currentView) {
        case 'dashboard':
            loadMainDashboard();
            break;
        case 'new-complaint':
            loadNewComplaintView();
            break;
        case 'my-complaints':
            loadMyComplaintsView();
            break;
    }
}

function loadMainDashboard() {
    const dashboardContent = document.getElementById('dashboard-content');
    
    dashboardContent.innerHTML = `
        <!-- Stats Cards with Progress Bars -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
            <div class="glass netflix-card" style="padding: 2rem; text-align: center; border-radius: 16px; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; color: #e50914; margin-bottom: 0.5rem;" id="total-complaints">0</div>
                <div style="color: #b3b3b3; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <i class="fas fa-chart-line" style="font-size: 0.9rem;"></i>
                    Total Complaints
                </div>
                <div style="width: 100%; background: rgba(229, 9, 20, 0.2); height: 4px; border-radius: 2px; overflow: hidden;">
                    <div style="height: 100%; background: #e50914; border-radius: 2px; width: 100%; animation: progressShine 2s infinite;"></div>
                </div>
            </div>
            <div class="glass netflix-card" style="padding: 2rem; text-align: center; border-radius: 16px; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;" id="pending-complaints">0</div>
                <div style="color: #b3b3b3; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <i class="fas fa-clock" style="font-size: 0.9rem;"></i>
                    Pending
                </div>
                <div style="width: 100%; background: rgba(251, 191, 36, 0.2); height: 4px; border-radius: 2px; overflow: hidden;">
                    <div id="pending-progress" style="height: 100%; background: #fbbf24; border-radius: 2px; width: 0%; transition: width 1s ease; animation: pulse 2s infinite;"></div>
                </div>
            </div>
            <div class="glass netflix-card" style="padding: 2rem; text-align: center; border-radius: 16px; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.5rem;" id="progress-complaints">0</div>
                <div style="color: #b3b3b3; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 0.9rem;"></i>
                    In Progress
                </div>
                <div style="width: 100%; background: rgba(59, 130, 246, 0.2); height: 4px; border-radius: 2px; overflow: hidden;">
                    <div id="inprogress-progress" style="height: 100%; background: #3b82f6; border-radius: 2px; width: 0%; transition: width 1s ease;"></div>
                </div>
            </div>
            <div class="glass netflix-card" style="padding: 2rem; text-align: center; border-radius: 16px; transition: all 0.3s ease;">
                <div style="font-size: 2.5rem; font-weight: 700; color: #4ade80; margin-bottom: 0.5rem;" id="resolved-complaints">0</div>
                <div style="color: #b3b3b3; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle" style="font-size: 0.9rem;"></i>
                    Resolved
                </div>
                <div style="width: 100%; background: rgba(74, 222, 128, 0.2); height: 4px; border-radius: 2px; overflow: hidden;">
                    <div id="resolved-progress" style="height: 100%; background: #4ade80; border-radius: 2px; width: 0%; transition: width 1s ease;"></div>
                </div>
            </div>
        </div>
        
        <!-- Complaint Categories Tabs -->
        <div class="glass" style="padding: 2rem; margin-bottom: 3rem; border-radius: 16px;">
            <h2 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
                <div style="padding: 0.5rem; border-radius: 50%; background: rgba(229, 9, 20, 0.2); color: #e50914;">
                    <i class="fas fa-edit"></i>
                </div>
                Submit Your Complaint
            </h2>
            
            <!-- Category Tabs -->
            <div id="complaint-tabs" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 1rem;">
                <!-- Tabs will be loaded here -->
            </div>
            
            <!-- Complaint Form -->
            <div id="complaint-form-container">
                <!-- Form will be loaded here -->
            </div>
        </div>
        
        <!-- Quick Actions and Recent Activity -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
            <div class="glass" style="padding: 2rem; border-radius: 16px;">
                <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; color: #4ade80;">
                    <i class="fas fa-plus"></i>
                    Quick Actions
                </h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button class="btn btn-netflix" onclick="setDashboardView('new-complaint')" style="width: 100%; justify-content: center;">
                        <i class="fas fa-paper-plane"></i>
                        New Complaint
                    </button>
                    <button class="btn btn-secondary" onclick="setDashboardView('my-complaints')" style="width: 100%; justify-content: center;">
                        <i class="fas fa-list"></i>
                        My Complaints (<span id="total-count">0</span>)
                    </button>
                </div>
            </div>
            
            <div class="glass" style="padding: 2rem; border-radius: 16px;">
                <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; color: #fbbf24;">
                    <i class="fas fa-exclamation-triangle"></i>
                    Recent Activity
                </h3>
                <div id="recent-activity">
                    <!-- Recent complaints will be loaded here -->
                </div>
            </div>
        </div>
        
        <!-- My Complaints Preview -->
        <div class="glass" style="padding: 2rem; border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="display: flex; align-items: center; gap: 1rem;">
                    <div style="padding: 0.5rem; border-radius: 50%; background: rgba(0, 168, 225, 0.2); color: #00a8e1;">
                        <i class="fas fa-list"></i>
                    </div>
                    My Complaints
                </h2>
                <button class="btn btn-prime" onclick="setDashboardView('my-complaints')">
                    View All
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            <div id="complaints-preview">
                <!-- Complaints preview will be loaded here -->
            </div>
        </div>
    `;
    
    loadComplaintCategories();
    loadRecentActivity();
}

function loadNewComplaintView() {
    const dashboardContent = document.getElementById('dashboard-content');
    
    // Show the new category-based complaint form
    dashboardContent.innerHTML = `
        <div class="glass" style="padding: 2rem; border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="display: flex; align-items: center; gap: 1rem;">
                    <div style="padding: 0.5rem; border-radius: 50%; background: rgba(229, 9, 20, 0.2); color: #e50914;">
                        <i class="fas fa-edit"></i>
                    </div>
                    Submit New Complaint
                </h2>
                <button class="btn btn-secondary" onclick="setDashboardView('dashboard')">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </button>
            </div>
            
            <!-- Category Tabs -->
            <div id="complaint-tabs" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 1rem;">
                <!-- Tabs will be loaded here -->
            </div>
            
            <!-- Complaint Form -->
            <div id="complaint-form-container">
                <!-- Form will be loaded here -->
            </div>
        </div>
    `;
    
    // Load the category-based complaint system
    loadComplaintCategories();

}

function loadMyComplaintsView() {
    const dashboardContent = document.getElementById('dashboard-content');
    
    dashboardContent.innerHTML = `
        <div class="glass" style="padding: 2rem; border-radius: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="display: flex; align-items: center; gap: 1rem;">
                    <div style="padding: 0.5rem; border-radius: 50%; background: rgba(6, 182, 212, 0.2); color: #06b6d4;">
                        <i class="fas fa-list"></i>
                    </div>
                    My Complaints
                </h2>
                <button class="btn btn-secondary" onclick="setDashboardView('dashboard')">
                    <i class="fas fa-arrow-left"></i>
                    Back to Dashboard
                </button>
            </div>
            
            <!-- Status Filter Buttons -->
            <div class="status-filters" style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; color: #b3b3b3; font-size: 0.9rem;">Filter by Status:</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <button class="status-filter-btn active" data-status="all" onclick="filterComplaintsByStatus('all')">
                        <i class="fas fa-list"></i> All
                    </button>
                    <button class="status-filter-btn" data-status="Pending" onclick="filterComplaintsByStatus('Pending')">
                        <i class="fas fa-clock"></i> Pending
                    </button>
                    <button class="status-filter-btn" data-status="In Progress" onclick="filterComplaintsByStatus('In Progress')">
                        <i class="fas fa-spinner"></i> In Progress
                    </button>
                    <button class="status-filter-btn" data-status="Resolved" onclick="filterComplaintsByStatus('Resolved')">
                        <i class="fas fa-check-circle"></i> Resolved
                    </button>
                    <button class="status-filter-btn" data-status="Rejected" onclick="filterComplaintsByStatus('Rejected')">
                        <i class="fas fa-times-circle"></i> Rejected
                    </button>
                </div>
            </div>
            
            <div id="all-complaints-list" style="max-height: 600px; overflow-y: auto;">
                <!-- All complaints will be loaded here -->
            </div>
        </div>
    `;
    
    loadAllComplaints();
}

// Global variable to store all complaints for filtering
let allUserComplaints = [];
let currentStatusFilter = 'all';

// Filter complaints by status
function filterComplaintsByStatus(status) {
    currentStatusFilter = status;
    
    // Update filter button styles
    document.querySelectorAll('.status-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`).classList.add('active');
    
    // Filter and display complaints
    let filteredComplaints = allUserComplaints;
    
    if (status !== 'all') {
        filteredComplaints = allUserComplaints.filter(complaint => 
            complaint.status === status
        );
    }
    
    displayFilteredComplaints(filteredComplaints, status);
}

// Display filtered complaints
function displayFilteredComplaints(complaints, filterStatus) {
    const complaintsList = document.getElementById('all-complaints-list');
    
    if (complaints.length === 0) {
        const statusText = filterStatus === 'all' ? 'complaints' : `${filterStatus.toLowerCase()} complaints`;
        complaintsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3 style="color: #888; margin-bottom: 0.5rem;">No ${statusText} found</h3>
                <p style="color: #666;">
                    ${filterStatus === 'all' 
                        ? "You haven't submitted any complaints yet." 
                        : `You don't have any ${filterStatus.toLowerCase()} complaints.`
                    }
                </p>
            </div>
        `;
        return;
    }
    
    // Display complaints with animation
    complaintsList.innerHTML = complaints.map((complaint, index) => `
        <div class="complaint-item" style="
            animation: slideInUp 0.3s ease-out ${index * 0.1}s both;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            transition: all 0.3s ease;
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.2)'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="display: flex; gap: 0.75rem;">
                    <span class="status-badge status-${complaint.status.replace(' ', '-').toLowerCase()}" style="
                        padding: 0.25rem 0.75rem;
                        border-radius: 15px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        ${getStatusStyle(complaint.status)}
                    ">
                        ${getStatusIcon(complaint.status)} ${complaint.status}
                    </span>
                    <span style="
                        padding: 0.25rem 0.75rem;
                        background: rgba(102, 126, 234, 0.2);
                        color: #667eea;
                        border-radius: 15px;
                        font-size: 0.75rem;
                        font-weight: 500;
                    ">
                        ${complaint.category_name || 'General'}
                    </span>
                </div>
                <span style="color: #666; font-size: 0.8rem;">
                    #${complaint.complaint_id} • ${new Date(complaint.created_at).toLocaleDateString()}
                </span>
            </div>
            
            <h3 style="color: #fff; margin-bottom: 0.75rem; font-size: 1.1rem;">
                ${complaint.title}
            </h3>
            
            <p style="color: #b3b3b3; line-height: 1.5; margin-bottom: 1rem;">
                ${complaint.description.length > 150 
                    ? complaint.description.substring(0, 150) + '...' 
                    : complaint.description
                }
            </p>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 0.5rem; font-size: 0.8rem; color: #666;">
                    <span><i class="fas fa-building"></i> ${complaint.department_name || 'N/A'}</span>
                    <span>•</span>
                    <span><i class="fas fa-flag"></i> Priority: ${complaint.urgency_level || 'Medium'}</span>
                </div>
                <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 1rem;" 
                        onclick="viewComplaintDetails(${complaint.id})">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Helper functions for status styling
function getStatusStyle(status) {
    const styles = {
        'Pending': 'background: rgba(251, 191, 36, 0.2); color: #fbbf24;',
        'In Progress': 'background: rgba(59, 130, 246, 0.2); color: #3b82f6;',
        'Resolved': 'background: rgba(34, 197, 94, 0.2); color: #22c55e;',
        'Rejected': 'background: rgba(239, 68, 68, 0.2); color: #ef4444;'
    };
    return styles[status] || 'background: rgba(156, 163, 175, 0.2); color: #9ca3af;';
}

function getStatusIcon(status) {
    const icons = {
        'Pending': '<i class="fas fa-clock"></i>',
        'In Progress': '<i class="fas fa-spinner fa-spin"></i>',
        'Resolved': '<i class="fas fa-check-circle"></i>',
        'Rejected': '<i class="fas fa-times-circle"></i>'
    };
    return icons[status] || '<i class="fas fa-question-circle"></i>';
}

// View complaint details (placeholder)
function viewComplaintDetails(complaintId) {
    const complaint = allUserComplaints.find(c => c.id === complaintId);
    if (complaint) {
        showEnhancedError(`Viewing details for: ${complaint.title}`, 'info');
        // Here you could open a modal or navigate to a detail view
    }
}

// Global variable to track selected complaint category
let selectedComplaintCategory = null;

function loadComplaintCategories() {
    // Load all complaint categories from the API
    fetch(`${API_BASE}/complaint-categories`)
        .then(response => response.json())
        .then(allCategories => {
            // Group categories by type for better organization with more specific categories
            const categoryGroups = {
                'Academic': [
                    'Course Content Issues', 'Teaching Quality', 'Assignment & Projects', 
                    'Attendance Marking', 'Class Scheduling', 'Faculty Availability', 
                    'Practical Exam Issues', 'Internal Assessment', 'Guest Lecture Issues',
                    'Industrial Visit', 'Project Guidance', 'Research Facilities'
                ],
                'Infrastructure': [
                    'Room Allocation', 'Room Maintenance', 'Hostel Security', 'Hostel Cleanliness',
                    'Food Quality', 'Food Variety', 'Mess Timing', 'Mess Cleanliness',
                    'Classroom Facilities', 'Washroom Maintenance', 'Electrical Issues', 
                    'Water Supply', 'Building Safety', 'Parking Issues'
                ],
                'Technology': [
                    'Lab Equipment Malfunction', 'Lab Software Issues', 'Lab Access Problems',
                    'Internet Connectivity', 'Computer Hardware Issues', 'Language Lab Issues',
                    'Printing Services'
                ],
                'Services': [
                    'Book Availability', 'Library Timing', 'Reading Room Issues', 'Library Staff Behavior',
                    'Medical Emergency Response', 'Medicine Availability', 'Doctor Availability',
                    'Bus Route Issues', 'Bus Timing', 'Bus Condition', 'Transportation'
                ],
                'Administrative': [
                    'Fee Structure Clarity', 'Payment Gateway Issues', 'Refund Delays',
                    'Scholarship Disbursement', 'Exam Scheduling', 'Result Declaration',
                    'Document Verification', 'ID Card Problems', 'Semester Registration',
                    'Backlog Clearance'
                ],
                'Career & Placement': [
                    'Company Visits', 'Placement Training', 'Interview Process', 
                    'Job Notifications', 'Career Counseling', 'Internship Support',
                    'Alumni Network', 'Industry Collaboration', 'Entrepreneurship Programs'
                ],
                'Student Life': [
                    'Sports Equipment', 'Ground Maintenance', 'Sports Event Organization',
                    'Event Organization', 'Club Activities', 'Cultural Programs',
                    'Student Representation', 'Canteen Services', 'Banking Services'
                ],
                'Safety & Welfare': [
                    'Ragging Incidents', 'Sexual Harassment', 'Discrimination',
                    'Mental Health Support', 'Safety Concerns', 'Grievance Redressal'
                ]
            };
            
            loadComplaintTabs(categoryGroups);
            loadComplaintForm(); // Load default form
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            // Load with comprehensive default categories if API fails
            const defaultGroups = {
                'Academic': ['Course Content Issues', 'Teaching Quality', 'Assignment & Projects'],
                'Infrastructure': ['Room Allocation', 'Food Quality', 'Classroom Facilities'],
                'Technology': ['Lab Equipment Malfunction', 'Internet Connectivity'],
                'Services': ['Book Availability', 'Medical Services', 'Transportation'],
                'Administrative': ['Fee Structure Clarity', 'Exam Scheduling', 'Document Verification'],
                'Career & Placement': ['Company Visits', 'Placement Training', 'Career Counseling'],
                'Student Life': ['Sports Equipment', 'Event Organization', 'Club Activities'],
                'Safety & Welfare': ['Safety Concerns', 'Mental Health Support', 'Grievance Redressal']
            };
            loadComplaintTabs(defaultGroups);
            loadComplaintForm();
        });
}

function loadComplaintTabs(categoryGroups) {
    const tabsContainer = document.getElementById('complaint-tabs');
    
    tabsContainer.innerHTML = Object.keys(categoryGroups).map((groupName, index) => `
        <button class="complaint-tab ${index === 0 ? 'active' : ''}" 
                onclick="selectComplaintCategory('${groupName}')" 
                data-category="${groupName}">
            <i class="fas fa-${getTabIcon(groupName)}"></i>
            ${groupName}
        </button>
    `).join('');
    
    // Set default selected category
    selectedComplaintCategory = Object.keys(categoryGroups)[0];
}

function getTabIcon(categoryName) {
    const icons = {
        'Academic': 'graduation-cap',
        'Infrastructure': 'building',
        'Administrative': 'file-alt',
        'Technical': 'laptop',
        'General': 'exclamation-circle'
    };
    return icons[categoryName] || 'circle';
}

function selectComplaintCategory(categoryName) {
    selectedComplaintCategory = categoryName;
    
    // Remove active class from all tabs
    document.querySelectorAll('.complaint-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`[data-category="${categoryName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update form for selected category
    loadComplaintForm(categoryName);
}

function loadComplaintForm(categoryType = 'Academic') {
    const formContainer = document.getElementById('complaint-form-container');
    
    formContainer.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="margin-bottom: 2rem; padding: 1rem; background: rgba(229, 9, 20, 0.1); border: 1px solid rgba(229, 9, 20, 0.2); border-radius: 12px;">
                <h3 style="color: #e50914; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-${getTabIcon(categoryType)}"></i>
                    ${categoryType} Complaint
                </h3>
                <p style="color: #b3b3b3; font-size: 0.9rem;">
                    ${getCategoryDescription(categoryType)}
                </p>
            </div>
            
            <form id="complaint-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="form-group">
                    <label class="form-label">Complaint Title *</label>
                    <input type="text" class="form-input" name="title" 
                           placeholder="Brief title describing your ${categoryType.toLowerCase()} issue" 
                           required minlength="10" maxlength="100"
                           oninput="validateField(this)" onblur="validateField(this)">
                    <div class="field-feedback"></div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Detailed Description *</label>
                    <textarea class="form-textarea" name="description" 
                              placeholder="Please describe your ${categoryType.toLowerCase()} issue in detail. Include relevant dates, locations, and any other important information..." 
                              required minlength="20" maxlength="1000"
                              style="min-height: 150px;"
                              oninput="validateField(this)" onblur="validateField(this)"></textarea>
                    <div class="field-feedback"></div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Urgency Level</label>
                    <select class="form-select" name="urgency_level">
                        <option value="1">1 - Low (Can wait a few days)</option>
                        <option value="2">2 - Medium (Should be addressed soon)</option>
                        <option value="3" selected>3 - High (Needs prompt attention)</option>
                        <option value="4">4 - Very High (Urgent issue)</option>
                        <option value="5">5 - Critical (Emergency)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Additional Information (Optional)</label>
                    <textarea class="form-textarea" name="additional_info" 
                              placeholder="Any additional details, previous attempts to resolve, or relevant context..." 
                              style="min-height: 80px;"></textarea>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="button" class="btn btn-secondary" onclick="clearComplaintForm()" style="flex: 1;">
                        <i class="fas fa-eraser"></i>
                        Clear Form
                    </button>
                    <button type="submit" class="btn btn-netflix" style="flex: 2;">
                        <i class="fas fa-paper-plane"></i>
                        Submit ${categoryType} Complaint
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Add form submission handler
    const complaintForm = document.getElementById('complaint-form');
    complaintForm.addEventListener('submit', handleComplaintSubmission);
    
    // Initialize auto-save for this form
    if (window.EnhancedFeatures && window.EnhancedFeatures.AutoSave) {
        complaintForm.autoSaveInstance = new window.EnhancedFeatures.AutoSave('#complaint-form');
    }
    
    // Add real-time validation setup
    setupRealTimeValidation(complaintForm);
}

function getCategoryDescription(categoryType) {
    const descriptions = {
        'Academic': 'Issues related to courses, teaching quality, assignments, attendance, faculty, and academic processes.',
        'Infrastructure': 'Problems with hostel facilities, mess services, classrooms, washrooms, electrical, water supply, and campus infrastructure.',
        'Technology': 'Computer lab equipment, software issues, internet connectivity, hardware problems, and technical support.',
        'Services': 'Library services, medical facilities, transportation, and other campus service-related issues.',
        'Administrative': 'Fee payments, scholarships, exam scheduling, documentation, registration, and administrative processes.',
        'Career & Placement': 'Job placements, internships, career guidance, company visits, and professional development support.',
        'Student Life': 'Sports facilities, cultural events, club activities, student representation, and campus life experiences.',
        'Safety & Welfare': 'Safety concerns, harassment issues, mental health support, discrimination, and student welfare matters.'
    };
    return descriptions[categoryType] || 'Please describe your issue in detail and select the most appropriate category.';
}

function clearComplaintForm() {
    if (confirm('Are you sure you want to clear the form? All entered data will be lost.')) {
        document.getElementById('complaint-form').reset();
        // Clear all validation feedback
        document.querySelectorAll('.field-feedback').forEach(feedback => {
            feedback.innerHTML = '';
        });
        document.querySelectorAll('.form-input, .form-textarea').forEach(field => {
            field.classList.remove('valid', 'invalid');
        });
        showEnhancedError('Form cleared successfully', 'info');
    }
}

// Real-time validation function
function validateField(field) {
    const formGroup = field.parentNode;
    let feedback = formGroup.querySelector('.field-feedback');
    let charCounter = formGroup.querySelector('.char-counter');
    
    // Create feedback element if it doesn't exist
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'field-feedback';
        formGroup.appendChild(feedback);
    }
    
    // Create character counter for text fields
    if ((field.name === 'title' || field.name === 'description') && !charCounter) {
        charCounter = document.createElement('div');
        charCounter.className = 'char-counter';
        formGroup.style.position = 'relative';
        formGroup.appendChild(charCounter);
    }
    
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Clear previous validation
    field.classList.remove('valid', 'invalid');
    formGroup.classList.remove('has-validation');
    
    // Remove existing validation icon
    const existingIcon = formGroup.querySelector('.validation-icon');
    if (existingIcon) {
        existingIcon.remove();
    }
    
    // Validation rules
    let isValid = true;
    let message = '';
    let maxLength = 0;
    
    if (fieldName === 'title') {
        maxLength = 100;
        if (value.length === 0) {
            isValid = false;
            message = '<i class="fas fa-exclamation-circle"></i> Title is required';
        } else if (value.length < 10) {
            isValid = false;
            message = '<i class="fas fa-exclamation-circle"></i> Title must be at least 10 characters';
        } else if (value.length > maxLength) {
            isValid = false;
            message = '<i class="fas fa-exclamation-circle"></i> Title must be less than 100 characters';
        } else {
            isValid = true;
            message = '<i class="fas fa-check-circle"></i> Good title!';
        }
    } else if (fieldName === 'description') {
        maxLength = 1000;
        if (value.length === 0) {
            isValid = false;
            message = '<i class="fas fa-exclamation-circle"></i> Description is required';
        } else if (value.length < 20) {
            isValid = false;
            message = '<i class="fas fa-exclamation-circle"></i> Please provide more details (minimum 20 characters)';
        } else if (value.length > maxLength) {
            isValid = false;
            message = '<i class="fas fa-exclamation-circle"></i> Description is too long (maximum 1000 characters)';
        } else {
            isValid = true;
            message = '<i class="fas fa-check-circle"></i> Great description!';
        }
    }
    
    // Update character counter
    if (charCounter && maxLength > 0) {
        const remaining = maxLength - field.value.length;
        charCounter.textContent = `${field.value.length}/${maxLength}`;
        
        // Update counter color based on remaining characters
        charCounter.classList.remove('warning', 'error');
        if (remaining < 20) {
            charCounter.classList.add('error');
        } else if (remaining < 50) {
            charCounter.classList.add('warning');
        }
    }
    
    // Apply validation styling only if user has started typing
    if (field.value.length > 0) {
        field.classList.add(isValid ? 'valid' : 'invalid');
        formGroup.classList.add('has-validation');
        
        // Add validation icon
        const validationIcon = document.createElement('i');
        validationIcon.className = `validation-icon ${isValid ? 'valid' : 'invalid'} fas fa-${isValid ? 'check-circle' : 'exclamation-circle'}`;
        formGroup.appendChild(validationIcon);
        
        // Show feedback message
        feedback.innerHTML = message;
        feedback.className = `field-feedback ${isValid ? 'success' : 'error'}`;
    } else {
        // Clear feedback when field is empty
        feedback.innerHTML = '';
        feedback.className = 'field-feedback';
    }
    
    // Update submit button state
    updateSubmitButton();
    
    // Auto-save if enabled
    if (window.EnhancedFeatures && window.EnhancedFeatures.AutoSave) {
        const form = field.closest('form');
        if (form && form.autoSaveInstance) {
            form.autoSaveInstance.scheduleAutoSave();
        }
    }
}

// Setup real-time validation for a form
function setupRealTimeValidation(form) {
    const validationFields = form.querySelectorAll('input[name="title"], textarea[name="description"]');
    
    validationFields.forEach(field => {
        // Add input event listeners for real-time validation
        field.addEventListener('input', () => validateField(field));
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('focus', () => {
            // Clear any previous error states on focus
            const feedback = field.parentNode.querySelector('.field-feedback');
            if (feedback && field.value.length === 0) {
                feedback.innerHTML = '';
                field.classList.remove('valid', 'invalid');
            }
        });
    });
    
    // Initial validation state
    updateSubmitButton();
}

// Update submit button based on form validity
function updateSubmitButton() {
    const form = document.getElementById('complaint-form');
    if (!form) return;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const titleField = form.querySelector('input[name="title"]');
    const descField = form.querySelector('textarea[name="description"]');
    
    if (!submitBtn || !titleField || !descField) return;
    
    const titleValid = titleField.value.trim().length >= 10 && titleField.value.trim().length <= 100;
    const descValid = descField.value.trim().length >= 20 && descField.value.trim().length <= 1000;
    
    const isFormValid = titleValid && descValid;
    
    submitBtn.disabled = !isFormValid;
    submitBtn.style.opacity = isFormValid ? '1' : '0.6';
    submitBtn.style.cursor = isFormValid ? 'pointer' : 'not-allowed';
    
    // Update button text based on validation state
    const icon = submitBtn.querySelector('i');
    const buttonText = submitBtn.childNodes[submitBtn.childNodes.length - 1];
    
    if (isFormValid) {
        if (icon) icon.className = 'fas fa-paper-plane';
        if (buttonText) buttonText.textContent = ` Submit ${selectedComplaintCategory || 'Complaint'}`;
        submitBtn.title = 'Click to submit your complaint';
    } else {
        if (icon) icon.className = 'fas fa-exclamation-triangle';
        if (buttonText) buttonText.textContent = ' Please complete all required fields';
        submitBtn.title = 'Please fill in all required fields correctly';
    }
}

function handleComplaintSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = showLoadingState(submitBtn, 'Submitting...');
    
    // First, get all complaint categories to find the right one
    fetch(`${API_BASE}/complaint-categories`)
        .then(response => response.json())
        .then(categories => {
            // Find a category that matches the selected type
            const matchingCategory = categories.find(cat => 
                cat.name.toLowerCase().includes(selectedComplaintCategory.toLowerCase()) ||
                selectedComplaintCategory.toLowerCase().includes(cat.name.toLowerCase())
            ) || categories[0]; // Fallback to first category
            
            // Get the department for this category
            return fetch(`${API_BASE}/departments`)
                .then(response => response.json())
                .then(departments => {
                    const department = departments.find(dept => dept.id === matchingCategory.department_id) || departments[0];
                    
                    const complaintData = {
                        title: formData.get('title'),
                        description: formData.get('description') + 
                                   (formData.get('additional_info') ? '\n\nAdditional Information:\n' + formData.get('additional_info') : ''),
                        urgency_level: parseInt(formData.get('urgency_level')),
                        category_id: matchingCategory.id,
                        department_id: department.id,
                        user_id: currentUser.id
                    };
                    
                    // Submit complaint
                    return fetch(`${API_BASE}/complaints`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(complaintData)
                    });
                });
        })
        .then(response => response.json())
        .then(data => {
            if (data.success || data.id) {
                showToast('Complaint submitted successfully! Dashboard will update automatically.', 'success');
                document.getElementById('complaint-form').reset();
                
                // Immediately refresh complaints data from CSV for real-time update
                setTimeout(() => {
                    loadUserComplaints();
                    updateLastUpdatedTime();
                }, 1000); // Small delay to ensure CSV is written
                
                // Auto-save cleanup
                if (window.EnhancedFeatures && window.EnhancedFeatures.AutoSave) {
                    localStorage.removeItem('complaint_draft');
                }
                
                // Show success animation
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted!';
                setTimeout(() => {
                    hideLoadingState(submitBtn, originalContent);
                }, 2000);
                
                // Clear validation states
                document.querySelectorAll('.field-feedback').forEach(feedback => {
                    feedback.innerHTML = '';
                });
                document.querySelectorAll('.form-input, .form-textarea').forEach(field => {
                    field.classList.remove('valid', 'invalid');
                });
            } else {
                throw new Error(data.error || 'Failed to submit complaint');
            }
        })
        .catch(error => {
            console.error('Error submitting complaint:', error);
            showToast('Failed to submit complaint. Please try again.', 'error');
            hideLoadingState(submitBtn, originalContent);
        });
}

function loadDepartmentSelection() {
    const departmentsSelection = document.getElementById('departments-selection');
    
    departmentsSelection.innerHTML = departments.map((dept, index) => `
        <div class="netflix-card" onclick="selectDepartmentForNewComplaint(${dept.id})" style="
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            animation: slideInUp 0.6s ease-out ${index * 0.1}s both;
        ">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #e50914, #ff6b6b);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                ">
                    <i class="fas fa-building"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${dept.name}</h3>
                    <p style="font-size: 0.9rem; color: #b3b3b3;">${dept.location}</p>
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end;">
                <i class="fas fa-arrow-right" style="color: #e50914;"></i>
            </div>
        </div>
    `).join('');
}

async function loadCategorySelection() {
    const categoriesSelection = document.getElementById('categories-selection');
    
    try {
        const deptCategories = await loadDepartmentCategories(selectedDepartment.id);
        
        categoriesSelection.innerHTML = deptCategories.map((category, index) => `
            <div class="netflix-card" onclick="selectCategoryForComplaint(${category.id})" style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 1rem;
                animation: slideInUp 0.6s ease-out ${index * 0.1}s both;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h4 style="font-size: 1.1rem; font-weight: 600;">${category.name}</h4>
                    <span style="
                        padding: 0.25rem 0.75rem;
                        border-radius: 15px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        background: ${getPriorityColor(category.priority_level).bg};
                        color: ${getPriorityColor(category.priority_level).text};
                    ">${category.priority_level}</span>
                </div>
                <p style="color: #b3b3b3; margin-bottom: 1rem; line-height: 1.5;">${category.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; color: #666;">
                        <i class="fas fa-clock"></i> ${category.typical_resolution_days} days resolution
                    </span>
                    <i class="fas fa-arrow-right" style="color: #e50914;"></i>
                </div>
            </div>
        `).join('');
    } catch (error) {
        categoriesSelection.innerHTML = '<p style="text-align: center; color: #ef4444;">Failed to load categories. Please try again.</p>';
    }
}

function loadRecentActivity() {
    const recentActivity = document.getElementById('recent-activity');
    
    if (complaints.length === 0) {
        recentActivity.innerHTML = '<p style="color: #b3b3b3; text-align: center; padding: 1rem;">No recent activity.</p>';
        return;
    }
    
    const recentComplaints = complaints.slice(0, 3);
    recentActivity.innerHTML = recentComplaints.map(complaint => `
        <div style="
            padding: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            border-left: 3px solid ${getStatusColor(complaint.status).color};
        ">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <span style="font-weight: 500; font-size: 0.9rem;">${complaint.title}</span>
                <span style="
                    padding: 0.2rem 0.5rem;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    background: ${getStatusColor(complaint.status).bg};
                    color: ${getStatusColor(complaint.status).color};
                ">${complaint.status}</span>
            </div>
            <p style="font-size: 0.8rem; color: #b3b3b3;">
                ${new Date(complaint.created_at).toLocaleDateString()}
            </p>
        </div>
    `).join('');
}

function loadAllComplaints() {
    const allComplaintsList = document.getElementById('all-complaints-list');
    
    if (complaints.length === 0) {
        allComplaintsList.innerHTML = '<p style="text-align: center; color: #b3b3b3; padding: 3rem;">No complaints submitted yet.</p>';
        return;
    }
    
    allComplaintsList.innerHTML = complaints.map((complaint, index) => `
        <div style="
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
            animation: slideInUp 0.6s ease-out ${index * 0.1}s both;
        " onmouseover="this.style.borderColor='rgba(229, 9, 20, 0.3)'" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="
                        padding: 0.25rem 0.75rem;
                        border-radius: 15px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        background: ${getStatusColor(complaint.status).bg};
                        color: ${getStatusColor(complaint.status).color};
                    ">${complaint.status}</span>
                    <span style="
                        padding: 0.25rem 0.75rem;
                        border-radius: 15px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        background: ${getPriorityColor(complaint.priority).bg};
                        color: ${getPriorityColor(complaint.priority).text};
                    ">${complaint.priority}</span>
                </div>
                <span style="font-size: 0.8rem; color: #666;">
                    #${complaint.complaint_id} • ${new Date(complaint.created_at).toLocaleDateString()}
                </span>
            </div>
            
            <h3 style="margin-bottom: 0.75rem; font-size: 1.2rem;">${complaint.title}</h3>
            <p style="color: #b3b3b3; margin-bottom: 1rem; line-height: 1.5;">${complaint.description}</p>
            
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="
                        padding: 0.25rem 0.5rem;
                        background: rgba(100, 116, 139, 0.2);
                        color: #64748b;
                        border-radius: 8px;
                        font-size: 0.7rem;
                    ">${complaint.category_name || 'N/A'}</span>
                    <span style="
                        padding: 0.25rem 0.5rem;
                        background: rgba(6, 182, 212, 0.2);
                        color: #06b6d4;
                        border-radius: 8px;
                        font-size: 0.7rem;
                    ">${complaint.department_name || 'N/A'}</span>
                </div>
                <button class="btn btn-secondary" onclick="loadComplaintComments(${complaint.id})" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
                    <i class="fas fa-comments"></i>
                    Comments
                </button>
            </div>
            
            <div id="comments-${complaint.id}" style="margin-top: 1rem; display: none;">
                <!-- Comments will be loaded here -->
            </div>
        </div>
    `).join('');
}

// Helper functions
function getStatusColor(status) {
    switch (status) {
        case 'Pending':
            return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' };
        case 'In Progress':
            return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' };
        case 'Resolved':
            return { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' };
        case 'Rejected':
            return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' };
        default:
            return { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.2)' };
    }
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'Low':
            return { text: '#4ade80', bg: 'rgba(74, 222, 128, 0.2)' };
        case 'Medium':
            return { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' };
        case 'High':
            return { text: '#f97316', bg: 'rgba(249, 115, 22, 0.2)' };
        case 'Critical':
            return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' };
        default:
            return { text: '#9ca3af', bg: 'rgba(156, 163, 175, 0.2)' };
    }
}

// Department selection functions
function selectDepartmentForComplaint(departmentId) {
    setDashboardView('new-complaint');
}

async function selectDepartmentForNewComplaint(departmentId) {
    selectedDepartment = departments.find(d => d.id === departmentId);
    if (selectedDepartment) {
        loadDashboardView();
    }
}

function selectCategoryForComplaint(categoryId) {
    const deptCategories = categories;
    selectedCategory = deptCategories.find(c => c.id === categoryId);
    if (selectedCategory) {
        loadDashboardView();
    }
}

// Reset functions
function resetComplaintForm() {
    selectedDepartment = null;
    selectedCategory = null;
    loadDashboardView();
}

function resetSelectedCategory() {
    selectedCategory = null;
    loadDashboardView();
}

// Enhanced complaint submission
async function handleAdvancedComplaintSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const complaintData = {
        title: data.title,
        description: data.description,
        category_id: selectedCategory.id,
        department_id: selectedDepartment.id,
        user_id: currentUser.id,
        urgency_level: parseInt(data.urgency_level)
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        await submitComplaint(complaintData);
        
        // Reset form and go back to dashboard
        resetComplaintForm();
        setDashboardView('dashboard');
        
        showToast('Complaint submitted successfully!', 'success');
    } catch (error) {
        showToast('Failed to submit complaint. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Comments functionality
async function loadComplaintComments(complaintId) {
    const commentsDiv = document.getElementById(`comments-${complaintId}`);
    
    if (commentsDiv.style.display === 'none') {
        try {
            const response = await fetch(`${API_BASE}/complaints/${complaintId}/comments`);
            if (response.ok) {
                const comments = await response.json();
                
                if (comments.length === 0) {
                    commentsDiv.innerHTML = `
                        <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                            <h4 style="margin-bottom: 0.5rem; color: #b3b3b3; font-size: 0.9rem;">Admin Comments:</h4>
                            <p style="color: #666; font-size: 0.8rem;">No comments yet.</p>
                        </div>
                    `;
                } else {
                    commentsDiv.innerHTML = `
                        <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                            <h4 style="margin-bottom: 1rem; color: #b3b3b3; font-size: 0.9rem;">Admin Comments:</h4>
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                ${comments.map(comment => `
                                    <div style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 8px;">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                            <span style="font-weight: 500; color: #06b6d4; font-size: 0.9rem;">${comment.admin_name}</span>
                                            <span style="font-size: 0.7rem; color: #666;">
                                                ${new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style="color: #e5e7eb; line-height: 1.4; font-size: 0.9rem;">${comment.text}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
                
                commentsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
            showToast('Failed to load comments', 'error');
        }
    } else {
        commentsDiv.style.display = 'none';
    }
}

async function selectDepartment(departmentId) {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    
    const deptCategories = await loadDepartmentCategories(departmentId);
    showComplaintForm(department, deptCategories);
}

function showComplaintForm(department, categories) {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    modalBody.innerHTML = `
        <div class="text-center" style="margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #e50914;">New Complaint</h2>
            <p style="color: #b3b3b3;">Department: ${department.name}</p>
        </div>
        
        <form id="complaint-form">
            <div class="form-group">
                <label class="form-label">Select Category</label>
                <select class="form-select" name="category_id" required>
                    <option value="">Choose complaint category</option>
                    ${categories.map(cat => `
                        <option value="${cat.id}">
                            ${cat.name} (${cat.typical_resolution_days} days resolution)
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Complaint Title</label>
                <input type="text" class="form-input" name="title" placeholder="Brief title for your complaint" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Detailed Description</label>
                <textarea class="form-textarea" name="description" placeholder="Describe your issue in detail..." required style="min-height: 120px;"></textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Urgency Level</label>
                <select class="form-select" name="urgency_level">
                    <option value="1">1 - Low</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - High</option>
                    <option value="4">4 - Very High</option>
                    <option value="5">5 - Critical</option>
                </select>
            </div>
            
            <input type="hidden" name="department_id" value="${department.id}">
            <input type="hidden" name="user_id" value="${currentUser.id}">
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button type="button" class="btn btn-secondary" onclick="hideLoginModal()" style="flex: 1;">
                    Cancel
                </button>
                <button type="submit" class="btn btn-netflix" style="flex: 1;">
                    <i class="fas fa-paper-plane"></i>
                    Submit Complaint
                </button>
            </div>
        </form>
    `;
    
    document.getElementById('complaint-form').addEventListener('submit', handleComplaintSubmission);
}

async function handleComplaintSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    data.category_id = parseInt(data.category_id);
    data.department_id = parseInt(data.department_id);
    data.user_id = parseInt(data.user_id);
    data.urgency_level = parseInt(data.urgency_level);
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    try {
        await submitComplaint(data);
        hideLoginModal();
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function updateComplaintsDisplay() {
    // Show loading indicator
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        lastUpdatedElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        lastUpdatedElement.style.color = '#fbbf24';
    }
    
    // Update stats
    const totalElement = document.getElementById('total-complaints');
    const pendingElement = document.getElementById('pending-complaints');
    const progressElement = document.getElementById('progress-complaints');
    const resolvedElement = document.getElementById('resolved-complaints');
    const totalCountElement = document.getElementById('total-count');
    
    if (totalElement) totalElement.textContent = complaints.length;
    if (pendingElement) pendingElement.textContent = complaints.filter(c => c.status === 'Pending').length;
    if (progressElement) progressElement.textContent = complaints.filter(c => c.status === 'In Progress').length;
    if (resolvedElement) resolvedElement.textContent = complaints.filter(c => c.status === 'Resolved').length;
    if (totalCountElement) totalCountElement.textContent = complaints.length;
    
    // Update progress bars
    const total = complaints.length;
    if (total > 0) {
        const pendingProgress = document.getElementById('pending-progress');
        const inprogressProgress = document.getElementById('inprogress-progress');
        const resolvedProgress = document.getElementById('resolved-progress');
        
        if (pendingProgress) {
            pendingProgress.style.width = `${(complaints.filter(c => c.status === 'Pending').length / total) * 100}%`;
        }
        if (inprogressProgress) {
            inprogressProgress.style.width = `${(complaints.filter(c => c.status === 'In Progress').length / total) * 100}%`;
        }
        if (resolvedProgress) {
            resolvedProgress.style.width = `${(complaints.filter(c => c.status === 'Resolved').length / total) * 100}%`;
        }
    }
    
    // Update complaints preview on main dashboard
    const complaintsPreview = document.getElementById('complaints-preview');
    if (complaintsPreview) {
        if (complaints.length === 0) {
            complaintsPreview.innerHTML = '<p style="text-align: center; color: #b3b3b3; padding: 2rem;">No complaints submitted yet.</p>';
        } else {
            const previewComplaints = complaints.slice(0, 3);
            complaintsPreview.innerHTML = previewComplaints.map(complaint => `
                <div style="
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.borderColor='rgba(229, 9, 20, 0.3)'" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <span style="
                                padding: 0.25rem 0.75rem;
                                border-radius: 15px;
                                font-size: 0.7rem;
                                font-weight: 600;
                                background: ${getStatusColor(complaint.status).bg};
                                color: ${getStatusColor(complaint.status).color};
                            ">${complaint.status}</span>
                            <span style="
                                padding: 0.25rem 0.75rem;
                                border-radius: 15px;
                                font-size: 0.7rem;
                                font-weight: 600;
                                background: ${getPriorityColor(complaint.priority).bg};
                                color: ${getPriorityColor(complaint.priority).text};
                            ">${complaint.priority}</span>
                        </div>
                        <span style="font-size: 0.8rem; color: #666;">
                            #${complaint.complaint_id}
                        </span>
                    </div>
                    
                    <h3 style="margin-bottom: 0.5rem; font-size: 1rem;">${complaint.title}</h3>
                    <p style="color: #b3b3b3; margin-bottom: 1rem; line-height: 1.5; font-size: 0.9rem;">
                        ${complaint.description.length > 100 ? complaint.description.substring(0, 100) + '...' : complaint.description}
                    </p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <span style="font-size: 0.8rem; color: #666;">
                            ${new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                        <span style="
                            padding: 0.25rem 0.5rem;
                            background: rgba(6, 182, 212, 0.2);
                            color: #06b6d4;
                            border-radius: 8px;
                            font-size: 0.7rem;
                        ">${complaint.department_name || 'N/A'}</span>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Update recent activity
    loadRecentActivity();
    
    // Update all complaints view if it's currently active
    if (currentView === 'my-complaints') {
        loadAllComplaints();
    }
}

function showAdminDashboard() {
    document.body.innerHTML = `
        <div class="dashboard-container">
            <nav class="dashboard-nav">
                <div class="nav-container">
                    <div class="nav-brand">
                        <div class="brand-icon">
                            <i class="fas fa-building"></i>
                        </div>
                        <span class="brand-text">SmartComplaint</span>
                    </div>
                    
                    <div class="nav-actions">
                        <span style="color: #b3b3b3;">Admin: ${currentUser.name}</span>
                        <button class="btn btn-secondary" onclick="logout()">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            
            <main class="dashboard-main">
                <div class="container">
                    <div class="dashboard-header">
                        <h1 class="gradient-text">Admin Dashboard</h1>
                        <p style="color: #b3b3b3; margin-bottom: 1rem;">Manage and resolve complaints efficiently 🛠️</p>
                        <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: #666; justify-content: center; flex-wrap: wrap;">
                            <span style="background: rgba(0, 168, 225, 0.2); padding: 0.25rem 0.75rem; border-radius: 15px; color: #00a8e1;">${currentUser.designation || 'Administrator'}</span>
                            <span>•</span>
                            <span>${currentUser.department_name || 'All Departments'}</span>
                        </div>
                    </div>
                    
                    <div id="admin-dashboard-content">
                        <!-- Admin content will be loaded here -->
                    </div>
                </div>
            </main>
        </div>
    `;
    
    loadAdminDashboardContent();
    
    // Start auto-refresh for admin
    startAdminAutoRefresh();
}

async function loadAdminDashboardContent() {
    const dashboardContent = document.getElementById('admin-dashboard-content');
    
    // Show loading state
    dashboardContent.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
            <p>Loading admin dashboard...</p>
        </div>
    `;
    
    // Load all complaints from CSV for admin (real-time data)
    try {
        let allComplaints = [];
        
        // Try CSV endpoint first
        try {
            const csvResponse = await fetch(`${API_BASE}/all-student-complaints`);
            if (csvResponse.ok) {
                const csvComplaints = await csvResponse.json();
                console.log('CSV Response:', csvComplaints); // Debug log
                
                if (Array.isArray(csvComplaints) && csvComplaints.length > 0) {
                    // Convert CSV data to match expected format
                    allComplaints = csvComplaints.map(complaint => ({
                        id: complaint.complaint_id,
                        complaint_id: complaint.complaint_id,
                        title: complaint.title,
                        description: complaint.description,
                        status: complaint.status,
                        priority: complaint.priority,
                        urgency_level: complaint.urgency_level,
                        category_name: complaint.category,
                        department_name: complaint.department,
                        created_at: complaint.created_at,
                        updated_at: complaint.updated_at,
                        resolved_at: complaint.resolved_at,
                        student_name: complaint.student_name,
                        student_id: complaint.student_id
                    }));
                    console.log('Processed complaints:', allComplaints.length); // Debug log
                }
            }
        } catch (csvError) {
            console.log('CSV endpoint failed, trying database:', csvError);
        }
        
        // Fallback to database API if CSV failed or empty
        if (allComplaints.length === 0) {
            const response = await fetch(`${API_BASE}/complaints`);
            if (response.ok) {
                allComplaints = await response.json();
                console.log('Database complaints:', allComplaints.length); // Debug log
            }
        }
        
        // Calculate additional statistics
        const totalStudents = new Set(allComplaints.map(c => c.student_id)).size;
        const todayComplaints = allComplaints.filter(c => {
            const today = new Date().toDateString();
            const complaintDate = new Date(c.created_at).toDateString();
            return today === complaintDate;
        }).length;
        const criticalComplaints = allComplaints.filter(c => c.priority === 'Critical' || c.urgency_level >= 4).length;
            
            dashboardContent.innerHTML = `
                <!-- Admin Overview Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                    <div class="glass netflix-card" style="padding: 1.5rem; text-align: center; border-radius: 16px; border-left: 4px solid #00a8e1;">
                        <div style="font-size: 2rem; font-weight: 700; color: #00a8e1; margin-bottom: 0.5rem;">${allComplaints.length}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">
                            <i class="fas fa-clipboard-list"></i> Total Complaints
                        </div>
                    </div>
                    <div class="glass netflix-card" style="padding: 1.5rem; text-align: center; border-radius: 16px; border-left: 4px solid #fbbf24;">
                        <div style="font-size: 2rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.5rem;">${allComplaints.filter(c => c.status === 'Pending').length}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">
                            <i class="fas fa-hourglass-half"></i> Pending Review
                        </div>
                    </div>
                    <div class="glass netflix-card" style="padding: 1.5rem; text-align: center; border-radius: 16px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 2rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.5rem;">${allComplaints.filter(c => c.status === 'In Progress').length}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">
                            <i class="fas fa-cogs"></i> In Progress
                        </div>
                    </div>
                    <div class="glass netflix-card" style="padding: 1.5rem; text-align: center; border-radius: 16px; border-left: 4px solid #4ade80;">
                        <div style="font-size: 2rem; font-weight: 700; color: #4ade80; margin-bottom: 0.5rem;">${allComplaints.filter(c => c.status === 'Resolved').length}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">
                            <i class="fas fa-check-circle"></i> Resolved
                        </div>
                    </div>
                    <div class="glass netflix-card" style="padding: 1.5rem; text-align: center; border-radius: 16px; border-left: 4px solid #8b5cf6;">
                        <div style="font-size: 2rem; font-weight: 700; color: #8b5cf6; margin-bottom: 0.5rem;">${totalStudents}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">
                            <i class="fas fa-users"></i> Active Students
                        </div>
                    </div>
                    <div class="glass netflix-card" style="padding: 1.5rem; text-align: center; border-radius: 16px; border-left: 4px solid #ef4444;">
                        <div style="font-size: 2rem; font-weight: 700; color: #ef4444; margin-bottom: 0.5rem;">${criticalComplaints}</div>
                        <div style="color: #b3b3b3; font-size: 0.9rem;">
                            <i class="fas fa-exclamation-triangle"></i> Critical Issues
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions for Admin -->
                <div class="glass" style="padding: 2rem; margin-bottom: 2rem; border-radius: 16px;">
                    <h2 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                        <i class="fas fa-bolt" style="color: #fbbf24;"></i>
                        Quick Actions
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        <button class="btn btn-netflix" onclick="showPendingComplaints()" style="padding: 1rem; justify-content: center;">
                            <i class="fas fa-clock"></i>
                            Review Pending (${allComplaints.filter(c => c.status === 'Pending').length})
                        </button>
                        <button class="btn btn-prime" onclick="showCriticalComplaints()" style="padding: 1rem; justify-content: center;">
                            <i class="fas fa-fire"></i>
                            Critical Issues (${criticalComplaints})
                        </button>
                        <button class="btn btn-secondary" onclick="showTodayComplaints()" style="padding: 1rem; justify-content: center;">
                            <i class="fas fa-calendar-day"></i>
                            Today's Complaints (${todayComplaints})
                        </button>
                        <button class="btn btn-secondary" onclick="exportComplaintsData()" style="padding: 1rem; justify-content: center;">
                            <i class="fas fa-download"></i>
                            Export Data
                        </button>
                    </div>
                </div>
                
                <!-- Advanced Filters and Search -->
                <div class="glass" style="padding: 2rem; margin-bottom: 2rem; border-radius: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                        <h2 style="display: flex; align-items: center; gap: 1rem;">
                            <i class="fas fa-search" style="color: #00a8e1;"></i>
                            Search & Filter Complaints
                        </h2>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-secondary" onclick="refreshAdminComplaints()">
                                <i class="fas fa-sync-alt"></i>
                                Refresh Data
                            </button>
                            <span id="admin-last-updated" style="color: #4ade80; font-size: 0.9rem;">Live Data</span>
                        </div>
                    </div>
                    
                    <!-- Search Bar -->
                    <div style="margin-bottom: 1.5rem;">
                        <input type="text" class="form-input" id="search-complaints" placeholder="Search by student name, complaint title, or description..." 
                               oninput="searchAdminComplaints()" style="width: 100%;">
                    </div>
                    
                    <!-- Filter Options -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                        <select class="form-select" id="status-filter" onchange="filterAdminComplaints()">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        
                        <select class="form-select" id="priority-filter" onchange="filterAdminComplaints()">
                            <option value="">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                        
                        <select class="form-select" id="department-filter" onchange="filterAdminComplaints()">
                            <option value="">All Departments</option>
                            ${departments.map(dept => `<option value="${dept.name}">${dept.name}</option>`).join('')}
                        </select>
                        
                        <select class="form-select" id="urgency-filter" onchange="filterAdminComplaints()">
                            <option value="">All Urgency</option>
                            <option value="5">5 - Critical</option>
                            <option value="4">4 - Very High</option>
                            <option value="3">3 - High</option>
                            <option value="2">2 - Medium</option>
                            <option value="1">1 - Low</option>
                        </select>
                        
                        <select class="form-select" id="date-filter" onchange="filterAdminComplaints()">
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>
                </div>
                
                <!-- Analytics Charts -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                    <div class="glass" style="padding: 2rem; border-radius: 16px;">
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                            <i class="fas fa-chart-bar" style="color: #00a8e1;"></i>
                            Complaints by Status
                        </h3>
                        <div id="status-chart"></div>
                    </div>
                    
                    <div class="glass" style="padding: 2rem; border-radius: 16px;">
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                            <i class="fas fa-chart-pie" style="color: #fbbf24;"></i>
                            Department Distribution
                        </h3>
                        <div id="department-chart"></div>
                    </div>
                </div>
                
                <!-- All Complaints Management -->
                <div class="glass" style="padding: 2rem; border-radius: 16px;">
                    <h2 style="margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
                        <i class="fas fa-tasks" style="color: #e50914;"></i>
                        Manage Complaints
                    </h2>
                    <div id="admin-complaints-list" style="max-height: 600px; overflow-y: auto;">
                        <!-- Admin complaints will be loaded here -->
                    </div>
                </div>
            `;
            
        // Ensure we have some data to display
        if (allComplaints.length === 0) {
            console.warn('No complaints found from API, creating sample data for demo');
            // Create sample data for demo purposes
            allComplaints = [
                {
                    id: 'COMP001',
                    complaint_id: 'COMP001',
                    title: 'Sample Complaint - WiFi Issue',
                    description: 'This is a sample complaint for demonstration purposes.',
                    status: 'Pending',
                    priority: 'Medium',
                    urgency_level: 3,
                    category_name: 'Infrastructure',
                    department_name: 'IT Services',
                    created_at: '2024-12-15 10:00:00',
                    updated_at: '2024-12-15 10:00:00',
                    resolved_at: '',
                    student_name: 'Demo Student',
                    student_id: 'DEMO001'
                }
            ];
            showToast('Showing demo data - API may be unavailable', 'info');
        } else {
            console.log(`Loading ${allComplaints.length} complaints for admin dashboard`);
            showToast(`Loaded ${allComplaints.length} complaints`, 'success');
        }
        
        loadAdminComplaints(allComplaints);
        generateAdminCharts(allComplaints);
    } catch (error) {
        console.error('Failed to load admin dashboard:', error);
        showToast('Failed to load admin dashboard: ' + error.message, 'error');
        
        // Show error state in dashboard
        dashboardContent.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Failed to Load Dashboard</h3>
                <p>Error: ${error.message}</p>
                <button class="btn btn-netflix" onclick="loadAdminDashboardContent()" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
}

function generateAdminCharts(complaints) {
    console.log('Generating charts for', complaints.length, 'complaints');
    
    // Status Chart
    const statusData = [
        { label: 'Pending', value: complaints.filter(c => c.status === 'Pending').length },
        { label: 'In Progress', value: complaints.filter(c => c.status === 'In Progress').length },
        { label: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length },
        { label: 'Rejected', value: complaints.filter(c => c.status === 'Rejected').length }
    ].filter(item => item.value > 0);
    
    const statusChart = document.getElementById('status-chart');
    if (statusChart) {
        if (statusData.length > 0 && window.SimpleCharts) {
            SimpleCharts.createBarChart(statusChart, statusData, {
                colors: ['#fbbf24', '#3b82f6', '#4ade80', '#ef4444']
            });
        } else {
            statusChart.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-chart-bar" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No status data available</p>
                </div>
            `;
        }
    }
    
    // Department Chart
    const deptCounts = {};
    complaints.forEach(complaint => {
        const dept = complaint.department_name || 'Unknown';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    const departmentData = Object.entries(deptCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 departments
    
    const departmentChart = document.getElementById('department-chart');
    if (departmentChart) {
        if (departmentData.length > 0 && window.SimpleCharts) {
            SimpleCharts.createPieChart(departmentChart, departmentData, {
                colors: ['#e50914', '#ff6b6b', '#00a8e1', '#4ade80', '#fbbf24', '#8b5cf6']
            });
        } else {
            departmentChart.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-chart-pie" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No department data available</p>
                </div>
            `;
        }
    }
}

let allAdminComplaints = [];

function loadAdminComplaints(complaints) {
    allAdminComplaints = complaints;
    displayAdminComplaints(complaints);
}

function displayAdminComplaints(complaintsToShow) {
    const adminComplaintsList = document.getElementById('admin-complaints-list');
    
    console.log('Displaying', complaintsToShow.length, 'complaints'); // Debug log
    
    if (!adminComplaintsList) {
        console.error('Admin complaints list element not found');
        return;
    }
    
    if (complaintsToShow.length === 0) {
        adminComplaintsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3 style="color: #888; margin-bottom: 0.5rem;">No complaints found</h3>
                <p style="color: #666;">The system currently has no complaints to display.</p>
                <button class="btn btn-netflix" onclick="loadAdminDashboardContent()" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i> Refresh Data
                </button>
            </div>
        `;
        return;
    }
    
    adminComplaintsList.innerHTML = complaintsToShow.map((complaint, index) => `
        <div style="
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s ease;
            animation: slideInUp 0.6s ease-out ${index * 0.05}s both;
            ${complaint.urgency_level >= 4 ? 'border-left: 4px solid #ef4444;' : ''}
        " onmouseover="this.style.borderColor='rgba(0, 168, 225, 0.3)'" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
            
            <!-- Header with Status and Priority -->
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="
                        padding: 0.25rem 0.75rem;
                        border-radius: 15px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        background: ${getStatusColor(complaint.status).bg};
                        color: ${getStatusColor(complaint.status).color};
                    ">${getStatusIcon(complaint.status)} ${complaint.status}</span>
                    <span style="
                        padding: 0.25rem 0.75rem;
                        border-radius: 15px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        background: ${getPriorityColor(complaint.priority).bg};
                        color: ${getPriorityColor(complaint.priority).text};
                    ">${complaint.priority}</span>
                    ${complaint.urgency_level >= 4 ? `
                        <span style="
                            padding: 0.25rem 0.75rem;
                            border-radius: 15px;
                            font-size: 0.7rem;
                            font-weight: 600;
                            background: rgba(239, 68, 68, 0.2);
                            color: #ef4444;
                        "><i class="fas fa-fire"></i> Urgent</span>
                    ` : ''}
                </div>
                <div style="text-align: right; font-size: 0.8rem; color: #666;">
                    <div>#${complaint.complaint_id}</div>
                    <div>${new Date(complaint.created_at).toLocaleDateString()}</div>
                </div>
            </div>
            
            <!-- Student Information -->
            <div style="background: rgba(139, 92, 246, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <strong style="color: #8b5cf6;">${complaint.student_name}</strong>
                        <span style="color: #b3b3b3; margin-left: 0.5rem;">(${complaint.student_id})</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #666;">
                        ${complaint.department_name} • ${complaint.category_name}
                    </div>
                </div>
            </div>
            
            <!-- Complaint Details -->
            <h3 style="margin-bottom: 0.75rem; font-size: 1.2rem; color: #fff;">${complaint.title}</h3>
            <p style="color: #b3b3b3; margin-bottom: 1.5rem; line-height: 1.5; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">
                ${complaint.description}
            </p>
            
            <!-- Admin Actions -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; color: #b3b3b3;">
                        <i class="fas fa-tasks"></i> Update Status
                    </label>
                    <select class="form-select" onchange="updateComplaintStatus('${complaint.complaint_id}', this.value)" style="font-size: 0.9rem;">
                        <option value="Pending" ${complaint.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${complaint.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${complaint.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Rejected" ${complaint.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; color: #b3b3b3;">
                        <i class="fas fa-flag"></i> Update Priority
                    </label>
                    <select class="form-select" onchange="updateComplaintPriority('${complaint.complaint_id}', this.value)" style="font-size: 0.9rem;">
                        <option value="Low" ${complaint.priority === 'Low' ? 'selected' : ''}>Low</option>
                        <option value="Medium" ${complaint.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="High" ${complaint.priority === 'High' ? 'selected' : ''}>High</option>
                        <option value="Critical" ${complaint.priority === 'Critical' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; font-size: 0.8rem; color: #666;">
                    <span><i class="fas fa-clock"></i> Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
                    ${complaint.updated_at ? `<span><i class="fas fa-edit"></i> Updated: ${new Date(complaint.updated_at).toLocaleDateString()}</span>` : ''}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="showAddCommentForm('${complaint.complaint_id}')" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
                        <i class="fas fa-comment-plus"></i>
                        Add Comment
                    </button>
                    <button class="btn btn-prime" onclick="viewStudentProfile('${complaint.student_id}')" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
                        <i class="fas fa-user"></i>
                        View Student
                    </button>
                </div>
            </div>
            
            <div id="comment-form-${complaint.complaint_id}" style="margin-top: 1rem; display: none;">
                <!-- Comment form will be added here -->
            </div>
        </div>
    `).join('');
}

function filterAdminComplaints() {
    const statusFilter = document.getElementById('status-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    const departmentFilter = document.getElementById('department-filter').value;
    
    let filteredComplaints = allAdminComplaints;
    
    if (statusFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.priority === priorityFilter);
    }
    
    if (departmentFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.department_id === parseInt(departmentFilter));
    }
    
    displayAdminComplaints(filteredComplaints);
}

async function refreshAdminComplaints() {
    try {
        showToast('Refreshing complaints data...', 'info');
        
        // Try CSV endpoint first
        let allComplaints = [];
        try {
            const csvResponse = await fetch(`${API_BASE}/all-student-complaints`);
            if (csvResponse.ok) {
                const csvComplaints = await csvResponse.json();
                if (Array.isArray(csvComplaints) && csvComplaints.length > 0) {
                    allComplaints = csvComplaints.map(complaint => ({
                        id: complaint.complaint_id,
                        complaint_id: complaint.complaint_id,
                        title: complaint.title,
                        description: complaint.description,
                        status: complaint.status,
                        priority: complaint.priority,
                        urgency_level: complaint.urgency_level,
                        category_name: complaint.category,
                        department_name: complaint.department,
                        created_at: complaint.created_at,
                        updated_at: complaint.updated_at,
                        resolved_at: complaint.resolved_at,
                        student_name: complaint.student_name,
                        student_id: complaint.student_id
                    }));
                }
            }
        } catch (csvError) {
            console.log('CSV refresh failed, trying database');
        }
        
        // Fallback to database
        if (allComplaints.length === 0) {
            const response = await fetch(`${API_BASE}/complaints`);
            if (response.ok) {
                allComplaints = await response.json();
            }
        }
        
        loadAdminComplaints(allComplaints);
        generateAdminCharts(allComplaints);
        showToast(`Refreshed ${allComplaints.length} complaints`, 'success');
        updateAdminLastUpdatedTime();
    } catch (error) {
        console.error('Refresh error:', error);
        showToast('Failed to refresh complaints: ' + error.message, 'error');
    }
}

async function updateComplaintStatus(complaintId, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showToast(`Status updated to ${newStatus}`, 'success');
            refreshAdminComplaints();
        } else {
            throw new Error('Failed to update status');
        }
    } catch (error) {
        showToast('Failed to update status', 'error');
    }
}

async function updateComplaintPriority(complaintId, newPriority) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${complaintId}/priority`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ priority: newPriority })
        });
        
        if (response.ok) {
            showToast(`Priority updated to ${newPriority}`, 'success');
            refreshAdminComplaints();
        } else {
            throw new Error('Failed to update priority');
        }
    } catch (error) {
        showToast('Failed to update priority', 'error');
    }
}

function showAddCommentForm(complaintId) {
    const commentFormDiv = document.getElementById(`comment-form-${complaintId}`);
    
    if (commentFormDiv.style.display === 'none') {
        commentFormDiv.innerHTML = `
            <div style="padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <h4 style="margin-bottom: 1rem; color: #b3b3b3;">Add Admin Comment</h4>
                <form onsubmit="submitAdminComment(event, ${complaintId})" style="display: flex; flex-direction: column; gap: 1rem;">
                    <textarea class="form-textarea" placeholder="Enter your comment..." required style="min-height: 100px;"></textarea>
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" class="btn btn-secondary" onclick="hideAddCommentForm(${complaintId})" style="flex: 1;">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-prime" style="flex: 1;">
                            <i class="fas fa-comment"></i>
                            Add Comment
                        </button>
                    </div>
                </form>
            </div>
        `;
        commentFormDiv.style.display = 'block';
    } else {
        commentFormDiv.style.display = 'none';
    }
}

function hideAddCommentForm(complaintId) {
    const commentFormDiv = document.getElementById(`comment-form-${complaintId}`);
    commentFormDiv.style.display = 'none';
}

async function submitAdminComment(event, complaintId) {
    event.preventDefault();
    
    const textarea = event.target.querySelector('textarea');
    const commentText = textarea.value.trim();
    
    if (!commentText) return;
    
    try {
        const response = await fetch(`${API_BASE}/complaints/${complaintId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                admin_id: currentUser.id,
                text: commentText
            })
        });
        
        if (response.ok) {
            showToast('Comment added successfully', 'success');
            hideAddCommentForm(complaintId);
            textarea.value = '';
        } else {
            throw new Error('Failed to add comment');
        }
    } catch (error) {
        showToast('Failed to add comment', 'error');
    }
}

// Utility Functions
function checkAuthStatus() {
    const userData = localStorage.getItem('user');
    if (userData) {
        currentUser = JSON.parse(userData);
        if (currentUser.role === 'student') {
            showStudentDashboard();
        } else if (currentUser.role === 'admin') {
            showAdminDashboard();
        }
    }
}

function logout() {
    // Stop auto-refresh when logging out
    stopAutoRefresh();
    
    currentUser = null;
    localStorage.removeItem('user');
    location.reload();
}

function showToast(message, type = 'info') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    toastIcon.className = `toast-icon ${icons[type]}`;
    toastMessage.textContent = message;
    
    toast.className = `toast ${type}`;
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Helper function to show loading state on buttons
function showLoadingState(button, loadingText) {
    const originalContent = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
    button.disabled = true;
    return originalContent;
}

// Helper function to hide loading state on buttons
function hideLoadingState(button, originalContent) {
    button.innerHTML = originalContent;
    button.disabled = false;
}

// Enhanced error display function
function showEnhancedError(message, type = 'info') {
    showToast(message, type);
}

function showDemo() {
    showToast('Demo video coming soon!', 'info');
}

// Auto-refresh functionality for real-time updates
let autoRefreshInterval = null;
let previousComplaintCount = 0;

function startAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Set initial complaint count
    previousComplaintCount = complaints.length;
    
    // Refresh data every 10 seconds for real-time updates
    autoRefreshInterval = setInterval(() => {
        if (currentUser && currentUser.role === 'student') {
            loadUserComplaints();
            updateLastUpdatedTime();
        }
    }, 10000); // 10 seconds
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

function refreshDashboard() {
    if (currentUser && currentUser.role === 'student') {
        showToast('Refreshing dashboard data...', 'info');
        loadUserComplaints();
        updateLastUpdatedTime();
        
        // Show refresh animation
        const refreshBtn = document.querySelector('button[onclick="refreshDashboard()"] i');
        if (refreshBtn) {
            refreshBtn.classList.add('fa-spin');
            setTimeout(() => {
                refreshBtn.classList.remove('fa-spin');
            }, 1000);
        }
    }
}

function updateLastUpdatedTime() {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = `Updated: ${now.toLocaleTimeString()}`;
        lastUpdatedElement.style.color = '#4ade80';
        
        // Fade back to normal color after 2 seconds
        setTimeout(() => {
            lastUpdatedElement.style.color = '#666';
        }, 2000);
    }
}

// Global functions for onclick handlers
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.showRoleSelection = showRoleSelection;
window.showStudentRegistration = showStudentRegistration;
window.showAdminLogin = showAdminLogin;
window.fillDemoCredentials = fillDemoCredentials;
window.selectDepartment = selectDepartment;
window.selectDepartmentForComplaint = selectDepartmentForComplaint;
window.selectDepartmentForNewComplaint = selectDepartmentForNewComplaint;
window.selectCategoryForComplaint = selectCategoryForComplaint;
window.setDashboardView = setDashboardView;
window.resetComplaintForm = resetComplaintForm;
window.resetSelectedCategory = resetSelectedCategory;
window.loadComplaintComments = loadComplaintComments;
window.filterAdminComplaints = filterAdminComplaints;
window.refreshAdminComplaints = refreshAdminComplaints;
window.updateComplaintStatus = updateComplaintStatus;
window.updateComplaintPriority = updateComplaintPriority;
window.showAddCommentForm = showAddCommentForm;
window.hideAddCommentForm = hideAddCommentForm;
window.submitAdminComment = submitAdminComment;
window.logout = logout;
window.showDemo = showDemo;
window.selectComplaintCategory = selectComplaintCategory;
window.clearComplaintForm = clearComplaintForm;
window.validateField = validateField;
window.filterComplaintsByStatus = filterComplaintsByStatus;
window.viewComplaintDetails = viewComplaintDetails;
window.refreshDashboard = refreshDashboard;
window.showPendingComplaints = showPendingComplaints;
window.showCriticalComplaints = showCriticalComplaints;
window.showTodayComplaints = showTodayComplaints;
window.exportComplaintsData = exportComplaintsData;
window.searchAdminComplaints = searchAdminComplaints;
window.viewStudentProfile = viewStudentProfile;
window.loadAdminDashboardContent = loadAdminDashboardContent;
// Admin-specific functions
function showPendingComplaints() {
    document.getElementById('status-filter').value = 'Pending';
    filterAdminComplaints();
    showToast('Showing pending complaints only', 'info');
}

function showCriticalComplaints() {
    document.getElementById('priority-filter').value = 'Critical';
    document.getElementById('urgency-filter').value = '4';
    filterAdminComplaints();
    showToast('Showing critical complaints only', 'info');
}

function showTodayComplaints() {
    document.getElementById('date-filter').value = 'today';
    filterAdminComplaints();
    showToast('Showing today\'s complaints only', 'info');
}

function exportComplaintsData() {
    if (allAdminComplaints.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    // Create CSV content
    const headers = ['Complaint ID', 'Student ID', 'Student Name', 'Title', 'Description', 'Category', 'Department', 'Status', 'Priority', 'Urgency', 'Created Date', 'Updated Date'];
    const csvContent = [
        headers.join(','),
        ...allAdminComplaints.map(complaint => [
            complaint.complaint_id,
            complaint.student_id,
            `"${complaint.student_name}"`,
            `"${complaint.title}"`,
            `"${complaint.description.replace(/"/g, '""')}"`,
            complaint.category_name,
            complaint.department_name,
            complaint.status,
            complaint.priority,
            complaint.urgency_level,
            complaint.created_at,
            complaint.updated_at || ''
        ].join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Complaints data exported successfully', 'success');
}

function searchAdminComplaints() {
    filterAdminComplaints();
}

// Enhanced admin filtering function
function filterAdminComplaints() {
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const priorityFilter = document.getElementById('priority-filter')?.value || '';
    const departmentFilter = document.getElementById('department-filter')?.value || '';
    const urgencyFilter = document.getElementById('urgency-filter')?.value || '';
    const dateFilter = document.getElementById('date-filter')?.value || '';
    const searchQuery = document.getElementById('search-complaints')?.value.toLowerCase() || '';
    
    let filteredComplaints = allAdminComplaints;
    
    // Apply filters
    if (statusFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.priority === priorityFilter);
    }
    
    if (departmentFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.department_name === departmentFilter);
    }
    
    if (urgencyFilter) {
        filteredComplaints = filteredComplaints.filter(c => c.urgency_level >= parseInt(urgencyFilter));
    }
    
    if (dateFilter) {
        const now = new Date();
        filteredComplaints = filteredComplaints.filter(c => {
            const complaintDate = new Date(c.created_at);
            switch(dateFilter) {
                case 'today':
                    return complaintDate.toDateString() === now.toDateString();
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return complaintDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return complaintDate >= monthAgo;
                default:
                    return true;
            }
        });
    }
    
    if (searchQuery) {
        filteredComplaints = filteredComplaints.filter(c => 
            c.student_name.toLowerCase().includes(searchQuery) ||
            c.title.toLowerCase().includes(searchQuery) ||
            c.description.toLowerCase().includes(searchQuery) ||
            c.student_id.toLowerCase().includes(searchQuery)
        );
    }
    
    displayAdminComplaints(filteredComplaints);
    
    // Update filter info
    const totalFiltered = filteredComplaints.length;
    const totalAll = allAdminComplaints.length;
    if (totalFiltered !== totalAll) {
        showToast(`Showing ${totalFiltered} of ${totalAll} complaints`, 'info');
    }
}

// Auto-refresh for admin dashboard
function startAdminAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Refresh admin data every 15 seconds
    autoRefreshInterval = setInterval(() => {
        if (currentUser && currentUser.role === 'admin') {
            refreshAdminComplaints();
            updateAdminLastUpdatedTime();
        }
    }, 15000); // 15 seconds for admin
}

function updateAdminLastUpdatedTime() {
    const lastUpdatedElement = document.getElementById('admin-last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = `Updated: ${now.toLocaleTimeString()}`;
        lastUpdatedElement.style.color = '#4ade80';
        
        // Fade back to normal color after 2 seconds
        setTimeout(() => {
            lastUpdatedElement.style.color = '#666';
        }, 2000);
    }
}

function viewStudentProfile(studentId) {
    // Show student profile modal with their information and complaint history
    fetch(`${API_BASE}/student-complaints/${studentId}`)
        .then(response => response.json())
        .then(studentComplaints => {
            const student = studentComplaints[0]; // Get student info from first complaint
            if (!student) {
                showToast('Student information not found', 'error');
                return;
            }
            
            // Create modal content
            const modalContent = `
                <div style="max-width: 600px; margin: 2rem auto; background: rgba(0,0,0,0.9); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="color: #8b5cf6; margin: 0;">
                            <i class="fas fa-user"></i> Student Profile
                        </h2>
                        <button onclick="closeStudentProfile()" style="background: none; border: none; color: #666; font-size: 1.5rem; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                        <h3 style="color: #8b5cf6; margin-bottom: 1rem;">${student.student_name}</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                            <div><strong>Student ID:</strong> ${student.student_id}</div>
                            <div><strong>Total Complaints:</strong> ${studentComplaints.length}</div>
                            <div><strong>Pending:</strong> ${studentComplaints.filter(c => c.status === 'Pending').length}</div>
                            <div><strong>Resolved:</strong> ${studentComplaints.filter(c => c.status === 'Resolved').length}</div>
                        </div>
                    </div>
                    
                    <h4 style="margin-bottom: 1rem; color: #b3b3b3;">Complaint History:</h4>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${studentComplaints.map(complaint => `
                            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                    <strong style="color: #fff;">${complaint.title}</strong>
                                    <span style="
                                        padding: 0.2rem 0.5rem;
                                        border-radius: 10px;
                                        font-size: 0.7rem;
                                        background: ${getStatusColor(complaint.status).bg};
                                        color: ${getStatusColor(complaint.status).color};
                                    ">${complaint.status}</span>
                                </div>
                                <p style="color: #b3b3b3; font-size: 0.9rem; margin-bottom: 0.5rem;">
                                    ${complaint.description.length > 100 ? complaint.description.substring(0, 100) + '...' : complaint.description}
                                </p>
                                <div style="font-size: 0.8rem; color: #666;">
                                    ${complaint.category} • ${new Date(complaint.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Show modal
            const modal = document.createElement('div');
            modal.id = 'student-profile-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            `;
            modal.innerHTML = modalContent;
            document.body.appendChild(modal);
            
            // Add close function to window
            window.closeStudentProfile = () => {
                document.body.removeChild(modal);
                delete window.closeStudentProfile;
            };
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    window.closeStudentProfile();
                }
            });
        })
        .catch(error => {
            console.error('Error loading student profile:', error);
            showToast('Failed to load student profile', 'error');
        });
}

// Complete the loadAllComplaints function
function loadAllComplaints() {
    const allComplaintsList = document.getElementById('all-complaints-list');
    
    if (!currentUser || !currentUser.id) {
        allComplaintsList.innerHTML = '<p style="text-align: center; color: #b3b3b3; padding: 3rem;">Please log in to view complaints.</p>';
        return;
    }
    
    // Show loading state
    allComplaintsList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #666;">
            <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
            <p>Loading your complaints...</p>
        </div>
    `;
    
    // First try to load from CSV file using student_id
    const loadFromCSV = currentUser.student_id ? 
        fetch(`${API_BASE}/student-complaints/${currentUser.student_id}`) : 
        Promise.resolve({ ok: false });
    
    loadFromCSV
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            // Fallback to database API
            return fetch(`${API_BASE}/complaints?user_id=${currentUser.id}`)
                .then(res => res.json());
        })
        .then(complaints => {
            if (!Array.isArray(complaints)) {
                throw new Error('Invalid response format');
            }
            
            // Convert CSV data format if needed
            if (complaints.length > 0 && complaints[0].complaint_id && !complaints[0].id) {
                complaints = complaints.map(complaint => ({
                    id: complaint.complaint_id,
                    complaint_id: complaint.complaint_id,
                    title: complaint.title,
                    description: complaint.description,
                    status: complaint.status,
                    priority: complaint.priority,
                    urgency_level: complaint.urgency_level,
                    category_name: complaint.category,
                    department_name: complaint.department,
                    created_at: complaint.created_at,
                    updated_at: complaint.updated_at,
                    resolved_at: complaint.resolved_at,
                    student_name: complaint.student_name,
                    student_id: complaint.student_id
                }));
            }
            
            // Store complaints globally for filtering
            allUserComplaints = complaints;
            
            // Display all complaints initially
            displayFilteredComplaints(complaints, 'all');
        })
        .catch(error => {
            console.error('Error loading complaints:', error);
            allComplaintsList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #ef4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Failed to load complaints. Please try again.</p>
                    <button class="btn btn-secondary" onclick="loadAllComplaints()" style="margin-top: 1rem;">
                        <i class="fas fa-refresh"></i> Retry
                    </button>
                </div>
            `;
        });
}