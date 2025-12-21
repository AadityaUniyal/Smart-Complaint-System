// Enhanced Animations & Micro-interactions
// Provides smooth animations, loading states, and interactive feedback

class EnhancedAnimations {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.observers = new Map();
        
        this.init();
    }
    
    init() {
        console.log('✨ Initializing enhanced animations...');
        this.setupIntersectionObserver();
        this.setupLoadingSkeletons();
        this.setupMicroInteractions();
        this.setupPageTransitions();
    }
    
    // Intersection Observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
           