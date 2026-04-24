/**
 * Klyon - Integration Script v3.0 (Unified & CORS Fixed)
 */
document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 🔧 1. CONFIGURACIÓN CENTRAL KLYON
    // ==========================================
    const KLYON = {
        url: 'https://klyon-manage.vercel.app/api/status',
        projectId: '0722c1c3-ed89-4b07-96f7-4c75cd1750b4',
        apiKey: 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd'
    };

    let metrics = { sessions: 0, sales: 0, errors: 0 };
    let startTime = Date.now();

    // Registrar sesión única
    if (!sessionStorage.getItem('k_s')) {
        metrics.sessions = 1;
        sessionStorage.setItem('k_s', 'true');
    }

    // Capturar errores de JS automáticamente
    window.addEventListener('error', function() { metrics.errors++; });

    // ==========================================
    // 📡 2. FUNCIÓN DE SINCRONIZACIÓN (Ping + Métricas)
    // ==========================================
    const syncKlyon = async () => {
        try {
            const response = await fetch(KLYON.url, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: KLYON.projectId,
                    apiKey: KLYON.apiKey,
                    sessions: metrics.sessions,
                    sales: metrics.sales,
                    errors: metrics.errors
                })
            });

            if (!response.ok) return;

            const data = await response.json();
            console.log('📡 Klyon Sync:', data);

            // --- CONTROL REMOTO ---
            
            // A. BLOQUEO TOTAL
            if (data.status === 'suspended') {
                document.body.innerHTML = `
                    <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; background:#0f172a; color:white; text-align:center; padding:20px; position:fixed; top:0; left:0; width:100%; z-index:999999;">
                        <div style="background:rgba(255,255,255,0.05); padding:40px; border-radius:30px; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px);">
                            <h1 style="font-size:2.5rem; margin-bottom:10px;">Sitio Suspendido</h1>
                            <p style="opacity:0.7; max-width:400px; margin:0 auto 30px;">Este sitio ha sido desactivado temporalmente por el administrador.</p>
                            <a href="mailto:soporte@tudominio.com" style="background:#3b82f6; color:white; text-decoration:none; padding:12px 30px; border-radius:12px; font-weight:bold;">Contactar Soporte</a>
                        </div>
                    </div>
                `;
                return; 
            }

            // B. ALERTA DE PAGO
            if (data.config && data.config.show_popup) {
                if (!sessionStorage.getItem('k_a')) { 
                    alert(data.config.message || "Recordatorio: Se acerca la fecha de pago.");
                    sessionStorage.setItem('k_a', 'true');
                }
            }

            // Resetear métricas locales tras éxito
            metrics.sessions = 0; metrics.sales = 0; metrics.errors = 0;

        } catch (error) {
            console.error('❌ Klyon Sync Error:', error);
        }
    };

    // Al salir, enviar métricas finales usando keepalive
    window.addEventListener('beforeunload', () => {
        fetch(KLYON.url, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: KLYON.projectId,
                apiKey: KLYON.apiKey,
                errors: metrics.errors
            }),
            keepalive: true
        });
    });

    // Iniciar intervalos
    syncKlyon(); 
    setInterval(syncKlyon, 60000); // Cada 1 minuto

    // ==========================================
    // 🎨 3. LÓGICA DE LA WEB (Navigation, Scroll, etc)
    // ==========================================

    // Navigation toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            navLinks.forEach((link, index) => {
                link.style.animation = link.style.animation ? '' : `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            });
            burger.classList.toggle('toggle');
        });
    }

    // Sticky Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('sticky', window.scrollY > 50);
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) backToTop.classList.toggle('active', window.scrollY > 500);
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        });
    });

    // Skills tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabPanes.forEach(p => p.classList.remove('active'));
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });

    // Form validation + Registrar Venta en Klyon
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Aquí iría tu validación...
            // Si el formulario se envía, sumamos una "venta" en Klyon
            metrics.sales += 1;
            syncKlyon(); // Sincronizar de inmediato
        });
    }

    // Active nav on scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - 200) current = section.getAttribute('id');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    });

    // Animate on scroll
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
