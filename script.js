document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollContainer = document.querySelector('.scroll-container');

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: scrollContainer,
        rootMargin: '0px',
        threshold: 0.3
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Intersection Observer for scroll reveal animations
    const revealObserverOptions = {
        root: scrollContainer,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target); // Only reveal once
            }
        });
    }, revealObserverOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // Continuous Nav Indicator Sync
    const indicator = document.querySelector('.nav-indicator');

    const updateSmoothIndicator = () => {
        if (!indicator) return;

        // Map nav links to their target sections originally
        const navItems = Array.from(navLinks).map(link => {
            const targetId = link.getAttribute('href');
            let targetSection = null;
            if (targetId && targetId !== '#') {
                targetSection = document.querySelector(targetId);
            }
            return {
                link: link,
                section: targetSection,
                offsetTop: targetSection ? targetSection.offsetTop : 0
            };
        }).filter(item => item.section); // Only keep valid sections



        const scrollTop = scrollContainer.scrollTop;

        // Find which two mapped items we're between
        let startIndex = 0;
        let endIndex = 0;
        let t = 0;

        for (let i = 0; i < navItems.length; i++) {
            if (i === navItems.length - 1) {
                // We are at or past the last section
                startIndex = i;
                endIndex = i;
                t = 0;
                break;
            }
            if (scrollTop >= navItems[i].offsetTop && scrollTop < navItems[i + 1].offsetTop) {
                startIndex = i;
                endIndex = i + 1;
                // Calculate interpolation factor
                let sectionHeight = navItems[i + 1].offsetTop - navItems[i].offsetTop;
                if (sectionHeight > 0) {
                    t = (scrollTop - navItems[i].offsetTop) / sectionHeight;
                }
                break;
            }
        }

        // Handle scrolling before the first section (e.g. bounce)
        if (scrollTop < navItems[0].offsetTop) {
            startIndex = 0;
            endIndex = 0;
            t = 0;
        }

        const startItem = navItems[startIndex];
        const endItem = navItems[endIndex];

        const containerRect = startItem.link.parentElement.getBoundingClientRect();
        const startRect = startItem.link.getBoundingClientRect();
        const endRect = endItem.link.getBoundingClientRect();

        const startLeft = startRect.left - containerRect.left;
        const startWidth = startRect.width;

        const endLeft = endRect.left - containerRect.left;
        const endWidth = endRect.width;

        const currentLeft = startLeft + (endLeft - startLeft) * t;
        const currentWidth = startWidth + (endWidth - startWidth) * t;

        indicator.style.width = `${currentWidth}px`;
        indicator.style.transform = `translateX(${currentLeft}px)`;

        // Update active text color Class based on midpoint
        navLinks.forEach(nav => nav.classList.remove('active'));
        if (t < 0.5) {
            startItem.link.classList.add('active');
        } else {
            endItem.link.classList.add('active');
        }
    };

    // Theme Toggle setup
    const themeBtn = document.querySelector('.theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Check device preference initially
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
        if (sunIcon && moonIcon) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        });
    }

    if (scrollContainer && indicator) {
        scrollContainer.addEventListener('scroll', () => {
            window.requestAnimationFrame(() => {
                updateSmoothIndicator();

                // Rotate theme button on scroll
                if (themeBtn) {
                    const scrollDistance = scrollContainer.scrollTop;
                    themeBtn.style.transform = `rotate(${scrollDistance * 0.15}deg)`;
                }
            });
        });

        // Also rotate theme button when scrolling the portfolio overlay
        const portfolioOverlay = document.getElementById('photography-portfolio');
        if (portfolioOverlay && themeBtn) {
            portfolioOverlay.addEventListener('scroll', () => {
                window.requestAnimationFrame(() => {
                    const scrollDistance = portfolioOverlay.scrollTop;
                    themeBtn.style.transform = `rotate(${scrollDistance * 0.15}deg)`;
                });
            });
        }
        
        // Initial setup
        window.requestAnimationFrame(updateSmoothIndicator);
        window.addEventListener('resize', () => {
            window.requestAnimationFrame(updateSmoothIndicator);
        });
    }

    // Update nav link click to purely scroll smoothly
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetSection = document.querySelector(targetId);

            if (targetSection && scrollContainer) {
                // Temporarily disable scroll snapping for a smoother animated transition
                scrollContainer.style.scrollSnapType = 'none';

                targetSection.scrollIntoView({ behavior: 'smooth' });

                // Re-enable snapping roughly after scroll finishes
                setTimeout(() => {
                    scrollContainer.style.scrollSnapType = 'y mandatory';
                }, 800);
            }
        });
    });

    // --- Accordion Entrance Animation ---
    const accordionContainer = document.querySelector('.accordion-container');

    if (accordionContainer) {
        const entranceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start Sequence
                    setTimeout(() => {
                        accordionContainer.classList.add('animate-expand-middle');

                        setTimeout(() => {
                            accordionContainer.classList.remove('entrance-hidden');
                            accordionContainer.classList.add('animate-slide-out');

                            // Cleanup after animations finish to allow normal accordion behavior
                            setTimeout(() => {
                                accordionContainer.classList.remove('animate-expand-middle');
                                accordionContainer.classList.remove('animate-slide-out');
                            }, 1200);
                        }, 800);
                    }, 300);

                    entranceObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        entranceObserver.observe(accordionContainer);
    }

    const accordionCards = document.querySelectorAll('.project-card');
    const countCurrent = document.querySelector('.count-current');
    const countTotal = document.querySelector('.count-total');

    const updateCounters = () => {
        const visibleCards = Array.from(accordionCards);
        if (countTotal) {
            countTotal.textContent = String(visibleCards.length).padStart(2, '0');
        }

        const activeCard = document.querySelector('.project-card.active');
        if (activeCard) {
            const visibleIndex = visibleCards.indexOf(activeCard) + 1;
            if (countCurrent && visibleIndex > 0) {
                countCurrent.textContent = String(visibleIndex).padStart(2, '0');
            }
        }
    };



    if (accordionCards.length > 0) {
        // Initialize first card
        if (!Array.from(accordionCards).some(c => c.classList.contains('active'))) {
            accordionCards[0].classList.add('active');
            updateCounters();
        }

        accordionCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                accordionCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                updateCounters();
            });

            // Support for touch devices and opening the portfolio
            card.addEventListener('click', (e) => {
                if (!card.classList.contains('active')) {
                    e.preventDefault();
                    accordionCards.forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    updateCounters();
                } else {
                    // If already active, check if it's the photography card to open portfolio
                    const title = card.querySelector('.project-title-link').textContent.trim();
                    if (title === 'Photography') {
                        e.preventDefault();
                        openPortfolio(card);
                    }
                }
            });
        });
    }

    // --- Portfolio Overlay Logic ---
    const portfolioOverlay = document.getElementById('photography-portfolio');
    const closePortfolioBtn = document.querySelector('.close-portfolio');

    function openPortfolio(sourceElement) {
        if (!portfolioOverlay) return;

        const firstItem = portfolioOverlay.querySelector('.portfolio-item');
        if (!sourceElement || !firstItem) {
            portfolioOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            return;
        }

        // --- FLIP / Morph Logic ---
        const sourceImg = sourceElement.querySelector('.card-image-placeholder');
        if (!sourceImg) {
             portfolioOverlay.classList.add('active');
             document.body.style.overflow = 'hidden';
             return;
        }

        const sourceRect = sourceImg.getBoundingClientRect();
        
        // 1. Prepare overlay (active but invisible to get correct layout)
        portfolioOverlay.style.visibility = 'hidden';
        portfolioOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; 
        
        // 2. Clear previous states and prepare for reveal
        const portfolioItems = Array.from(portfolioOverlay.querySelectorAll('.portfolio-item'));
        portfolioItems.forEach(item => item.classList.remove('is-visible'));

        // 3. Wait for layout to settle before calculating target
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const realTargetRect = firstItem.getBoundingClientRect();
            
            // 4. Create Morph Element
            const morph = document.createElement('div');
            morph.className = 'morph-element';
            
            // Mirror the object-fit behavior by using an img inside
            const imgUrlRaw = window.getComputedStyle(sourceImg).backgroundImage;
            const imgUrl = imgUrlRaw.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
            const morphImg = document.createElement('img');
            morphImg.src = imgUrl;
            morphImg.style.width = '100%';
            morphImg.style.height = '100%';
            morphImg.style.objectFit = 'cover';
            morphImg.style.borderRadius = '0px';
            morph.appendChild(morphImg);
            
            morph.style.borderRadius = '0px'; 
            morph.style.top = `${sourceRect.top}px`;
            morph.style.left = `${sourceRect.left}px`;
            morph.style.width = `${sourceRect.width}px`;
            morph.style.height = `${sourceRect.height}px`;
            morph.style.transition = 'none';
            
            document.body.appendChild(morph);

            // Hide the real first item during the morph
            firstItem.style.visibility = 'hidden';

            // Force Reflow
            morph.getBoundingClientRect();

            // 5. Start Morph Animation
            morph.style.transition = 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
            morph.style.top = `${realTargetRect.top}px`;
            morph.style.left = `${realTargetRect.left}px`;
            morph.style.width = `${realTargetRect.width}px`;
            morph.style.height = `${realTargetRect.height}px`;

            // 6. Reveal Overlay and Grid
            setTimeout(() => {
                portfolioOverlay.style.visibility = ''; 
                
                // Trigger reveal for other items (delayed)
                portfolioItems.forEach((item, index) => {
                    if (index === 0) return;
                    setTimeout(() => {
                        item.classList.add('is-visible');
                    }, 100 * index + 400); 
                });

                // Final swap: morph to real item
                setTimeout(() => {
                    firstItem.style.visibility = 'visible';
                    firstItem.classList.add('is-visible');
                    morph.style.opacity = '0';
                    setTimeout(() => morph.remove(), 400);
                }, 800); 
            }, 50);
          });
        });
    }

    function closePortfolio() {
        if (!portfolioOverlay) return;
        portfolioOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore main scroll
    }

    if (closePortfolioBtn) {
        closePortfolioBtn.addEventListener('click', closePortfolio);
    }

    // Escape key to close portfolio and lightbox
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightboxOverlay && lightboxOverlay.classList.contains('active')) {
                closeLightbox();
            } else if (portfolioOverlay && portfolioOverlay.classList.contains('active')) {
                closePortfolio();
            }
        }
    });

    // --- Lightbox Functionality ---
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-nav.prev');
    const nextBtn = document.querySelector('.lightbox-nav.next');

    let currentLightboxItems = [];
    let currentLightboxIndex = -1;
    let lastActiveGridItem = null;

    function openLightbox(index, items) {
        if (!lightboxOverlay || !lightboxImg || index < 0) return;

        currentLightboxIndex = index;
        currentLightboxItems = items;
        lastActiveGridItem = items[index];
        lastActiveGridItem.style.visibility = 'hidden';

        const gridImg = lastActiveGridItem.querySelector('img');
        const caption = lastActiveGridItem.querySelector('.item-overlay span');
        const sourceRect = gridImg.getBoundingClientRect();

        // 1. Set terminal state content
        lightboxImg.src = gridImg.src;
        if (lightboxCaption) lightboxCaption.textContent = caption ? caption.textContent : '';
        
        // 2. Prepare FLIP: Start at grid position
        // Calculate the actual visual size the image will have in the lightbox due to max-width/height
        const naturalRatio = gridImg.naturalWidth / gridImg.naturalHeight;
        const containerW = window.innerWidth;
        const containerH = window.innerHeight;
        const containerRatio = containerW / containerH;

        let targetW, targetH;
        if (naturalRatio > containerRatio) {
            targetW = containerW;
            targetH = containerW / naturalRatio;
        } else {
            targetH = containerH;
            targetW = containerH * naturalRatio;
        }
        
        const scaleX = sourceRect.width / targetW;
        const scaleY = sourceRect.height / targetH;
        const translateX = (sourceRect.left + sourceRect.width / 2) - (containerW / 2);
        const translateY = (sourceRect.top + sourceRect.height / 2) - (containerH / 2);

        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;

        // 3. Activate overlay
        lightboxOverlay.classList.add('active');

        // 4. Play: Animate to center
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                lightboxImg.style.transition = 'transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
                lightboxImg.style.transform = 'translate(0, 0) scale(1)';
            });
        });
    }

    function closeLightbox() {
        if (!lightboxOverlay || currentLightboxIndex === -1) return;

        // Reveal grid immediately
        lightboxOverlay.style.background = 'transparent';

        const gridImg = lastActiveGridItem.querySelector('img');
        const sourceRect = gridImg.getBoundingClientRect();
        
        const naturalRatio = gridImg.naturalWidth / gridImg.naturalHeight;
        const containerW = window.innerWidth;
        const containerH = window.innerHeight;
        const containerRatio = containerW / containerH;

        let targetW, targetH;
        if (naturalRatio > containerRatio) {
            targetW = containerW;
            targetH = containerW / naturalRatio;
        } else {
            targetH = containerH;
            targetW = containerH * naturalRatio;
        }
        
        const scaleX = sourceRect.width / targetW;
        const scaleY = sourceRect.height / targetH;
        const translateX = (sourceRect.left + sourceRect.width / 2) - (containerW / 2);
        const translateY = (sourceRect.top + sourceRect.height / 2) - (containerH / 2);

        // Shrink back
        lightboxImg.style.transition = 'transform 0.7s cubic-bezier(0.19, 1, 0.22, 1)';
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        
        setTimeout(() => {
            lightboxOverlay.classList.remove('active');
            lightboxOverlay.style.background = ''; // Reset
            if (lastActiveGridItem) lastActiveGridItem.style.visibility = '';
            currentLightboxIndex = -1;
            lightboxImg.style.transform = '';
            lightboxImg.style.transition = '';
        }, 700);
    }

    function navigateLightbox(direction) {
        if (currentLightboxIndex === -1) return;

        let nextIndex = currentLightboxIndex + direction;
        if (nextIndex < 0) nextIndex = currentLightboxItems.length - 1;
        if (nextIndex >= currentLightboxItems.length) nextIndex = 0;

        // Reveal previous item before switching
        if (lastActiveGridItem) lastActiveGridItem.style.visibility = '';

        currentLightboxIndex = nextIndex;
        lastActiveGridItem = currentLightboxItems[currentLightboxIndex];
        lastActiveGridItem.style.visibility = 'hidden';

        const gridImg = lastActiveGridItem.querySelector('img');
        const caption = lastActiveGridItem.querySelector('.item-overlay span');

        // Crisp slide transition without transparency
        lightboxImg.style.transform = `translateX(${direction * 40}px)`; // Slightly more slide

        setTimeout(() => {
            lightboxImg.style.transition = 'none';
            lightboxImg.src = gridImg.src;
            if (lightboxCaption) lightboxCaption.textContent = caption ? caption.textContent : '';
            
            lightboxImg.style.transform = `translateX(${-direction * 40}px)`;
            lightboxImg.getBoundingClientRect(); // Reflow

            lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
            lightboxImg.style.transform = 'translateX(0)';
        }, 200);
    }

    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (!lightboxOverlay.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Add click listeners to portfolio items for lightbox
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.portfolio-item');
        if (item && portfolioOverlay && portfolioOverlay.classList.contains('active')) {
            const items = Array.from(portfolioOverlay.querySelectorAll('.portfolio-item'));
            const index = items.indexOf(item);
            openLightbox(index, items);
        }
    });

    // Hero Scroll Button
    const scrollBtn = document.querySelector('.scroll-btn');
    if (scrollBtn && scrollContainer) {
        scrollBtn.addEventListener('click', () => {
            const projectsSection = document.querySelector('#other-projects');
            if (projectsSection) {
                scrollContainer.style.scrollSnapType = 'none';
                projectsSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    scrollContainer.style.scrollSnapType = 'y mandatory';
                }, 800);
            }
        });
    }



    // Custom Elastic Cursor
    const cursorCircle = document.querySelector('.cursor-circle');

    // Position state
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let circleX = mouseX;
    let circleY = mouseY;

    // Squeeze effect state
    let lastCircleX = circleX;
    let lastCircleY = circleY;
    let currentAngle = 0;

    // Physics variables
    const speed = 0.4; // controls tracking snappiness (higher = less delay)

    // Update target position on mouse move
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Unified Cursor Hover Management and Snapping
    let snapTarget = null;
    const cursorText = document.querySelector('.cursor-text');

    document.addEventListener('mouseover', (e) => {
        // Find if target is an interactive element (excluding portfolio items for separate 'View' behavior)
        const snapEl = e.target.closest('a, button, .scroll-btn, .nav-link, .theme-toggle, .contact-link-wrap, .close-portfolio, .close-lightbox');
        const viewEl = e.target.closest('.portfolio-item');

        if (snapEl) {
            // Prepare target: wrap all direct text nodes in a span for transformation
            if (!snapEl.dataset.magneticPrepared) {
                Array.from(snapEl.childNodes).forEach(node => {
                    if (node.nodeType === 3 && node.textContent.trim().length > 0) {
                        const wrapper = document.createElement('span');
                        wrapper.className = 'magnetic-inner';
                        snapEl.insertBefore(wrapper, node);
                        wrapper.appendChild(node);
                    }
                });
                snapEl.dataset.magneticPrepared = "true";
            }

            snapTarget = snapEl;
            cursorCircle.classList.add('snapped');
        } else if (viewEl) {
            cursorCircle.classList.add('view-mode');
            if (cursorText) {
                cursorText.textContent = viewEl.dataset.cursorText || 'View';
            }
        }
    });

    document.addEventListener('mouseout', (e) => {
        const snapEl = e.target.closest('a, button, .project-card, .scroll-btn, .nav-link, .theme-toggle, .contact-link-wrap, .close-portfolio, .close-lightbox');
        const viewEl = e.target.closest('.portfolio-item');

        if (snapEl) {
            // Reset content translation
            Array.from(snapEl.children).forEach(child => {
                if (!child.classList.contains('card-glass')) {
                    child.style.transform = '';
                    child.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
                }
            });

            snapTarget = null;
            cursorCircle.classList.remove('snapped');

            // Reset cursor dimensions
            cursorCircle.style.setProperty('--cursor-w', '16px');
            cursorCircle.style.setProperty('--cursor-h', '16px');
            cursorCircle.style.setProperty('--cursor-r', '50%');
        } else if (viewEl) {
            cursorCircle.classList.remove('view-mode');
            if (cursorText) {
                cursorText.textContent = '';
            }
        }
    });

    // Animate the outer circle with interpolation and snap effect
    function animateCursor() {
        let targetX = mouseX;
        let targetY = mouseY;
        let targetW = 16;
        let targetH = 16;
        let targetR = '50%';

        if (snapTarget) {
            const rect = snapTarget.getBoundingClientRect();
            // Magnetic pull: move target slightly towards the center of the element
            // but keep it responsive to mouse position within the bounds
            const padding = 12; // Standard padding for all buttons

            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
            targetW = rect.width + padding * 2;
            targetH = rect.height + padding * 2;

            // Determine border radius based on element shape, with a fallback for sharp elements
            const style = window.getComputedStyle(snapTarget);

            // For project-cards, keep their specific radius. For everything else (links, buttons), force a pill shape.
            if (snapTarget.classList.contains('project-card')) {
                targetR = style.borderRadius;
            } else {
                targetR = '100px';
            }

            // Adjust coordinates if it's a very large element (like project-card)
            // to still feel somewhat stuck but not completely centered if far away
            const dx = mouseX - targetX;
            const dy = mouseY - targetY;
            targetX += dx * 0.15;
            targetY += dy * 0.15;

            // Apply magnetic translation to content
            const contentPull = 0.35; // Increased pull for better visibility
            Array.from(snapTarget.children).forEach(child => {
                // Don't move the glass background of project cards
                if (!child.classList.contains('card-glass')) {
                    child.style.transform = `translate(${dx * contentPull}px, ${dy * contentPull}px)`;
                    child.style.transition = 'none';
                }
            });
        }

        // Calculate distance for the circle move
        const dx = targetX - circleX;
        const dy = targetY - circleY;

        // For general movement (not snapped), track instantly to remove lag.
        // When snapped, use interpolation for a smooth "pull" towards the element.
        if (!snapTarget) {
            circleX = targetX;
            circleY = targetY;
        } else {
            circleX += dx * speed;
            circleY += dy * speed;
        }

        // Apply transforms and size variables
        cursorCircle.style.transform = `translate(calc(${circleX}px - 50%), calc(${circleY}px - 50%))`;

        if (snapTarget) {
            cursorCircle.style.setProperty('--cursor-w', `${targetW}px`);
            cursorCircle.style.setProperty('--cursor-h', `${targetH}px`);
            cursorCircle.style.setProperty('--cursor-r', targetR);
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // --- Antigravity Particle Background ---
    const canvas = document.getElementById('fluid-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        let width, height;
        let particles = [];
        let mouseX = -1000, mouseY = -1000;
        const mouseRadius = 120;
        let time = 0;

        function initParticles() {
            particles = [];
            const spacing = 100;
            const cols = Math.ceil(width / spacing) + 2;
            const rows = Math.ceil(height / spacing) + 2;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * spacing + (Math.random() - 0.5) * 8;
                    const y = j * spacing + (Math.random() - 0.5) * 8;

                    const t = Math.random();
                    const r = Math.round(255 + (249 - 255) * t);
                    const g = Math.round(39 + (249 - 39) * t);
                    const b = Math.round(81 + (249 - 81) * t);

                    particles.push({
                        homeX: x,
                        homeY: y,
                        x: x,
                        y: y,
                        vx: 0,
                        vy: 0,
                        maxPillWidth: Math.random() * 6 + 10,
                        minRadius: Math.random() * 1 + 2,
                        pillHeight: Math.random() * 2 + 3,
                        rotation: Math.PI / 2 + (Math.random() - 0.5) * 0.4,
                        color: `rgb(${r}, ${g}, ${b})`,
                        opacity: Math.random() * 0.4 + 0.5,
                        phaseX: Math.random() * Math.PI * 2,
                        phaseY: Math.random() * Math.PI * 2,
                        waveSpeed: Math.random() * 2 + 1,
                        waveAmp: Math.random() * 22 + 12
                    });
                }
            }
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        }

        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        function render() {
            time += 0.008;

            // Sync with dark mode
            ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#111111' : '#f9f9f9';
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                const waveX = Math.sin(time * p.waveSpeed + p.phaseX + p.homeY * 0.008) * p.waveAmp;
                const waveY = Math.cos(time * p.waveSpeed * 0.8 + p.phaseY + p.homeX * 0.008) * p.waveAmp * 0.6;

                let targetX = p.homeX + waveX;
                let targetY = p.homeY + waveY;

                const dx = targetX - mouseX;
                const dy = targetY - mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouseRadius && dist > 0) {
                    const force = (1 - dist / mouseRadius) * 50;
                    targetX += (dx / dist) * force;
                    targetY += (dy / dist) * force;
                }

                p.vx += (targetX - p.x) * 0.08;
                p.vy += (targetY - p.y) * 0.08;
                p.vx *= 0.75;
                p.vy *= 0.75;
                p.x += p.vx;
                p.y += p.vy;

                // Scale size based on displacement from home
                const dispX = p.x - p.homeX;
                const dispY = p.y - p.homeY;
                const displacement = Math.sqrt(dispX * dispX + dispY * dispY);
                const maxDisp = p.waveAmp * 1.5;
                const stretchT = Math.min(displacement / maxDisp, 1);

                const currentWidth = p.minRadius * 2 + (p.maxPillWidth - p.minRadius * 2) * stretchT;
                const currentHeight = p.pillHeight;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.beginPath();
                const hw = currentWidth / 2;
                const hh = currentHeight / 2;
                const cr = hh;
                ctx.moveTo(-hw + cr, -hh);
                ctx.lineTo(hw - cr, -hh);
                ctx.arcTo(hw, -hh, hw, -hh + cr, cr);
                ctx.lineTo(hw, hh - cr);
                ctx.arcTo(hw, hh, hw - cr, hh, cr);
                ctx.lineTo(-hw + cr, hh);
                ctx.arcTo(-hw, hh, -hw, hh - cr, cr);
                ctx.lineTo(-hw, -hh + cr);
                ctx.arcTo(-hw, -hh, -hw + cr, -hh, cr);
                ctx.closePath();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
                ctx.restore();
            }

            ctx.globalAlpha = 1.0;
            requestAnimationFrame(render);
        }

        render();
    }

    // Trigger Navbar Entrance Animation
    setTimeout(() => {
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.classList.add('navbar-visible');
    }, 500);
});
