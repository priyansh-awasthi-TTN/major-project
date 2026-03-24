# JobHuntly Backend API

Spring Boot backend application with JWT authentication for the JobHuntly platform.

## Features

- User registration and login for both Job Seekers and Companies
- JWT-based authentication with access tokens (3 days) and refresh tokens (7 days)
- Token management with database storage and validation
- Secure password hashing with BCrypt
- CORS configuration for frontend integration
- MySQL database for data persistence

## Tech Stack

- Java 17
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- JWT (JSON Web Tokens)
- MySQL Database
- Maven

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

### Database Setup

1. Install MySQL and start the MySQL service
2. Create a database (optional - the application will create it automatically):
   ```sql
   CREATE DATABASE jobhuntly;
   ```
3. Update the database credentials in `src/main/resources/application.yml` if needed:
   ```yaml
   spring:
     datasource:
       username: your_mysql_username
       password: your_mysql_password
   ```

### Running the Application

1. Navigate to the backend directory:
   ```bash
   cd major-project/backend
   ```

2. Run the application:
   ```bash
   mvn spring-boot:run
   ```

3. The API will be available at: `http://localhost:8080`

## Database Configuration

The application is configured to use MySQL with the following default settings:
- Database: `jobhuntly` (created automatically if it doesn't exist)
- Host: `localhost:3306`
- Username: `root`
- Password: `root`

You can modify these settings in `src/main/resources/application.yml`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/verify` - Verify token validity

### Request Examples

#### Register
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "JOBSEEKER"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123",
  "userType": "JOBSEEKER"
}
```

#### Refresh Token
```json
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token-here"
}
```

### Response Format

#### Success Response
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "userType": "JOBSEEKER"
  }
}
```

#### Error Response
```json
{
  "message": "Error description"
}
```

## Configuration

Key configuration properties in `application.yml`:

- JWT secret key and token expiration times
- Database configuration
- CORS settings
- Server port

## Security Features

- Password encryption using BCrypt
- JWT tokens with configurable expiration
- Token blacklisting and revocation
- Database-stored token validation
- CORS protection
- Authentication entry point for unauthorized access

## Database Schema

The application automatically creates the following tables in MySQL:
- `users` - User information
- `access_tokens` - Access token management
- `refresh_tokens` - Refresh token management

The `ddl-auto: update` setting ensures that tables are created/updated automatically when the application starts.

## Frontend Integration

The backend is configured to work with the React frontend running on:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Create React App)

Update the `cors.allowed-origins` in `application.yml` to match your frontend URL.

## MySQL Connection Troubleshooting

If you encounter connection issues:

1. **Ensure MySQL is running**: Check if MySQL service is active
2. **Verify credentials**: Make sure username/password in `application.yml` are correct
3. **Check port**: Default MySQL port is 3306
4. **Database creation**: The application will create the `jobhuntly` database automatically
5. **Time zone issues**: The connection URL includes `serverTimezone=UTC` to handle timezone differences

Common MySQL setup commands:
```sql
-- Create user (if needed)
CREATE USER 'jobhuntly'@'localhost' IDENTIFIED BY 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON jobhuntly.* TO 'jobhuntly'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;
```