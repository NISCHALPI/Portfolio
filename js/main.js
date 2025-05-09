// Main JavaScript file for the Mathematics PhD Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    // Navigation menu toggle for mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Here you would typically send the data to a server
            // For now, we'll just show an alert
            alert(`Thank you, ${name}! Your message has been received. We'll get back to you soon.`);
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Initialize animations for page elements
    function initFadeElements() {
        const fadeElements = document.querySelectorAll('.research-area, .project-card, .blog-post, .course, .testimonial, .talk');
        
        fadeElements.forEach((element, index) => {
            element.classList.add('fade-in');
            element.style.transitionDelay = `${index * 0.1}s`;
            // Make elements visible immediately since we're not scrolling
            setTimeout(() => {
                element.classList.add('active');
            }, 100 + (index * 100));
        });
    }
    
    // Initialize animations
    initFadeElements();
    
    // LaTeX rendering for mathematical equations
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ]
        });
    }
    
    // Render LaTeX from data-latex attributes
    if (typeof katex === 'object' && typeof katex.render === 'function') {
        document.querySelectorAll('.math-equation').forEach(function(element) {
            katex.render(element.getAttribute('data-latex'), element, {
                throwOnError: false,
                displayMode: true
            });
        });
    }
});
