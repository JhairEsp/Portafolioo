// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Navigation toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        burger.classList.toggle('toggle');
    });
    
    // Sticky Header
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
        
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        }
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                if (nav.classList.contains('nav-active')) {
                    nav.classList.remove('nav-active');
                    burger.classList.remove('toggle');
                    navLinks.forEach(link => {
                        link.style.animation = '';
                    });
                }
                
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Back to top
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Skills tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.getAttribute('data-target');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Projects filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 200);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 500);
                }
            });
        });
    });
    
    // Custom cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (cursor && cursorFollower) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 100);
        });
        
        const links = document.querySelectorAll('a, button, .btn, .social-icon');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.style.width = '50px';
                cursor.style.height = '50px';
                cursor.style.border = '1px solid var(--primary)';
                cursorFollower.style.width = '0';
            });
            
            link.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.border = '2px solid var(--primary)';
                cursorFollower.style.width = '8px';
            });
        });
    }
    
    // Form validation
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let valid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            
            if (name.value.trim() === '') {
                valid = false;
                showError(name, 'Por favor ingresa tu nombre');
            } else removeError(name);
            
            if (email.value.trim() === '') {
                valid = false;
                showError(email, 'Por favor ingresa tu email');
            } else if (!isValidEmail(email.value)) {
                valid = false;
                showError(email, 'Por favor ingresa un email válido');
            } else removeError(email);
            
            if (subject.value.trim() === '') {
                valid = false;
                showError(subject, 'Por favor ingresa un asunto');
            } else removeError(subject);
            
            if (message.value.trim() === '') {
                valid = false;
                showError(message, 'Por favor ingresa un mensaje');
            } else removeError(message);
            
            if (valid) {
                contactForm.reset();
                alert('¡Mensaje enviado con éxito!');
            }
        });
    }
    
    function showError(input, message) {
        const formGroup = input.parentElement;
        removeError(input);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '5px';
        
        formGroup.appendChild(errorElement);
        input.style.borderColor = '#dc3545';
    }
    
    function removeError(input) {
        const formGroup = input.parentElement;
        const errorElement = formGroup.querySelector('.error-message');
        
        if (errorElement) {
            formGroup.removeChild(errorElement);
        }
        
        input.style.borderColor = '';
    }
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Active nav on scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // Animate on scroll
    const animateElements = document.querySelectorAll('.skill-item, .project-item, .timeline-item');
    
    function checkScroll() {
        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.5s ease';
    });
    
    window.addEventListener('scroll', checkScroll);
    checkScroll();

// ... (Todo tu código anterior de navegación, scroll, etc. se mantiene igual) ...

// --- CONFIGURACIÓN DE KLYON ---
const KLYON_CONFIG = {
    url: 'https://klyon-manage.vercel.app',
    projectId: '0722c1c3-ed89-4b07-96f7-4c75cd1750b4',
    apiKey: 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd'
};

// --- SISTEMA DE MÉTRICAS ---
let sessionMetrics = {
    users: 1, // Si cargó la página, contamos 1 sesión/usuario
    sales: 0,
    errors: 0
};

// Capturar errores automáticamente
window.addEventListener('error', function(event) {
    sessionMetrics.errors++;
    console.log('❌ Error capturado para Klyon');
});

// Función para enviar latido (Heartbeat) - Se mantiene igual
const sendHeartbeat = async () => {
    try {
        await fetch(`${KLYON_CONFIG.url}/api/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: KLYON_CONFIG.projectId,
                apiKey: KLYON_CONFIG.apiKey
            })
        });
        console.log('✅ Heartbeat enviado a Klyon');
    } catch (error) {
        console.error('❌ Error en heartbeat', error);
    }
};

// Nueva función para enviar métricas (Usuarios, Ventas, Errores)
const sendMetrics = async () => {
    try {
        await fetch(`${KLYON_CONFIG.url}/api/metrics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: KLYON_CONFIG.projectId,
                apiKey: KLYON_CONFIG.apiKey,
                users: sessionMetrics.users,
                sales: sessionMetrics.sales,
                errors: sessionMetrics.errors
            })
        });
        console.log('📊 Métricas enviadas a Klyon:', sessionMetrics);
    } catch (error) {
        console.error('❌ Error enviando métricas', error);
    }
};

// --- INICIALIZACIÓN ---

// Enviar Heartbeat cada 1 minuto (para que salga ONLINE)
sendHeartbeat();
setInterval(sendHeartbeat, 60000);

// Enviar Métricas cada 5 minutos (o al cargar la página)
sendMetrics(); 
setInterval(sendMetrics, 300000); 

// EJEMPLO: Si quieres contar una venta cuando alguien envíe el formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', () => {
        // Si el formulario es válido, podrías contarlo como una conversión/venta
        sessionMetrics.sales += 10; // Ejemplo: sumamos 10 al valor de ventas
        sendMetrics(); // Enviamos actualización inmediata
    });
}
