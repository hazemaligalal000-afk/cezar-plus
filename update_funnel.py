import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update the Offer Section with 3 Bundles
offer_old = r'<section class="section offer-section".*?<!-- ==================== ORDER FORM SECTION'
offer_new = """<section class="section offer-section" id="offer">
        <div class="container">
            <div class="section-header">
                <span class="section-badge">🔥 عروض الباقات الحصرية</span>
                <h2 class="section-title">اختر الباقة الأنسب لك ولأهدافك</h2>
                <p class="section-subtitle">نوفر لك أفضل قيمة مقابل السعر لضمان استمراريتك وتحقيق حلمك</p>
            </div>

            <style>
                .packages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
                .pkg-card { background: #fff; border-radius: 20px; padding: 30px; text-align: center; position: relative; border: 2px solid #eaeaea; transition: var(--transition); display: flex; flex-direction: column; }
                .pkg-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--primary); }
                .pkg-bestseller { border-color: var(--primary); box-shadow: 0 10px 40px rgba(46, 204, 113, 0.2); transform: scale(1.05); z-index: 2; }
                .pkg-bestseller:hover { transform: scale(1.05) translateY(-5px); }
                .pkg-badge { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; padding: 5px 20px; border-radius: 20px; font-weight: bold; font-size: 0.9rem; box-shadow: 0 5px 15px rgba(46,204,113,0.3); white-space: nowrap; }
                .pkg-title { font-size: 1.5rem; color: var(--text-dark); margin: 20px 0 10px; }
                .pkg-desc { color: #666; font-size: 0.9rem; margin-bottom: 20px; min-height: 40px; }
                .pkg-price-wrap { display: flex; justify-content: center; align-items: baseline; gap: 10px; margin-bottom: 25px; }
                .pkg-new { font-size: 2.5rem; font-weight: 900; color: var(--text-dark); }
                .pkg-currency { font-size: 1.2rem; font-weight: bold; color: #888; }
                .pkg-old { text-decoration: line-through; color: #aaa; font-size: 1.1rem; }
                .pkg-features { flex-grow: 1; text-align: right; margin-bottom: 30px; }
                .pkg-feature { margin-bottom: 15px; color: var(--text-dark); font-weight: 500; display: flex; align-items: center; gap: 10px; }
                .pkg-feature i { color: var(--primary); }
                .bonus-box { background: #fffcf0; border: 1px dashed #f1c40f; border-radius: 10px; padding: 15px; margin-top: 15px; text-align: right; font-size: 0.9rem; font-weight: bold; color: #d35400; }
                @media (max-width: 768px) { .pkg-bestseller { transform: none; } .pkg-bestseller:hover { transform: translateY(-5px); } }
            </style>

            <div class="packages-grid">
                <!-- Package 1 -->
                <div class="pkg-card">
                    <h3 class="pkg-title">باقة التجربة</h3>
                    <p class="pkg-desc">عبوة واحدة تكفي لمدة شهر - مثالية للتعرف على المنتج</p>
                    <div class="pkg-price-wrap">
                        <span class="pkg-old">2000</span>
                        <span class="pkg-new">1500</span>
                        <span class="pkg-currency">ج.م</span>
                    </div>
                    <div class="pkg-features">
                        <div class="pkg-feature"><span>✅</span> عبوة واحدة (30 كبسولة)</div>
                        <div class="pkg-feature"><span>✅</span> شحن مجاني لأي محافظة</div>
                        <div class="pkg-feature"><span>✅</span> الدفع بعد الاستلام والمعاينة</div>
                    </div>
                    <a href="#order-section" class="btn btn-outline full-width pkg-btn" data-pkg="1">اختيار باقة التجربة</a>
                </div>

                <!-- Package 2 -->
                <div class="pkg-card pkg-bestseller">
                    <div class="pkg-badge">🔥 الأكثر مبيعاً - تخفيض مضاعف</div>
                    <h3 class="pkg-title">باقة التحول الشامل</h3>
                    <p class="pkg-desc">احصل على 3 عبوات بسعر 2 فقط - تكفي 3 أشهر</p>
                    <div class="pkg-price-wrap">
                        <span class="pkg-old">6000</span>
                        <span class="pkg-new">3000</span>
                        <span class="pkg-currency">ج.م</span>
                    </div>
                    <div class="pkg-features">
                        <div class="pkg-feature"><span>✅</span> 3 عبوات (اِشترِ 2 واحصل على 1 مجاناً)</div>
                        <div class="pkg-feature"><span>✅</span> شحن مجاني وسريع</div>
                        <div class="pkg-feature"><span>✅</span> ضمان استعادة الأموال 14 يوماً</div>
                        <div class="pkg-feature"><span>✅</span> أولوية المتابعة الطبية</div>
                        <div class="bonus-box">
                            🎁 هدية مجانية: كتاب إلكتروني "أنظمة غذائية لكسر ثبات الوزن" (بقيمـة 300 ج.م)
                        </div>
                    </div>
                    <a href="#order-section" class="btn btn-primary btn-xl pulse-animate full-width pkg-btn" data-pkg="3">اطلب باقة التحول الآن</a>
                </div>

                <!-- Package 3 -->
                <div class="pkg-card">
                    <h3 class="pkg-title">باقة الكورس الكامل</h3>
                    <p class="pkg-desc">احصل على 5 عبوات بسعر 3 فقط - الخيار الأوفر</p>
                    <div class="pkg-price-wrap">
                        <span class="pkg-old">10000</span>
                        <span class="pkg-new">4500</span>
                        <span class="pkg-currency">ج.م</span>
                    </div>
                    <div class="pkg-features">
                        <div class="pkg-feature"><span>✅</span> 5 عبوات (اِشترِ 3 واحصل على 2 مجاناً)</div>
                        <div class="pkg-feature"><span>✅</span> شحن مجاني V.I.P</div>
                        <div class="bonus-box">
                            🎁 هديتين: الكتاب الإلكتروني + متابعة أسبوعية مباشرة مع أخصائي تغذية
                        </div>
                    </div>
                    <a href="#order-section" class="btn btn-outline full-width pkg-btn" data-pkg="5">اختيار الكورس الكامل</a>
                </div>
            </div>
        </div>
    </section>

<!-- ==================== ORDER FORM SECTION"""
html = re.sub(offer_old, offer_new, html, flags=re.DOTALL)

# 2. Unhide Quantity selector and populate it with bundles
dropdown_old = r'<div class="form-group" style="display: none;">\s*<label for="quantity">عدد العبوات</label>\s*<div class="input-wrapper">\s*<span class="input-icon">📦</span>\s*<select id="quantity" name="quantity">\s*<option value="1" selected>عبوة واحدة \(بـ 1500 ج\)</option>\s*</select>\s*</div>\s*</div>'
dropdown_new = """<div class="form-group full-width">
                            <label for="quantity">اختر الباقة</label>
                            <div class="input-wrapper">
                                <span class="input-icon">📦</span>
                                <select id="quantity" name="quantity" required style="font-weight: bold; color: var(--primary);">
                                    <option value="1">باقة التجربة (عبوة واحدة) - 1500 ج</option>
                                    <option value="3" selected>🔥 باقة التحول (3 عبوات بسعر 2) - 3000 ج + هدية</option>
                                    <option value="5">الكورس الكامل (5 عبوات بسعر 3) - 4500 ج + هدايا</option>
                                </select>
                            </div>
                        </div>"""
html = re.sub(dropdown_old, dropdown_new, html, flags=re.DOTALL)

# 3. Inject Upsell Modal before order-success
order_success_html = r'<div id="order-success" class="order-success-msg" style="display: none;">'
upsell_html = """
                <!-- UPSELL MODAL -->
                <div id="upsell-modal" class="order-success-msg" style="display: none; border: 2px dashed #f39c12; background: #fffdf5;">
                    <div class="success-icon" style="background: #f39c12;">⏳</div>
                    <h3 style="color: #d35400;">انتظر! طلبك لم يكتمل بعد...</h3>
                    <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 20px;">تسريع حرق الدهون بنسبة 40% مع شاي الديتوكس الصحي!</p>
                    <div style="background: #fff; padding: 15px; border-radius: 10px; margin-bottom: 20px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 15px; text-align: right;">
                        <img src="images/product.jpg" alt="Detox Tea" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover; filter: hue-rotate(90deg);">
                        <div>
                            <h4 style="margin: 0 0 5px; color: var(--text-dark);">شاي ديتوكس التخسيس</h4>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">يخلص الجسم من السموم ويعالج الانتفاخات ويسرع من فعالية الكبسولات.</p>
                            <div style="margin-top: 5px;">
                                <span style="text-decoration: line-through; color: #aaa; font-size: 0.9rem;">600 ج.م</span>
                                <span style="font-weight: bold; color: #e74c3c; font-size: 1.1rem; margin-right: 5px;">فقط 300 ج.م</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-primary pulse-animate" onclick="acceptUpsell()" style="width: 100%; margin-bottom: 10px; font-size: 1.1rem; background: #2ecc71;">نعم، أضف شاي الديتوكس لطلبي (وفر 50%) ✅</button>
                    <button class="btn btn-outline" onclick="declineUpsell()" style="width: 100%; border: none; color: #888; text-decoration: underline;">لا شكراً، أكمل طلبي بدون إضافة</button>
                </div>
                
                <div id="order-success" class="order-success-msg" style="display: none;">"""
html = html.replace(order_success_html, upsell_html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
