/**
 * LifeLink - Google Maps API Configuration
 * 
 * HOW TO GET YOUR FREE API KEY:
 * ─────────────────────────────
 * 1. Go to: https://console.cloud.google.com/
 * 2. Create a new project (e.g. "LifeLink")
 * 3. Go to "APIs & Services" → "Enable APIs"
 * 4. Enable: "Maps JavaScript API"
 * 5. Go to "APIs & Services" → "Credentials"
 * 6. Click "Create Credentials" → "API Key"
 * 7. Copy the key and paste it below (replace YOUR_GOOGLE_MAPS_API_KEY_HERE)
 * 
 * OPTIONAL (recommended for production):
 * - Restrict your key to your domain in the Credentials settings
 */

const GOOGLE_MAPS_API_KEY = "AIzaSyCQUxJV1vB3yg_WoyngqovodvFNshQ9V9s";

// Expose globally
if (typeof window !== 'undefined') {
    window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GOOGLE_MAPS_API_KEY };
}
