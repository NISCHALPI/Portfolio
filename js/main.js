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
    
    // Initialize scroll animations with Intersection Observer
    function initScrollAnimations() {
        // Select all animation elements
        const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        
        // Add staggered delay to reveal elements
        elements.forEach((element, index) => {
            element.style.transitionDelay = `${index * 0.1}s`;
        });
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    // Add a small delay before adding the visible class for smoother appearance
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, 100);
                    observer.unobserve(entry.target); // Stop observing once visible
                }
            });
        }, {
            threshold: 0.1, // Trigger earlier
            rootMargin: '0px 0px -10% 0px' // Show elements slightly before they enter the viewport
        });
        
        elements.forEach(element => {
            observer.observe(element);
        });
    }
    
    // Initialize animations
    initFadeElements();
    initScrollAnimations();
    
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

    // Tag rendering for blog listing (blog.html) - plain text after tag icon
    setTimeout(() => {
        document.querySelectorAll('.blog-post, .featured-post-content').forEach(post => {
            const meta = post.querySelector('.post-meta');
            if (!meta) return;
            let tagContainer = meta.querySelector('.post-tags');
            if (!tagContainer) {
                tagContainer = document.createElement('span');
                tagContainer.className = 'post-tags';
                meta.appendChild(tagContainer);
            }
            tagContainer.innerHTML = '';
            let tags = [];
            if (tagContainer.dataset.tags) {
                try {
                    tags = JSON.parse(tagContainer.dataset.tags);
                } catch {
                    tags = tagContainer.dataset.tags.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
            if (!tags.length) {
                tags = tagContainer.textContent.split(',').map(t => t.trim()).filter(Boolean);
            }
            if (tags.length) {
                const tagLabel = document.createElement('span');
                tagLabel.className = 'tag-label';
                tagLabel.innerHTML = `<i class="fas fa-tags"></i> ${tags.join(', ')}`;
                tagContainer.appendChild(tagLabel);
            }
        });
    }, 200);
});
