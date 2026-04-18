document.addEventListener('DOMContentLoaded', () => {

    // ── Midnight theme ────────────────────────────────────────────────────────
    const currentHour = new Date().getHours();
    if (currentHour < 5) document.body.classList.add('midnight-theme');

    // ── Config ────────────────────────────────────────────────────────────────
    const startDate    = new Date('2025-03-28T00:00:00');
    const CORRECT_CODE = '03282025';

    const errorMessages = [
        "ouch!! that's definitely wrong 😭 try again bestie",
        "nope, not even close 💀 think harder!",
        "baby no 😭 that's not it, try again!",
        "wrong answer, but full marks for confidence 😂",
        "my heart says no 💔 try again!",
        "are you even trying?? 🥺 come on!",
        "that hurt a little ngl 😔 wrong answer!",
        "404: correct date not found 😅 try again?",
        "sarthak would be disappointed rn 😤 try again!",
        "lol no 😂 remember our anniversary babeee",
    ];
    let errorCount = 0;

    // ── DOM refs ──────────────────────────────────────────────────────────────
    const typewriterEl = document.getElementById('typewriter-text');
    const appContainer = document.getElementById('main-app');
    const lockScreen   = document.getElementById('lock-screen');
    const lockInput    = document.getElementById('lock-input');
    const errorText    = document.getElementById('error-text');
    const audio        = document.getElementById('bg-music');
    const vinylDisc    = document.getElementById('vinyl-icon');
    const vinylToggle  = document.getElementById('vinyl-toggle');
    const vinylLabel   = document.getElementById('vinyl-label');
    const lineNumbers  = document.getElementById('line-numbers');
    const typeCursor   = document.getElementById('type-cursor');
    const cliWrapper   = document.getElementById('interactive-cli');
    const cliInput     = document.getElementById('cli-input');

    // ── Floating hearts (lock screen) ─────────────────────────────────────────
    const floatContainer = document.getElementById('lock-float-hearts');
    const heartChars = ['❤️','💕','🌸','💗','✨','💖','🩷'];
    for (let i = 0; i < 18; i++) {
        const el = document.createElement('span');
        el.className = 'float-heart';
        el.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
        el.style.cssText = `
            left:${Math.random()*100}%;
            font-size:${0.8+Math.random()*1.2}rem;
            animation-duration:${6+Math.random()*8}s;
            animation-delay:${Math.random()*8}s;
        `;
        floatContainer.appendChild(el);
    }

    // ── Audio ─────────────────────────────────────────────────────────────────
    let isPlaying = false;
    audio.volume  = 0;

    function setVinylState(playing) {
        isPlaying = playing;
        vinylDisc.classList.toggle('spinning', playing);
        vinylLabel.textContent = playing ? '♫ playing' : '▶ play';
        vinylLabel.classList.toggle('playing', playing);
        localStorage.setItem('musicPlaying', playing ? 'true' : 'false');
    }

    if (localStorage.getItem('musicPlaying') === 'true') {
        const saved = parseFloat(localStorage.getItem('audioTime') || '0');
        if (saved) audio.currentTime = saved;
        audio.volume = 0.5;
        audio.play().then(() => setVinylState(true)).catch(() => setVinylState(false));
    }

    vinylToggle.addEventListener('click', () => {
        if (isPlaying) { fadeOut(); setVinylState(false); }
        else { audio.play().then(() => { fadeIn(); setVinylState(true); }); }
    });

    audio.addEventListener('timeupdate', () => {
        if (isPlaying) localStorage.setItem('audioTime', audio.currentTime);
    });

    function fadeIn() {
        let v = 0; audio.volume = 0;
        const t = setInterval(() => { v = Math.min(v+0.05, 0.5); audio.volume = v; if (v>=0.5) clearInterval(t); }, 100);
    }
    function fadeOut() {
        let v = audio.volume;
        const t = setInterval(() => { v = Math.max(v-0.05, 0); audio.volume = v; if (v<=0) { audio.pause(); clearInterval(t); } }, 100);
    }

    // ── Lock screen ───────────────────────────────────────────────────────────
    lockInput.addEventListener('input',   () => { if (lockInput.value.length === 8) setTimeout(checkPassword, 150); });
    lockInput.addEventListener('keydown', e  => { if (e.key === 'Enter') checkPassword(); });
    lockScreen.addEventListener('click',  () => lockInput.focus());

    function checkPassword() {
        if (lockInput.value === CORRECT_CODE) {
            unlockSequence();
        } else {
            showError();
            lockInput.value = '';
        }
    }

    function showError() {
        const msg = errorMessages[errorCount % errorMessages.length];
        errorCount++;
        errorText.textContent = msg;
        errorText.classList.remove('visible');
        void errorText.offsetWidth;
        errorText.classList.add('visible');
        const wrap = document.querySelector('.lock-input-wrapper');
        wrap.style.borderColor = 'var(--pink)';
        wrap.style.boxShadow   = '0 0 0 3px rgba(255,42,95,0.28)';
        setTimeout(() => { wrap.style.borderColor = ''; wrap.style.boxShadow = ''; }, 600);
    }

    if (sessionStorage.getItem('unlocked') === 'true') {
        lockScreen.style.display = 'none';
        appContainer.classList.add('unlocked');
        setTimeout(startTypewriter, 300);
    }

    function unlockSequence() {
        lockInput.blur();
        sessionStorage.setItem('unlocked', 'true');
        document.querySelector('.lock-prompt').classList.add('glitching');
        lockScreen.classList.add('glitch-screen');
        if (!isPlaying) {
            audio.play().then(() => { fadeIn(); setVinylState(true); }).catch(() => {});
        }
        setTimeout(() => {
            lockScreen.style.display = 'none';
            appContainer.classList.add('unlocked');
            spawnHeartBurst();
            setTimeout(startTypewriter, 500);
        }, 900);
    }

    function spawnHeartBurst() {
        for (let i = 0; i < 14; i++) {
            const el = document.createElement('div');
            el.textContent = ['❤️','💕','✨','💖','🌸'][Math.floor(Math.random()*5)];
            el.style.cssText = `
                position:fixed;left:50%;top:50%;
                font-size:${1.2+Math.random()*1.5}rem;
                pointer-events:none;z-index:9999;
                transition:all ${0.8+Math.random()*0.5}s cubic-bezier(0.2,0,0,1);
                transform:translate(-50%,-50%);
            `;
            document.body.appendChild(el);
            requestAnimationFrame(() => {
                const angle = Math.random() * Math.PI * 2;
                const dist  = 80 + Math.random() * 180;
                el.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px))`;
                el.style.opacity = '0';
            });
            setTimeout(() => el.remove(), 1500);
        }
    }

    // ── Heart → gallery ───────────────────────────────────────────────────────
    const heartLink = document.getElementById('heart-link');
    if (heartLink) {
        heartLink.addEventListener('click', e => {
            e.preventDefault();
            document.body.classList.add('page-exit');
            setTimeout(() => { window.location.href = heartLink.getAttribute('href'); }, 400);
        });
    }

    // ── Story text ────────────────────────────────────────────────────────────
    let storyBase = `<span class="comment">/**
 * OUR STORY
 * kritika & sarthak.love
 * since 28.03.2025
 */</span>

Hey bebeeee !! ❤️

Since the day I met you,
everything in my life started to feel
a little brighter and a lot more meaningful.

Your smile became my favourite sight !!
like literally… I can look at you all day
and still not get tired 😭❤️

I'm truly grateful for you,
for us,
and for all the memories we're creating together.

And that first time I hugged you 🫂…
I don't think you even realize,
but it felt like I had finally found a place
where I truly belonged.

Ik we fight a lottt 😭
but yk na…
ladna sab temporary hota hai,
but this feeling of lovee…
<span class="keyword">this is permanent.</span>

I don't know what the future holds,
but one thing I know for sure —

<span class="keyword">I choose you. Every single day.</span>

<span class="comment">// keep scrolling baby ❤️</span>`;

    if (currentHour < 5) {
        storyBase += `\n\n<span class="keyword">system:</span> <span class="comment">// It's late, go to bed. But I love you 🌙</span>`;
    }

    // ── Typewriter engine ─────────────────────────────────────────────────────
    // `source` is mutable — CLI commands append to it so the typewriter
    // naturally continues from where it stopped.
    let source   = storyBase.trim();
    let pos      = 0;         // index of next char to reveal
    let running  = false;     // prevents concurrent typewriter loops
    let prevLines = 0;

    function updateLineNumbers() {
        const lines = (typewriterEl.innerText || '').split('\n').length;
        if (lines !== prevLines) {
            prevLines = lines;
            lineNumbers.innerHTML = Array.from({length: lines}, (_, i) => i+1).join('<br>');
        }
    }

    function scrollCode() {
        const wb = typewriterEl.closest('.window-body');
        if (wb) wb.scrollTop = wb.scrollHeight;
    }

    function tick() {
        running = true;

        if (pos >= source.length) {
            // Nothing left — show CLI
            running = false;
            typeCursor.style.display = 'none';
            cliWrapper.classList.add('active');
            setTimeout(() => cliInput.focus(), 80);
            return;
        }

        // If the next character starts an HTML tag, skip the whole tag in one go
        if (source[pos] === '<') {
            const end = source.indexOf('>', pos);
            if (end !== -1) {
                pos = end + 1;
                typewriterEl.innerHTML = source.slice(0, pos);
                updateLineNumbers();
                scrollCode();
                setTimeout(tick, 0);   // 0ms — tags are invisible
                return;
            }
        }

        // Visible character
        const ch = source[pos];
        pos++;
        typewriterEl.innerHTML = source.slice(0, pos);
        updateLineNumbers();
        scrollCode();

        let delay = 26 + Math.random() * 30;
        if (ch === '.' || ch === '!' || ch === '?') delay = 360;
        else if (ch === '\n')                        delay = 170;
        else if (ch === ',')                         delay = 110;

        setTimeout(tick, delay);
    }

    function startTypewriter() {
        typeCursor.style.display = 'inline';
        cliWrapper.classList.remove('active');
        if (!running) tick();
    }

    // Append text from CLI commands and resume typewriter if not already running
    function appendLines(html) {
        source += html;
        typeCursor.style.display = 'inline';
        cliWrapper.classList.remove('active');
        if (!running) tick();
    }

    // ── CLI ───────────────────────────────────────────────────────────────────
    const reasons = [
        '1)  The way you smile at me… everything just feels right in that moment 😊',
        '2)  Tu jab saath ho toh sab theek lagta hai, even the worst days become bearable',
        '3)  Your voice… literally mera comfort zone hai, sunke hi sukoon milta hai 🎵',
        '4)  Your childish side… honestly I love it the most 😭❤️',
        '5)  The way you care for me… it makes me feel so incredibly lucky',
        '6)  With you, I feel safe… like duniya kuch bhi kare, I have you 🛡️',
        "7)  Your little jealous moments… I tease you but secretly they're sooo cute 😏",
        '8)  Your hugs… bas wahi meri peace hai, sab problems wahi khatam 🫂',
        "9)  Your music taste… not always perfect but still my favourite because it's yours 😂",
        '10) And honestly… I love you simply because you\'re YOU ❤️',
        '11) Aur sach bolu… I don\'t even need reasons, I just love you ❤️',
    ];

    function esc(s) {
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    cliInput.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const val = cliInput.value.trim().toLowerCase();
        cliInput.value = '';
        if (!val) return;

        cliWrapper.classList.remove('active');

        if (val === 'help') {
            appendLines(
                '\n<span class="comment">// available commands:</span>\n' +
                '  <span class="keyword">reasons</span>   — why I love you (the list is endless)\n' +
                '  <span class="keyword">memories</span>  — open our photo gallery 💕\n'
            );
        } else if (val === 'reasons') {
            appendLines(
                '\n<span class="comment">// fetching records from heart.db…</span>\n\n' +
                reasons.join('\n') + '\n'
            );
        } else if (val === 'memories') {
            appendLines('\n<span class="comment">// loading memories… this might make you smile 💕</span>\n');
            setTimeout(() => {
                const ls = document.getElementById('love-section');
                ls.style.display = 'flex';
                ls.style.visibility = 'visible';
                requestAnimationFrame(() => requestAnimationFrame(() => ls.classList.add('visible')));
                setTimeout(() => ls.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
            }, 1400);
        } else {
            appendLines(
                `\n<span class="comment">// command not found: ${esc(val)}</span>\n` +
                `<span class="keyword">hint:</span> type '<span class="keyword">help</span>' for available commands\n`
            );
        }
    });

    // ── Timer ─────────────────────────────────────────────────────────────────
    function updateTimer() {
        const diff = Math.max(0, Date.now() - startDate);
        document.getElementById('days').textContent    = Math.floor(diff / 86400000);
        document.getElementById('hours').textContent   = String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0');
        document.getElementById('minutes').textContent = String(Math.floor((diff % 3600000)  / 60000)).padStart(2,'0');
        document.getElementById('seconds').textContent = String(Math.floor((diff % 60000)    / 1000)).padStart(2,'0');
    }
    updateTimer();
    setInterval(updateTimer, 1000);

    // ── Background petal canvas ───────────────────────────────────────────────
    const canvas = document.getElementById('falling-petals');
    const ctx    = canvas.getContext('2d');
    let W, H, mx = -1000, my = -1000;
    const petals = [];

    window.addEventListener('mousemove',  e => { mx = e.clientX; my = e.clientY; });
    window.addEventListener('touchmove',  e => { if (e.touches.length) { mx = e.touches[0].clientX; my = e.touches[0].clientY; } }, { passive: true });
    window.addEventListener('mouseout',   () => { mx = -1000; my = -1000; });

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    class Petal {
        constructor(init) {
            this.type = Math.random() < 0.6 ? 'dot' : Math.random() < 0.6 ? 'sparkle' : 'heart';
            this.reset();
            if (init) this.y = Math.random() * H;
        }
        reset() {
            this.x  = Math.random() * W;
            this.y  = -20;
            this.sz = Math.random() * 4 + 1.5;
            this.vy = Math.random() * 0.8 + 0.4;
            this.vx = Math.random() * 0.4 - 0.2;
            this.a  = Math.random() * Math.PI * 2;
            this.da = (Math.random() - 0.5) * 0.04;
            const al  = Math.random() * 0.25 + 0.08;
            const rgb = Math.random() < 0.7 ? '255,42,95' : Math.random() < 0.5 ? '195,155,211' : '255,182,193';
            this.color = `rgba(${rgb},${al})`;
        }
        update() {
            this.y += this.vy;
            this.x += this.vx + Math.sin(this.y * 0.008) * 0.4;
            this.a += this.da;
            const dx = mx - this.x, dy = my - this.y, d = Math.hypot(dx, dy);
            if (d < 130 && d > 0) {
                const f = (130 - d) / 130;
                this.x -= (dx / d) * f * 4;
                this.y -= (dy / d) * f * 4;
            }
            if (this.y > H + 30) this.reset();
        }
        draw() {
            ctx.save();
            ctx.fillStyle = ctx.strokeStyle = this.color;
            if (this.type === 'dot') {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.sz, 0, Math.PI*2); ctx.fill();
            } else if (this.type === 'sparkle') {
                ctx.translate(this.x, this.y); ctx.rotate(this.a); ctx.lineWidth = 1;
                for (let k = 0; k < 4; k++) {
                    ctx.beginPath(); ctx.moveTo(0, -this.sz*1.4); ctx.lineTo(0, this.sz*1.4); ctx.stroke();
                    ctx.rotate(Math.PI / 4);
                }
            } else {
                ctx.translate(this.x, this.y);
                const u = this.sz * 0.55;
                ctx.fillRect(-u*2,-u*2,u*2,u); ctx.fillRect(u,-u*2,u*2,u);
                ctx.fillRect(-u*3,-u,u*6,u*2); ctx.fillRect(-u*2,u,u*5,u);
                ctx.fillRect(-u,u*2,u*3,u);    ctx.fillRect(0,u*3,u,u);
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < 70; i++) petals.push(new Petal(true));

    (function loop() {
        ctx.clearRect(0, 0, W, H);
        petals.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    })();
});