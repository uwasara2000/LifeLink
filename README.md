# LifeLink 🩸

LifeLink is a blood donation network platform designed to connect blood donors, recipients, and hospitals seamlessly.

## Features

- **Donor Registration & Search**: Find donors nearby by blood type and location.
- **Interactive Map**: Locate blood donors and blood drives using the interactive map.
- **Blood Requests**: Submit and track urgent blood donation requests.
- **Hospital Directory**: Browse participating hospitals and medical facilities.
- **Authentication**: Secure sign-up and login powered by Firebase Authentication.

## Project Structure

```
├── backend/            # Express.js backend server and API routes
├── frontend/           # Web client (HTML, CSS, JavaScript, Leaflet map)
│   ├── css/            # Style sheets
│   ├── js/             # Application logic and Firebase client
│   └── images/         # Assets and icons
├── firebase.json       # Firebase Hosting configuration
└── package.json        # Root scripts and dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/uwasara2000/LifeLink.git
   cd LifeLink
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT
