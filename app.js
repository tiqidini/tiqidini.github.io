function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing function for smoother effect (easeOutQuad)
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function updateDays(animate = false) {
    const startDate = new Date('2022-02-24');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const messageElement = document.getElementById('message');
    if (messageElement) {
        // Если структура еще не создана (первая загрузка)
        if (!messageElement.querySelector('.days')) {
            messageElement.innerHTML = `
                Сьогодні<br>
                <div class="days-wrapper">
                    <span class="days">0</span>
                </div>
                <span class="label">доба</span><br>
                героїчного<br>протистояння
            `;
        }

        const daysElement = messageElement.querySelector('.days');
        if (animate) {
            animateValue(daysElement, 0, diffDays, 1000);
        } else {
            daysElement.textContent = diffDays;
        }
    }
}

function createIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');

    // Рисуем белый фон
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 192, 192);

    // Загружаем оригинальный логотип
    const img = new Image();
    img.onload = function () {
        // Вычисляем размер и позицию для логотипа (90% от размера канваса)
        const size = 192 * 0.9;
        const horizontalPosition = (192 - size) / 2;
        const verticalPosition = (192 - size) / 2 + 10; // Смещаем на 10 пикселей вниз

        // Рисуем логотип немного ниже центра
        ctx.drawImage(img, horizontalPosition, verticalPosition, size, size);

        // Создаем новую иконку и обновляем ссылки на неё
        const newIconUrl = canvas.toDataURL('image/png');
        updateIconLinks(newIconUrl);
    };
    img.src = '1.png'; // Путь к оригинальному логотипу
}

function updateIconLinks(newIconUrl) {
    // Обновляем иконку для браузера
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = newIconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);

    // Обновляем apple-touch-icon
    const appleLink = document.querySelector("link[rel='apple-touch-icon']") || document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = newIconUrl;
    document.getElementsByTagName('head')[0].appendChild(appleLink);

    // Обновляем иконку в манифесте
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            if (registration.active) {
                registration.active.postMessage({
                    type: 'UPDATE_ICON',
                    iconUrl: newIconUrl
                });
            }
        });
    }
}

class TiltEffect {
    constructor(element) {
        this.element = element;
        this.container = element.closest('.container');
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);

        if (this.container) {
            this.container.addEventListener('mousemove', this.handleMouseMove);
            this.container.addEventListener('mouseleave', this.handleMouseLeave);
        }

        window.addEventListener('deviceorientation', this.handleDeviceOrientation);
    }

    handleMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
        const rotateY = ((x - centerX) / centerX) * 10;

        this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0)`;
    }

    handleMouseLeave() {
        this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    }

    handleDeviceOrientation(e) {
        if (!e.beta || !e.gamma) return;

        // Limit rotation for mobile
        const rotateX = Math.min(Math.max(e.beta - 45, -15), 15); // Tilt front/back
        const rotateY = Math.min(Math.max(e.gamma, -15), 15); // Tilt left/right

        this.element.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateY(0)`;
    }
}

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const particleCount = Math.min(window.innerWidth / 10, 100); // Responsive count

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around screen
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDays(true);
    setInterval(() => updateDays(false), 60000);

    // Initialize effects
    const card = document.querySelector('.card');
    if (card) new TiltEffect(card);
    new ParticleSystem('particles');

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
                registration.update();
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    }

    // Create dynamic icon
    window.addEventListener('load', createIcon);
});