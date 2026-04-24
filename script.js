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
        const response = await fetch(`${KLYON_CONFIG.url}/api/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: KLYON_CONFIG.projectId,
                apiKey: KLYON_CONFIG.apiKey
            })
        });

        if (!response.ok) return;

        const data = await response.json();

        // 1. 🔒 CONTROL DE BLOQUEO (Si el estado es 'suspended')
        if (data.status === 'suspended') {
            document.body.innerHTML = `
                <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; background:#0f172a; color:white; text-align:center; padding:20px; position:fixed; top:0; left:0; width:100%; z-index:999999;">
                    <div style="background:rgba(255,255,255,0.05); padding:40px; border-radius:30px; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px);">
                        <h1 style="font-size:2.5rem; margin-bottom:10px;">Sitio Suspendido</h1>
                        <p style="opacity:0.7; max-width:400px; margin:0 auto 30px;">Este proyecto ha sido desactivado temporalmente. Por favor, contacta con el administrador para restaurar el acceso.</p>
                        <a href="mailto:tu-correo@ejemplo.com" style="background:#3b82f6; color:white; text-decoration:none; padding:12px 30px; border-radius:12px; font-weight:bold; transition:0.3s;">Contactar Soporte</a>
                    </div>
                </div>
            `;
            // Detener otros intervalos para ahorrar recursos
            return; 
        }

        // 2. 🔔 CONTROL DE ALERTA (Si mandaste el mensaje de pago)
        if (data.config && data.config.show_popup) {
            // Verificamos si ya mostramos la alerta en esta sesión para no molestar
            if (!sessionStorage.getItem('klyon_alert_shown')) {
                alert(data.config.message || "Recordatorio: Se acerca la fecha de pago de tu servicio.");
                sessionStorage.setItem('klyon_alert_shown', 'true');
            }
        }

    } catch (error) {
        console.error('❌ Error en control remoto Klyon:', error);
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
