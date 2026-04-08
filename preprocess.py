import sys

with open('why-us.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace metadata
html = html.replace('<title>Amenities & Services – JK Maasai Hotel</title>', '<title>Why Choose Us – JK Maasai Hotel</title>')
html = html.replace('<li><a href="index.html#why-us">Why Us</a></li>\n                                <li><a href="amenities.html" class="is-active">Amenities & Services</a></li>', '<li><a href="why-us.html" class="is-active">Why Us</a></li>\n                                <li><a href="amenities.html">Amenities & Services</a></li>')
html = html.replace('<h1>Amenities & Services</h1>', '<h1>Why Choose Us</h1>')
html = html.replace('<p>Explore the many amenities and services that make us unique</p>', '<p>Discover what makes JK Maasai Hotel the perfect destination</p>')
html = html.replace('<a href="index.html">Home</a> &gt; Amenities & Services', '<a href="index.html">Home</a> &gt; Why Choose Us')

# Replace body content
start_marker = '<!-- MAIN CONTENT -->'
end_marker = '<!-- FOOTER -->'
if start_marker in html and end_marker in html:
    before = html.split(start_marker)[0]
    after = html.split(end_marker)[1]
    
    why_us_content = """<!-- MAIN CONTENT -->
    <section class="amenities-section reveal-on-scroll">
        <div class="why-us-grid">
            <div class="why-us-card">
                <div class="why-us-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </div>
                <h3>Peaceful Environment</h3>
                <p>A tranquil haven to relax and reconnect with nature.</p>
            </div>
            <div class="why-us-card">
                <div class="why-us-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                </div>
                <h3>Comfortable Rooms</h3>
                <p>Luxurious and cozy spaces designed for your comfort.</p>
            </div>
            <div class="why-us-card">
                <div class="why-us-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3>Friendly Service</h3>
                <p>Warm hospitality that makes you feel instantly at home.</p>
            </div>
            <div class="why-us-card">
                <div class="why-us-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3>Perfect for Every Traveler</h3>
                <p>Ideal for solos, couples, or family adventures alike.</p>
            </div>
            <div class="why-us-card">
                <div class="why-us-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3>Great Value</h3>
                <p>Premium experiences that fit perfectly within your budget.</p>
            </div>
        </div>
    </section>

    <!-- FOOTER -->"""
    html = before + why_us_content + after

# Fix the index.html#why-us across all html file references (for footer links or nav) if not already
with open('why-us.html', 'w', encoding='utf-8') as f:
    f.write(html)
