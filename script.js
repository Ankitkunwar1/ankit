window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// === Particle/Balls Background ===
(function() {
    const canvas = document.getElementById("balls-bg");
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const BALLS = 42;
    const balls = [];
    const colorsDark = ["#a78bfa", "#818cf8", "#f472b6", "#facc15", "#10b981", "#60a5fa"];
    const colorsLight = ["#6366f1", "#818cf8", "#e879f9", "#fbbf24", "#22d3ee", "#818cf8"];
    let useDark = document.documentElement.classList.contains('dark');

    function getColors() {
        return useDark ? colorsDark : colorsLight;
    }

    function Ball() {
        const minR = 3, maxR = 16;
        this.radius = minR + Math.random() * (maxR - minR);
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.color = getColors()[Math.floor(Math.random() * getColors().length)];
        this.opacity = 0.55 + Math.random()*0.35;
    }
    Ball.prototype.draw = function(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
    }

    // Mouse pointer attraction
    let mouse = {x: width/2, y: height/2, active: false};
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    function setupBalls() {
        balls.length = 0;
        for(let i=0; i<BALLS; i++) balls.push(new Ball());
    }
    setupBalls();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for(const b of balls) {
            // Mouse attraction
            if(mouse.active) {
                const dx = mouse.x - b.x;
                const dy = mouse.y - b.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 200) {
                    const strength = (200 - dist) / 600;
                    b.vx += dx/dist * strength * 0.7;
                    b.vy += dy/dist * strength * 0.7;
                }
            }
            b.x += b.vx;
            b.y += b.vy;
            b.vx *= 0.98;
            b.vy *= 0.98;
            if(b.x < b.radius) { b.x = b.radius; b.vx *= -0.95; }
            if(b.x > width - b.radius) { b.x = width - b.radius; b.vx *= -0.95; }
            if(b.y < b.radius) { b.y = b.radius; b.vy *= -0.95; }
            if(b.y > height - b.radius) { b.y = height - b.radius; b.vy *= -0.95; }
            b.draw(ctx);
        }
        requestAnimationFrame(animate);
    }
    animate();

    function updateBallColors() {
        useDark = document.documentElement.classList.contains('dark');
        for(const b of balls) {
            b.color = getColors()[Math.floor(Math.random() * getColors().length)];
        }
    }
    window.updateBallColors = updateBallColors;
    window.addEventListener('resize', () => { setupBalls(); });
})();

// === Follower Ball (Blending Black-White) ===
(function(){
    const follower = document.getElementById('follower-ball');
    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let currentX = mouseX, currentY = mouseY;
    let size = 42; // Default ball size
    let animating = false;

    function lerp(a, b, t) { return a + (b-a)*t; }

    function getBlendColor() {
        // Blend between #222 (dark) and #ddd (light) based on dark mode
        let isDark = document.documentElement.classList.contains('dark');
        // Use a mid color for transition (could shift on hover)
        let c1 = {r:34, g:34, b:34}, c2 = {r:221, g:221, b:221};
        // If dark: 0.25 toward white, if light: 0.35 toward black
        let t = isDark ? 0.25 : 0.65;
        let r = Math.round(lerp(c1.r, c2.r, t));
        let g = Math.round(lerp(c1.g, c2.g, t));
        let b = Math.round(lerp(c1.b, c2.b, t));
        return `rgba(${r},${g},${b},0.45)`;
    }

    function update() {
        currentX = lerp(currentX, mouseX, 0.22);
        currentY = lerp(currentY, mouseY, 0.22);
        follower.style.transform = `translate3d(${currentX-(size/2)}px, ${currentY-(size/2)}px, 0)`;
        follower.style.background = getBlendColor();
        follower.style.boxShadow = `0 2px 16px 0 rgba(60,60,60,0.10)`;
        follower.style.width = size + "px";
        follower.style.height = size + "px";
        follower.style.borderRadius = "50%";
        follower.style.transition = "background 0.2s, width 0.2s, height 0.2s, box-shadow 0.2s";
        follower.style.pointerEvents = "none";
        follower.style.zIndex = "3";
        requestAnimationFrame(update);
    }
    update();

    window.addEventListener('mousemove', e=>{
        mouseX = e.clientX;
        mouseY = e.clientY;
        size = Math.max(32, Math.min(54, 38 + Math.sin(Date.now()/320)*10));
    });
    window.addEventListener('touchmove', e=>{
        if(e.touches[0]) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            size = 30;
        }
    });
    window.addEventListener('resize', ()=>{
        mouseX = window.innerWidth/2;
        mouseY = window.innerHeight/2;
    });

    // Update color on mode change
    window.addEventListener('storage', ()=>{follower.style.background=getBlendColor();});
    document.addEventListener('DOMContentLoaded', ()=>{follower.style.background=getBlendColor();});
    // Listen to class changes for color update
    const observer = new MutationObserver(()=>{follower.style.background = getBlendColor();});
    observer.observe(document.documentElement, {attributes:true,attributeFilter:['class']});
})();

// === Dark/Light Mode Toggle with Sliding Switch ===
(function() {
    const htmlEl = document.documentElement;
    const modeSwitch = document.getElementById('mode-switch');
    const handle = modeSwitch.querySelector('.switch-handle');

    function setMode(mode) {
        if(mode === 'light') {
            htmlEl.classList.remove('dark');
            htmlEl.classList.add('light');
            modeSwitch.classList.add('light');
            modeSwitch.classList.remove('active');
        } else {
            htmlEl.classList.remove('light');
            htmlEl.classList.add('dark');
            modeSwitch.classList.remove('light');
            modeSwitch.classList.add('active');
        }
        if(window.updateBallColors) window.updateBallColors();
    }

    // Initial mode
    let saved = localStorage.getItem('colorMode');
    if(saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        setMode('light');
    } else {
        setMode('dark');
    }

    function toggleMode() {
        if(htmlEl.classList.contains('dark')) {
            setMode('light');
            localStorage.setItem('colorMode', 'light');
        } else {
            setMode('dark');
            localStorage.setItem('colorMode', 'dark');
        }
    }

    modeSwitch.addEventListener('click', toggleMode);
    modeSwitch.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMode();
        }
    });
})();

// Typing Animation for Home Titles
(function () {
    const roles = [
        "Web Developer",
        "Software Engineer",
        "UI/UX Enthusiast",
        "Digital Problem Solver"
    ];
    let currentRole = 0, currentChar = 0, typing = true;
    const textEl = document.getElementById("typed-text");
    function typeAnimation() {
        if (!textEl) return;
        let role = roles[currentRole];
        if (typing) {
            if (currentChar <= role.length) {
                textEl.textContent = role.slice(0, currentChar);
                currentChar++;
                setTimeout(typeAnimation, 55 + Math.random() * 100);
            } else {
                typing = false;
                setTimeout(typeAnimation, 1200);
            }
        } else {
            if (currentChar > 0) {
                textEl.textContent = role.slice(0, currentChar);
                currentChar--;
                setTimeout(typeAnimation, 20 + Math.random() * 55);
            } else {
                typing = true;
                currentRole = (currentRole + 1) % roles.length;
                setTimeout(typeAnimation, 500);
            }
        }
    }
    typeAnimation();
})();

// Project Tree Toggle
document.querySelectorAll('.tree-toggle').forEach(function(toggle){
    toggle.addEventListener('click', function(){
        const children = this.parentElement.querySelector('.tree-children');
        const svg = this.querySelector('svg');
        if (children.classList.contains('hidden')) {
            children.classList.remove('hidden');
            svg.style.transform = "rotate(180deg)";
        } else {
            children.classList.add('hidden');
            svg.style.transform = "rotate(0deg)";
        }
    });
});

// Contact Form - Fake Submit with Confirmation
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('contactForm').classList.add('hidden');
    document.getElementById('formSuccess').classList.remove('hidden');
});