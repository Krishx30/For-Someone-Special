document.addEventListener('DOMContentLoaded', () => {

    // --- Audio Player Logic ---
    const audio = document.getElementById('bg-music');
    const vinylIcon = document.getElementById('vinyl-icon');
    const vinylToggle = document.getElementById('vinyl-toggle');

    let isPlaying = false;
    audio.volume = 0; // start at 0 for fade-in
    
    // Resume music seamlessly if they were playing it on the main page
    if (localStorage.getItem('musicPlaying') === 'true') {
        isPlaying = true;
        vinylIcon.classList.add('spinning');
        audio.volume = 0.5;
        
        const savedTime = localStorage.getItem('audioTime');
        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }

        let playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay blocked
                isPlaying = false;
                vinylIcon.classList.remove('spinning');
                localStorage.setItem('musicPlaying', 'false');
            });
        }
    }

    vinylToggle.addEventListener('click', () => {
        if (isPlaying) {
            fadeOutAudio();
            vinylIcon.classList.remove('spinning');
            localStorage.setItem('musicPlaying', 'false');
            isPlaying = false;
        } else {
            audio.play();
            fadeInAudio();
            vinylIcon.classList.add('spinning');
            localStorage.setItem('musicPlaying', 'true');
            isPlaying = true;
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (isPlaying) {
            localStorage.setItem('audioTime', audio.currentTime);
        }
    });

    function fadeInAudio() {
        let vol = 0;
        audio.volume = vol;
        let fade = setInterval(() => {
            if (vol < 0.5) {
                vol += 0.05;
                audio.volume = Math.min(vol, 0.5);
            } else {
                clearInterval(fade);
            }
        }, 200);
    }
    
    function fadeOutAudio() {
        let vol = audio.volume;
        let fade = setInterval(() => {
            if (vol > 0.05) {
                vol -= 0.05;
                audio.volume = Math.max(0, vol);
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fade);
            }
        }, 200);
    }


    // --- Background Canvas Animations (Terminal Bits/Petals) with Physics ---
    const canvas = document.getElementById('falling-petals');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let petals = [];
    
    let mouse = { x: -1000, y: -1000 };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Petal {
        constructor() {
            this.reset();
            this.y = Math.random() * height; 
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = -20;
            this.size = Math.random() * 3 + 1; 
            this.speedY = Math.random() * 1 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.color = `rgba(255, 105, 180, ${Math.random() * 0.3 + 0.1})`;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.3;

            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let interactRadius = 150;
            
            if (distance < interactRadius) {
                let forceDirectionX = -dx / distance;
                let forceDirectionY = -dy / distance;
                let forceMultiplier = (interactRadius - distance) / interactRadius;
                let repelSpeed = 5; 
                this.x += forceDirectionX * forceMultiplier * repelSpeed;
                this.y += forceDirectionY * forceMultiplier * repelSpeed;
            }

            if (this.y > height + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 60; i++) {
        petals.push(new Petal());
    }

    function animateBg() {
        ctx.clearRect(0, 0, width, height);
        for (let petal of petals) {
            petal.update();
            petal.draw();
        }
        requestAnimationFrame(animateBg);
    }

    animateBg();




    // --- Lightbox Modal Logic ---
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    
    // Gather only actual photo polaroid images (exclude the secret video card)
    const polaroidCards = Array.from(document.querySelectorAll('.polaroid-card:not(.secret-polaroid)'));
    const polaroidImages = polaroidCards.map(card => card.querySelector('.polaroid-img'));
    let currentImageIndex = 0;

    // --- Staggered Polaroid Entrance ---
    polaroidCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, 150 * index);
    });

    // Open lightbox when a polaroid is clicked (not the secret one)
    polaroidCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            currentImageIndex = index;
            updateLightboxImage();
            lightboxOverlay.classList.add('active');
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', () => {
        lightboxOverlay.classList.remove('active');
    });

    // Also close if clicked outside the image
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) {
            lightboxOverlay.classList.remove('active');
        }
    });

    // Navigate logic
    function updateLightboxImage() {
        lightboxImg.src = polaroidImages[currentImageIndex].src;
    }

    function showNext() {
        currentImageIndex = (currentImageIndex + 1) % polaroidImages.length;
        updateLightboxImage();
    }

    function showPrev() {
        currentImageIndex = (currentImageIndex - 1 + polaroidImages.length) % polaroidImages.length;
        updateLightboxImage();
    }

    btnNext.addEventListener('click', showNext);
    btnPrev.addEventListener('click', showPrev);

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (!lightboxOverlay.classList.contains('active')) return;
        
        if (e.key === 'ArrowRight') showNext();
        else if (e.key === 'ArrowLeft') showPrev();
        else if (e.key === 'Escape') lightboxOverlay.classList.remove('active');
    });

    // Swipe detection for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxOverlay.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightboxOverlay.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        // threshold 50px
        if (touchEndX < touchStartX - 50) showNext(); // swipe left -> next
        if (touchEndX > touchStartX + 50) showPrev(); // swipe right -> prev
    }

    // --- Easter Egg Logic ---
    const secretTrigger = document.getElementById('secret-trigger');
    const secretOverlay = document.getElementById('easter-egg-overlay');
    const secretClose = document.getElementById('secret-close');
    const secretVideo = document.getElementById('secret-video');
    
    let clickCount = 0;
    let clickTimeout;

    if (secretTrigger) {
        secretTrigger.addEventListener('click', () => {
            clickCount++;

            // Visual pulse feedback
            secretTrigger.classList.remove('pulse');
            void secretTrigger.offsetWidth; // force reflow to restart animation
            secretTrigger.classList.add('pulse');

            clearTimeout(clickTimeout);
            
            if (clickCount >= 5) {
                // Trigger Easter Egg
                clickCount = 0; // reset
                
                // Pause background music
                if (isPlaying) {
                     audio.pause();
                     vinylIcon.classList.remove('spinning');
                     isPlaying = false;
                     localStorage.setItem('musicPlaying', 'false');
                }
                
                secretOverlay.classList.add('active');
                secretVideo.play().catch(()=>{});
            } else {
                // Reset click count if they stop clicking for 1 second
                clickTimeout = setTimeout(() => {
                    clickCount = 0;
                }, 1000);
            }
        });
    }

    if (secretClose) {
        secretClose.addEventListener('click', () => {
            closeEasterEgg();
        });
    }

    // Also close easter egg if clicked outside the video
    if (secretOverlay) {
        secretOverlay.addEventListener('click', (e) => {
            if (e.target === secretOverlay) {
                closeEasterEgg();
            }
        });
    }

    function closeEasterEgg() {
        secretOverlay.classList.remove('active');
        secretVideo.pause();
        secretVideo.currentTime = 0;
    }

});
