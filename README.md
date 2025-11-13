# BIT GROUP C Attendance System

> Powered by Alien Technology from Pluto for Higher Performance

A modern, secure, and fast attendance management system built with **pure HTML, CSS, and JavaScript** (no frameworks!), powered by Cloudflare Workers backend.

## ✨ Features

- ✅ **Pure HTML/CSS/JS** - No frameworks, just vanilla web technologies
- ⚡ **Cloudflare Workers Backend** - Lightning-fast serverless backend
- 💾 **Pastebin Data Storage** - Simple and reliable data persistence
- 🌐 **GitHub Pages Hosting** - Free and reliable hosting
- 🔐 **PIN Authentication** - Secure student verification
- 🛡️ **Fraud Detection** - Advanced device fingerprinting and IP tracking
- 🚫 **Blacklist System** - Automatic rule violation handling
- 📱 **Responsive Design** - Works perfectly on all devices
- 🌙 **Dark Theme** - Default dark mode, easy on the eyes

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bit-attendance.git
cd bit-attendance

# Start a local server (choose one)
python -m http.server 8080
# OR
npx http-server -p 8080
# OR
php -S localhost:8080

# Open in browser
open http://localhost:8080
```

### Deploy to GitHub Pages

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/bit-attendance.git
git push -u origin main

# 2. Enable GitHub Pages
# Go to Settings → Pages → Select 'main' branch → Save
```

Your site will be live at: `https://YOUR_USERNAME.github.io/bit-attendance/`

## 🔧 Configuration

### 1. Deploy Cloudflare Worker

Copy `cloudflare-worker.js` to Cloudflare Workers and update:

```javascript
const PASTEBIN_API_KEY = "your_api_key"
const PASTEBIN_PASTE_ID = "your_paste_id"
const ADMIN_PINCODE = "your_admin_pin"
```

Deploy to: `every.pupujiger.workers.dev` (or your custom URL)

### 2. Update API Configuration

Edit `js/config.js`:

```javascript
const API_BASE_URL = 'https://your-worker.workers.dev';
const ADMIN_PATH = 'your-secret-path'; // Change this!
```

## 📁 Project Structure

```
bit-attendance/
├── index.html              # Home page
├── attendance.html         # Mark attendance page
├── about.html             # About & contact page
├── prank.html             # Unauthorized access page
├── x9k2p7m4.html          # Hidden admin panel
├── cloudflare-worker.js   # Backend worker code
├── css/
│   └── styles.css         # All styles (dark theme)
├── js/
│   ├── config.js          # API configuration
│   ├── utils.js           # Helper functions
│   ├── navigation.js      # Navigation & theme
│   ├── home.js            # Home page logic
│   ├── attendance.js      # Attendance logic
│   └── admin.js           # Admin panel logic
└── README.md              # This file
```

## 📖 How It Works

### For Students

1. Navigate to **Mark Attendance** page
2. Search by name or index number
3. Select your name from suggestions
4. Enter PIN (last 5 digits of index number)
5. Click **Mark Attendance** - ONE TIME ONLY!

### For Administrators

The admin panel is **completely hidden**. Access it at:

```
https://your-site.com/?key=x9k2p7m4
```

Enter admin PIN when prompted.

**Admin Features:**
- Toggle attendance on/off
- Add/remove students (single or bulk)
- View real-time attendance
- Manage blacklist
- Clear attendance records
- View fraud attempts
- Protected students system

## ⚠️ System Rules

**Violate any rule and see what happens:**

1. Each student can only mark attendance **once per day**
2. Device sharing is **strictly prohibited**
3. PIN verification is **required**
4. Attempting to mark for another student = **instant blacklist**
5. Both students involved in fraud get attendance **voided**
6. Protected students cannot be deleted or blacklisted

## 👥 Contact

### Course Representatives

- **Myles** - 0500776941 - [WhatsApp](https://wa.me/233500776941)
- **Dhonzy** - 0345222358 - [WhatsApp](https://wa.me/233345222358)
- **Admin** - 0245222358 - [WhatsApp](https://wa.me/233245222358)

## 🔒 Security Features

- Device fingerprinting
- IP address tracking
- Strike system (warning → blacklist)
- Fraud attempt logging
- Protected student accounts
- Hidden admin routes
- Secure PIN authentication

## 🎨 Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Cloudflare Workers
- **Storage:** Pastebin API
- **Hosting:** GitHub Pages
- **No build tools, no dependencies!**

## 🛡️ Protected Students

These students cannot be deleted or blacklisted:

- `1686468923` - Osman Mohammed Abutazure
- `1685397148` - Portia Awusi Atsu
- `1700493421` - Princess Asiedua Annor

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera
- ✅ Mobile browsers

## 📄 License

MIT License - See LICENSE file for details

---

**🛸 Built with Alien Technology from Pluto**

© 2024 BIT GROUP C Attendance System. All rights reserved.

## Features

- **Pure HTML/CSS/JS** - No frameworks, just vanilla web technologies
- **Cloudflare Workers Backend** - Lightning-fast serverless backend
- **Pastebin Data Storage** - Simple and reliable data persistence
- **GitHub Pages Hosting** - Free and reliable hosting
- **PIN Authentication** - Secure student verification
- **Fraud Detection** - Advanced device fingerprinting and IP tracking
- **Blacklist System** - Automatic rule violation handling
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode Support** - Easy on the eyes, day or night

## Live Demo

Visit: [https://HiddenEye.github.io/bit-attendance](https://HiddenEye.github.io/bit-attendance)

## Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Cloudflare Workers
- **Storage:** Pastebin API
- **Hosting:** GitHub Pages
- **Version Control:** Git

## Getting Started

### Prerequisites

- Node.js and npm (for gh-pages deployment only)
- A web browser
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HiddenEye/bit-attendance.git
cd bit-attendance
```

2. Install dependencies (for deployment):
```bash
npm install
```

3. Start local development server:
```bash
# Using Python
python -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

## Deployment

### GitHub Pages

1. Update `package.json` with your GitHub username:
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/bit-attendance"
}
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```

3. Configure GitHub Pages:
   - Go to your repository settings
   - Navigate to Pages section
   - Set source to `gh-pages` branch

### Cloudflare Worker

1. The Cloudflare Worker code is in `cloudflare-worker.js`
2. Deploy it to Cloudflare Workers at: `every.pupujiger.workers.dev`
3. Update the API URL in `js/config.js` if needed

## Project Structure

```
bit-attendance/
├── index.html              # Home page
├── attendance.html         # Attendance marking portal
├── about.html             # About page with contact info
├── admin.html             # Prank page for unauthorized access
├── secure-login.html      # Hidden admin login
├── x-panel.html           # Admin control panel
├── css/
│   └── main.css           # All styles
├── js/
│   ├── config.js          # Configuration
│   ├── utils.js           # Utility functions
│   ├── theme.js           # Theme management
│   ├── admin-access.js    # Hidden admin access
│   ├── home.js            # Home page logic
│   ├── attendance.js      # Attendance portal logic
│   ├── about.js           # About page logic
│   └── admin-panel.js     # Admin panel logic
└── cloudflare-worker.js   # Backend worker code
```

## How It Works

### For Students

1. Visit the attendance page
2. Search for your name or index number
3. Select yourself from the results
4. Enter your PIN (last 5 digits of index number)
5. Mark your attendance - ONE TIME ONLY!

### For Administrators

The admin panel is hidden for security. Only authorized personnel with the secret PIN can access it.

**Admin Features:**
- View real-time statistics
- Enable/Disable attendance
- Add/Remove students
- Bulk upload students
- View attendance records
- Manage blacklist
- Monitor fraud attempts
- Clear attendance data

## System Rules

Violate any rule and see what happens:

1. One attendance per student per day
2. One device per student - sharing devices is prohibited
3. PIN verification required (last 5 digits of index number)
4. Attempting to mark for multiple students will result in blacklisting
5. Both students involved in fraud will have their attendance voided
6. Protected students are exempt from certain restrictions

## Contact

### Course Representatives

- **Myles** - 0500776941 - [WhatsApp](https://wa.me/233500776941)
- **Dhonzy** - 0345222358 - [WhatsApp](https://wa.me/233345222358)
- **Admin** - 0245222358 - [WhatsApp](https://wa.me/233245222358)

## Security Features

- Device fingerprinting for fraud detection
- IP address tracking
- Automatic blacklisting on rule violations
- Protected students system
- Hidden admin panel
- PIN-based authentication

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## License

MIT License - See LICENSE file for details

## Credits

Built with Alien Technology from Pluto

**Developer:** Alien Technology Team

---

© 2024 BIT GROUP C Attendance System. All rights reserved.
