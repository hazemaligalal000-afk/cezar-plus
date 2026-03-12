/* ==========================================
   CEZAR PLUS - Landing Page JavaScript
   High Conversion Optimized
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initStickyBar();
    initCountdown();
    initCounterAnimation();
    initFaqAccordion();
    initScrollAnimations();
    initParticles();
    initRemainingCount();
    initOrderForm();
});

/* ===== Navbar Scroll Effect ===== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });
}

/* ===== Sticky CTA Bar ===== */
function initStickyBar() {
    const stickyBar = document.getElementById('sticky-cta');
    const hero = document.getElementById('hero');

    window.addEventListener('scroll', () => {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        if (window.pageYOffset > heroBottom - 200) {
            stickyBar.classList.add('visible');
        } else {
            stickyBar.classList.remove('visible');
        }
    }, { passive: true });
}

/* ===== Order Form Logic ===== */
function initOrderForm() {
    const form = document.getElementById('product-order-form');
    const qtySelect = document.getElementById('quantity');
    const priceDisplay = document.getElementById('summary-price');
    const totalDisplay = document.getElementById('summary-total');
    const successMsg = document.getElementById('order-success');

    if (!form) return;

    // Price mapping
    const prices = {
        '1': 1000,
        '2': 1600,
        '3': 2200,
        'course': 1600
    };

    // Update price on quantity change
    qtySelect.addEventListener('change', () => {
        const qty = qtySelect.value;
        const price = prices[qty];
        priceDisplay.textContent = `${price} جنيه`;
        totalDisplay.textContent = `${price} جنيه`;
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loader = submitBtn.querySelector('.btn-loader');

        // Capture data
        const name = document.getElementById('full-name').value;
        const phone = document.getElementById('phone').value;
        const gov = document.getElementById('governorate').value;
        const qty = qtySelect.options[qtySelect.selectedIndex].text;
        const address = document.getElementById('address').value;
        const total = totalDisplay.textContent;

        // Disable button and show loader
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';

        // Construct WhatsApp message
        const whatsappNumber = '201020760067';
        const message =
            `*طلب جديد لسيزار بلس - Cezar Plus*%0A` +
            `-------------------------------------------%0A` +
            `👤 *الاسم:* ${name}%0A` +
            `📱 *الموبايل:* ${phone}%0A` +
            `📍 *المحافظة:* ${gov}%0A` +
            `📦 *الكمية:* ${qty}%0A` +
            `🏠 *العنوان:* ${address}%0A` +
            `💰 *الإجمالي:* ${total}%0A` +
            `-------------------------------------------%0A` +
            `✅ الدفع عند الاستلام - شحن سريع`;

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

        // Simulation delay then redirect
        setTimeout(() => {
            // Open WhatsApp
            window.open(whatsappURL, '_blank');

            // Show success state on page
            form.style.display = 'none';
            successMsg.style.display = 'block';

            // Scroll to top of form section
            document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' });

            // Re-enable button
            submitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
        }, 1200);
    });
}

function resetForm() {
    const form = document.getElementById('product-order-form');
    const successMsg = document.getElementById('order-success');

    form.reset();
    form.style.display = 'flex';
    successMsg.style.display = 'none';

    // Reset prices
    document.getElementById('summary-price').textContent = '1000 جنيه';
    document.getElementById('summary-total').textContent = '1000 جنيه';
}

/* ===== Countdown Timer ===== */
function initCountdown() {
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    // Set countdown to end of today + 24 hours
    let savedEnd = localStorage.getItem('cezar_countdown_end');
    let endTime;

    if (savedEnd && parseInt(savedEnd) > Date.now()) {
        endTime = parseInt(savedEnd);
    } else {
        endTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        localStorage.setItem('cezar_countdown_end', endTime.toString());
    }

    function updateCountdown() {
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
            // Reset countdown
            endTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('cezar_countdown_end', endTime.toString());
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/* ===== Counter Animation ===== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.dataset.target);
                    animateCounter(counter, target);
                });
            }
        });
    }, { threshold: 0.3 });

    const proofBar = document.querySelector('.social-proof-bar');
    if (proofBar) observer.observe(proofBar);
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60;
    const duration = 2000;
    const stepTime = duration / 60;

    function step() {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString('en-US');
            return;
        }
        element.textContent = Math.floor(current).toLocaleString('en-US');
        requestAnimationFrame(step);
    }

    // Use setTimeout to slow down the animation
    let frame = 0;
    function animateStep() {
        frame++;
        current = easeOutQuad(frame / 60) * target;
        if (frame >= 60) {
            element.textContent = target.toLocaleString('en-US');
            return;
        }
        element.textContent = Math.floor(current).toLocaleString('en-US');
        setTimeout(animateStep, stepTime);
    }

    animateStep();
}

function easeOutQuad(t) {
    return t * (2 - t);
}

/* ===== FAQ Accordion ===== */
function initFaqAccordion() {
    // Open first FAQ by default
    const firstFaq = document.querySelector('.faq-item');
    if (firstFaq) {
        firstFaq.classList.add('active');
    }
}

function toggleFaq(button) {
    const faqItem = button.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');

    // Close all
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Open clicked if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

/* ===== Scroll Animations ===== */
function initScrollAnimations() {
    const animElements = document.querySelectorAll(
        '.problem-card, .feature-card, .testimonial-card, .step-card, .contact-card, .solution-point, .offer-card'
    );

    animElements.forEach(el => el.classList.add('animate-on-scroll'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animElements.forEach(el => observer.observe(el));
}

/* ===== Hero Particles ===== */
function initParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;

    const colors = [
        'rgba(212, 136, 15, 0.3)',
        'rgba(245, 208, 96, 0.2)',
        'rgba(255, 255, 255, 0.15)',
        'rgba(27, 107, 58, 0.2)'
    ];

    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 6 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 10 + 8}s;
            animation-delay: ${Math.random() * 8}s;
        `;
        container.appendChild(particle);
    }
}

/* ===== Remaining Count Simulation ===== */
function initRemainingCount() {
    const countEl = document.getElementById('remaining-count');
    if (!countEl) return;

    let savedCount = localStorage.getItem('cezar_remaining');
    let count;

    if (savedCount) {
        count = parseInt(savedCount);
    } else {
        count = 23;
    }

    countEl.textContent = count;

    // Decrease randomly every few minutes
    setInterval(() => {
        if (count > 3) {
            count--;
            countEl.textContent = count;
            localStorage.setItem('cezar_remaining', count.toString());

            // Flash effect
            countEl.style.color = '#E74C3C';
            countEl.style.transform = 'scale(1.3)';
            countEl.style.transition = 'all 0.3s';
            setTimeout(() => {
                countEl.style.color = '';
                countEl.style.transform = '';
            }, 500);
        }
    }, Math.random() * 120000 + 60000); // Random between 1-3 minutes
}

/* ===== Smooth Scroll for Anchor Links ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
