document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollContainer = document.querySelector('.scroll-container');

    // Start with loading locked
    document.body.classList.add('loading-active');

    function initSiteAnimations() {
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
    }

    // --- Apple Time Machine Loader ---
    const loader = document.getElementById('time-machine-loader');
    if (loader) {
        const tmStack = loader.querySelector('.tm-stack');
        // Pre-check dark mode before theme code runs
        const isDark = document.body.classList.contains('dark-mode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        const totalCards = 7; // 1 Red, 5 Intermediate, 1 BG
        const startColor = [255, 39, 81]; // Red
        const endColor = isDark ? [17, 17, 17] : [249, 249, 249];
        
        // Background is solidified in the red accent color. As the cards drop in on top, they carve out their borders towards the center
        loader.style.backgroundColor = `rgb(${startColor[0]}, ${startColor[1]}, ${startColor[2]})`;
        
        for (let i = 0; i < totalCards; i++) {
            const card = document.createElement('div');
            card.className = 'tm-card';
            // Cards get progressively smaller via clip-path, so they must stack ON TOP to leave a visible frame of the previous one
            card.style.zIndex = i + 1; 
            
            const progress = 1 - (i / (totalCards - 1));
            
            const r = Math.round(endColor[0] + (startColor[0] - endColor[0]) * progress);
            const g = Math.round(endColor[1] + (startColor[1] - endColor[1]) * progress);
            const b = Math.round(endColor[2] + (startColor[2] - endColor[2]) * progress);
            
            card.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            
            if (i === 0) {
                // Initial state for front popup card
                card.style.opacity = '0';
                card.style.transform = `scale(0.8)`; // Full screen pops from 80% to 100%
                card.style.clipPath = `inset(0vmin)`;
                card.style.webkitClipPath = `inset(0vmin)`;
            } else {
                // Initial state for newer cards (starts huge near camera)
                card.style.opacity = '0';
                card.style.transform = `scale(2.5)`;
                card.style.clipPath = `inset(0vmin)`;
                card.style.webkitClipPath = `inset(0vmin)`;
            }
            
            tmStack.appendChild(card);
        }
        
        // 1. Pop up the first exactly full screen red card
        setTimeout(() => {
            const firstCard = tmStack.children[0];
            // Slow, lingering settling curve
            firstCard.style.transition = 'transform 2.0s cubic-bezier(0.1, 1, 0.1, 1), clip-path 2.0s ease, -webkit-clip-path 2.0s ease, opacity 0.6s ease';
            firstCard.style.opacity = '1';
            firstCard.style.transform = 'scale(1)';
            firstCard.style.clipPath = 'inset(0vmin)'; 
            firstCard.style.webkitClipPath = 'inset(0vmin)';
            
            // 2. Start heavily overlapping drops for the remaining inner cards
            for (let i = 1; i < totalCards; i++) {
                setTimeout(() => {
                    const c = tmStack.children[i];
                    // Even smoother, longer coasting entrance animation (3.2 seconds)
                    c.style.transition = 'transform 3.2s cubic-bezier(0.1, 1, 0.1, 1), clip-path 3.2s cubic-bezier(0.1, 1, 0.1, 1), -webkit-clip-path 3.2s cubic-bezier(0.1, 1, 0.1, 1), opacity 0.8s ease';
                    c.style.opacity = '1';
                    
                    // Flatten local perspective/size distortions
                    c.style.transform = `scale(1)`;
                    
                    // Allocate exact segments (13 identical thickness units spanning the smallest screen dimension)
                    const offset = i * (100 / 13); 
                    c.style.clipPath = `inset(${offset}vmin)`;
                    c.style.webkitClipPath = `inset(${offset}vmin)`;
                    
                    // 3. If it's the final BG card, we begin the exit sequence
                    if (i === totalCards - 1) {
                        setTimeout(() => {
                            // All layers start zooming simultaneously using exact identical scale math to guarantee zero clipping
                            for(let j = 0; j < totalCards; j++) {
                                const layer = tmStack.children[j];
                                // Match the luxurious 3.2s zoom-in pacing: Outer finishes in 2.0s, innermost finishes in ~3.2s
                                const duration = 2.0 + (j * 0.2); 
                                layer.style.transition = `transform ${duration}s cubic-bezier(0.6, 0.0, 0.1, 1), opacity ${duration - 0.5}s ease 0.2s`;
                                
                                // We scale everyone uniformly up to massive size to shoot past the camera.
                                // Because we ONLY animate scale and not clip-path, the mathematical boundaries are completely locked and can NEVER intersect.
                                layer.style.transform = 'scale(40)'; 
                                
                                if (j < totalCards - 1) {
                                    layer.style.opacity = '0'; // Tunnel framing layers fade out
                                } else {
                                    layer.style.opacity = '1'; // The solid center block securely sweeps across the screen to act as the background floor
                                }
                            }
                            
                            // Reveal site
                            setTimeout(() => {
                                document.body.classList.remove('loading-active');
                                initSiteAnimations();
                                if (typeof updateSmoothIndicator === 'function') updateSmoothIndicator();
                                loader.style.opacity = '0';
                                setTimeout(() => loader.remove(), 1000);
                            }, 1800); // Triggers as soon as the expanding block visually covers the camera, instead of waiting for the full 3.2s technical completion
                            
                        }, 1800); // Paused longer to let the 3.2s coasting entrance breathe
                    }
                }, 300 + (i * 120)); // Slowed entrance stagger slightly (120ms) for better overlap pacing
            }
        }, 150);
    } else {
        document.body.classList.remove('loading-active');
        initSiteAnimations();
    }

    // --- Modern Text Reveal Setup ---
    function wrapWords(element) {
        const nodes = Array.from(element.childNodes);
        nodes.forEach(node => {
            if (node.nodeType === 3) {
                const text = node.nodeValue;
                if (!text.trim() && text !== '\u00A0') return;
                
                const words = text.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                words.forEach(word => {
                    if (/^\s+$/.test(word) || word === '') {
                        fragment.appendChild(document.createTextNode(word));
                    } else {
                        const span = document.createElement('span');
                        span.className = 'reveal-word';
                        span.textContent = word;
                        fragment.appendChild(span);
                    }
                });
                node.parentNode.replaceChild(fragment, node);
            } else if (node.nodeType === 1) {
                // Don't split br tags or already wrapped tags
                if (node.tagName !== 'BR' && !node.classList.contains('reveal-word')) {
                     wrapWords(node);
                }
            }
        });
    }

    document.querySelectorAll('.hero-bio').forEach((bio) => {
        wrapWords(bio);
        
        let wordCount = 0;
        // Search through DOM in order to stagger correctly
        const words = bio.querySelectorAll('.reveal-word');
        words.forEach((word) => {
            const delayTime = wordCount * 0.03;
            word.style.transitionDelay = `${delayTime}s`;
            
            // Match underline timing to the link's words
            const parentLink = word.closest('.fancy-link');
            if (parentLink) {
                // Set the delay, adding 0.4s so it slides in as the text becomes visible
                parentLink.style.setProperty('--underline-delay', `${delayTime + 0.4}s`);
                // Add a helper class so CSS knows this link has dynamic timing
                parentLink.classList.add('dynamic-underline');
            }
            
            wordCount++;
        });
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

    // --- Advanced WebGL Fluid Displacement Background ---
    const interactiveBg = document.querySelector('.interactive-bg');

    if (interactiveBg) {
        interactiveBg.innerHTML = ''; // Start clean
        
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '0';
        interactiveBg.appendChild(canvas);
        
        const frosted = document.createElement('div');
        frosted.className = 'frosted-glass';
        interactiveBg.appendChild(frosted);

        try {
            const gl = canvas.getContext('webgl');
            if (gl) {
            const vsSource = `
                attribute vec2 position;
                void main() {
                    gl_Position = vec4(position, 0.0, 1.0);
                }
            `;

            const fsSource = `
                precision highp float;
                uniform vec2 u_resolution;
                uniform vec2 u_mouse;
                uniform float u_time;
                uniform vec3 u_color;
                uniform vec3 u_bg;

                // 2D Simplex Noise Function needed for soft mesh gradients
                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                float snoise(vec2 v){
                  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                  vec2 i  = floor(v + dot(v, C.yy) );
                  vec2 x0 = v - i + dot(i, C.xx);
                  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                  vec4 x12 = x0.xyxy + C.xxzz;
                  x12.xy -= i1;
                  i = mod(i, 289.0);
                  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                  m = m*m ;
                  m = m*m ;
                  vec3 x = 2.0 * fract(p * C.www) - 1.0;
                  vec3 h = abs(x) - 0.5;
                  vec3 ox = floor(x + 0.5);
                  vec3 a0 = x - ox;
                  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                  vec3 g;
                  g.x  = a0.x  * x0.x  + h.x  * x0.y;
                  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                  return 130.0 * dot(m, g);
                }

                void main() {
                    vec2 st = gl_FragCoord.xy / u_resolution.xy;
                    vec2 noiseSt = st;
                    noiseSt.x *= u_resolution.x / u_resolution.y;

                    vec2 mouse = u_mouse.xy / u_resolution.xy;
                    mouse.x *= u_resolution.x / u_resolution.y;

                    // Extremely wide, gentle displacement force from the mouse (pushing the fog)
                    float dist = distance(noiseSt, mouse);
                    float force = exp(-dist * 2.5) * 0.15;
                    // By subtracting the push vector, we sample coordinates closer to the mouse, 
                    // which effectively "pushes" the drawn texture away from the cursor visually.
                    vec2 push = normalize(noiseSt - mouse + vec2(0.001)) * force;
                    vec2 warpedSt = noiseSt - push;

                    // Large, low-frequency base noise for major movement
                    float baseNoise = snoise(warpedSt * 0.35 + u_time * 0.005) * 0.5 + 0.5;
                    
                    // Secondary, medium-frequency noise to break up solid black areas
                    float detailNoise = snoise(warpedSt * 0.9 - u_time * 0.012) * 0.5 + 0.5;
                    
                    // Topography mapping: turn the noise into concentric, circular waves
                    float topo = sin(baseNoise * 14.0 - u_time * 0.1) * 0.5 + 0.5;
                    
                    // Wide interpolation curves for maximum gradation
                    // This ensures there are never hard edges between colors
                    float topoMask = smoothstep(0.1, 0.9, topo);
                    float baseMask = smoothstep(0.0, 1.0, baseNoise);
                    float detailMask = smoothstep(0.3, 0.7, detailNoise) * 0.15; // Faint background haze
                    
                    // Combine them for a deep, layered feeling with zero "flat" zones
                    float finalMask = (topoMask * baseMask * 0.5) + detailMask;

                    // Blend with accent color
                    vec3 finalColor = mix(u_bg, u_color, finalMask);

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;

            function createShader(gl, type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.error(gl.getShaderInfoLog(shader));
                    gl.deleteShader(shader);
                    return null;
                }
                return shader;
            }

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            const positionLocation = gl.getAttribLocation(program, "position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            const locations = {
                resolution: gl.getUniformLocation(program, "u_resolution"),
                mouse: gl.getUniformLocation(program, "u_mouse"),
                time: gl.getUniformLocation(program, "u_time"),
                color: gl.getUniformLocation(program, "u_color"),
                bg: gl.getUniformLocation(program, "u_bg"),
            };

            let width, height;
            function resize() {
                width = window.innerWidth;
                height = window.innerHeight;
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
                gl.uniform2f(locations.resolution, width, height);
            }
            window.addEventListener('resize', resize);
            resize();

            let targetMouseX = width / 2, targetMouseY = height / 2;
            let currentMouseX = width / 2, currentMouseY = height / 2;
            
            window.addEventListener('mousemove', (e) => {
                // Update global mouse used by the custom custom cursor
                mouseX = e.clientX;
                mouseY = e.clientY;

                // Update target mouse for WebGL shader
                targetMouseX = e.clientX;
                targetMouseY = height - e.clientY; // WebGL Y is flipped
            });

            function hexToRgb(hex) {
                let r = parseInt(hex.slice(1, 3), 16) / 255;
                let g = parseInt(hex.slice(3, 5), 16) / 255;
                let b = parseInt(hex.slice(5, 7), 16) / 255;
                return [r, g, b];
            }

            const accentRgb = hexToRgb('#ff2751');

            function renderWebGL(time) {
                gl.uniform1f(locations.time, time * 0.001);
                
                // Spring-loaded smoothing for organic response
                currentMouseX += (targetMouseX - currentMouseX) * 0.08;
                currentMouseY += (targetMouseY - currentMouseY) * 0.08;
                gl.uniform2f(locations.mouse, currentMouseX, currentMouseY);
                
                gl.uniform3fv(locations.color, accentRgb);

                const isDark = document.body.classList.contains('dark-mode');
                gl.uniform3fv(locations.bg, isDark ? hexToRgb('#111111') : hexToRgb('#f9f9f9'));

                gl.drawArrays(gl.TRIANGLES, 0, 6);
                requestAnimationFrame(renderWebGL);
            }
            requestAnimationFrame(renderWebGL);
        }
    } catch (e) {
        console.error('WebGL background failed to initialize:', e);
    }
    }

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

    // --- Background effect handled in CSS via custom properties ---

    // Trigger Navbar Entrance Animation
    setTimeout(() => {
        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.classList.add('navbar-visible');
    }, 500);
});
