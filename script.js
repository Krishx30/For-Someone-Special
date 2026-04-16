document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const startDate = new Date('2025-08-03T00:00:00');
    
    // DOM Elements
    const typewriterElement = document.getElementById('typewriter-text');
    const loveSection = document.getElementById('love-section');
    const appContainer = document.getElementById('main-app');
    
    const lockScreen = document.getElementById('lock-screen');
    const lockInput = document.getElementById('lock-input');
    
    const audio = document.getElementById('bg-music');
    const vinylIcon = document.getElementById('vinyl-icon');
    const vinylToggle = document.getElementById('vinyl-toggle');

    // --- Audio Player Logic ---
    let isPlaying = false;
    audio.volume = 0; // start at 0 for fade-in
    
    // Check local storage so music keeps playing if they go to the gallery page
    if (localStorage.getItem('musicPlaying') === 'true') {
        isPlaying = true;
        vinylIcon.classList.add('spinning');
        audio.volume = 0.5;
        
        const savedTime = localStorage.getItem('audioTime');
        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }
        // Audio might still be blocked by browser autoplay policy until interacted, 
        // but we attempt it anyway.
        let playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
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
                audio.volume = vol;
            } else {
                audio.pause();
                clearInterval(fade);
            }
        }, 200);
    }

    // --- Lock Screen Logic ---
    const MAGIC_DATE = "08032025";
    
    lockScreen.addEventListener('click', () => {
        lockInput.focus();
    });

    lockInput.addEventListener('input', (e) => {
        if (e.target.value === MAGIC_DATE) {
            unlockSequence();
        }
    });

    function unlockSequence() {
        // Blur out lock screen
        lockInput.blur();
        lockScreen.style.opacity = '0';
        
        // Start music automatically if they unlock it
        if (!isPlaying) {
            audio.play().then(() => {
                fadeInAudio();
                vinylIcon.classList.add('spinning');
                localStorage.setItem('musicPlaying', 'true');
                isPlaying = true;
            }).catch(()=> {
                // Browser might still block until explicit click, that's fine
            });
        }
        
        setTimeout(() => {
            lockScreen.style.display = 'none';
            appContainer.classList.add('unlocked');
            
            // Start the main typing story
            document.getElementById('story-section').classList.add('start-story');
            setTimeout(typeWriter, 500);
        }, 1000);
    }

    // --- The Story text ---
    const storyHtml = `
<span class="comment">/**</span>
<span class="comment"> * THE CODE OF LOVE</span>
<span class="comment"> */</span>

Hey Ajjjuuu!
Do you remember the day our story began?
<span class="comment">// August 3rd, 2025.</span>
Since that day, I've been yours and there has been no looking back; 
pata nahi kaise, I've always felt like we were meant to be;
<span class="comment">// Your face, Your voice, Your words.</span>
Your everything got imprinted in my heart;
As the time went on,
The bond grew stronger and stronger;
sure we have had our fights;
And I'm sure there will be many more;
but our bond will always grow back stronger &lt;3; 

All I want to say is:
Bu, I will love you <span class="keyword">forever and ever</span>;

<span class="comment">// Keep scrolling... &lt;3</span>`;

    // --- Typewriter Logic ---
    let i = 0;
    let isTag = false;
    let text = storyHtml.trim();
    
    function typeWriter() {
        if (i < text.length) {
            let currentStr = text.slice(0, i + 1);
            
            if (text.charAt(i) === '<') isTag = true;
            if (text.charAt(i) === '>') isTag = false;
            
            if (text.charAt(i) === '&' && text.slice(i, i+4) === '&lt;') {
                 i += 3; 
                 currentStr = text.slice(0, i + 1);
            }
            
            typewriterElement.innerHTML = currentStr;
            i++;
            
            let speed = isTag ? 0 : Math.random() * 40 + 30;
            
            if (!isTag && (text.charAt(i-1) === '.' || text.charAt(i-1) === '?' || text.charAt(i-1) === ';')) {
                speed = 400;
            }
            if (!isTag && text.charAt(i-1) === '\n') {
                speed = 250;
            }

            setTimeout(typeWriter, speed);
        } else {
            setTimeout(() => {
                loveSection.classList.add('visible');
            }, 800);
        }
    }
    
    // --- Timer Logic ---
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateTimer() {
        const now = new Date();
        const diff = now - startDate;
        const past = Math.max(0, diff); 

        const days = Math.floor(past / (1000 * 60 * 60 * 24));
        const hours = Math.floor((past % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((past % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((past % (1000 * 60)) / 1000);

        daysEl.innerText = days;
        hoursEl.innerText = hours.toString().padStart(2, '0');
        minutesEl.innerText = minutes.toString().padStart(2, '0');
        secondsEl.innerText = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    // --- Background Canvas Animations (Terminal Bits/Petals) with Physics ---
    const canvas = document.getElementById('falling-petals');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let petals = [];
    
    // Track pointer coordinates for interactive physics
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
    
    // Reset mouse pos when off screen
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
            // Apply normal gravity
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.3;

            // Physics Logic: Interaction with mouse
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            let interactRadius = 150; // The force field size
            
            if (distance < interactRadius) {
                // Calculate push force based on how close they are
                let forceDirectionX = -dx / distance;
                let forceDirectionY = -dy / distance;
                let forceMultiplier = (interactRadius - distance) / interactRadius;
                
                // Set max repel force
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
});
