# BIT GROUP C Attendance System

Beautiful, secure attendance marking system for BIT GROUP C built with React and Cloudflare Workers.

## Features

- 🎓 Student portal for marking attendance
- 🔐 Secure PIN verification (surname & index-based)
- 👨‍💼 Admin dashboard for managing students
- 📊 Real-time attendance statistics
- 🛡️ Fraud detection and blacklist system
- 🚀 Deployed on GitHub Pages + Cloudflare Workers

## Quick Start

### Prerequisites
- Node.js v16+
- Git

### Installation

\`\`\`bash
# Clone repository
git clone https://github.com/codelabwithosman/bit-attendance.git
cd bit-attendance

# Install dependencies
npm install

# Start development server
npm start
\`\`\`

### Deployment

\`\`\`bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
\`\`\`

## Usage

### Student Portal
1. Navigate to https://codelabwithosman.github.io/bit-attendance
2. Search for your name or index
3. Enter your PIN (last 4 letters of surname OR last 5 digits of index)
4. Attendance will be marked automatically

### Admin Panel
1. Go to `/admin` route
2. Enter the admin PIN
3. Manage students, toggle attendance, view stats

## Architecture

- **Frontend**: React + React Router (GitHub Pages)
- **Backend**: Cloudflare Worker (API)
- **Storage**: Pastebin + Cloudflare KV (persistence)

## Security Features

- Device fingerprinting
- IP logging
- Session tokens (30 min expiry)
- Fraud attempt tracking
- Automatic blacklisting
- Protected students (cannot be deleted)

## License

MIT
