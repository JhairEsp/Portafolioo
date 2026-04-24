/**
 * Klyon - Integration Script v2.0
 */
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
        errors: 0
    };

    // Registrar sesión única por pestaña
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
            const response = await fetch(`${KLYON_CONFIG.url}/api/status`, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: KLYON_CONFIG.projectId,
                    apiKey: KLYON_CONFIG.apiKey
                })
            });

            if (!response.ok) return;

            const data = await response.json();
            console.log('📡 Klyon Status Check:', data);

            // 1. 🔒 BLOQUEO DE PÁGINA
            if (data.status === 'suspended') {
                document.body.innerHTML = `
                    <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; background:#0f172a; color:white; text-align:center; padding:20px; position:fixed; top:0; left:0; width:100%; z-index:999999;">
                        <div style="background:rgba(255,255,255,0.05); padding:40px; border-radius:30px; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px);">
                            <h1 style="font-size:2.5rem; margin-bottom:10px;">Sitio Suspendido</h1>
                            <p style="opacity:0.7; max-width:400px; margin:0 auto 30px;">Este proyecto ha sido desactivado temporalmente por el administrador.</p>
                            <a href="mailto:soporte@tudominio.com" style="background:#3b82f6; color:white; text-decoration:none; padding:12px 30px; border-radius:12px; font-weight:bold;">Contactar Soporte</a>
                        </div>
                    </div>
                `;
                return; 
            }

            // 2. 🔔 ALERTA DE PAGO
            if (data.config && data.config.show_popup) {
                // Solo mostrar una vez por sesión para no molestar
                if (!sessionStorage.getItem('klyon_alert_shown')) { 
                    alert(data.config.message || "Recordatorio: Se acerca la fecha de pago.");
                    sessionStorage.setItem('klyon_alert_shown', 'true');
                }
            }

        } catch (error) {
            console.error('❌ Error Klyon Heartbeat:', error);
        }
    };

    // =============================
    // 📊 ENVÍO DE MÉTRICAS
    // =============================
    const sendMetrics = async () => {
        try {
            const payload = {
                projectId: KLYON_CONFIG.projectId,
                apiKey: KLYON_CONFIG.apiKey,
                sessions: sessionMetrics.sessions,
                sales: sessionMetrics.sales,
                errors: sessionMetrics.errors
            };

            await fetch(`${KLYON_CONFIG.url}/api/metrics`, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Resetear contadores locales tras envío exitoso
            sessionMetrics.sessions = 0;
            sessionMetrics.sales = 0;
            sessionMetrics.errors = 0;

        } catch (error) {
            console.error('❌ Error enviando métricas a Klyon', error);
        }
    };

    // Enviar métricas finales al cerrar/salir
    window.addEventListener('beforeunload', () => {
        const payload = JSON.stringify({
            projectId: KLYON_CONFIG.projectId,
            apiKey: KLYON_CONFIG.apiKey,
            sessions: 0,
            sales: 0,
            errors: sessionMetrics.errors
        });

        // Usamos fetch con keepalive para asegurar que llegue aunque se cierre la pestaña
        fetch(`${KLYON_CONFIG.url}/api/metrics`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
        });
    });

    // =============================
    // ⏱️ INTERVALOS
    // =============================
    sendHeartbeat();
    setInterval(sendHeartbeat, 60000); // Latido cada 1 min

    sendMetrics();
    setInterval(sendMetrics, 300000); // Métricas cada 5 min

    // =============================
    // LÓGICA DE TU WEB (Nav, Scroll, etc)
    // =============================
    
    // Burger Menu
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

    // Scroll Effects
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('sticky', window.scrollY > 50);
        const btt = document.querySelector('.back-to-top');
        if (btt) btt.classList.toggle('active', window.scrollY > 500);
    });

    // Formulario de Contacto + Registrar Venta
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Aquí puedes añadir tu validación...
            // Si el envío es exitoso, sumamos una "venta/conversión"
            sessionMetrics.sales += 1;
            sendMetrics(); // Enviamos la métrica de inmediato
        });
    }

    // Animación al hacer scroll
    const animateElements = document.querySelectorAll('.skill-item, .project-item, .timeline-item');
    const checkScroll = () => {
        animateElements.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight / 1.2) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s ease';
    });
    window.addEventListener('scroll', checkScroll);
    checkScroll();

});
