import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove why-us block
start_tag = '<div id="why-us" style="margin-top: 5rem; padding-top: 2rem;">'
end_tag = '</div>\n        </div>\n    </section>\n\n    <!-- 3. ROOMS / ACCOMMODATION'

if start_tag in text and end_tag in text:
    before = text.split(start_tag)[0]
    after = text.split(end_tag)[1]
    text = before + '    </section>\n\n    <!-- 3. ROOMS / ACCOMMODATION' + after
    print("Why Us block removed.")
else:
    print("Why Us block NOT found.")

# 2. Add accommodation intro
insert_tag = '<section id="rooms" class="reveal-on-scroll">\n        <h2>Rooms &amp; Accommodation</h2>'
accommodation_intro = """<section id="rooms" class="reveal-on-scroll">
        <div id="accommodation-intro" style="max-width: 800px; margin: 0 auto 3.5rem auto; text-align: center;">
            <h2 style="color: var(--color-primary); margin-bottom: 1rem; border-bottom: none; font-size: 2rem;">Accommodation</h2>
            <p style="color: #666; font-size: 1.05rem; margin-bottom: 2rem;">
                Experience the perfect blend of modern comfort and authentic safari adventure. Our rooms are tailored to meet the needs of all our guests, ensuring a relaxing and memorable stay.
            </p>
            
            <div id="acc-extra-content" style="display: none; text-align: left; background: #f9f9f9; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                <div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center;">
                    <div style="flex: 1; min-width: 250px;">
                        <h4 style="color: var(--color-primary); margin-bottom: 0.75rem;"><i class="fa-solid fa-people-roof" style="margin-right: 8px; color: var(--color-accent);"></i>Family Comfort</h4>
                        <ul style="padding-left: 1.5rem; margin-bottom: 0; color: #555;">
                            <li>Spacious interconnecting rooms</li>
                            <li>Child-friendly amenities</li>
                            <li>Quiet environment for relaxation</li>
                        </ul>
                    </div>
                    <div style="flex: 1; min-width: 250px;">
                        <h4 style="color: var(--color-primary); margin-bottom: 0.75rem;"><i class="fa-solid fa-bell-concierge" style="margin-right: 8px; color: var(--color-accent);"></i>Guest Services</h4>
                        <ul style="padding-left: 1.5rem; margin-bottom: 0; color: #555;">
                            <li>Daily housekeeping details</li>
                            <li>Complimentary Wi-Fi access</li>
                            <li>24/7 attentive room service</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <button id="acc-toggle-btn" style="background: transparent; border: 1.5px solid var(--color-primary); color: var(--color-primary); padding: 0.6rem 2rem; border-radius: 30px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 0.95rem;">Learn More ↓</button>
        </div>"""

if insert_tag in text:
    text = text.replace(insert_tag, accommodation_intro + '\n\n        <!-- The original Rooms header was replaced but we keep the grid. -->')
    print("Accommodation intro added.")
else:
    print("Room tag NOT found.")

# Remove old Rooms & Accommodation header to avoid duplication and fix spacing
# The above replacement deliberately omitted "<h2>Rooms &amp; Accommodation</h2>" to let the new "Accommodation" heading take over.
# We also want to remove "<p>Choose a room that suits you. All our rooms are designed for comfort and calm.</p>" since it is replaced by intro.
old_p = '<p>Choose a room that suits you. All our rooms are designed for comfort and calm.</p>'
if old_p in text:
    text = text.replace(old_p, '')

# 3. Add JS toggle
js_target = '        });\n    </script>\n</body>'
js_add = """
            // Accommodation Toggle Logic
            const accBtn = document.getElementById('acc-toggle-btn');
            const accContent = document.getElementById('acc-extra-content');
            if (accBtn && accContent) {
                accBtn.addEventListener('click', function() {
                    if (accContent.style.display === 'none') {
                        accContent.style.display = 'block';
                        accBtn.innerHTML = 'Read Less &uarr;';
                        accBtn.style.backgroundColor = 'var(--color-primary)';
                        accBtn.style.color = 'white';
                    } else {
                        accContent.style.display = 'none';
                        accBtn.innerHTML = 'Learn More &darr;';
                        accBtn.style.backgroundColor = 'transparent';
                        accBtn.style.color = 'var(--color-primary)';
                    }
                });
            }
        });
    </script>
</body>"""

if js_target in text:
    text = text.replace(js_target, js_add)
    print("JS logic added.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
