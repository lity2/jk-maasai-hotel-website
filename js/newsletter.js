document.addEventListener("DOMContentLoaded", function () {
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const statusMessage = document.getElementById('newsletter-status');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            if (!email) return;

            // Reset status
            statusMessage.style.display = 'none';
            statusMessage.textContent = '';
            statusMessage.style.color = '';

            try {
                // Disable button during request
                const submitBtn = newsletterForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;

                const response = await fetch('http://localhost:3000/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                statusMessage.style.display = 'flex';
                
                if (data.success) {
                    statusMessage.className = 'newsletter-status success';
                    statusMessage.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${data.message}</span>`;
                    newsletterForm.reset();
                } else {
                    statusMessage.className = 'newsletter-status error';
                    statusMessage.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${data.message}</span>`;
                }
            } catch (error) {
                console.error('Subscription error:', error);
                statusMessage.style.display = 'flex';
                statusMessage.className = 'newsletter-status error';
                statusMessage.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>An error occurred. Please try again later.</span>`;
            } finally {
                // Re-enable button
                const submitBtn = newsletterForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Subscribe';
                submitBtn.disabled = false;
            }
        });
    }
});
