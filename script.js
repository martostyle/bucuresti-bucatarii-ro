// Main initialization
const initApp = () => {
    const overlay = document.getElementById('image-overlay');
    const overlayImg = document.getElementById('overlay-img');

    const initGalleryInteraction = (galleryId, animation) => {
        const gallery = document.getElementById(galleryId);
        if (!gallery) return;

        gallery.addEventListener('mouseenter', () => animation.pause());
        gallery.addEventListener('mouseleave', () => animation.play());

        const items = gallery.querySelectorAll('.gallery-item');
        items.forEach(item => {
            const img = item.querySelector('img');
            item.addEventListener('mouseenter', () => {
                if (img && overlayImg) overlayImg.src = img.src;
                if (overlay) overlay.classList.add('active');
            });
            item.addEventListener('mouseleave', () => {
                if (overlay) overlay.classList.remove('active');
            });
        });
    };

    const isMobile = window.innerWidth <= 768;
    const maxImages = 33;
    const basePath = "assets/kitchen";
    const ext = ".jpg";

    const loadValidImages = async () => {
        const validIds = [];
        const promises = [];
        for (let i = 1; i <= maxImages; i++) {
            promises.push(new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(i);
                img.onerror = () => resolve(null);
                img.src = `${basePath}${i}${ext}`;
            }));
        }
        const results = await Promise.all(promises);
        return results.filter(id => id !== null).sort((a, b) => a - b);
    };

    const setupGalleries = async () => {
        let validIds = await loadValidImages();
        // Fallback or empty if needed. If user has 'kitchen1.jpg', 'kitchen2.jpg', they will load correctly.
        if (validIds.length === 0) validIds = [1, 2, 3];

        // Randomize the starting point
        const startIndex = Math.floor(Math.random() * validIds.length);
        const randomizedIds = [
            ...validIds.slice(startIndex),
            ...validIds.slice(0, startIndex)
        ];

        const buildHTML = () => {
            let html = '';
            randomizedIds.forEach(id => {
                html += `<div class="gallery-item"><img src="${basePath}${id}${ext}" alt="Kitchen ${id}"></div>`;
            });
            randomizedIds.forEach(id => {
                html += `<div class="gallery-item"><img src="${basePath}${id}${ext}" alt="Kitchen ${id}"></div>`;
            });
            return html;
        };

        if (isMobile) {
            const galleryMobile = document.getElementById('gallery-loop-mobile');
            if (galleryMobile) {
                galleryMobile.innerHTML = buildHTML();
                // small delay to permit layout
                setTimeout(() => {
                    const itemsMobile = galleryMobile.querySelectorAll('.gallery-item');
                    if (itemsMobile.length > 0) {
                        // total width of one full set of images + gaps
                        const totalWidth = Array.from(itemsMobile).slice(0, randomizedIds.length).reduce((acc, item) => acc + item.offsetWidth + 15, 0);
                        const durationMobile = Math.max(25, (randomizedIds.length / 3) * 25);
                        const animationMobile = gsap.fromTo(galleryMobile,
                            { x: 0 },
                            { x: -totalWidth, duration: durationMobile, ease: "none", repeat: -1 }
                        );
                        initGalleryInteraction('gallery-loop-mobile', animationMobile);
                    }
                }, 100);
            }
        } else {
            const galleryDesktop = document.getElementById('gallery-loop-desktop');
            if (galleryDesktop) {
                galleryDesktop.innerHTML = buildHTML();
                setTimeout(() => {
                    const itemsDesktop = galleryDesktop.querySelectorAll('.gallery-item');
                    if (itemsDesktop.length > 0) {
                        const totalHeight = Array.from(itemsDesktop).slice(0, validIds.length).reduce((acc, item) => acc + item.offsetHeight + 30, 0);
                        const durationDesktop = Math.max(30, (validIds.length / 3) * 30);
                        const animationDesktop = gsap.to(galleryDesktop, {
                            y: -totalHeight,
                            duration: durationDesktop,
                            ease: "none",
                            repeat: -1
                        });
                        initGalleryInteraction('gallery-loop-desktop', animationDesktop);
                    }
                }, 100);
            }
        }
    };

    setupGalleries();

    const modal = document.getElementById('quotation-modal');
    const openBtn = document.getElementById('project-cta');
    const closeBtn = document.querySelector('.close-modal');

    const setupFileInput = (inputId, nameId, previewsId) => {
        const input = document.getElementById(inputId);
        const nameDisplay = document.getElementById(nameId);
        const previewsContainer = document.getElementById(previewsId);
        if (!input || !nameDisplay || !previewsContainer) return;

        // Използваме DataTransfer за управление на файловете (позволява изтриване)
        let dt = new DataTransfer();

        const updateDisplay = () => {
            const files = dt.files;
            previewsContainer.innerHTML = '';

            if (files.length > 0) {
                nameDisplay.textContent = files.length === 1 ? files[0].name : `${files.length} fișiere selectate`;
                nameDisplay.style.color = "#D4AF37";

                Array.from(files).forEach((file, index) => {
                    const reader = new FileReader();
                    const item = document.createElement('div');
                    item.className = 'preview-item';

                    const removeBtn = document.createElement('div');
                    removeBtn.className = 'remove-btn';
                    removeBtn.innerHTML = '&times;';
                    removeBtn.onclick = (e) => {
                        e.stopPropagation();
                        const newDt = new DataTransfer();
                        Array.from(dt.files).filter((_, i) => i !== index).forEach(f => newDt.items.add(f));
                        dt = newDt;
                        input.files = dt.files;
                        updateDisplay();
                    };

                    if (file.type.startsWith('image/')) {
                        reader.onload = (e) => {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            item.appendChild(img);
                            item.appendChild(removeBtn);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        const icon = document.createElement('div');
                        icon.className = 'file-icon';
                        icon.textContent = file.name.split('.').pop() || 'FILE';
                        item.appendChild(icon);
                        item.appendChild(removeBtn);
                    }
                    previewsContainer.appendChild(item);
                });
            } else {
                nameDisplay.textContent = "Niciun fișier selectat";
                nameDisplay.style.color = "rgba(255,255,255,0.5)";
            }
        };

        input.addEventListener('change', (e) => {
            const newFiles = Array.from(e.target.files);
            newFiles.forEach(file => dt.items.add(file));
            input.files = dt.files;
            updateDisplay();
        });
    };

    setupFileInput('kitchen_files', 'name-files', 'file-previews-container');

    if (openBtn && modal) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            gsap.set(openBtn, { clearProps: "transform" });
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = isMobile ? 'auto' : 'hidden';
        });
    }

    const form = document.getElementById('quotation-form');
    if (form) {
        form.querySelectorAll('input[required]').forEach(input => {
            input.addEventListener('invalid', (e) => e.target.setCustomValidity('Vă rugăm să completați acest câmp'));
            input.addEventListener('input', (e) => e.target.setCustomValidity(''));
        });
        form.addEventListener('submit', () => {
            const submitBtn = form.querySelector('.submit-btn');
            if (submitBtn) submitBtn.innerHTML = 'Se trimite...';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = isMobile ? 'auto' : 'hidden';
        }
    });

    // ── Magnetic CTA — 2 зони ──────────────────────────────────────────────────
    //
    //  [ ЛЯВА 0–40% — бутонът стои ][ ДЯСНА 41–100% — бутонът гони ]
    //
    //  Максимално отместване по X: до 40% границата на hero секцията
    //  (бутонът не може да отиде по-далеч вдясно от 40% mark)
    //

    const btnMagnet = document.getElementById('project-cta');
    const heroSection = document.querySelector('.hero-section');
    const animWrapper = document.getElementById('animated-btn-wrapper');
    const ctaWrapper = document.querySelector('.cta-wrapper');

    const snapHome = () => {
        gsap.killTweensOf(btnMagnet);
        gsap.to(btnMagnet, {
            x: 0, y: 0,
            duration: 0.5,
            ease: "power3.out",
            onComplete: () => gsap.set(btnMagnet, { clearProps: "transform" })
        });
    };

    if (btnMagnet && heroSection && animWrapper && ctaWrapper) {

        let inChaseZone = false;

        // ── Пауза на анимацията само когато мишката е директно върху бутона ──
        btnMagnet.addEventListener('mouseenter', () => {
            animWrapper.classList.add('paused');
        });
        btnMagnet.addEventListener('mouseleave', () => {
            animWrapper.classList.remove('paused');
        });

        // Only apply mousemove magnetic tracking if it's NOT a mobile device
        if (!isMobile) {
            heroSection.addEventListener('mousemove', (e) => {
                const heroRect = heroSection.getBoundingClientRect();
                const heroW = heroRect.width;

                // Относителна X позиция на мишката спрямо hero секцията
                const relX = e.clientX - heroRect.left;

                // Само 2 зони: 0–40% ЛЯВА (стой) | 41–100% ДЯСНА (гони)
                const inRight = relX > heroW * 0.40;

                if (!inRight) {
                    // ── Лява зона → snap на 0,0 ──
                    if (inChaseZone) {
                        inChaseZone = false;
                        snapHome();
                    }
                    return;
                }

                // ── Дясна зона → магнитен ефект (игривата анимация продължава) ──
                inChaseZone = true;

                // Оригинален център на бутона (ctaWrapper не се мести)
                const rect = ctaWrapper.getBoundingClientRect();
                const origX = rect.left + rect.width / 2;
                const origY = rect.top + rect.height / 2;

                // MAX_MOVE по X = 4× разстоянието от центъра на бутона до 40% границата
                // (двойно повече от преди)
                const boundary40 = heroRect.left + heroW * 0.40;
                const maxMoveX = Math.max((boundary40 - origX) * 8, 320); // 8× дистанция
                const maxMoveY = 240; // вертикален таван



                const dxOrig = e.clientX - origX;
                const dyOrig = e.clientY - origY;

                // Директно следи мишката, таван = 2× от 40% границата
                const targetX = Math.max(-maxMoveX, Math.min(dxOrig, maxMoveX));
                const targetY = Math.max(-maxMoveY, Math.min(dyOrig, maxMoveY));

                gsap.to(btnMagnet, {
                    x: targetX,
                    y: targetY,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });

            heroSection.addEventListener('mouseleave', () => {
                inChaseZone = false;
                animWrapper.classList.remove('paused');
                gsap.killTweensOf(btnMagnet);
                gsap.to(btnMagnet, {
                    x: 0, y: 0,
                    duration: 0.9,
                    ease: "elastic.out(1, 0.3)",
                    onComplete: () => gsap.set(btnMagnet, { clearProps: "transform" })
                });
            });
        }

        const videoBg = document.getElementById('hero-video');
        const bg2 = document.getElementById('hero-bg-2');
        const bg3 = document.getElementById('hero-bg-3');

        if (videoBg && bg2 && bg3) {
            // Промяна: Функцията за циклично редуване
            const startBgCycle = () => {
                videoBg.addEventListener('ended', () => {
                    // Първо потъмняване (изчакване по-малко от преди 5сек -> 2сек)
                    setTimeout(() => {
                        // Плавно преливане към Втори бекграунд
                        gsap.set(bg2, { display: 'block', opacity: 0 });
                        gsap.to(videoBg, { opacity: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => { videoBg.style.display = 'none'; } });
                        gsap.to(bg2, { opacity: 1, duration: 0.8, ease: "power2.inOut" });

                        // След 10 сек. преминаване към Трети бекграунд
                        setTimeout(() => {
                            gsap.set(bg3, { display: 'block', opacity: 0 });
                            gsap.to(bg2, { opacity: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => { bg2.style.display = 'none'; } });
                            gsap.to(bg3, { opacity: 1, duration: 0.8, ease: "power2.inOut" });

                            // След още 10 сек. връщане към Първия (видео)
                            setTimeout(() => {
                                gsap.set(videoBg, { display: 'block', opacity: 0 });
                                videoBg.currentTime = 0;
                                videoBg.play();
                                gsap.to(bg3, { opacity: 0, duration: 0.8, ease: "power2.inOut", onComplete: () => { bg3.style.display = 'none'; } });
                                gsap.to(videoBg, { opacity: 0.5, duration: 0.8, ease: "power2.inOut" });

                                // Цикълът се самоподдържа чрез 'ended' на видеото
                            }, 10000);
                        }, 10000);
                    }, 2000);
                });
            };
            startBgCycle();
        }
    };

}; // End of initApp

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

window.addEventListener('load', () => { document.body.classList.add('loaded'); });
