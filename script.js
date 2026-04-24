// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {

    // =============================
    // 🔧 CONFIGURACIÓN KLYON
    // =============================
    const KLYON_CONFIG = {
        url: 'https://klyon-manage.vercel.app',
        projectId: '0722c1c3-ed89-4b07-96f7-4c75cd1750b4',
        apiKey: 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd'
    };

    // =============================
    // 📊 MÉTRICAS DE SESIÓN
    // =============================
    let sessionMetrics = {
        sessions: 0,
        sales: 0,
        errors: 0,
        duration: 0
    };

    // Detectar sesión única
    if (!sessionStorage.getItem('klyon_session')) {
        sessionMetrics.sessions = 1;
        sessionStorage.setItem('klyon_session', 'true');
    }

    let startTime = Date.now();

    // =============================
    // ❌ CAPTURA DE ERRORES
    // =============================
    window.addEventListener('error', function() {
        sessionMetrics.errors++;
    });

// =============================
// ❤️ HEARTBEAT + CONTROL REMOTO
// =============================
const sendHeartbeat = async () => {
    try {
        // CAMBIAMOS /heartbeat por /status
        const response = await fetch(`${KLYON_CONFIG.url}/api/status`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: KLYON_CONFIG.projectId,
                apiKey: KLYON_CONFIG.apiKey
            })
        });

        const data = await response.json();
        console.log('📡 Respuesta NUEVA de Klyon:', data);

        // Si ves 'VERSION_NUEVA_STATUS' en la consola, ¡ya está funcionando!
        
        if (data.status === 'suspended') {
            document.body.innerHTML = `<h1>Sitio Suspendido</h1>`;
            return;
        }

        if (data.config && data.config.show_popup) {
            alert(data.config.message);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
};
    // =============================
    // 📊 MÉTRICAS
    // =============================
    const sendMetrics = async () => {
    try {
        const duration = Math.floor((Date.now() - startTime) / 1000);

        const payload = {
            projectId: KLYON_CONFIG.projectId,
            apiKey: KLYON_CONFIG.apiKey,
            sessions: sessionMetrics.sessions,
            sales: sessionMetrics.sales,
            errors: sessionMetrics.errors,
            duration: duration
        };

        // Forzamos el modo 'cors' en el fetch
        await fetch(`${KLYON_CONFIG.url}/api/metrics`, {
            method: 'POST',
            mode: 'cors', // <--- IMPORTANTE
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Solo reseteamos si tuvo éxito
        sessionMetrics.sessions = 0;
        sessionMetrics.sales = 0;
        sessionMetrics.errors = 0;
        startTime = Date.now();

    } catch (error) {
        console.error('❌ Error enviando métricas', error);
    }
};

    // =============================
    // 🧠 SEND BEACON (al salir)
    // =============================
    window.addEventListener('beforeunload', () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);

        const payload = {
            projectId: KLYON_CONFIG.projectId,
            apiKey: KLYON_CONFIG.apiKey,
            duration: duration
        };

        navigator.sendBeacon(
            `${KLYON_CONFIG.url}/api/metrics`,
            JSON.stringify(payload)
        );
    });

    // =============================
    // ⏱️ INTERVALOS
    // =============================
    sendHeartbeat();
    setInterval(sendHeartbeat, 60000);

    sendMetrics();
    setInterval(sendMetrics, 300000);

    // =============================
    // NAVIGATION TOGGLE
    // =============================
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');

            navLinks.forEach((link, index) => {
                link.style.animation = link.style.animation
                    ? ''
                    : `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            });

            burger.classList.toggle('toggle');
        });
    }

    // =============================
    // STICKY HEADER + BACK TO TOP
    // =============================
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 50);
        }

        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.classList.toggle('active', window.scrollY > 500);
        }
    });

    // =============================
    // SMOOTH SCROLL
    // =============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =============================
    // FORM VALIDATION + MÉTRICAS
    // =============================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let valid = true;

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');

            if (name.value.trim() === '') valid = false;
            if (email.value.trim() === '') valid = false;
            if (subject.value.trim() === '') valid = false;
            if (message.value.trim() === '') valid = false;

            if (valid) {
                contactForm.reset();

                // 👉 REGISTRAR "VENTA / CONVERSIÓN"
                sessionMetrics.sales += 1;

                sendMetrics();
            }
        });
    }

    // =============================
    // ACTIVE NAV ON SCROLL
    // =============================
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - 200) {
                current = section.id;
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle(
                'active',
                link.getAttribute('href') === '#' + current
            );
        });
    });

    // =============================
    // ANIMATE ON SCROLL
    // =============================
    const animateElements = document.querySelectorAll(
        '.skill-item, .project-item, .timeline-item'
    );

    function checkScroll() {
        animateElements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight / 1.2) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
    });

    window.addEventListener('scroll', checkScroll);
    checkScroll();

});
