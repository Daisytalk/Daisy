# Daisy Authentication System

## 🚀 Quick Setup

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **Login with test credentials** below

## 🧪 Test Users for Development

### Regular User (Completed Onboarding)
- **Email**: `test@example.com`
- **Password**: `password`
- **Status**: Trial user with completed onboarding
- **Access**: Dashboard, Profile, Chat
- **Trial**: 3 days remaining

### Admin User
- **Email**: `admin@example.com`  
- **Password**: `password`
- **Status**: Active subscription with completed onboarding
- **Access**: Dashboard, Profile, Chat, Admin Panel
- **Subscription**: Active (no trial)

## 🎯 Test Flow

### 1. Login as Test User
1. Go to `/auth/login`
2. Enter: `test@example.com` / `password`
3. Should redirect to `/dashboard`
4. Can access `/profile` to see onboarding responses
5. Can access `/chat` to start conversations

### 2. View Profile Data
The test user has pre-populated onboarding responses:
- **Gender**: Male
- **Age Range**: 26-35
- **Topics**: Anxiety and Stress, Work-Life Balance, Self-Esteem
- **Mental Health Rating**: 6/10
- **Previous Therapy**: Yes
- **Goals**: "I want to work on managing stress from work and improving my confidence in social situations."

### 3. Admin Access
1. Login as admin user
2. Access `/admin/onboarding` to manage questions
3. Full access to all user areas

## 🔧 API Testing

### Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Onboarding Data
```bash
# Get user's onboarding data
curl -X GET http://localhost:3000/api/onboarding/data/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 User Journey Testing

1. **Landing Page** → Click "Talk To Daisy" or "Login"
2. **Login** → Use test credentials
3. **Dashboard** → See trial status and profile summary
4. **Profile** → View complete onboarding responses
5. **Chat** → Start conversation with AI (mock responses)
6. **Admin** → Manage onboarding questions (admin user only)

## 🚀 Ready Features

- ✅ **Authentication** - Login/logout with JWT tokens
- ✅ **Protected Routes** - Automatic redirects for unauthenticated users
- ✅ **Trial Management** - 3-day trial tracking
- ✅ **Onboarding Data** - Pre-populated responses for testing
- ✅ **Profile View** - Complete user profile with onboarding history
- ✅ **Admin Interface** - Question management system
- ✅ **Chat Interface** - Ready for AI integration

## 🔄 Reset Test Data

To reset or modify test data, edit the mock arrays in:
- `/api/auth/login/route.ts` - User credentials
- `/api/auth/me/route.ts` - User profile data  
- `/api/onboarding/data/[userId]/route.ts` - Onboarding responses