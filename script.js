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

        // Reveal logic for other static elements
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
        
        // Muted and Desaturated for a more sophisticated, "brushed metal" ruby look
        // Adjusted proportionally to be lighter since background shifted from #111111 to #141414
        const startColor = [176, 70, 88]; 
        const endColor = isDark ? [20, 20, 20] : [249, 249, 249];
        
        // Background is made transparent so the interactive topography canvas can be seen through the shapes
        loader.style.backgroundColor = 'transparent';
        
        for (let i = 0; i < totalCards; i++) {
            const card = document.createElement('div');
            card.className = 'tm-card';
            // Cards get progressively smaller via clip-path, so they must stack ON TOP to leave a visible frame of the previous one
            card.style.zIndex = i + 1; 
            
            const progress = 1 - (i / (totalCards - 1));
            
            const r = Math.round(endColor[0] + (startColor[0] - endColor[0]) * progress);
            const g = Math.round(endColor[1] + (startColor[1] - endColor[1]) * progress);
            const b = Math.round(endColor[2] + (startColor[2] - endColor[2]) * progress);
            
            // Organic, frosted glass effect that directly lenses the topography background
            card.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${0.05 + progress * 0.3})`;
            // Adds heavy blurring to further separate the layers, creating a deep liquid look
            card.style.backdropFilter = `blur(${6 + i * 2}px) saturate(1.2)`;
            card.style.webkitBackdropFilter = `blur(${6 + i * 2}px) saturate(1.2)`;
            // Very subtle rim was removed to eliminate any rectangular edge visibility against the background
            // card.style.border = `1px solid rgba(255, 255, 255, ${0.05 + progress * 0.15})`;
            
            if (i === 0) {
                // Initial state for front popup card
                card.style.opacity = '0';
                card.style.transform = `scale(1.1) rotate(0deg)`; // Card starts larger than viewport to hide its edges
                card.style.clipPath = `ellipse(150vmin 150vmin at 50% 50%)`;
                card.style.webkitClipPath = `ellipse(150vmin 150vmin at 50% 50%)`;
            } else {
                // Initial state for newer cards (starts huge near camera with a slight swirl)
                card.style.opacity = '0';
                card.style.transform = `scale(2.5) rotate(-20deg)`;
                card.style.clipPath = `ellipse(150vmin 150vmin at 50% 50%)`;
                card.style.webkitClipPath = `ellipse(150vmin 150vmin at 50% 50%)`;
            }
            
            tmStack.appendChild(card);
        }
        
        // 1. Pop up the first exactly full screen red card
        setTimeout(() => {
            const firstCard = tmStack.children[0];
            // Slow, lingering settling curve
            firstCard.style.transition = 'transform 2.0s cubic-bezier(0.1, 1, 0.1, 1), clip-path 2.0s ease, -webkit-clip-path 2.0s ease, opacity 0.6s ease';
            firstCard.style.opacity = '1';
            firstCard.style.transform = 'scale(1) rotate(0deg)';
            firstCard.style.clipPath = 'ellipse(150vmin 150vmin at 50% 50%)'; 
            firstCard.style.webkitClipPath = 'ellipse(150vmin 150vmin at 50% 50%)';
            
            // 2. Start heavily overlapping drops for the remaining inner cards
            for (let i = 1; i < totalCards; i++) {
                setTimeout(() => {
                    const c = tmStack.children[i];
                    // Even smoother, longer coasting entrance animation (3.2 seconds)
                    c.style.transition = 'transform 3.2s cubic-bezier(0.1, 1, 0.1, 1), clip-path 3.2s cubic-bezier(0.1, 1, 0.1, 1), -webkit-clip-path 3.2s cubic-bezier(0.1, 1, 0.1, 1), opacity 0.8s ease';
                    c.style.opacity = '1';
                    
                    // Flatten local perspective/size distortions, settle the swirl
                    c.style.transform = `scale(1) rotate(0deg)`;
                    
                    // Create soft, topography-like concentric ovals shrinking towards the center
                    // We slightly alternate the radii to make them look wavy/organic instead of perfect circles
                    const span = 55; // Base max radius size
                    const rx = span - (i * (span / totalCards)) + (i % 2 === 0 ? 8 : 0); 
                    const ry = span - (i * (span / totalCards)) + (i % 2 !== 0 ? 8 : 0); 
                    
                    c.style.clipPath = `ellipse(${rx}vmin ${ry}vmin at 50% 50%)`;
                    c.style.webkitClipPath = `ellipse(${rx}vmin ${ry}vmin at 50% 50%)`;
                    
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
                                // We add a final clockwise swirl to match the new background
                                layer.style.transform = `scale(40) rotate(${15 + j * 5}deg)`; 
                                
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
                                 if (typeof updateSectionParallax === 'function') updateSectionParallax();
                                 
                                 // Trigger matching UI entrance animations for top (navbar) and bottom (toggle)
                                 const navbar = document.querySelector('.navbar');
                                 const themeToggle = document.querySelector('.theme-toggle');
                                 if (navbar) navbar.classList.add('navbar-visible');
                                 if (themeToggle) themeToggle.classList.add('toggle-visible');

                                 loader.style.opacity = '0';
                                 setTimeout(() => loader.remove(), 1000);
                             }, 1800); 
                            
                        }, 1800); // Paused longer to let the 3.2s coasting entrance breathe
                    }
                }, 300 + (i * 120)); // Slowed entrance stagger slightly (120ms) for better overlap pacing
            }
        }, 150);
    } else {
        document.body.classList.remove('loading-active');
        initSiteAnimations();
        if (typeof updateSmoothIndicator === 'function') updateSmoothIndicator();
        if (typeof updateSectionParallax === 'function') updateSectionParallax();
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

    const updateSectionParallax = () => {
        const scrollTop = scrollContainer.scrollTop;
        const vh = window.innerHeight;
        const sections = document.querySelectorAll('.section');
        
        // Map nav links to their target sections originally (reusing the logic for parallax positioning)
        const navItemsLocal = Array.from(navLinks).map(link => {
            const targetId = link.getAttribute('href');
            let targetSection = null;
            if (targetId && targetId !== '#') targetSection = document.querySelector(targetId);
            return { offsetTop: targetSection ? targetSection.offsetTop : 0 };
        });

        sections.forEach((section, index) => {
            const container = section.querySelector('.content-container');
            if (!container) return;

            const sectionMiddle = navItemsLocal[index] ? navItemsLocal[index].offsetTop : (index * vh);
            
            // Skip parallax for Section 2 (Projects) as it is now a vertical snapped stack for all devices
            if (index === 1) {
                container.style.transform = '';
                container.style.opacity = '1';
                return;
            }
            
            // Normalize scroll distance based on a fixed viewport pivot (1000px) 
            // instead of the raw variable 'vh' to keep the physical pixel-per-scroll 
            // speed identical across all devices.
            const normalizationPivot = 1000;
            const progress = Math.max(-1, Math.min(1, (scrollTop - sectionMiddle) / normalizationPivot));

            // Applied directly as inline styles for maximum 1-to-1 responsiveness
            // We use the actual vh here for the movement intensity so it stays proportionally correct to the screen.
            const translateY = progress * (vh * 0.20); 
            const scale = 1 - Math.abs(progress) * 0.05; 
            const opacity = 1 - Math.abs(progress) * 1.5; 

            container.style.transform = `translateY(${translateY}px) scale(${scale})`;
            container.style.opacity = Math.max(0, opacity);
            // Dynamic blur removed for cleaner high-definition look

        });
    };

    const updateSmoothIndicator = () => {
        if (!indicator) return;

        const navItems = Array.from(navLinks).map(link => {
            const targetId = link.getAttribute('href');
            let targetSection = null;
            if (targetId && targetId !== '#') targetSection = document.querySelector(targetId);
            
            // Critical fix for flattened layouts (display: contents)
            // If the section itself has no offset, pick its first visual child (the cards)
            let offset = targetSection ? targetSection.offsetTop : 0;
            if (targetSection && targetSection.classList.contains('projects') && offset === 0) {
                const firstCard = targetSection.querySelector('.project-card');
                if (firstCard) offset = firstCard.offsetTop;
            }

            return {
                link: link,
                section: targetSection,
                offsetTop: offset
            };
        }).filter(item => item.section);

        const scrollTop = scrollContainer.scrollTop;
        const vh = window.innerHeight;

        const homeSection = navItems[0];
        const projectsSection = navItems[1];
        const aboutSection = navItems[2];

        // Track the bottom of the projects stack (last card)
        const projectCards = Array.from(projectsSection.section.querySelectorAll('.project-card'));
        const lastCard = projectCards[projectCards.length - 1];
        const projectsEnd = aboutSection ? aboutSection.offsetTop : (projectsSection.offsetTop + projectCards.length * vh);
        const lastCardTop = lastCard ? lastCard.offsetTop : (projectsEnd - vh);

        // Counter visibility logic and active zone tracking
        // We use a small offset (+/-10px) to prevent flicker on Home page
        if (scrollTop >= projectsSection.offsetTop - 10 && scrollTop < projectsEnd - vh / 2) {
            projectsSection.section.classList.add('is-active-zone');
            document.body.classList.add('is-projects-active');
            
            // Update counter text and timeline bars based on proximity
            // Use actual card step for robust calculation on mobile
            const cardStep = (projectCards.length > 1) ? (projectCards[1].offsetTop - projectCards[0].offsetTop) : vh;
            const rawProgress = (scrollTop - projectsSection.offsetTop) / cardStep;
            const currentCardIndex = Math.min(projectCards.length, Math.max(1, Math.round(rawProgress) + 1));
            
            const countCurrentDisplay = document.querySelector('.count-current');
            if (countCurrentDisplay) {
                countCurrentDisplay.textContent = String(currentCardIndex).padStart(2, '0');
            }

            // Timeline bar proximity scaling - switching to 'width' for natural flex-pushing behavior
            const bars = document.querySelectorAll('.timeline-bar');
            bars.forEach((bar, i) => {
                const distance = Math.abs(rawProgress - i);
                const proximity = Math.max(0, 1 - distance * 0.8);
                
                // Active status based on nearest index
                bar.classList.toggle('active', i === currentCardIndex - 1);
                
                // Real-time smooth width and opacity boost
                const baseWidth = 24;
                const targetWidth = baseWidth + (proximity * 48); // Expands up to +48px (total 72px)
                const opacity = 0.3 + proximity * 0.7; // Brighter focus
                
                bar.style.width = `${Math.round(targetWidth)}px`;
                bar.style.opacity = opacity;

                // Add click listener to navigate to the project card
                if (!bar.hasListener) {
                    bar.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (projectCards[i]) {
                            scrollContainer.scrollTo({
                                top: projectCards[i].offsetTop,
                                behavior: 'smooth'
                            });
                        }
                    });
                    bar.hasListener = true;
                }
            });
        } else {
            projectsSection.section.classList.remove('is-active-zone');
            document.body.classList.remove('is-projects-active');
        }

        let startIndex = 0;
        let endIndex = 0;
        let t = 0;

        // --- Sophisticated 3-Zone Mapping for Smooth Sliding ---
        if (scrollTop < projectsSection.offsetTop) {
            // Zone 1: Home to Projects (Interpolated Sliding)
            startIndex = 0;
            endIndex = 1;
            const dist = projectsSection.offsetTop - homeSection.offsetTop;
            t = Math.max(0, Math.min(1, (scrollTop - homeSection.offsetTop) / dist));
        } 
        else if (scrollTop < lastCardTop) {
            // Zone 2: Inside Projects Stack (Locked to PROJECTS)
            startIndex = 1;
            endIndex = 1;
            t = 0;
        }
        else {
            // Zone 3: Projects to About (Interpolated Sliding)
            startIndex = 1;
            endIndex = 2;
            const dist = aboutSection.offsetTop - lastCardTop;
            t = Math.max(0, Math.min(1, (scrollTop - lastCardTop) / dist));
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

        // Handle active class highlighting
        navItems.forEach((item, index) => {
            const isActive = (index === startIndex && t < 0.5) || (index === endIndex && t >= 0.5);
            item.link.classList.toggle('active', isActive);
        });
    };



    // Unified scroll execution engine
    const runUnifiedScrollUpdates = () => {
        window.requestAnimationFrame(() => {
            updateSmoothIndicator();
            updateSectionParallax();
            
            // Sync theme button rotation
            const themeBtnLocal = document.querySelector('.theme-toggle');
            if (themeBtnLocal) {
                const scrollDistance = scrollContainer.scrollTop;
                themeBtnLocal.style.transform = `rotate(${scrollDistance * 0.15}deg)`;
            }
        });
    };

    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', runUnifiedScrollUpdates);
        
        // Initial positioning for the landing state
        window.requestAnimationFrame(runUnifiedScrollUpdates);
        window.addEventListener('resize', runUnifiedScrollUpdates);
    }

    // Modern Nav link handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const targetSection = document.querySelector(targetId);

            if (targetSection && scrollContainer) {
                scrollContainer.style.scrollSnapType = 'none';
                targetSection.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    scrollContainer.style.scrollSnapType = 'y mandatory';
                }, 800);
            }
        });
    });

    // Theme Toggle logic
    const themeBtn = document.querySelector('.theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

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

    // Portfolio interaction sync
    const portfolioOverlay = document.getElementById('photography-portfolio');
    if (portfolioOverlay && themeBtn) {
        portfolioOverlay.addEventListener('scroll', () => {
             window.requestAnimationFrame(() => {
                 themeBtn.style.transform = `rotate(${portfolioOverlay.scrollTop * 0.15}deg)`;
             });
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
                // Specialized fix for display:contents containers (Projects)
                let scrollTarget = targetSection;
                if (targetId === '#other-projects') {
                    const firstCard = targetSection.querySelector('.project-card');
                    if (firstCard) scrollTarget = firstCard;
                }

                // Temporarily disable scroll snapping for a smoother animated transition
                scrollContainer.style.scrollSnapType = 'none';

                // Calculate exact top offset to ensure it reaches the child if parent is display:contents
                const targetOffset = scrollTarget.offsetTop;
                scrollContainer.scrollTo({
                    top: targetOffset,
                    behavior: 'smooth'
                });

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
                    // Start Two-Stage Sequence
                    setTimeout(() => {
                        // Phase 1: Photography card pops up in the center
                        accordionContainer.classList.add('animate-pop-middle');

                        setTimeout(() => {
                            // Phase 2: Once the pop finishes, others slide out from behind
                            accordionContainer.classList.remove('entrance-hidden');
                            accordionContainer.classList.add('animate-slide-out');

                            // Final Cleanup
                            setTimeout(() => {
                                accordionContainer.classList.remove('animate-pop-middle');
                                accordionContainer.classList.remove('animate-slide-out');
                            }, 2000); // Wait for the slow 1.8s slide to finish
                        }, 800); 
                    }, 500);

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

                mat2 rotate(float angle) {
                    return mat2(cos(angle), -sin(angle),
                                sin(angle), cos(angle));
                }

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

                    // Centered orbit: entire pattern rotates clockwise
                    vec2 centeredSt = (noiseSt - vec2(0.5 * u_resolution.x / u_resolution.y, 0.5));
                    centeredSt *= rotate(-u_time * 0.12); // Higher frequency for global spin
                    vec2 rotatedSt = centeredSt + vec2(0.5 * u_resolution.x / u_resolution.y, 0.5);

                    // Displacement force from the mouse (pushing the fog)
                    float dist = distance(rotatedSt, mouse);
                    float force = exp(-dist * 2.5) * 0.15;
                    
                    // Repulsion vector (pushing away from the cursor)
                    // We use original noiseSt vs mouse for direct physical feeling
                    vec2 push = normalize(noiseSt - mouse + vec2(0.001)) * force;
                    
                    // Warp: global rotated coordinates + mouse displacement + local swirling rotation
                    vec2 warpedSt = rotatedSt - push;
                    // Secondary internal swirl to make the blobs themselves rotate clockwise
                    warpedSt = (warpedSt - vec2(0.5 * u_resolution.x / u_resolution.y, 0.5)) * rotate(-u_time * 0.05) + vec2(0.5 * u_resolution.x / u_resolution.y, 0.5);
                    
                    // Large, low-frequency base noise for major movement
                    float baseNoise = snoise(warpedSt * 0.35 + u_time * 0.009) * 0.5 + 0.5;
                    
                    // Persistent central oval blob logic
                    vec2 centerPos = vec2(0.5 * u_resolution.x / u_resolution.y, 0.5);
                    // We use rotatedSt so the "squish" of the oval rotates clockwise with the pattern
                    vec2 toCenter = rotatedSt - centerPos;
                    float ovalDist = length(toCenter * vec2(0.7, 1.3)); // Squish to create an oval
                    // Zone size increased to 0.8 for a much larger clean area behind text
                    float centerBlob = 1.0 - smoothstep(0.0, 0.8, ovalDist);
                    
                    // Bias the noise field towards the center to ensure a constant "presence"
                    baseNoise = mix(baseNoise, 1.0, centerBlob * 0.45);
                    
                    // Secondary, medium-frequency noise to break up solid black areas
                    float detailNoise = snoise(warpedSt * 0.9 - u_time * 0.02) * 0.5 + 0.5;
                    
                    // Lowered topography frequency (14.0 -> 7.0) to reduce "strandiness" and make waves thicker
                    float topo = sin(baseNoise * 7.5 - u_time * 0.15) * 0.5 + 0.5;
                    
                    // Ultra-soft masking to eliminate any perceived "hard" strands
                    float topoMask = pow(topo, 1.2) * 0.6; // Soften the peak of each wavy layer
                    float baseMask = pow(baseNoise, 1.0); // Keep the base large and fluid
                    
                    // Increase the reach of the faint detail haze to fill in "empty" zones
                    float detailMask = detailNoise * 0.25; 
                    
                    // Final composition: we multiply by (1.0 - centerBlob) to suppress color in the middle
                    // This creates a clean "hole" in the patterns for the center text to remain readable
                    float finalMask = ((topoMask * baseMask) + detailMask) * (1.0 - centerBlob * 0.9);

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
                
                const isDark = document.body.classList.contains('dark-mode');
                
                // Using extremely subtle tints/shades of our brand red (#ff2751)
                // This brings back the brand's warmth but stays sophisticated and low-contrast
                // Using a 25/75 blend between brand red (#ff2751) and our background colors
                // This creates a much more subtle, sophisticated "branded haze"
                const bgHex = isDark ? '#141414' : '#f9f9f9';
                const accentHex = isDark ? '#5a1b26' : '#adadad'; // Neutral grey for light mode (equivalent contrast)

                gl.uniform3fv(locations.bg, hexToRgb(bgHex));
                gl.uniform3fv(locations.color, hexToRgb(accentHex));

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
        const snapEl = e.target.closest('a, button, .scroll-btn, .nav-link, .theme-toggle, .contact-link-wrap, .close-portfolio, .close-lightbox, .timeline-bar');
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
        const snapEl = e.target.closest('a, button, .project-card, .scroll-btn, .nav-link, .theme-toggle, .contact-link-wrap, .close-portfolio, .close-lightbox, .timeline-bar');
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

        if (snapTarget && window.innerWidth > 1024) {
            const rect = snapTarget.getBoundingClientRect();
            let padding = 12; // Standard padding for all buttons

            // Specialized interaction for timeline bars to prevent the 'stuck' feeling
            if (snapTarget.classList.contains('timeline-bar')) {
                // No horizontal pull - let the mouse move freely along the bar's width
                targetX = mouseX; 
                // Only snap to the vertical center of the bar
                targetY = rect.top + rect.height / 2;
                padding = 8; // Tighter padding for bars
                
                targetW = rect.width + padding * 2;
                targetH = rect.height + padding * 2;
            } else {
                // Magnetic pull for standard icons/buttons: move target towards the center
                targetX = rect.left + rect.width / 2;
                targetY = rect.top + rect.height / 2;

                // Standardize snap size for fixed buttons
                if (snapTarget.classList.contains('theme-toggle') || snapTarget.classList.contains('close-portfolio')) {
                    targetW = 50 + padding * 2;
                    targetH = 50 + padding * 2;
                } else {
                    targetW = rect.width + padding * 2;
                    targetH = rect.height + padding * 2;
                }
            }

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


});
