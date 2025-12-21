// Interactive Features for Smart Complaint System
// Advanced interactions and micro-animations

class InteractiveFeatures {
    constructor() {
        this.init();
    }

    init() {
        this.setupRippleEffects();
        this.setupParallaxScrolling();
        this.setupAnimatedCounters();
        this.setupInteractiveCards();
        this.setupTypingEffect();
        this.setupSmoothTransitions();
        this.setupGestureSupport();
        this.setupKeyboardNavigation();
        this.setupVoiceCommands();
        console.log('🎭 Interactive features initialized');
    }

    // Ripple Effect for Buttons
    setupRippleEffects() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
                this.createRipple(button, e);
            }
        });
    }

    createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Parallax Scrolling
    setupParallaxScrolling() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    // Animated Counters
    setupAnimatedCounters() {
        const counters = document.querySelectorAll('.counter');
        const observerOptions = {
            threshold: 0.7
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target') || element.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Interactive Cards
    setupInteractiveCards() {
        const cards = document.querySelectorAll('.card, .complaint-item, .stat-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.addCardHoverEffect(e.target);
            });

            card.addEventListener('mouseleave', (e) => {
                this.removeCardHoverEffect(e.target);
            });

            card.addEventListener('mousemove', (e) => {
                this.updateCardTilt(e);
            });
        });
    }

    addCardHoverEffect(card) {
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    }

    removeCardHoverEffect(card) {
        card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
        card.style.boxShadow = '';
    }

    updateCardTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `translateY(-5px) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    // Typing Effect
    setupTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-effect');

        typingElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--primary-color)';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    // Remove cursor after typing is complete
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 1000);
                }
            };

            // Start typing when element comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(typeWriter, 500);
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(element);
        });
    }

    // Smooth Transitions
    setupSmoothTransitions() {
        // Add smooth transitions to all interactive elements
        const style = document.createElement('style');
        style.textContent = `
            .btn, .card, .complaint-item, .stat-card, .form-group input, .form-group select {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .form-group input:focus, .form-group select:focus {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .fade-in-up {
                animation: fadeInUp 0.6s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    // Gesture Support
    setupGestureSupport() {
        let startX, startY, currentX, currentY;
        let isSwipe = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipe = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isSwipe) return;
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!isSwipe) return;
            isSwipe = false;

            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // Minimum swipe distance
            if (Math.abs(diffX) > 50 || Math.abs(diffY) > 50) {
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    // Horizontal swipe
                    if (diffX > 0) {
                        this.handleSwipeLeft();
                    } else {
                        this.handleSwipeRight();
                    }
                } else {
                    // Vertical swipe
                    if (diffY > 0) {
                        this.handleSwipeUp();
                    } else {
                        this.handleSwipeDown();
                    }
                }
            }
        });
    }

    handleSwipeLeft() {
        // Handle left swipe (e.g., next page, close modal)
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
        }
    }

    handleSwipeRight() {
        // Handle right swipe (e.g., previous page, open menu)
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    }

    handleSwipeUp() {
        // Handle up swipe (e.g., scroll to top)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleSwipeDown() {
        // Handle down swipe (e.g., refresh)
        // Could implement pull-to-refresh functionality
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }

            // Arrow key navigation for cards
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    handleArrowNavigation(e) {
        const focusableElements = Array.from(document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ));

        const currentIndex = focusableElements.indexOf(document.activeElement);
        let nextIndex;

        switch (e.key) {
            case 'ArrowUp':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
                break;
        }

        if (nextIndex !== undefined && focusableElements[nextIndex]) {
            e.preventDefault();
            focusableElements[nextIndex].focus();
        }
    }

    // Voice Commands (Basic Implementation)
    setupVoiceCommands() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            // Add voice command button
            this.addVoiceCommandButton(recognition);

            recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };

            recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
            };
        }
    }

    addVoiceCommandButton(recognition) {
        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-command-btn';
        voiceButton.innerHTML = '🎤';
        voiceButton.title = 'Voice Commands (Click and speak)';
        voiceButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        `;

        voiceButton.addEventListener('click', () => {
            recognition.start();
            voiceButton.style.background = '#ff4444';
            voiceButton.innerHTML = '🔴';
            
            setTimeout(() => {
                voiceButton.style.background = 'var(--primary-color)';
                voiceButton.innerHTML = '🎤';
            }, 3000);
        });

        document.body.appendChild(voiceButton);
    }

    processVoiceCommand(command) {
        console.log('Voice command:', command);

        if (command.includes('login') || command.includes('sign in')) {
            if (typeof showLoginModal === 'function') {
                showLoginModal();
            }
        } else if (command.includes('logout') || command.includes('sign out')) {
            if (typeof logout === 'function') {
                logout();
            }
        } else if (command.includes('new complaint') || command.includes('submit complaint')) {
            if (typeof showDashboardView === 'function') {
                showDashboardView('new-complaint');
            }
        } else if (command.includes('dashboard') || command.includes('home')) {
            if (typeof showDashboardView === 'function') {
                showDashboardView('overview');
            }
        } else if (command.includes('scroll up') || command.includes('go up')) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (command.includes('scroll down') || command.includes('go down')) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }

    // Utility method to add fade-in animation to elements
    addFadeInAnimation(elements) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(element => {
            observer.observe(element);
        });
    }
}

// Initialize interactive features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.interactiveFeatures = new InteractiveFeatures();
    
    // Add fade-in animations to key elements
    const elementsToAnimate = document.querySelectorAll(
        '.hero, .feature-card, .stat-card, .complaint-item, .dashboard-view'
    );
    
    if (elementsToAnimate.length > 0) {
        window.interactiveFeatures.addFadeInAnimation(elementsToAnimate);
    }
});

// Export for global access
window.InteractiveFeatures = InteractiveFeatures;
