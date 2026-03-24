# Frontend-Backend API Integration

## Overview
The frontend React application is now fully connected to the Spring Boot backend API for authentication.

## API Service
- **Location**: `frontend/src/services/api.js`
- **Base URL**: `http://localhost:8080/api`
- **Features**: 
  - Automatic token management
  - Error handling
  - Request/response logging (for debugging)

## Authentication Context
- **Location**: `frontend/src/context/AuthContext.jsx`
- **Features**:
  - User registration
  - User login
  - Token storage in localStorage
  - Automatic authentication check on app load
  - Loading states

## Updated Components

### Login Page (`frontend/src/pages/Login.jsx`)
- Form validation
- API integration for login
- Error handling and display
- Loading states
- User type selection (JOBSEEKER/COMPANY)

### SignUp Page (`frontend/src/pages/SignUp.jsx`)
- Form validation
- API integration for registration
- Error handling and display
- Loading states
- User type selection (JOBSEEKER/COMPANY)

## API Endpoints Used

### Registration
```
POST /api/auth/register
Body: {
  "fullName": "string",
  "email": "string", 
  "password": "string",
  "userType": "JOBSEEKER" | "COMPANY"
}
```

### Login
```
POST /api/auth/login
Body: {
  "email": "string",
  "password": "string",
  "userType": "JOBSEEKER" | "COMPANY" (optional)
}
```

### Get Current User
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

### Logout
```
POST /api/auth/logout
Headers: {
  "Authorization": "Bearer <access_token>"
}
```

## Token Management
- **Access Token**: Stored in localStorage, valid for 3 days
- **Refresh Token**: Stored in localStorage, valid for 7 days
- **Automatic**: Tokens are automatically included in API requests

## Database Integration
- User data is stored in MySQL database
- Tokens are stored with unique IDs mapped to users
- Password encryption using BCrypt
- User types: JOBSEEKER, COMPANY

## Testing
Both registration and login are working correctly:
1. Frontend forms submit to backend API
2. Backend validates and stores user data in MySQL
3. JWT tokens are generated and returned
4. Frontend stores tokens and updates user state
5. User is redirected to dashboard

## Next Steps
- Add protected routes based on authentication status
- Implement token refresh logic
- Add user profile management
- Connect other features to backend APIs