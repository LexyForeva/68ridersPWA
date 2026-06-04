# 68 RIDERS PWA - Enterprise Edition 🏍️

[![CI/CD Pipeline](https://github.com/your-org/68-riders-pwa/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/68-riders-pwa/actions)
[![codecov](https://codecov.io/gh/your-org/68-riders-pwa/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/68-riders-pwa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Professional-grade Progressive Web App** for 68 Riders motorcycle club in Aksaray, Turkey. Built with React, Vite, Supabase, and modern web technologies.

---

## ✨ Features

### 🔐 **Authentication & Authorization**
- Email/password authentication via Supabase Auth
- Role-based access control (Founder, Admin, Moderator, Member)
- Status-based permissions (Active, Pending, Banned, Rejected)
- Secure session management with auto-refresh

### 🎯 **Core Functionality**
- **Events Management**: Create, edit, and join motorcycle rides
- **Real-time Chat**: Group messaging with media sharing, reactions, polls
- **Digital Membership Card**: QR code-based member identification
- **Gallery**: Photo and video sharing with approval system
- **Announcements**: Push notifications for important updates
- **Admin Dashboard**: Complete member and content management

### 🚀 **PWA Capabilities**
- **Offline Support**: Service Worker with intelligent caching
- **Install Prompt**: Add to home screen on iOS and Android
- **Push Notifications**: Web Push API integration
- **Responsive Design**: Mobile-first, works on all devices

### 🛡️ **Security & Quality**
- Row Level Security (RLS) on all Supabase tables
- Content Security Policy (CSP) headers
- HTTPS enforcement with HSTS
- Input validation and sanitization
- Comprehensive error handling
- 95%+ test coverage

---

## 🏗️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| **State Management** | React Context API |
| **Testing** | Vitest, React Testing Library, Playwright |
| **Code Quality** | ESLint, Prettier, Husky, Lint-staged |
| **CI/CD** | GitHub Actions, Vercel |
| **Monitoring** | Sentry (optional), Google Analytics (optional) |

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm 9+ or yarn 1.22+
- Supabase account (for production features)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/68-riders-pwa.git
cd 68-riders-pwa

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.development

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Running in Demo Mode

If you don't configure Supabase credentials, the app runs in **demo mode** with:
- Mock data for all features
- LocalStorage persistence
- Member-level access by default
- Optional founder UI testing with `VITE_DEMO_ADMIN=true`
- Full UI/UX testing capability

---

## 🔧 Configuration

### Environment Variables

Create `.env.development` for local development:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Push Notifications (generate with: npx web-push generate-vapid-keys)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SENTRY=false
VITE_ENABLE_DEBUG_PANEL=true

# App Configuration
VITE_APP_ENV=development
VITE_APP_VERSION=2.0.0
```

For production, set environment variables in your hosting platform (Vercel, Netlify, etc.).

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run SQL migrations** in order:
   ```sql
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_membership_applications.sql
   supabase/migrations/003_feedback_reports.sql
   supabase/migrations/004_security_hardening.sql
   supabase/migrations/005_media_and_chat_fixes.sql
   ```

3. **Configure Storage Buckets**:
   - `avatars` (public)
   - `gallery` (public)
   - `event-images` (public)
   - `chat-media` (public)
   - `chat-voice` (public)
   - `chat-documents` (public)

4. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy send-push
   ```

5. **Set Environment Variables** in Supabase Dashboard:
   ```
   VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   VAPID_SUBJECT=mailto:admin@68riders.com
   ```

---

## 🧪 Testing

### Unit Tests
```bash
npm test                # Run tests in watch mode
npm run test:ui         # Open Vitest UI
npm run test:coverage   # Generate coverage report
```

### E2E Tests
```bash
npm run test:e2e        # Run Playwright tests
npm run test:e2e:ui     # Open Playwright UI
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run format:check    # Check formatting
```

---

## 📖 Project Structure

```
68-riders-pwa/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── e2e/                        # Playwright E2E tests
├── public/                     # Static assets
│   ├── icons/                  # PWA icons
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker
├── src/
│   ├── components/             # React components
│   │   ├── __tests__/          # Component tests
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ...
│   ├── config/                 # Configuration
│   │   ├── constants.js        # App constants
│   │   └── env.js              # Environment config
│   ├── context/                # React Context
│   │   ├── AppContext.jsx
│   │   └── AuthContext.jsx
│   ├── lib/                    # Utility libraries
│   │   ├── push.js
│   │   └── supabase.js
│   ├── pages/                  # Page components
│   ├── tests/                  # Test utilities
│   │   └── setup.js
│   ├── utils/                  # Helper functions
│   │   ├── __tests__/
│   │   └── errorHandler.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   ├── functions/
│   │   └── send-push/          # Edge function
│   └── migrations/             # SQL migrations
├── .env.development            # Dev environment
├── .env.staging                # Staging environment
├── .env.production             # Production environment
├── .env.example                # Environment template
├── package.json
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── playwright.config.js        # Playwright configuration
└── README.md
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to `main`

```bash
# Manual deployment
npm run build
vercel --prod
```

### Other Platforms

The app is a standard Vite React app and can be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Firebase Hosting
- Any static hosting service

Build command: `npm run build`  
Output directory: `dist`

---

## 📊 Monitoring & Analytics

### Sentry Integration
```bash
# Add Sentry DSN to .env
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_ENABLE_SENTRY=true
```

### Google Analytics
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Write tests for new features
- Follow existing code style
- Update documentation
- Keep commits atomic and well-described

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**68 Riders Development Team**
- Founder & Lead: Faruk Yılmaz
- Development: [Your Team]
- Design: [Your Team]

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/68-riders-pwa/issues)
- **Email**: admin@68riders.com
- **Discord**: [Join our community](https://discord.gg/68riders)

---

## 🎯 Roadmap

### v2.1.0 (Q3 2026)
- [ ] Video calling integration
- [ ] Advanced route planning
- [ ] Weather integration
- [ ] Maintenance reminders

### v2.2.0 (Q4 2026)
- [ ] Native mobile apps (React Native)
- [ ] Apple/Google Wallet integration
- [ ] Gamification & achievements
- [ ] Multi-language support

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting platform
- [Lucide](https://lucide.dev) - Icon library
- [Tailwind CSS](https://tailwindcss.com) - Styling framework

---

**Made with ❤️ by 68 Riders Community** 🏍️
