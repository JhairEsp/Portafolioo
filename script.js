/**
 * Klyon - Integration Script v3.0 (Unified & CORS Fixed)
 */
document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // 🔧 1. CONFIGURACIÓN CENTRAL KLYON
    // ==========================================
    const KLYON = {
        url: 'https://klyon-manage.vercel.app/api/status',
        // ASEGÚRATE DE QUE ESTOS SEAN LOS QUE SALEN EN TU DASHBOARD
        projectId: '4746cf19-ec86-4a87-b6e8-a09ddcc5b4e6',
        apiKey: 'e463a3d76c45635e547811396d5635e3ad6643b22f91ece5'
    };

    let metrics = { sessions: 0, sales: 0, errors: 0 };

    // Registrar sesión única
    if (!sessionStorage.getItem('k_s')) {
        metrics.sessions = 1;
        sessionStorage.setItem('k_s', 'true');
    }

    // Capturar errores
    window.addEventListener('error', () => { metrics.errors++; });

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

            const data = await response.json();
            
            if (data.error) {
                console.error('❌ Error de Klyon:', data.error);
                return;
            }

            console.log('📡 Klyon Sync OK:', data);

            // Control Remoto (Bloqueo)
            if (data.status === 'suspended') {
                document.body.innerHTML = `
                    <div style="height:100vh;display:flex;align-items:center;justify-content:center;background:#0f172a;color:white;font-family:sans-serif;text-align:center;padding:20px;">
                        <div>
                            <h1>SITIO SUSPENDIDO</h1>
                            <p style="opacity:0.6;">Contacta al administrador para restaurar el acceso.</p>
                        </div>
                    </div>`;
                return;
            }

            // Control Alerta
            if (data.config && data.config.show_popup && !sessionStorage.getItem('k_a')) {
                alert(data.config.message || "Recordatorio de pago pendiente.");
                sessionStorage.setItem('k_a', 'true');
            }

            // Limpiar métricas si el envío fue exitoso
            metrics.sessions = 0; metrics.sales = 0; metrics.errors = 0;

        } catch (e) {
            console.error('❌ Error de conexión con Klyon');
        }
    };

    // Sincronizar al cargar y cada 60 segundos
    syncKlyon();
    setInterval(syncKlyon, 60000);N.url, {
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
