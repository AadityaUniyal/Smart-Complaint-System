// Professional Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('smartcomplaint_theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;
        localStorage.setItem('smartcomplaint_theme', themeName);
    }

    toggle() {
        const themes = ['dark', 'light'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
    console.log('Professional features loaded');
});
