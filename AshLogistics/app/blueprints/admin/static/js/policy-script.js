// Cookie Consent Management
let cookiePreferences = {
    essential: true, // Always true
    analytics: false,
    functional: false,
    marketing: false
};

// Check if cookie preferences are already set
function checkCookieConsent() {
    const preferences = localStorage.getItem('cookiePreferences');
    if (preferences) {
        cookiePreferences = JSON.parse(preferences);
        document.getElementById('cookieConsent').style.display = 'none';
        updateCookieSettings();
    }
}

// Open cookie settings modal
function openCookieSettings() {
    const modal = new bootstrap.Modal(document.getElementById('cookieSettingsModal'));
    updateCookieSettings();
    modal.show();
}

// Update cookie settings checkboxes
function updateCookieSettings() {
    document.getElementById('analyticsCookies').checked = cookiePreferences.analytics;
    document.getElementById('functionalCookies').checked = cookiePreferences.functional;
    document.getElementById('marketingCookies').checked = cookiePreferences.marketing;
}

// Save cookie preferences
function saveCookiePreferences() {
    cookiePreferences = {
        essential: true,
        analytics: document.getElementById('analyticsCookies').checked,
        functional: document.getElementById('functionalCookies').checked,
        marketing: document.getElementById('marketingCookies').checked
    };

    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    document.getElementById('cookieConsent').style.display = 'none';

    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('cookieSettingsModal'));
    modal.hide();

    // Apply cookie preferences
    applyCookiePreferences();
}

// Accept all cookies
function acceptAllCookies() {
    cookiePreferences = {
        essential: true,
        analytics: true,
        functional: true,
        marketing: true
    };

    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    document.getElementById('cookieConsent').style.display = 'none';
    updateCookieSettings();
    applyCookiePreferences();
}

// Apply cookie preferences (simulated)
function applyCookiePreferences() {
    console.log('Applying cookie preferences:', cookiePreferences);
    
    // Example: Analytics cookies
    if (cookiePreferences.analytics) {
        // Initialize analytics
        console.log('Analytics cookies enabled');
    }

    // Example: Functional cookies
    if (cookiePreferences.functional) {
        // Initialize functional features
        console.log('Functional cookies enabled');
    }

    // Example: Marketing cookies
    if (cookiePreferences.marketing) {
        // Initialize marketing features
        console.log('Marketing cookies enabled');
    }
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Check cookie consent on page load
    checkCookieConsent();

    // Smooth scroll functionality
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
});

// Update active section in navigation based on scroll position
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.policy-content section');
    const navLinks = document.querySelectorAll('.nav-section .nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});
