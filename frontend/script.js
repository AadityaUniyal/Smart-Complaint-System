// Smart Complaint System - Complete Frontend JavaScript
// All functionality implemented

console.log('🎯 Script.js is loading...');

// Global Variables
const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let currentTheme = 'dark';
let departments = [];
let courses = [];
let categories = [];
let complaints = [];
let allComplaints = [];
let students = [];

console.log('🎯 Global variables initialized');

// DOM Elements
let loadingScreen = null;
let loginModal = null;
let modalBody = null;
let toastContainer = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Smart Complaint System - Initializing...');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Load initial data
    loadInitialData();
    
    // Check for saved user session
    checkUserSession();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup form validation
    setupFormValidation();
    
    // Test API immediately for debugging
    setTimeout(() => {
        console.log('🧪 Testing API connection...');
        testAPIConnection();
    }, 2000);
    
    console.log('✅ Application initialized successfully');
});

// Test API connection function
async function testAPIConnection() {
    try {
        document.getElementById('api-status').textContent = 'Testing...';
        
        console.log('🔗 Testing API health...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ API Health:', healthData);
        
        console.log('🔗 Testing complaints endpoint...');
        const complaintsResponse = await fetch(`${API_BASE}/all-student-complaints`);
        const complaintsData = await complaintsResponse.json();
        console.log('✅ API Complaints:', complaintsData.length, 'complaints loaded');
        
        // Update debug panel
        document.getElementById('api-status').textContent = 'Connected';
        document.getElementById('complaints-count').textContent = complaintsData.length;
        
        // Force update stats for testing
        allComplaints = complaintsData;
        updateAdminStats();
        
    } catch (error) {
        console.error('❌ API Test failed:', error);
        document.getElementById('api-status').textContent = 'Failed: ' + error.message;
    }
}

// Force login function for testing
function forceLogin() {
    const testUser = {
        id: 1,
        name: 'Test Admin',
        email: 'admin@college.edu',
        role: 'admin'
    };
    
    currentUser = testUser;
    localStorage.setItem('smartcomplaint_user', JSON.stringify(currentUser));
    console.log('🔐 Force login successful');
    showAdminDashboard();
}

// Initialize DOM Elements
function initializeDOMElements() {
    loadingScreen = document.getElementById('loading-screen');
    loginModal = document.getElementById('login-modal');
    modalBody = document.getElementById('modal-body');
    toastContainer = document.getElementById('toast-container');
    
    console.log('📋 DOM elements initialized');
}

// Hide Loading Screen
function hideLoadingScreen() {
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }, 1000);
    }
}

// Load Initial Data
async function loadInitialData() {
    try {
        console.log('📊 Loading initial data...');
        
        // Load departments
        const deptResponse = await fetch(`${API_BASE}/departments`);
        if (deptResponse.ok) {
            departments = await deptResponse.json();
            console.log(`✅ Loaded ${departments.length} departments`);
        }
        
        // Load courses
        const courseResponse = await fetch(`${API_BASE}/courses`);
        if (courseResponse.ok) {
            courses = await courseResponse.json();
            console.log(`✅ Loaded ${courses.length} courses`);
        }
        
        // Load categories
        const catResponse = await fetch(`${API_BASE}/complaint-categories`);
        if (catResponse.ok) {
            categories = await catResponse.json();
            console.log(`✅ Loaded ${categories.length} categories`);
        }
        
        // Update homepage stats
        updateHomepageStats();
        
    } catch (error) {
        console.error('❌ Error loading initial data:', error);
        showToast('Failed to load some data. Please refresh the page.', 'warning');
    }
}

// Update Homepage Statistics
function updateHomepageStats() {
    // Update with real data if available
    if (departments.length > 0) {
        const deptElement = document.getElementById('total-departments');
        if (deptElement) {
            deptElement.textContent = departments.length;
        }
    }
}

// Check User Session
function checkUserSession() {
    const savedUser = localStorage.getItem('smartcomplaint_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('👤 User session restored:', currentUser.name);
            
            if (currentUser.role === 'admin') {
                showAdminDashboard();
            } else {
                showStudentDashboard();
            }
        } catch (error) {
            console.error('❌ Error restoring user session:', error);
            localStorage.removeItem('smartcomplaint_user');
        }
    }
}

// Refresh admin data function
async function refreshAdminData() {
    const refreshBtn = document.querySelector('[onclick="refreshAdminData()"]');
    if (refreshBtn) {
        refreshBtn.classList.add('btn-loading');
        refreshBtn.disabled = true;
    }
    
    try {
        showToast('Refreshing data...', 'info', 2000);
        await loadAdminData();
        showToast('Data refreshed successfully!', 'success');
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
        showToast('Failed to refresh data', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.classList.remove('btn-loading');
            refreshBtn.disabled = false;
        }
    }
}

// Refresh student data function
async function refreshStudentData() {
    const refreshBtn = document.querySelector('[onclick="refreshStudentData()"]');
    if (refreshBtn) {
        refreshBtn.classList.add('btn-loading');
        refreshBtn.disabled = true;
    }
    
    try {
        showToast('Refreshing data...', 'info', 2000);
        await loadStudentData();
        showToast('Data refreshed successfully!', 'success');
    } catch (error) {
        console.error('❌ Error refreshing data:', error);
        showToast('Failed to refresh data', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.classList.remove('btn-loading');
            refreshBtn.disabled = false;
        }
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Smooth scrolling for anchor links
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
    
    // Close modal on outside click
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideLoginModal();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Close modal with Escape key
        if (e.key === 'Escape') {
            if (loginModal && loginModal.classList.contains('active')) {
                hideLoginModal();
            }
        }
        
        // Tab navigation within modal
        if (e.key === 'Tab' && loginModal && loginModal.classList.contains('active')) {
            const focusableElements = loginModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    });
    
    console.log('🎯 Event listeners setup complete');
}

// Navigation Functions
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (navMenu && navToggle) {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Modal Functions
function showLoginModal() {
    if (loginModal) {
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset modal scroll position
        const modalBody = loginModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
        
        // Ensure modal is scrollable
        loginModal.style.overflowY = 'auto';
        
        showRoleSelection();
        
        // Focus management for accessibility
        setTimeout(() => {
            const firstInput = loginModal.querySelector('input, button');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }
}

function hideLoginModal() {
    if (loginModal) {
        loginModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function showRoleSelection() {
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="auth-container">
            <div class="auth-header">
                <div class="auth-logo">
                    <span class="logo-icon">🎓</span>
                    <h2>SmartComplaint</h2>
                </div>
                <p class="auth-subtitle">Choose your role to continue</p>
            </div>
            
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="student" onclick="switchAuthTab('student')">
                    <span class="tab-icon">👨‍🎓</span>
                    <span class="tab-text">Student</span>
                </button>
                <button class="auth-tab" data-tab="admin" onclick="switchAuthTab('admin')">
                    <span class="tab-icon">🛡️</span>
                    <span class="tab-text">Admin</span>
                </button>
            </div>
            
            <div class="auth-content">
                <!-- Student Tab Content -->
                <div class="auth-panel active" id="student-panel">
                    <div class="panel-header">
                        <h3>Student Registration</h3>
                        <p>Create your account to submit and track complaints</p>
                    </div>
                    
                    <form id="student-registration-form" onsubmit="handleStudentRegistration(event)">
                        <div class="form-section">
                            <h4>Personal Information</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="student-name">Full Name *</label>
                                    <input type="text" id="student-name" name="name" required 
                                           placeholder="Enter your full name">
                                </div>
                                <div class="form-group">
                                    <label for="student-email">Email Address *</label>
                                    <input type="email" id="student-email" name="email" required 
                                           placeholder="your.email@college.edu">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="student-phone">Phone Number</label>
                                    <input type="tel" id="student-phone" name="phone" 
                                           placeholder="Your phone number">
                                </div>
                                <div class="form-group">
                                    <label for="student-roll">Roll Number *</label>
                                    <input type="text" id="student-roll" name="roll_number" required 
                                           placeholder="Your roll number">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h4>Academic Information</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="student-course">Course *</label>
                                    <select id="student-course" name="course_id" required>
                                        <option value="">Select Course</option>
                                        ${courses.map(course => `<option value="${course.id}">${course.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="admission-year">Admission Year *</label>
                                    <input type="number" id="admission-year" name="admission_year" required 
                                           min="2020" max="${new Date().getFullYear()}" 
                                           placeholder="${new Date().getFullYear()}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="student-year">Current Year *</label>
                                    <select id="student-year" name="year" required>
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="student-semester">Current Semester *</label>
                                    <select id="student-semester" name="semester" required>
                                        <option value="">Select Semester</option>
                                        <option value="1">1st Semester</option>
                                        <option value="2">2nd Semester</option>
                                        <option value="3">3rd Semester</option>
                                        <option value="4">4th Semester</option>
                                        <option value="5">5th Semester</option>
                                        <option value="6">6th Semester</option>
                                        <option value="7">7th Semester</option>
                                        <option value="8">8th Semester</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-large">
                                <span class="btn-icon">🚀</span>
                                Create Account
                            </button>
                        </div>
                        
                        <div class="form-footer">
                            <p>Already have an account? Switch to Admin tab if you're an administrator.</p>
                        </div>
                    </form>
                </div>
                
                <!-- Admin Tab Content -->
                <div class="auth-panel" id="admin-panel">
                    <div class="panel-header">
                        <h3>Administrator Login</h3>
                        <p>Access the admin dashboard to manage complaints</p>
                    </div>
                    
                    <form id="admin-login-form" onsubmit="handleAdminLogin(event)">
                        <div class="form-section">
                            <div class="form-group">
                                <label for="admin-email">Email Address</label>
                                <input type="email" id="admin-email" name="email" required 
                                       value="admin@college.edu" placeholder="admin@college.edu">
                            </div>
                            
                            <div class="form-group">
                                <label for="admin-password">Password</label>
                                <div class="password-input">
                                    <input type="password" id="admin-password" name="password" required 
                                           value="admin123" placeholder="Enter your password">
                                    <button type="button" class="password-toggle" onclick="togglePassword('admin-password')">
                                        👁️
                                    </button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="remember-me">
                                    <span class="checkmark"></span>
                                    Remember me
                                </label>
                            </div>
                        </div>
                        
                        <div class="demo-credentials">
                            <div class="demo-header">
                                <span class="demo-icon">🔑</span>
                                <strong>Demo Credentials</strong>
                            </div>
                            <div class="demo-info">
                                <div class="credential-item">
                                    <span class="credential-label">Email:</span>
                                    <span class="credential-value">admin@college.edu</span>
                                </div>
                                <div class="credential-item">
                                    <span class="credential-label">Password:</span>
                                    <span class="credential-value">admin123</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-large">
                                <span class="btn-icon">🔐</span>
                                Sign In
                            </button>
                        </div>
                        
                        <div class="form-footer">
                            <p>Need to register as a student? Switch to the Student tab.</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Authentication Functions
async function handleStudentRegistration(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Add default department_id if not set
    if (!data.department_id && courses.length > 0) {
        const selectedCourse = courses.find(c => c.id == data.course_id);
        if (selectedCourse) {
            data.department_id = selectedCourse.department_id;
        } else {
            data.department_id = 1; // Default to first department
        }
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                role: 'student'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            localStorage.setItem('smartcomplaint_user', JSON.stringify(currentUser));
            
            showToast('Registration successful! Welcome to SmartComplaint.', 'success');
            hideLoginModal();
            showStudentDashboard();
        } else {
            showToast(result.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
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
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            localStorage.setItem('smartcomplaint_user', JSON.stringify(currentUser));
            
            showToast('Login successful! Welcome back.', 'success');
            hideLoginModal();
            showAdminDashboard();
        } else {
            showToast(result.error || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Dashboard Functions
function showStudentDashboard() {
    console.log('🎯 Showing student dashboard...');
    
    // Hide landing page
    const landingPage = document.getElementById('landing-page');
    const adminDashboard = document.getElementById('admin-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    
    if (landingPage) landingPage.classList.add('hidden');
    if (adminDashboard) adminDashboard.classList.add('hidden');
    if (studentDashboard) studentDashboard.classList.remove('hidden');
    
    // Update user info
    updateStudentInfo();
    
    // Force load student data
    setTimeout(() => {
        console.log('🔄 Force loading student data...');
        loadStudentData();
    }, 500);
    
    // Show overview by default
    showDashboardView('overview');
}

function showAdminDashboard() {
    console.log('🎯 Showing admin dashboard...');
    
    // Hide landing page
    const landingPage = document.getElementById('landing-page');
    const studentDashboard = document.getElementById('student-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    if (landingPage) landingPage.classList.add('hidden');
    if (studentDashboard) studentDashboard.classList.add('hidden');
    if (adminDashboard) adminDashboard.classList.remove('hidden');
    
    // Update admin info
    updateAdminInfo();
    
    // Force load admin data
    setTimeout(() => {
        console.log('🔄 Force loading admin data...');
        loadAdminData();
    }, 500);
    
    // Show dashboard by default
    showAdminView('dashboard');
}

function updateStudentInfo() {
    if (!currentUser) return;
    
    // Update user initials
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const userInitials = document.getElementById('user-initials');
    const profileInitials = document.getElementById('profile-initials');
    
    if (userInitials) userInitials.textContent = initials;
    if (profileInitials) profileInitials.textContent = initials;
    
    // Update user info in dropdown
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    
    if (userName) userName.textContent = currentUser.name;
    if (userEmail) userEmail.textContent = currentUser.email;
    
    // Update profile form
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileFullName = document.getElementById('profile-full-name');
    const profilePhone = document.getElementById('profile-phone');
    const profileStudentId = document.getElementById('profile-student-id');
    const profileYear = document.getElementById('profile-year');
    const profileSemester = document.getElementById('profile-semester');
    
    if (profileName) profileName.textContent = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;
    if (profileFullName) profileFullName.value = currentUser.name || '';
    if (profilePhone) profilePhone.value = currentUser.phone || '';
    if (profileStudentId) profileStudentId.value = currentUser.student_id || '';
    if (profileYear) profileYear.value = currentUser.year || '';
    if (profileSemester) profileSemester.value = currentUser.semester || '';
}

function updateAdminInfo() {
    if (!currentUser) return;
    
    // Update admin info
    const adminName = document.getElementById('admin-name');
    const adminEmail = document.getElementById('admin-email');
    
    if (adminName) adminName.textContent = currentUser.name;
    if (adminEmail) adminEmail.textContent = currentUser.email;
}

async function loadStudentData() {
    if (!currentUser || !currentUser.student_id) {
        console.log('⚠️ No student ID found, cannot load student data');
        return;
    }
    
    try {
        console.log('📊 Loading student data for ID:', currentUser.student_id);
        
        // Show loading indicators
        const totalEl = document.getElementById('student-total-complaints');
        const pendingEl = document.getElementById('student-pending-complaints');
        const progressEl = document.getElementById('student-progress-complaints');
        const resolvedEl = document.getElementById('student-resolved-complaints');
        
        if (totalEl) totalEl.textContent = '...';
        if (pendingEl) pendingEl.textContent = '...';
        if (progressEl) progressEl.textContent = '...';
        if (resolvedEl) resolvedEl.textContent = '...';
        
        // Load student complaints
        const response = await fetch(`${API_BASE}/student-complaints/${currentUser.student_id}`);
        if (response.ok) {
            complaints = await response.json();
            console.log(`✅ Loaded ${complaints.length} student complaints`);
            updateStudentStats();
            updateRecentComplaints();
            updateComplaintsList();
        } else {
            console.error('❌ Failed to load student complaints:', response.status);
            showToast('Failed to load your complaints', 'error');
            
            // Reset to 0 if failed
            if (totalEl) totalEl.textContent = '0';
            if (pendingEl) pendingEl.textContent = '0';
            if (progressEl) progressEl.textContent = '0';
            if (resolvedEl) resolvedEl.textContent = '0';
        }
    } catch (error) {
        console.error('❌ Error loading student data:', error);
        showToast('Failed to load your complaints. Please refresh the page.', 'error');
    }
}

async function loadAdminData() {
    try {
        console.log('📊 Loading admin data...');
        
        // Show loading indicators
        const totalEl = document.getElementById('admin-total-complaints');
        const pendingEl = document.getElementById('admin-pending-complaints');
        const progressEl = document.getElementById('admin-progress-complaints');
        const resolvedEl = document.getElementById('admin-resolved-complaints');
        
        if (totalEl) totalEl.textContent = '...';
        if (pendingEl) pendingEl.textContent = '...';
        if (progressEl) progressEl.textContent = '...';
        if (resolvedEl) resolvedEl.textContent = '...';
        
        // Load all complaints
        const complaintsResponse = await fetch(`${API_BASE}/all-student-complaints`);
        if (complaintsResponse.ok) {
            const responseData = await complaintsResponse.json();
            console.log('📊 Raw API response:', responseData);
            console.log('📊 Response type:', typeof responseData);
            console.log('📊 Is array:', Array.isArray(responseData));
            
            // Ensure we have an array
            if (Array.isArray(responseData)) {
                allComplaints = responseData;
            } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
                allComplaints = responseData.data;
            } else {
                console.error('❌ Unexpected response format:', responseData);
                allComplaints = [];
            }
            
            console.log(`✅ Loaded ${allComplaints.length} complaints`);
            updateAdminStats();
            updateAdminRecentComplaints();
            updateAdminComplaintsList();
        } else {
            console.error('❌ Failed to load complaints:', complaintsResponse.status);
            showToast('Failed to load complaints data', 'error');
        }
        
        // Load students
        const studentsResponse = await fetch(`${API_BASE}/students`);
        if (studentsResponse.ok) {
            students = await studentsResponse.json();
            console.log(`✅ Loaded ${students.length} students`);
            updateStudentsList();
        } else {
            console.error('❌ Failed to load students:', studentsResponse.status);
        }
        
        // Update department stats
        updateDepartmentStats();
        
        // Create analytics charts if available
        if (typeof createAnalyticsCharts === 'function') {
            createAnalyticsCharts();
        }
        
    } catch (error) {
        console.error('❌ Error loading admin data:', error);
        showToast('Failed to load admin data. Please refresh the page.', 'error');
        
        // Reset loading indicators
        const totalEl = document.getElementById('admin-total-complaints');
        const pendingEl = document.getElementById('admin-pending-complaints');
        const progressEl = document.getElementById('admin-progress-complaints');
        const resolvedEl = document.getElementById('admin-resolved-complaints');
        
        if (totalEl) totalEl.textContent = '0';
        if (pendingEl) pendingEl.textContent = '0';
        if (progressEl) progressEl.textContent = '0';
        if (resolvedEl) resolvedEl.textContent = '0';
    }
}

function updateStudentStats() {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    
    const totalEl = document.getElementById('student-total-complaints');
    const pendingEl = document.getElementById('student-pending-complaints');
    const progressEl = document.getElementById('student-progress-complaints');
    const resolvedEl = document.getElementById('student-resolved-complaints');
    
    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (progressEl) progressEl.textContent = inProgress;
    if (resolvedEl) resolvedEl.textContent = resolved;
}

function updateAdminStats() {
    console.log('📊 Updating admin stats...');
    console.log('All complaints data:', allComplaints);
    console.log('Data type:', typeof allComplaints);
    console.log('Is array:', Array.isArray(allComplaints));
    
    // Handle case where data might not be an array
    let complaintsArray = allComplaints;
    if (!Array.isArray(allComplaints)) {
        console.warn('⚠️ allComplaints is not an array, attempting to fix...');
        if (allComplaints && allComplaints.data && Array.isArray(allComplaints.data)) {
            complaintsArray = allComplaints.data;
        } else if (allComplaints && typeof allComplaints === 'object') {
            complaintsArray = [allComplaints];
        } else {
            complaintsArray = [];
        }
    }
    
    const total = complaintsArray.length;
    const pending = complaintsArray.filter(c => c.status === 'Pending').length;
    const inProgress = complaintsArray.filter(c => c.status === 'In Progress').length;
    const resolved = complaintsArray.filter(c => c.status === 'Resolved').length;
    
    console.log('📊 Admin Stats:', { total, pending, inProgress, resolved });
    
    const totalEl = document.getElementById('admin-total-complaints');
    const pendingEl = document.getElementById('admin-pending-complaints');
    const progressEl = document.getElementById('admin-progress-complaints');
    const resolvedEl = document.getElementById('admin-resolved-complaints');
    
    if (totalEl) {
        totalEl.textContent = total;
        console.log('✅ Updated total complaints:', total);
    } else {
        console.error('❌ Element not found: admin-total-complaints');
    }
    
    if (pendingEl) {
        pendingEl.textContent = pending;
        console.log('✅ Updated pending complaints:', pending);
    } else {
        console.error('❌ Element not found: admin-pending-complaints');
    }
    
    if (progressEl) {
        progressEl.textContent = inProgress;
        console.log('✅ Updated in-progress complaints:', inProgress);
    } else {
        console.error('❌ Element not found: admin-progress-complaints');
    }
    
    if (resolvedEl) {
        resolvedEl.textContent = resolved;
        console.log('✅ Updated resolved complaints:', resolved);
    } else {
        console.error('❌ Element not found: admin-resolved-complaints');
    }
}

function updateRecentComplaints() {
    const recentContainer = document.getElementById('recent-complaints');
    if (!recentContainer) return;
    
    if (complaints.length === 0) {
        recentContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No complaints yet</p>
                <button class="btn btn-primary" onclick="showDashboardView('new-complaint')">
                    Submit Your First Complaint
                </button>
            </div>
        `;
        return;
    }
    
    const recent = complaints.slice(0, 3);
    recentContainer.innerHTML = recent.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </div>
            <div class="complaint-meta">
                <span>Department: ${complaint.department}</span>
                <span>Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <p class="complaint-description">${complaint.description.substring(0, 100)}...</p>
        </div>
    `).join('');
}

function updateAdminRecentComplaints() {
    const recentContainer = document.getElementById('admin-recent-complaints');
    if (!recentContainer) return;
    
    if (allComplaints.length === 0) {
        recentContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><p>No complaints found</p></div>';
        return;
    }
    
    const recent = allComplaints.slice(0, 5);
    recentContainer.innerHTML = recent.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </div>
            <div class="complaint-meta">
                <span>Student: ${complaint.student_name}</span>
                <span>Department: ${complaint.department}</span>
                <span>Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <p class="complaint-description">${complaint.description.substring(0, 100)}...</p>
        </div>
    `).join('');
}

function updateComplaintsList() {
    const complaintsContainer = document.getElementById('complaints-list');
    if (!complaintsContainer) return;
    
    if (complaints.length === 0) {
        complaintsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>No complaints found</p>
                <button class="btn btn-primary" onclick="showDashboardView('new-complaint')">
                    Submit Your First Complaint
                </button>
            </div>
        `;
        return;
    }
    
    complaintsContainer.innerHTML = complaints.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </div>
            <div class="complaint-meta">
                <span>Department: ${complaint.department}</span>
                <span>Category: ${complaint.category}</span>
                <span>Priority: ${complaint.priority}</span>
                <span>Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <p class="complaint-description">${complaint.description}</p>
        </div>
    `).join('');
}
function updateAdminComplaintsList() {
    const complaintsContainer = document.getElementById('admin-complaints-list');
    if (!complaintsContainer) return;
    
    if (allComplaints.length === 0) {
        complaintsContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><p>No complaints found</p></div>';
        return;
    }
    
    complaintsContainer.innerHTML = allComplaints.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </div>
            <div class="complaint-meta">
                <span>Student: ${complaint.student_name}</span>
                <span>Department: ${complaint.department}</span>
                <span>Priority: ${complaint.priority}</span>
                <span>Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <p class="complaint-description">${complaint.description}</p>
        </div>
    `).join('');
}

function updateStudentsList() {
    const studentsContainer = document.getElementById('students-list');
    if (!studentsContainer) return;
    
    if (students.length === 0) {
        studentsContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No students found</p></div>';
        return;
    }
    
    studentsContainer.innerHTML = students.map(student => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h4 class="complaint-title">${student.name}</h4>
                <span class="complaint-status resolved">Active</span>
            </div>
            <div class="complaint-meta">
                <span>Email: ${student.email}</span>
                <span>Student ID: ${student.student_id || 'N/A'}</span>
                <span>Year: ${student.year || 'N/A'}</span>
                <span>Semester: ${student.semester || 'N/A'}</span>
            </div>
        </div>
    `).join('');
}

function updateDepartmentStats() {
    const statsContainer = document.getElementById('department-stats');
    if (!statsContainer) return;
    
    if (departments.length === 0) {
        statsContainer.innerHTML = '<p>No department data available</p>';
        return;
    }
    
    const departmentCounts = {};
    allComplaints.forEach(complaint => {
        const dept = complaint.department;
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
    
    statsContainer.innerHTML = Object.entries(departmentCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([dept, count]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                <span>${dept}</span>
                <span style="font-weight: 600; color: var(--primary-color);">${count}</span>
            </div>
        `).join('');
}

// View Management
function showDashboardView(viewName) {
    console.log(`🔄 Switching to view: ${viewName}`);
    
    // Hide all views
    document.querySelectorAll('.dashboard-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        console.log(`✅ View ${viewName} activated`);
    } else {
        console.error(`❌ View ${viewName}-view not found`);
    }
    
    // Update menu items - handle both old and new menu structures
    document.querySelectorAll('#student-dashboard .menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the correct menu item
    const activeMenuItem = document.querySelector(`#student-dashboard [onclick="showDashboardView('${viewName}')"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
        console.log(`✅ Menu item for ${viewName} activated`);
    }
    
    // Load view-specific data
    if (viewName === 'new-complaint') {
        loadComplaintForm();
    } else if (viewName === 'my-complaints') {
        loadStudentComplaints();
    } else if (viewName === 'overview') {
        loadStudentOverview();
    }
    
    // Update page title
    const titles = {
        'overview': 'Dashboard - Overview',
        'new-complaint': 'Dashboard - New Complaint',
        'my-complaints': 'Dashboard - My Complaints',
        'profile': 'Dashboard - Profile'
    };
    document.title = titles[viewName] || 'Smart Complaint System';
}

function showAdminView(viewName) {
    console.log(`🔄 Switching to admin view: ${viewName}`);
    
    // Hide all views
    document.querySelectorAll('#admin-dashboard .dashboard-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`admin-${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        console.log(`✅ Admin view ${viewName} activated`);
    } else {
        console.error(`❌ Admin view ${viewName}-view not found`);
    }
    
    // Update menu items
    document.querySelectorAll('#admin-dashboard .menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the correct menu item
    const activeMenuItem = document.querySelector(`#admin-dashboard [onclick="showAdminView('${viewName}')"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
        console.log(`✅ Admin menu item for ${viewName} activated`);
    }
    
    // Load view-specific data
    if (viewName === 'dashboard') {
        loadAdminDashboard();
    } else if (viewName === 'complaints') {
        loadAllComplaints();
    } else if (viewName === 'students') {
        loadStudentsData();
    } else if (viewName === 'departments') {
        loadDepartmentsData();
    } else if (viewName === 'analytics') {
        loadAnalyticsData();
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Admin - Dashboard',
        'complaints': 'Admin - All Complaints',
        'students': 'Admin - Students',
        'departments': 'Admin - Departments',
        'analytics': 'Admin - Analytics',
        'settings': 'Admin - Settings'
    };
    document.title = titles[viewName] || 'Smart Complaint System - Admin';
}

// Complaint Form
function loadComplaintForm() {
    console.log('📋 Loading complaint form...');
    console.log('Available departments:', departments.length);
    console.log('Available categories:', categories.length);
    
    // Populate departments
    const deptSelect = document.getElementById('complaint-department');
    if (deptSelect && departments.length > 0) {
        deptSelect.innerHTML = '<option value="">Select Department</option>' +
            departments.map(dept => `<option value="${dept.id}">${dept.name}</option>`).join('');
        
        console.log('✅ Populated departments dropdown');
        
        deptSelect.addEventListener('change', function() {
            console.log('🔄 Department changed to:', this.value);
            loadCategoriesForDepartment(this.value);
        });
    } else {
        console.error('❌ Department select not found or no departments available');
        // If no departments, try to load them
        if (departments.length === 0) {
            loadDepartments();
        }
    }
    
    // Add form validation
    setupComplaintFormValidation();
}

function setupComplaintFormValidation() {
    const form = document.getElementById('complaint-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    field.parentElement.classList.remove('error');
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific validations
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    if (field.name === 'title' && value && value.length < 5) {
        showFieldError(field, 'Title must be at least 5 characters long');
        return false;
    }
    
    if (field.name === 'description' && value && value.length < 20) {
        showFieldError(field, 'Description must be at least 20 characters long');
        return false;
    }
    
    return true;
}

function showFieldError(field, message) {
    field.parentElement.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
}

function clearFieldError(event) {
    const field = event.target;
    field.parentElement.classList.remove('error');
    
    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function loadCategoriesForDepartment(departmentId) {
    console.log('📋 Loading categories for department:', departmentId);
    
    const catSelect = document.getElementById('complaint-category');
    if (!catSelect) {
        console.error('❌ Category select not found');
        return;
    }
    
    if (!departmentId) {
        catSelect.innerHTML = '<option value="">Select Category</option>';
        return;
    }
    
    const deptCategories = categories.filter(cat => cat.department_id == departmentId);
    console.log('Found categories for department:', deptCategories.length);
    
    catSelect.innerHTML = '<option value="">Select Category</option>' +
        deptCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    
    console.log('✅ Populated categories dropdown');
}

async function handleComplaintSubmission(event) {
    event.preventDefault();
    
    console.log('🚀 Submitting complaint...');
    console.log('Current user:', currentUser);
    
    // Validate form before submission
    const form = event.target;
    const isValid = validateComplaintForm(form);
    
    if (!isValid) {
        showToast('Please fix the errors in the form before submitting', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Add user info - backend expects user_id, not student_id
    if (!currentUser || !currentUser.id) {
        showToast('Please login first to submit a complaint', 'error');
        return;
    }
    
    data.user_id = currentUser.id; // Backend expects user_id
    data.student_name = currentUser.name;
    data.student_email = currentUser.email;
    
    console.log('Complaint data:', data);
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Submitting...';
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading');
    
    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        
        if (response.ok) {
            showToast('🎉 Complaint submitted successfully! You will receive updates via email.', 'success');
            event.target.reset();
            
            // Clear any error states
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error');
                const errorDiv = group.querySelector('.field-error');
                if (errorDiv) errorDiv.remove();
            });
            
            // Refresh data and switch to complaints view
            loadStudentData();
            setTimeout(() => {
                showDashboardView('my-complaints');
            }, 1500);
            
        } else {
            console.error('Submission failed:', result);
            showToast(result.error || 'Failed to submit complaint. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Complaint submission error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
    }
}

function validateComplaintForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function clearComplaintForm() {
    const form = document.getElementById('complaint-form');
    if (form) {
        // Reset form
        form.reset();
        
        // Clear error states
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorDiv = group.querySelector('.field-error');
            if (errorDiv) errorDiv.remove();
        });
        
        // Reset category dropdown
        const categorySelect = document.getElementById('complaint-category');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>';
        }
        
        showToast('Form cleared', 'info');
    }
}

// User Menu Functions
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown') || document.getElementById('admin-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        
        // Close menu when clicking outside
        if (dropdown.classList.contains('active')) {
            document.addEventListener('click', closeUserMenuOnOutsideClick);
        } else {
            document.removeEventListener('click', closeUserMenuOnOutsideClick);
        }
    }
}

function closeUserMenuOnOutsideClick(event) {
    const userMenu = event.target.closest('.user-menu');
    if (!userMenu) {
        const dropdown = document.getElementById('user-dropdown') || document.getElementById('admin-dropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
            document.removeEventListener('click', closeUserMenuOnOutsideClick);
        }
    }
}

function showProfile() {
    if (currentUser?.role === 'admin') {
        showAdminView('settings');
    } else {
        showDashboardView('profile');
    }
    toggleUserMenu();
}

function showSettings() {
    if (currentUser?.role === 'admin') {
        showAdminView('settings');
    } else {
        showToast('Settings feature coming soon!', 'info');
    }
    toggleUserMenu();
}

function showAdminProfile() {
    showAdminView('settings');
    toggleUserMenu();
}

function showAdminSettings() {
    showAdminView('settings');
    toggleUserMenu();
}

// Theme Functions
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('smartcomplaint_theme', currentTheme);
    
    const themeBtn = document.querySelector('.btn-icon');
    if (themeBtn) {
        themeBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Filter Functions
function filterComplaints() {
    const statusFilter = document.getElementById('status-filter')?.value || '';
    const deptFilter = document.getElementById('department-filter')?.value || '';
    const searchTerm = document.getElementById('search-complaints')?.value.toLowerCase() || '';
    
    let filtered = complaints;
    
    if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    if (deptFilter) {
        filtered = filtered.filter(c => c.department === deptFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(searchTerm) ||
            c.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update display with filtered results
    const complaintsContainer = document.getElementById('complaints-list');
    if (complaintsContainer) {
        if (filtered.length === 0) {
            complaintsContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No complaints match your filters</p></div>';
        } else {
            complaintsContainer.innerHTML = filtered.map(complaint => `
                <div class="complaint-item">
                    <div class="complaint-header">
                        <h4 class="complaint-title">${complaint.title}</h4>
                        <span class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
                    </div>
                    <div class="complaint-meta">
                        <span>Department: ${complaint.department}</span>
                        <span>Category: ${complaint.category}</span>
                        <span>Priority: ${complaint.priority}</span>
                        <span>Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="complaint-description">${complaint.description}</p>
                </div>
            `).join('');
        }
    }
}

function filterAdminComplaints() {
    const statusFilter = document.getElementById('admin-status-filter')?.value || '';
    const deptFilter = document.getElementById('admin-department-filter')?.value || '';
    const priorityFilter = document.getElementById('admin-priority-filter')?.value || '';
    const searchTerm = document.getElementById('admin-search-complaints')?.value.toLowerCase() || '';
    
    let filtered = allComplaints;
    
    if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
    }
    
    if (deptFilter) {
        filtered = filtered.filter(c => c.department === deptFilter);
    }
    
    if (priorityFilter) {
        filtered = filtered.filter(c => c.priority === priorityFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(c => 
            c.title.toLowerCase().includes(searchTerm) ||
            c.description.toLowerCase().includes(searchTerm) ||
            c.student_name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update display with filtered results
    updateAdminComplaintsDisplay(filtered);
}

function updateAdminComplaintsDisplay(complaintsToShow) {
    const complaintsContainer = document.getElementById('admin-complaints-list');
    if (!complaintsContainer) return;
    
    if (complaintsToShow.length === 0) {
        complaintsContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No complaints match your filters</p></div>';
        return;
    }
    
    complaintsContainer.innerHTML = complaintsToShow.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h4 class="complaint-title">${complaint.title}</h4>
                <span class="complaint-status ${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span>
            </div>
            <div class="complaint-meta">
                <span>Student: ${complaint.student_name}</span>
                <span>Department: ${complaint.department}</span>
                <span>Priority: ${complaint.priority}</span>
                <span>Created: ${new Date(complaint.created_at).toLocaleDateString()}</span>
            </div>
            <p class="complaint-description">${complaint.description}</p>
        </div>
    `).join('');
}

// Logout Function
function logout() {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    // Clear user data
    currentUser = null;
    localStorage.removeItem('smartcomplaint_user');
    
    // Clear any cached data
    complaints = [];
    allComplaints = [];
    departments = [];
    categories = [];
    
    // Hide dashboards and show landing page
    const landingPage = document.getElementById('landing-page');
    const studentDashboard = document.getElementById('student-dashboard');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    if (landingPage) landingPage.classList.remove('hidden');
    if (studentDashboard) studentDashboard.classList.add('hidden');
    if (adminDashboard) adminDashboard.classList.add('hidden');
    
    // Close any open dropdowns
    const dropdown = document.getElementById('user-dropdown') || document.getElementById('admin-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
    
    // Reset page title
    document.title = 'Smart Complaint System';
    
    showToast('Logged out successfully', 'success');
    
    console.log('🚪 User logged out successfully');
}

// Toast Notification System
function showToast(message, type = 'info', duration = 5000) {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Setup complaint form submission
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Setting up complaint form...');
    
    // Setup complaint form if it exists
    const complaintForm = document.getElementById('complaint-form');
    if (complaintForm) {
        console.log('✅ Found complaint form, attaching event listener');
        complaintForm.addEventListener('submit', handleComplaintSubmission);
        
        // Also check if form is properly structured
        const requiredFields = ['title', 'department_id', 'category_id', 'description'];
        requiredFields.forEach(fieldName => {
            const field = complaintForm.querySelector(`[name="${fieldName}"]`);
            if (field) {
                console.log(`✅ Found required field: ${fieldName}`);
            } else {
                console.error(`❌ Missing required field: ${fieldName}`);
            }
        });
    } else {
        console.error('❌ Complaint form not found!');
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('user-dropdown');
    const adminDropdown = document.getElementById('admin-dropdown');
    const userMenu = document.querySelector('.user-menu');
    
    if (userDropdown && !userMenu?.contains(event.target)) {
        userDropdown.classList.remove('active');
    }
    
    if (adminDropdown && !userMenu?.contains(event.target)) {
        adminDropdown.classList.remove('active');
    }
});

// Create particle effects for hero section
function createParticleEffect() {
    const container = document.querySelector('.hero');
    if (!container) return;

    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    container.appendChild(particleContainer);

    // Create particles
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createParticle(particleContainer);
        }, i * 200);
    }

    // Continue creating particles
    setInterval(() => {
        if (document.querySelector('.hero:hover') || Math.random() > 0.7) {
            createParticle(particleContainer);
        }
    }, 2000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random starting position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 8000);
}
// Enhanced form validation
function validateFormField(field, value, type) {
    const formGroup = field.closest('.form-group');
    let isValid = true;
    let errorMessage = '';

    // Remove previous validation classes
    formGroup.classList.remove('error', 'success');

    switch (type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'phone':
            const phoneRegex = /^[0-9]{10,15}$/;
            const cleanPhone = value.replace(/\D/g, '');
            if (value && !phoneRegex.test(cleanPhone)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
        case 'required':
            if (!value || value.trim() === '') {
                isValid = false;
                errorMessage = 'This field is required';
            }
            break;
        case 'year':
            const currentYear = new Date().getFullYear();
            if (value && (value < 2020 || value > currentYear)) {
                isValid = false;
                errorMessage = 'Please enter a valid year';
            }
            break;
    }

    // Apply validation styling
    if (isValid && value) {
        formGroup.classList.add('success');
    } else if (!isValid) {
        formGroup.classList.add('error');
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--error-color);
        font-size: 0.75rem;
        margin-top: var(--spacing-xs);
        animation: fadeInUp 0.3s ease-out;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

// Enhanced form submission with loading states
async function handleStudentRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate all fields
    let isFormValid = true;
    const requiredFields = ['name', 'email', 'roll_number', 'course_id', 'year', 'semester', 'admission_year'];
    
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            const isValid = validateFormField(field, data[fieldName], 'required');
            if (!isValid) isFormValid = false;
        }
    });

    // Validate email specifically
    const emailField = form.querySelector('[name="email"]');
    if (emailField && !validateFormField(emailField, data.email, 'email')) {
        isFormValid = false;
    }

    // Validate phone if provided
    const phoneField = form.querySelector('[name="phone"]');
    if (phoneField && data.phone && !validateFormField(phoneField, data.phone, 'phone')) {
        isFormValid = false;
    }

    if (!isFormValid) {
        showToast('Please fix the errors in the form', 'error');
        return;
    }

    // Add default department_id if not set
    if (!data.department_id && courses.length > 0) {
        const selectedCourse = courses.find(c => c.id == data.course_id);
        if (selectedCourse) {
            data.department_id = selectedCourse.department_id;
        } else {
            data.department_id = 1;
        }
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                role: 'student'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            localStorage.setItem('smartcomplaint_user', JSON.stringify(currentUser));
            
            showToast('Registration successful! Welcome to SmartComplaint.', 'success');
            hideLoginModal();
            showStudentDashboard();
        } else {
            showToast(result.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validate fields
    let isFormValid = true;
    const emailField = form.querySelector('[name="email"]');
    const passwordField = form.querySelector('[name="password"]');
    
    if (!validateFormField(emailField, email, 'required') || 
        !validateFormField(emailField, email, 'email')) {
        isFormValid = false;
    }
    
    if (!validateFormField(passwordField, password, 'required')) {
        isFormValid = false;
    }

    if (!isFormValid) {
        showToast('Please enter valid credentials', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    
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
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            localStorage.setItem('smartcomplaint_user', JSON.stringify(currentUser));
            
            showToast('Login successful! Welcome back.', 'success');
            hideLoginModal();
            showAdminDashboard();
        } else {
            showToast(result.error || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Add real-time validation to form fields
function setupFormValidation() {
    document.addEventListener('input', (e) => {
        if (e.target.matches('.auth-panel input, .auth-panel select')) {
            const field = e.target;
            const value = field.value;
            const name = field.name;
            
            // Determine validation type
            let validationType = 'required';
            if (name === 'email') validationType = 'email';
            else if (name === 'phone') validationType = 'phone';
            else if (name === 'admission_year') validationType = 'year';
            
            // Validate field
            validateFormField(field, value, validationType);
        }
    });
}

// Tab switching functionality
function switchAuthTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update panels with animation
    document.querySelectorAll('.auth-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Add slight delay for smooth transition
    setTimeout(() => {
        const targetPanel = document.getElementById(`${tabName}-panel`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            
            // Ensure modal scrolls to top when switching tabs
            const modalBody = document.querySelector('.modal-body');
            const authContent = document.querySelector('.auth-content');
            
            if (modalBody) {
                modalBody.scrollTop = 0;
            }
            if (authContent) {
                authContent.scrollTop = 0;
            }
            
            // Focus first input in the new panel
            const firstInput = targetPanel.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }, 150);
}

// Password toggle functionality
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// Enhanced functionality integration
function showQuickActions() {
    const quickActionsModal = document.createElement('div');
    quickActionsModal.className = 'modal active';
    quickActionsModal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>⚡ Quick Actions</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="quick-actions">
                    ${currentUser?.role === 'admin' ? `
                        <button class="quick-action" onclick="showAdminView('complaints'); this.closest('.modal').remove();">
                            <div class="action-icon">📋</div>
                            <div class="action-text">View All Complaints</div>
                        </button>
                        <button class="quick-action" onclick="exportComplaints(); this.closest('.modal').remove();">
                            <div class="action-icon">📊</div>
                            <div class="action-text">Export Data</div>
                        </button>
                        <button class="quick-action" onclick="showAdminView('analytics'); this.closest('.modal').remove();">
                            <div class="action-icon">📈</div>
                            <div class="action-text">View Analytics</div>
                        </button>
                    ` : `
                        <button class="quick-action" onclick="showDashboardView('new-complaint'); this.closest('.modal').remove();">
                            <div class="action-icon">➕</div>
                            <div class="action-text">New Complaint</div>
                        </button>
                        <button class="quick-action" onclick="showDashboardView('my-complaints'); this.closest('.modal').remove();">
                            <div class="action-icon">📋</div>
                            <div class="action-text">My Complaints</div>
                        </button>
                        <button class="quick-action" onclick="showDashboardView('profile'); this.closest('.modal').remove();">
                            <div class="action-icon">👤</div>
                            <div class="action-text">Update Profile</div>
                        </button>
                    `}
                    <button class="quick-action" onclick="themeManager?.toggle(); this.closest('.modal').remove();">
                        <div class="action-icon">🎨</div>
                        <div class="action-text">Change Theme</div>
                    </button>
                    <button class="quick-action" onclick="keyboardShortcuts?.showHelp(); this.closest('.modal').remove();">
                        <div class="action-icon">⌨️</div>
                        <div class="action-text">Keyboard Shortcuts</div>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(quickActionsModal);
}

// Enhanced export functionality
async function exportComplaints() {
    if (!currentUser || currentUser.role !== 'admin') {
        showToast('Only administrators can export data', 'error');
        return;
    }

    try {
        showToast('Preparing export...', 'info');
        
        // Create CSV content
        const headers = ['ID', 'Title', 'Student Name', 'Department', 'Category', 'Status', 'Priority', 'Created Date', 'Description'];
        const csvContent = [
            headers.join(','),
            ...allComplaints.map(complaint => [
                complaint.complaint_id || complaint.id,
                `"${complaint.title}"`,
                `"${complaint.student_name}"`,
                `"${complaint.department}"`,
                `"${complaint.category}"`,
                complaint.status,
                complaint.priority,
                new Date(complaint.created_at).toLocaleDateString(),
                `"${complaint.description.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Export completed successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed. Please try again.', 'error');
    }
}

// Enhanced loading with skeletons
function showLoadingSkeletons(containerId, type = 'card', count = 3) {
    if (window.EnhancedFeatures?.SkeletonLoader) {
        window.EnhancedFeatures.SkeletonLoader.show(containerId, type, count);
    }
}

function hideLoadingSkeletons(containerId) {
    if (window.EnhancedFeatures?.SkeletonLoader) {
        window.EnhancedFeatures.SkeletonLoader.hide(containerId);
    }
}

// Enhanced data loading with progress indication
async function loadStudentDataEnhanced() {
    if (!currentUser || !currentUser.student_id) return;
    
    try {
        // Show loading skeletons
        showLoadingSkeletons('recent-complaints', 'card', 2);
        showLoadingSkeletons('complaints-list', 'list', 5);
        
        // Load student complaints with progress
        const response = await fetch(`${API_BASE}/student-complaints/${currentUser.student_id}`);
        if (response.ok) {
            complaints = await response.json();
            
            // Hide skeletons and update UI
            hideLoadingSkeletons('recent-complaints');
            hideLoadingSkeletons('complaints-list');
            
            updateStudentStats();
            updateRecentComplaints();
            updateComplaintsList();
            
            // Add notification for new complaints
            if (window.notificationCenter && complaints.length > 0) {
                const recentComplaint = complaints[0];
                const isRecent = new Date() - new Date(recentComplaint.created_at) < 24 * 60 * 60 * 1000;
                
                if (isRecent) {
                    window.notificationCenter.add({
                        type: 'complaint',
                        title: 'Complaint Update',
                        message: `Your complaint "${recentComplaint.title}" status: ${recentComplaint.status}`,
                        important: recentComplaint.status === 'Resolved'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading student data:', error);
        hideLoadingSkeletons('recent-complaints');
        hideLoadingSkeletons('complaints-list');
        showToast('Failed to load your complaints. Please refresh the page.', 'error');
    }
}

// Enhanced admin data loading
async function loadAdminDataEnhanced() {
    try {
        // Show loading skeletons
        showLoadingSkeletons('admin-recent-complaints', 'card', 3);
        showLoadingSkeletons('admin-complaints-list', 'list', 10);
        showLoadingSkeletons('department-stats', 'stats', 4);
        
        // Load all complaints
        const complaintsResponse = await fetch(`${API_BASE}/all-student-complaints`);
        if (complaintsResponse.ok) {
            allComplaints = await complaintsResponse.json();
            
            // Hide skeletons and update UI
            hideLoadingSkeletons('admin-recent-complaints');
            hideLoadingSkeletons('admin-complaints-list');
            hideLoadingSkeletons('department-stats');
            
            updateAdminStats();
            updateAdminRecentComplaints();
            updateAdminComplaintsList();
            updateDepartmentStats();
            
            // Create analytics charts
            createAnalyticsCharts();
        }
        
        // Load students
        const studentsResponse = await fetch(`${API_BASE}/students`);
        if (studentsResponse.ok) {
            students = await studentsResponse.json();
            updateStudentsList();
        }
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        hideLoadingSkeletons('admin-recent-complaints');
        hideLoadingSkeletons('admin-complaints-list');
        hideLoadingSkeletons('department-stats');
        showToast('Failed to load admin data. Please refresh the page.', 'error');
    }
}

// Create analytics charts
function createAnalyticsCharts() {
    if (!window.ProfessionalCharts) return;
    
    // Status distribution chart (Donut Chart)
    const statusCounts = {
        'Pending': allComplaints.filter(c => c.status === 'Pending').length,
        'In Progress': allComplaints.filter(c => c.status === 'In Progress').length,
        'Resolved': allComplaints.filter(c => c.status === 'Resolved').length
    };
    
    const statusData = Object.entries(statusCounts).map(([label, value]) => ({ label, value }));
    window.ProfessionalCharts.createDonutChart(statusData, 'status-chart', {
        width: 350,
        height: 300,
        animate: true,
        showLegend: true
    });

    // Dashboard status chart (smaller version)
    window.ProfessionalCharts.createDonutChart(statusData, 'dashboard-status-chart', {
        width: 250,
        height: 200,
        animate: true,
        showLegend: false
    });
    
    // Department distribution chart (Bar Chart)
    const deptCounts = {};
    allComplaints.forEach(complaint => {
        const dept = complaint.department;
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    
    const deptData = Object.entries(deptCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([label, value]) => ({ 
            label: label.length > 12 ? label.substring(0, 12) + '...' : label, 
            value 
        }));
    
    window.ProfessionalCharts.createBarChart(deptData, 'department-chart', {
        width: 450,
        height: 300,
        animate: true,
        showValues: true
    });

    // Dashboard department chart (smaller version)
    window.ProfessionalCharts.createBarChart(deptData.slice(0, 5), 'dashboard-department-chart', {
        width: 350,
        height: 200,
        animate: true,
        showValues: true
    });

    // Priority distribution chart (Donut Chart)
    const priorityCounts = {
        'Low': allComplaints.filter(c => c.priority === 'Low').length,
        'Medium': allComplaints.filter(c => c.priority === 'Medium').length,
        'High': allComplaints.filter(c => c.priority === 'High').length,
        'Critical': allComplaints.filter(c => c.priority === 'Critical').length
    };
    
    const priorityData = Object.entries(priorityCounts)
        .filter(([, value]) => value > 0)
        .map(([label, value]) => ({ label, value }));
    
    window.ProfessionalCharts.createDonutChart(priorityData, 'priority-chart', {
        width: 350,
        height: 300,
        animate: true,
        showLegend: true
    });

    // Monthly trends chart (Line Chart)
    const monthlyData = generateMonthlyTrends();
    window.ProfessionalCharts.createLineChart(monthlyData, 'trends-chart', {
        width: 450,
        height: 300,
        animate: true,
        showPoints: true,
        showArea: true,
        smooth: true
    });

    // Dashboard trends chart (smaller version)
    window.ProfessionalCharts.createLineChart(monthlyData.slice(-7), 'dashboard-trends-chart', {
        width: 350,
        height: 200,
        animate: true,
        showPoints: true,
        showArea: true,
        smooth: true
    });

    // Create progress bars for resolution progress
    createResolutionProgressBars();
}

// Generate sample monthly trends data
function generateMonthlyTrends() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const trendsData = [];
    
    // Generate data for the last 12 months
    for (let i = 11; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = months[monthIndex];
        
        // Calculate actual complaints for this month if available
        let value = 0;
        if (allComplaints && allComplaints.length > 0) {
            value = allComplaints.filter(complaint => {
                const complaintDate = new Date(complaint.created_at);
                return complaintDate.getMonth() === monthIndex;
            }).length;
        }
        
        // If no real data, generate realistic sample data
        if (value === 0) {
            value = Math.floor(Math.random() * 30) + 10; // 10-40 complaints per month
        }
        
        trendsData.push({
            label: monthName,
            value: value
        });
    }
    
    return trendsData;
}

// Create resolution progress bars
function createResolutionProgressBars() {
    const progressContainer = document.querySelector('#resolution-progress .progress-bars');
    if (!progressContainer) return;

    const total = allComplaints.length;
    if (total === 0) {
        progressContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No data available</p>';
        return;
    }

    const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
    const inProgress = allComplaints.filter(c => c.status === 'In Progress').length;
    const pending = allComplaints.filter(c => c.status === 'Pending').length;

    const resolvedPercent = (resolved / total) * 100;
    const inProgressPercent = (inProgress / total) * 100;
    const pendingPercent = (pending / total) * 100;

    progressContainer.innerHTML = `
        <div class="progress-bar-container">
            <div class="progress-label">
                <span>Resolved (${resolved})</span>
                <span class="progress-percentage">${resolvedPercent.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill progress-success" style="width: ${resolvedPercent}%"></div>
            </div>
        </div>
        
        <div class="progress-bar-container">
            <div class="progress-label">
                <span>In Progress (${inProgress})</span>
                <span class="progress-percentage">${inProgressPercent.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill progress-info" style="width: ${inProgressPercent}%"></div>
            </div>
        </div>
        
        <div class="progress-bar-container">
            <div class="progress-label">
                <span>Pending (${pending})</span>
                <span class="progress-percentage">${pendingPercent.toFixed(1)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill progress-warning" style="width: ${pendingPercent}%"></div>
            </div>
        </div>
    `;

    // Animate progress bars
    setTimeout(() => {
        const progressFills = progressContainer.querySelectorAll('.progress-fill');
        progressFills.forEach((fill, index) => {
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.transition = 'width 1s ease-out';
                fill.style.width = [resolvedPercent, inProgressPercent, pendingPercent][index] + '%';
            }, index * 200);
        });
    }, 100);
}

// Override original functions with enhanced versions
const originalLoadStudentData = loadStudentData;
const originalLoadAdminData = loadAdminData;

loadStudentData = loadStudentDataEnhanced;
loadAdminData = loadAdminDataEnhanced;

// Initialize particle effects
setTimeout(() => {
    createParticleEffect();
}, 2000);

console.log('🎯 Smart Complaint System - JavaScript loaded successfully');
// Make logout function more visible and accessible
function showLogoutConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>🚪 Confirm Logout</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to logout?</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="logout(); this.closest('.modal').remove();">Yes, Logout</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
// Debug function to check elements
function debugElements() {
    console.log('🔍 Debugging elements...');
    
    const elements = [
        'admin-total-complaints',
        'admin-pending-complaints', 
        'admin-progress-complaints',
        'admin-resolved-complaints',
        'student-total-complaints',
        'student-pending-complaints',
        'student-progress-complaints', 
        'student-resolved-complaints'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Found element: ${id}`, element);
        } else {
            console.error(`❌ Missing element: ${id}`);
        }
    });
    
    console.log('📊 Current data:', {
        allComplaints: allComplaints.length,
        complaints: complaints.length,
        currentUser: currentUser
    });
}

// Add keyboard shortcut for debugging
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        debugElements();
    }
});