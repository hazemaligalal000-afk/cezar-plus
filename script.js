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
    initSalesToasts();
    initExitIntent();

    // ─── META PIXEL EVENTS ─────────────────────────────────────
    initPixelScrollDepth();       // ScrollDepth milestones
    initPixelFormFocus();         // InitiateCheckout on form interaction
    initPixelQuantityChange();    // AddToCart on quantity select
    initPixelContactClicks();     // Contact event on WhatsApp / phone
    initPixelFaqSearch();         // Search event on FAQ open
});

/* ==========================================================
   META PIXEL — ADVANCED EVENT TRACKING
   Standard: https://developers.facebook.com/docs/meta-pixel
   CAPI:      https://developers.facebook.com/docs/marketing-api/conversions-api
   ========================================================== */

// ─── HELPER: Get selected quantity and price ─────────────────
function _getOrderData() {
    var qty   = document.getElementById('quantity');
    var prices = { '1': 1000, '2': 1600, '3': 2200, 'course': 1600 };
    var val   = qty ? qty.value : '1';
    return {
        num_items: isNaN(parseInt(val)) ? 1 : parseInt(val),
        value:     prices[val] || 1000,
        currency:  'EGP',
        content_ids:  [window.META_CONFIG && window.META_CONFIG.CONTENT_ID || 'CEZAR-PLUS-001'],
        content_name: window.META_CONFIG && window.META_CONFIG.CONTENT_NAME || 'سيزار بلس',
        content_type: 'product',
    };
}

// ── 1. SCROLL DEPTH TRACKING ─────────────────────────────────
// Fires a custom ScrollDepth event at 25%, 50%, 75%, 90%
function initPixelScrollDepth() {
    if (typeof fbq === 'undefined') return;
    var milestones = {25: false, 50: false, 75: false, 90: false};
    window.addEventListener('scroll', function() {
        var scrolled = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
        Object.keys(milestones).forEach(function(pct) {
            if (!milestones[pct] && scrolled >= parseInt(pct)) {
                milestones[pct] = true;
                var evtId = _genEventId('ScrollDepth_' + pct);
                fbq('trackCustom', 'ScrollDepth', { depth: pct + '%' }, { eventID: evtId });
                _sendCAPI('ScrollDepth', { depth: pct + '%' }, evtId);
            }
        });
    }, { passive: true });
}

// ── 2. INITIATE CHECKOUT (Form first focus) ───────────────────
// Fires when user clicks into any form field — very high-intent signal
function initPixelFormFocus() {
    if (typeof fbq === 'undefined') return;
    var form   = document.getElementById('product-order-form');
    if (!form) return;
    var fired  = false;
    form.addEventListener('focusin', function() {
        if (fired) return;
        fired = true;
        var data  = _getOrderData();
        var evtId = _genEventId('InitiateCheckout');
        fbq('track', 'InitiateCheckout', data, { eventID: evtId });
        _sendCAPI('InitiateCheckout', data, evtId);
    }, { once: false });
}

// ── 3. ADD TO CART (Quantity / package select) ────────────────
// Fires when user changes the quantity — strong purchase-intent signal
function initPixelQuantityChange() {
    if (typeof fbq === 'undefined') return;
    var qty = document.getElementById('quantity');
    if (!qty) return;
    qty.addEventListener('change', function() {
        var data  = _getOrderData();
        var evtId = _genEventId('AddToCart');
        fbq('track', 'AddToCart', data, { eventID: evtId });
        _sendCAPI('AddToCart', data, evtId);
    });
}

// ── 4. LEAD + COMPLETE REGISTRATION (Form submit) ────────────
// Fires Lead (website_leads) + CompleteRegistration on successful submit.
// Also hashes phone & name via SHA-256 for Advanced Matching.
function trackLeadEvent(name, phone, governorate, quantity, totalValue) {
    if (typeof fbq === 'undefined') return;

    var data = {
        content_name:  'سيزار بلس - طلب جديد',
        content_ids:   [window.META_CONFIG && window.META_CONFIG.CONTENT_ID || 'CEZAR-PLUS-001'],
        currency:      'EGP',
        value:         totalValue,
        num_items:     1,
        status:        'submitted',
        // Custom dimensions — visible in Events Manager
        custom_data: {
            governorate:   governorate,
            package:       quantity,
            source:        'landing_page',
            product:       'cezar_plus',
        },
    };

    var leadEvtId = _genEventId('Lead');
    var regEvtId  = _genEventId('CompleteRegistration');

    // ── Pixel (browser-side) ──────────────────────────────────
    fbq('track', 'Lead', data, { eventID: leadEvtId });
    fbq('track', 'CompleteRegistration', {
        content_name: 'سيزار بلس - طلب مكتمل',
        currency:     'EGP',
        value:        totalValue,
        status:       true,
    }, { eventID: regEvtId });

    // ── CAPI (server-side) with hashed PII ───────────────────
    Promise.all([
        _sha256(phone.replace(/\D/g,'')),
        _sha256(name),
    ]).then(function(hashed) {
        var userData = {
            ph: hashed[0],  // E.164 digits only, SHA-256
            fn: hashed[1],  // first name SHA-256
        };
        _sendCAPI('Lead', data, leadEvtId, userData);
        _sendCAPI('CompleteRegistration', {
            content_name: 'سيزار بلس - طلب مكتمل',
            currency:     'EGP',
            value:        totalValue,
            status:       true,
        }, regEvtId, userData);
    });
}

// ── 5. CONTACT (WhatsApp & Phone clicks) ─────────────────────
function initPixelContactClicks() {
    if (typeof fbq === 'undefined') return;
    document.querySelectorAll('a[href^="https://wa.me/"], a[href^="tel:"]').forEach(function(link) {
        link.addEventListener('click', function() {
            var evtId = _genEventId('Contact');
            var isWA  = link.href.startsWith('https://wa.me/');
            fbq('track', 'Contact', {
                content_name: isWA ? 'WhatsApp' : 'Phone',
            }, { eventID: evtId });
            _sendCAPI('Contact', { content_name: isWA ? 'WhatsApp' : 'Phone' }, evtId);
        });
    });
}

// ── 6. SEARCH (FAQ accordion open) ───────────────────────────
// Treat FAQ interactions as a Search signal — user researching the product
function initPixelFaqSearch() {
    if (typeof fbq === 'undefined') return;
    document.querySelectorAll('.faq-question').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var query = btn.querySelector('span') ? btn.querySelector('span').textContent : '';
            if (!query) return;
            var evtId = _genEventId('Search');
            fbq('track', 'Search', { search_string: query }, { eventID: evtId });
            _sendCAPI('Search', { search_string: query }, evtId);
        });
    });
}


/* ===== Sales Toasts (Social Proof) ===== */
function initSalesToasts() {
    const toast = document.getElementById('sales-toast');
    const userEl = toast.querySelector('.toast-user');
    const actionEl = toast.querySelector('.toast-action');
    const closeBtn = toast.querySelector('.toast-close');

    const names = ['أحمد من القاهرة', 'سارة من الإسكندرية', 'محمد من الجيزة', 'مريم من المنصورة', 'خالد من طنطا', 'ياسمين من الزقازيق', 'عمر من أسيوط', 'ليلى من بورسعيد', 'إبراهيم من سوهاج', 'نورهان من الفيوم'];
    const actions = ['طلب عبوتين الآن 📦', 'طلب العرض الذهبي ✨', 'حجز الكورس المتكامل 🔥', 'طلب عبوة واحدة الآن ✅'];

    function showRandomToast() {
        if (sessionStorage.getItem('exit_modal_shown') === 'true') return;

        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        userEl.textContent = randomName;
        actionEl.textContent = randomAction;

        toast.classList.add('show');

        // Hide after 6 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 6000);
    }

    // Show first toast after 5 seconds
    setTimeout(showRandomToast, 5000);

    // Show every 15-25 seconds
    setInterval(() => {
        if (!toast.classList.contains('show')) {
            showRandomToast();
        }
    }, Math.random() * 10000 + 15000);

    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
    });
}

/* ===== Exit Intent Modal ===== */
function initExitIntent() {
    const modal = document.getElementById('exit-modal');
    const closeBtn = modal.querySelector('.modal-close');

    if (localStorage.getItem('cezar_exit_shown')) return;

    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0 && !localStorage.getItem('cezar_exit_shown')) {
            showExitModal();
        }
    });

    // Mobile swipe up fallback? Difficult to detect.
    // Use timeout as fallback for mobile
    setTimeout(() => {
        if (!localStorage.getItem('cezar_exit_shown')) {
            // showExitModal(); // Maybe too annoying on mobile
        }
    }, 45000);

    closeBtn.addEventListener('click', closeExitModal);
}

function showExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.classList.add('show');
    localStorage.setItem('cezar_exit_shown', 'true');
}

function closeExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 400);
}

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

            // ── Fire Lead + CompleteRegistration ─────────────────
            var numericTotal = parseInt((totalDisplay.textContent || '0').replace(/\D/g,'')) || 1000;
            trackLeadEvent(name, phone, gov, qty, numericTotal);
            // ─────────────────────────────────────────────────────

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
