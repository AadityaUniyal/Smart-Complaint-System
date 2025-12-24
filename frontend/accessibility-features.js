class AccessibilityManager {
    constructor() {
        this.shortcuts = new Map();
        this.focusTracker = null;
        this.announcer = null;
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
       
