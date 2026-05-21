document.addEventListener("DOMContentLoaded", function () {
    // Initialize Lucide Icons if loaded
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    } else {
        console.warn("Lucide icons library not loaded.");
    }

    const siteHeader = document.querySelector('.site-header');
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const drawer = document.getElementById('mobile-menu-drawer');
    const drawerCloseBtn = document.querySelector('.drawer-close');
    const drawerOverlay = document.querySelector('.drawer-overlay');
    const body = document.body;

    // A list of focusable elements inside the drawer for keyboard trap
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    let firstFocusableElement = null;
    let lastFocusableElement = null;

    function updateFocusableElements() {
        if (!drawer) return;
        const focusableElements = drawer.querySelectorAll(focusableElementsString);
        if (focusableElements.length > 0) {
            firstFocusableElement = focusableElements[0];
            lastFocusableElement = focusableElements[focusableElements.length - 1];
        }
    }

    // Toggle Drawer Open
    function openMenu() {
        if (!drawer) return;
        drawer.classList.add('is-active');
        body.classList.add('menu-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        drawer.setAttribute('aria-hidden', 'false');
        
        updateFocusableElements();
        
        // Focus the close button after drawer opens
        setTimeout(() => {
            if (drawerCloseBtn) {
                drawerCloseBtn.focus();
            }
        }, 100);
    }

    // Toggle Drawer Close
    function closeMenu() {
        if (!drawer) return;
        drawer.classList.remove('is-active');
        body.classList.remove('menu-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        
        // Return focus to hamburger button
        if (hamburgerBtn) {
            hamburgerBtn.focus();
        }
    }

    // Event Listeners for Open/Close
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openMenu);
    }
    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', closeMenu);
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeMenu);
    }

    // Close menu on ESC key press
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            if (drawer && drawer.classList.contains('is-active')) {
                closeMenu();
            }
        }
    });

    // Close mobile drawer when a link is clicked (e.g. hash link scroll)
    const drawerLinks = document.querySelectorAll('.drawer-menu-list a:not(.accordion-trigger)');
    drawerLinks.forEach(link => {
        link.addEventListener('click', function () {
            closeMenu();
        });
    });

    // Tab Navigation Trap inside mobile drawer
    if (drawer) {
        drawer.addEventListener('keydown', function (e) {
            const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);
            if (!isTabPressed) return;

            updateFocusableElements();

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        });
    }

    // Accordion Logic for Mobile Drawer Submenus
    const accordionTriggers = document.querySelectorAll('.drawer-accordion .accordion-trigger');
    
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const parentLi = this.parentElement;
            const submenu = parentLi.querySelector('.drawer-submenu');
            const isOpen = parentLi.classList.contains('is-open');

            // Close all other accordions first
            const allAccordions = document.querySelectorAll('.drawer-accordion');
            allAccordions.forEach(item => {
                if (item !== parentLi && item.classList.contains('is-open')) {
                    item.classList.remove('is-open');
                    const itemTrigger = item.querySelector('.accordion-trigger');
                    const itemSubmenu = item.querySelector('.drawer-submenu');
                    if (itemTrigger && itemSubmenu) {
                        itemTrigger.setAttribute('aria-expanded', 'false');
                        itemSubmenu.setAttribute('aria-hidden', 'true');
                        itemSubmenu.style.maxHeight = '0px';
                    }
                }
            });

            // Toggle current accordion
            if (isOpen) {
                parentLi.classList.remove('is-open');
                this.setAttribute('aria-expanded', 'false');
                submenu.setAttribute('aria-hidden', 'true');
                submenu.style.maxHeight = '0px';
            } else {
                parentLi.classList.add('is-open');
                this.setAttribute('aria-expanded', 'true');
                submenu.setAttribute('aria-hidden', 'false');
                // Calculate height of child contents dynamically for smooth animation
                submenu.style.maxHeight = submenu.scrollHeight + "px";
            }
        });
    });
});
