(function() {
    "use strict";

    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    let w, h;
    let particles = [];
    const NUM_PARTICLES = 140;
    const MAX_SPEED = 0.5;
    const CONNECT_DIST = 150;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    let mouseX = -1000,
        mouseY = -1000;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * MAX_SPEED * 2;
            this.vy = (Math.random() - 0.5) * MAX_SPEED * 2;
            this.radius = Math.random() * 2.2 + 0.6;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = `rgba(212, 175, 55, ${this.opacity})`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            if (this.radius > 1.5) {
                ctx.shadowColor = '#d4af37';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        applyForce(mx, my) {
            const dx = this.x - mx;
            const dy = this.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 1) {
                const force = (120 - dist) / 120 * 0.25;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
                // límite de velocidad para que no explote
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > MAX_SPEED * 2) {
                    this.vx = (this.vx / speed) * MAX_SPEED * 1.5;
                    this.vy = (this.vy / speed) * MAX_SPEED * 1.5;
                }
            }
        }
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push(new Particle());
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    const alpha = (1 - dist / CONNECT_DIST) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        for (let p of particles) {
            p.applyForce(mouseX, mouseY);
            p.update();
            p.draw();
        }

        drawLines();
        requestAnimationFrame(animate);
    }

    animate();

    // Redibujar al cambiar tamaño
    window.addEventListener('resize', () => {
        resize();
    });

})();