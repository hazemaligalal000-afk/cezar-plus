import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Remove User Reviews section (761 to 818 approximate)
user_reviews_regex = re.compile(r'<!-- ==* USER REVIEWS SECTION ==* -->.*?</section>', re.DOTALL)
html = user_reviews_regex.sub('', html)

# 2. Extract Offer Section and Order Section and How section for moving
offer_regex = re.compile(r'(<!-- ==* OFFER SECTION ==* -->.*?</section>)', re.DOTALL)
offer_match = offer_regex.search(html)
if offer_match:
    offer_section = offer_match.group(1)
    html = offer_regex.sub('', html)

order_regex = re.compile(r'(<!-- ==* ORDER FORM SECTION ==* -->.*?</section>)', re.DOTALL)
order_match = order_regex.search(html)
if order_match:
    order_section = order_match.group(1)
    html = order_regex.sub('', html)

# Replace Mid CTA with Offer and Order sections
mid_cta_regex = re.compile(r'<!-- ==* MID CTA ==* -->.*?</section>', re.DOTALL)
if getattr(mid_cta_regex, "search", None) and mid_cta_regex.search(html):
    replacement = ""
    if offer_match: replacement += offer_section + "\n\n"
    if order_match: replacement += order_section + "\n\n"
    html = mid_cta_regex.sub(replacement, html)

# 3. Modify "How to Use" to be an accordion instead of cards
how_section_old = """            <div class="steps-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
                <div class="step-card">
                    <div class="step-icon">⏰</div>
                    <h3>مرة واحدة يومياً</h3>
                    <p>كبسولة واحدة يومياً قبل الأكل بنصف ساعة</p>
                </div>
                <div class="step-card">
                    <div class="step-icon">🚰</div>
                    <h3>التزمي بالمياه</h3>
                    <p>شرب كمية كافية من المياه خلال اليوم لتعزيز الحرق للدهون</p>
                </div>
            </div>"""

how_section_new = """            <div class="faq-list">
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">
                        <span>كيفية الاستخدام اليومي؟</span>
                        <span class="faq-arrow">▼</span>
                    </button>
                    <div class="faq-answer">
                        <p>تناولي كبسولة واحدة يومياً قبل الأكل بنصف ساعة للحصول على أفضل النتائج.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFaq(this)">
                        <span>هل هناك التزامات أخرى؟</span>
                        <span class="faq-arrow">▼</span>
                    </button>
                    <div class="faq-answer">
                        <p>تأكدي من شرب كمية كافية من المياه خلال اليوم (ما يقلل من 2-3 لتر) لتعزيز الحرق للدهون وتنشيط الأيض.</p>
                    </div>
                </div>
            </div>"""

html = html.replace(how_section_old, how_section_new)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
