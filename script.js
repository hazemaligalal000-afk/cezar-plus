/* ==========================================
   ENSFHA PLUS - Landing Page JavaScript
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
    var val   = qty ? qty.value : '1';
    return {
        num_items: 1,
        value:     1500,
        currency:  'EGP',
        content_ids:  [window.META_CONFIG && window.META_CONFIG.CONTENT_ID || 'ENSFHA-001'],
        content_name: window.META_CONFIG && window.META_CONFIG.CONTENT_NAME || 'إنسفيها',
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
        content_name:  'إنسفيها - طلب جديد',
        content_ids:   [window.META_CONFIG && window.META_CONFIG.CONTENT_ID || 'ENSFHA-001'],
        currency:      'EGP',
        value:         totalValue,
        num_items:     1,
        status:        'submitted',
        // Custom dimensions — visible in Events Manager
        custom_data: {
            governorate:   governorate,
            package:       quantity,
            source:        'landing_page',
            product:       'ensfha_plus',
        },
    };

    var leadEvtId = _genEventId('Lead');
    var regEvtId  = _genEventId('CompleteRegistration');

    // ── Pixel (browser-side) ──────────────────────────────────
    fbq('track', 'Lead', data, { eventID: leadEvtId });
    fbq('track', 'CompleteRegistration', {
        content_name: 'إنسفيها - طلب مكتمل',
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
            content_name: 'إنسفيها - طلب مكتمل',
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

    if (localStorage.getItem('ensfha_exit_shown')) return;

    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0 && !localStorage.getItem('ensfha_exit_shown')) {
            showExitModal();
        }
    });

    // Mobile swipe up fallback? Difficult to detect.
    // Use timeout as fallback for mobile
    setTimeout(() => {
        if (!localStorage.getItem('ensfha_exit_shown')) {
            // showExitModal(); // Maybe too annoying on mobile
        }
    }, 45000);

    closeBtn.addEventListener('click', closeExitModal);
}

function showExitModal() {
    const modal = document.getElementById('exit-modal');
    modal.classList.add('show');
    localStorage.setItem('ensfha_exit_shown', 'true');
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

    // Remove price mapping calculation since it's hardcoded to 1500 EGP
    // If the quantity select still exists in DOM, disable its event listener or ignore it.

    // Handle form submission
    let isSubmitting = false;
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        isSubmitting = true;

        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loader = submitBtn.querySelector('.btn-loader');

        // Capture data
        const name = document.getElementById('full-name').value;
        const phone = document.getElementById('phone').value;
        const gov = document.getElementById('governorate').value;
        const address = document.getElementById('address').value;
        // Hardcode quantity to 1 because there are no packages anymore
        const qty = 'عبوة واحدة'; 
        const total = totalDisplay.textContent || '1500 جنيه';

        // Disable button and show loader
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';

        // Construct WhatsApp message
        const whatsappNumber = '201097752858';
        const message =
            `*طلب جديد لكبسولات إنسفيها - Ensfha*%0A` +
            `-------------------------------------------%0A` +
            `👤 *الاسم:* ${name}%0A` +
            `📱 *الموبايل:* ${phone}%0A` +
            `📍 *المحافظة:* ${gov}%0A` +
            `📦 *الكمية:* ${qty}%0A` +
            `🏠 *العنوان:* ${address}%0A` +
            `💰 *الإجمالي المباع به:* ${total}%0A` +
            `-------------------------------------------%0A` +
            `✅ الدفع عند الاستلام - شحن سريع`;

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

        // Simulation delay then redirect
        setTimeout(() => {
            // Open WhatsApp
            window.open(whatsappURL, '_blank');

            // ── Fire Lead + CompleteRegistration ─────────────────
            var numericTotal = 1500;
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
            isSubmitting = false;
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

    if (!hoursEl || !minutesEl || !secondsEl) return;

    // Set countdown to end of today + 24 hours
    let savedEnd = localStorage.getItem('ensfha_countdown_end');
    let endTime;

    if (savedEnd && parseInt(savedEnd) > Date.now()) {
        endTime = parseInt(savedEnd);
    } else {
        endTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        localStorage.setItem('ensfha_countdown_end', endTime.toString());
    }

    function updateCountdown() {
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
            // Reset countdown
            endTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('ensfha_countdown_end', endTime.toString());
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

    function runAnimation() {
        if (animated) return;
        animated = true;
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            if (!isNaN(target)) animateCounter(counter, target);
        });
    }

    // Use threshold:0 so it fires as soon as 1px is visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) runAnimation();
        });
    }, { threshold: 0 });

    const proofBar = document.querySelector('.social-proof-bar');
    if (proofBar) {
        observer.observe(proofBar);
        // Also check immediately in case it's already in viewport on load
        const rect = proofBar.getBoundingClientRect();
        if (rect.top < window.innerHeight) runAnimation();
    } else {
        // Fallback: run after 1 second if no section found
        setTimeout(runAnimation, 1000);
    }
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

    let savedCount = localStorage.getItem('ensfha_remaining');
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
            localStorage.setItem('ensfha_remaining', count.toString());

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

/* ===== User Reviews Logic ===== */
function initReviews() {
    const ratingSelect = document.getElementById('rating-select');
    const reviewStarsInput = document.getElementById('review-stars');
    const stars = ratingSelect ? ratingSelect.querySelectorAll('.star-btn') : [];

    if (ratingSelect) {
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt(e.target.dataset.val);
                reviewStarsInput.value = val;
                
                stars.forEach(s => {
                    if (parseInt(s.dataset.val) <= val) {
                        s.style.color = '#ffc107'; // Active star color
                        s.classList.add('active');
                    } else {
                        s.style.color = '#ccc';   // Inactive star color
                        s.classList.remove('active');
                    }
                });
            });
        });
    }

    renderReviews();
}

function submitReview(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('reviewer-name');
    const textInput = document.getElementById('review-text');
    const starsInput = document.getElementById('review-stars');
    const successMsg = document.getElementById('review-success-msg');
    
    const name = nameInput.value.trim() || 'عميل لـ Ensfha';
    const text = textInput.value.trim();
    const stars = parseInt(starsInput.value) || 5;
    
    if (!text) return;
    
    const newReview = {
        name: name,
        text: text,
        stars: stars,
        date: 'منذ قليل'
    };
    
    let reviews = JSON.parse(localStorage.getItem('ensfha_reviews')) || getInitialReviews();
    reviews.unshift(newReview);
    localStorage.setItem('ensfha_reviews', JSON.stringify(reviews));
    
    renderReviews();
    
    nameInput.value = '';
    textInput.value = '';
    
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
        document.getElementById('reviews-list').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 2000);
}

function getInitialReviews() {
    return [
        {
            name: 'نجوى فؤاد',
            text: 'نتيجته روعة بجد، حسيت بفرق من تالت يوم في سد الشهية وحرق الدهون.',
            stars: 5,
            date: 'منذ يومين'
        },
        {
            name: 'علي محمود',
            text: 'آمن جداً ومحسيتش بأي أعراض جانبية زي المنتجات التانية اللي جربتها.',
            stars: 5,
            date: 'منذ 3 أيام'
        },
        {
            name: 'دعاء سعيد',
            text: 'ممتاز وعن تجربة، نزلت عليه 7 كيلو في أول شهر بدون حرمان.',
            stars: 4,
            date: 'منذ أسبوع'
        }
    ];
}

let currentReviewIndex = 0;

function renderReviews() {
    const list = document.getElementById('reviews-list');
    const countEl = document.getElementById('reviews-count');
    
    if (!list) return;
    
    const reviews = JSON.parse(localStorage.getItem('ensfha_reviews')) || getInitialReviews();
    
    list.innerHTML = '';
    
    reviews.forEach(review => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<span style="color: ${i <= review.stars ? '#ffc107' : '#ccc'}; font-size: 1.2rem;">★</span>`;
        }
        
        const reviewEl = document.createElement('div');
        reviewEl.style.cssText = 'padding: 20px; border-radius: 10px; background: #fdfdfd; border: 1px solid #eee; display: flex; flex-direction: column; gap: 10px; min-width: 100%; box-sizing: border-box;';
        reviewEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
                <strong style="color: var(--primary); font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                    <div style="width: 35px; height: 35px; background: var(--primary); color: #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 1.2rem;">
                        ${review.name.charAt(0)}
                    </div>
                    ${review.name}
                </strong>
                <span style="color: #888; font-size: 0.9rem;">${review.date}</span>
            </div>
            <div>
                ${starsHtml}
            </div>
            <p style="color: #444; line-height: 1.6; margin: 0; font-size: 1.05rem;">"${review.text}"</p>
        `;
        list.appendChild(reviewEl);
    });
    
    if (countEl) {
        countEl.textContent = reviews.length;
    }

    updateCarousel();
}

function updateCarousel() {
    const list = document.getElementById('reviews-list');
    const reviewsElements = document.querySelectorAll('#reviews-list > div');
    if (!list || reviewsElements.length === 0) return;
    
    // RTL Carousel translate logic (positive translates right)
    list.style.transform = `translateX(calc(${currentReviewIndex * 100}% + ${currentReviewIndex * 20}px))`;
}

// Ensure initReviews runs when DOM is loaded and attach carousel controls
document.addEventListener('DOMContentLoaded', () => {
    initReviews();

    const prevBtn = document.getElementById('prev-review');
    const nextBtn = document.getElementById('next-review');
    
    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const list = document.getElementById('reviews-list');
            const total = list ? list.children.length : 0;
            if (currentReviewIndex < total - 1) {
                currentReviewIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentReviewIndex > 0) {
                currentReviewIndex--;
                updateCarousel();
            }
        });
    }
});
