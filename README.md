# React Authentication with JWT (Access + Refresh)

A complete React single-page application implementing secure authentication using JWT access tokens and refresh tokens. Built with Axios, React Query, and React Hook Form.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hykura1501/ia04-react-authentication.git
   cd Source
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

**Backend (`backend/.env`):**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3000
```

### Running the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run start:dev
```
Backend will run on: `http://localhost:3000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📋 Features

- ✅ JWT Authentication with access & refresh tokens
- ✅ Access token stored in memory (session-based)
- ✅ Refresh token stored in localStorage (persistent)
- ✅ Automatic token refresh on 401 errors
- ✅ Axios interceptors for token management
- ✅ React Query for server state management
- ✅ React Hook Form with Zod validation
- ✅ Protected routes with authentication guards
- ✅ Error handling and user feedback

## 🛠️ Tech Stack

**Backend:**
- NestJS + TypeScript
- MongoDB + Mongoose
- Passport JWT
- bcryptjs

**Frontend:**
- React 19 + TypeScript
- Vite
- React Query
- React Hook Form + Zod
- Axios
- React Router
- Tailwind CSS + shadcn/ui

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Login (returns accessToken & refreshToken)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (requires Bearer token)
- `POST /auth/register` - Register new user

### User
- `GET /user/me` - Get current user info (requires Bearer token)

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Set env: `VITE_API_URL=<your-backend-url>`
3. Deploy

### Backend (Render/Railway)
1. Set environment variables (same as `.env`)
2. Build: `npm install && npm run build`
3. Start: `npm run start:prod`

### Public URLs
- **Frontend**: [Add your deployed frontend URL here]
- **Backend API**: [Add your deployed backend URL here]

## 📝 Project Structure

```
Source/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── user/     # User module
│   │   └── main.ts
│   └── package.json
├── frontend/         # React App
│   ├── src/
│   │   ├── pages/    # Login, SignUp, Dashboard
│   │   ├── services/ # API calls
│   │   ├── types/    # TypeScript types
│   │   └── components/
│   └── package.json
└── README.md
```

## ✅ Usage

1. **Register**: Navigate to `/signup` and create an account
2. **Login**: Use `/login` to authenticate
3. **Dashboard**: Access protected `/dashboard` after login
4. **Logout**: Click logout button to clear tokens

## 🔐 Authentication Flow

- Login → Receive accessToken & refreshToken
- Access token attached to all API requests
- On 401 error → Automatically refresh using refreshToken
- On refresh failure → Redirect to login
- Logout → Clear all tokens and redirect

---

**Created for AWDA IA03 Assignment** | React Authentication with JWT
