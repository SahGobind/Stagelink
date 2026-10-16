# StarCast — Professional Casting & Acting Opportunity Platform

StarCast is a modern, cinematic, and professional web platform that connects actresses and actors with top directors, producers, and casting agencies.

## Technology Stack

- **React 19** (Functional components, custom hooks, Context API)
- **Vite** (Next-generation frontend tooling and fast HMR)
- **JavaScript (ES6+)**
- **Tailwind CSS v3** (Custom cinematic design tokens, sleek typography, responsive grid)
- **React Router DOM v7** (Declarative routing, protected & role-based route guards)
- **Lucide React** (Clean, modern iconography)
- **React Hook Form & Zod** (Performant form handling and schema validation)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

### 1. Installation

```bash
# Navigate to the frontend directory
cd Frontend

# Install project dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 3. Production Build

```bash
# Compile and optimize for production
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
src/
  assets/
    images/
    icons/
  components/
    common/         # Reusable UI primitives (Button, Input, Select, Modal, etc.)
    layout/         # Public and Dashboard navigation, headers, footers
    opportunities/  # Casting cards, filters, search, and grids
    profile/        # Performer portfolio, credits, stats, and headers
    applications/   # Audition cards, progress timelines, status badges
    messaging/      # Direct messages, chat window, and composers
    notifications/  # Activity alerts and filter tabs
  layouts/          # Layout wrappers (Public, Auth, Candidate, Admin)
  pages/
    public/         # Home, About, How It Works, Contact
    auth/           # Sign Up, Login, Forgot Password, Reset Password
    opportunities/  # Browse Castings, Casting Details
    candidate/      # Performer Dashboard, Profile, Applications, Messages, etc.
    admin/          # Studio Dashboard, Performer Directory, Post Casting, etc.
    errors/         # 404 Not Found, 403 Unauthorized
  context/          # AuthContext, AppContext, NotificationContext
  data/             # Local mock datasets for development
  hooks/            # useAuth, useLocalStorage, useDebounce
  routes/           # AppRouter, ProtectedRoute, RoleBasedRoute
  services/         # Client-side mock service abstractions
  utils/            # Constants, formatters, Zod validation schemas
  App.jsx
  main.jsx
  index.css
```

## Available Routes

### Public
- `/` — Homepage
- `/about` — About Us
- `/how-it-works` — How It Works
- `/contact` — Contact Support
- `/opportunities` — Browse Castings
- `/opportunities/:id` — Casting Call Details

### Authentication
- `/signup` — Registration (Performer / Studio)
- `/login` — Sign In
- `/forgot-password` — Password Recovery
- `/reset-password` — New Password Setup

### Candidate Portal (Protected)
- `/candidate/dashboard` — Overview & Recommendations
- `/candidate/profile/setup` — Initial Profile Onboarding
- `/candidate/profile` — Full Performer Profile
- `/candidate/profile/edit` — Edit Bio & Information
- `/candidate/saved-opportunities` — Bookmarked Roles
- `/candidate/applications` — Active & Past Submissions
- `/candidate/applications/:id` — Audition Status & Timeline
- `/candidate/messages` — Direct Casting Messages
- `/candidate/notifications` — Real-Time Alerts
- `/candidate/settings` — Account Preferences

### Admin / Studio Portal (Protected)
- `/admin/dashboard` — Studio Analytics & Casting Summary
- `/admin/candidates` — Talent & Performer Search
- `/admin/candidates/:id` — Performer Portfolio View
- `/admin/opportunities` — Casting Call Manager
- `/admin/opportunities/create` — Post New Casting Call
- `/admin/opportunities/:id/edit` — Edit Casting Call
- `/admin/applications` — Submissions & Audition Reviews
- `/admin/messages` — Casting Studio Messages
- `/admin/settings` — Studio Configuration

### Errors
- `/unauthorized` — 403 Unauthorized Page
- `*` — 404 Scene Not Found Page
