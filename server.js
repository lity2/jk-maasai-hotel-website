const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'subscribers.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Endpoint to handle new subscriptions
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    try {
        // Read existing subscribers
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const subscribers = JSON.parse(data);

        // Check for duplicates
        if (subscribers.includes(email.toLowerCase())) {
            return res.status(409).json({ success: false, message: 'This email is already subscribed!' });
        }

        // Add new subscriber
        subscribers.push(email.toLowerCase());
        fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));

        return res.status(200).json({ success: true, message: 'Thank you for subscribing!' });
    } catch (error) {
        console.error('Error saving subscriber:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Newsletter Subscription API running on http://localhost:${PORT}`);
});
