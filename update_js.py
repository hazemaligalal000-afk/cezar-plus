import re

with open("script.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Update initOrderForm to handle price changes and Upsell logic
init_order_form_regex = re.compile(r'function initOrderForm\(\) \{.*?\n\}\n\nfunction resetForm\(\)', re.DOTALL)

new_init_order = """let currentOrderData = null;

function initOrderForm() {
    const form = document.getElementById('product-order-form');
    const qtySelect = document.getElementById('quantity');
    const priceDisplay = document.getElementById('summary-price');
    const totalDisplay = document.getElementById('summary-total');
    const upsellModal = document.getElementById('upsell-modal');
    
    if (!form) return;

    // Package Selection Buttons (Link to form)
    document.querySelectorAll('.pkg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pkgId = btn.getAttribute('data-pkg');
            if(qtySelect) {
                qtySelect.value = pkgId;
                qtySelect.dispatchEvent(new Event('change'));
            }
        });
    });

    // Handle Quantity Change
    const priceMap = {
        '1': 1500,
        '3': 3000,
        '5': 4500
    };
    
    const nameMap = {
        '1': 'عبوة واحدة',
        '3': 'باقة التحول (3 عبوات)',
        '5': 'الكورس الكامل (5 عبوات)'
    };

    if (qtySelect) {
        qtySelect.addEventListener('change', () => {
            const val = qtySelect.value;
            const price = priceMap[val] || 1500;
            priceDisplay.textContent = price + ' جنيه';
            totalDisplay.textContent = price + ' جنيه';
        });
    }

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
        const qtyVal = qtySelect ? qtySelect.value : '1';
        const qtyStr = nameMap[qtyVal] || 'عبوة واحدة';
        const price = priceMap[qtyVal] || 1500;
        
        currentOrderData = { name, phone, gov, address, qtyStr, price, total: price };

        // Show Loader
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';

        setTimeout(() => {
            form.style.display = 'none';
            upsellModal.style.display = 'block';
            document.getElementById('order-section').scrollIntoView({ behavior: 'smooth' });
            
            // Re-enable button
            submitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
            isSubmitting = false;
        }, 800);
    });
}

function processFinalOrder(upsold) {
    const successMsg = document.getElementById('order-success');
    const upsellModal = document.getElementById('upsell-modal');
    
    upsellModal.style.display = 'none';
    successMsg.style.display = 'block';
    
    if (upsold) {
        currentOrderData.qtyStr += ' + شاي ديتوكس';
        currentOrderData.total += 300;
    }
    
    const data = currentOrderData;
    
    const whatsappNumber = '201097752858';
    const message = `*طلب جديد لكبسولات لافيتاسانا - Iavitasana*%0A` +
        `-------------------------------------------%0A` +
        `👤 *الاسم:* ${data.name}%0A` +
        `📱 *الموبايل:* ${data.phone}%0A` +
        `📍 *المحافظة:* ${data.gov}%0A` +
        `📦 *الكمية:* ${data.qtyStr}%0A` +
        `🏠 *العنوان:* ${data.address}%0A` +
        `💰 *الإجمالي:* ${data.total} جنيه%0A` +
        `-------------------------------------------%0A` +
        `✅ الدفع عند الاستلام`;

    const orderData = {
        name: data.name,
        phone: data.phone,
        governorate: data.gov,
        address: data.address,
        quantity: data.qtyStr,
        total_price: data.total + ' جنيه'
    };

    const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwGED_jVHQyoonsLM-Rz8zd9dIq1CBHb8AM5QNn8kuYoExNMDnt-vuxFClFp0k53HbCeg/exec';

    fetch(gasWebAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        body: JSON.stringify(orderData)
    }).catch(err => console.error('Sheet Sync Error:', err));

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');

    trackLeadEvent(data.name, data.phone, data.gov, data.qtyStr, data.total);
}

function acceptUpsell() {
    processFinalOrder(true);
}

function declineUpsell() {
    processFinalOrder(false);
}

function resetForm()"""

js = init_order_form_regex.sub(new_init_order, js)

with open("script.js", "w", encoding="utf-8") as f:
    f.write(js)
