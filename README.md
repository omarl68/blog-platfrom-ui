# Article Management System - Frontend

A modern Angular 16 frontend application for managing articles and users with role-based access control, featuring Material Design and Font Awesome icons.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, Editor, Writer, Reader)
  - Secure login/logout functionality

- **Article Management**
  - Create, read, update, and delete articles
  - Rich text content with image uploads
  - Article status management (Draft, Published)
  - Tag-based categorization

- **User Management (Admin Only)**
  - User registration and profile management
  - Role assignment and management
  - Email verification system

- **Responsive Design**
  - Mobile-first responsive layout
  - Material Design components
  - Font Awesome icons

## 🛠️ Tech Stack

- **Angular 16** - Modern web framework
- **Angular Material** - UI component library
- **Font Awesome** - Icon library
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd article-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Edit src/environments/environment.ts for development
   # Edit src/environments/environment.prod.ts for production
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:4200`

## 🔧 Configuration

### Environment Variables

The application uses Angular environment files:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
  appName: 'Article Management System',
  appVersion: '1.0.0'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
  appName: 'Article Management System',
  appVersion: '1.0.0'
};
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── articles/          # Article-related components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   └── users/            # User management components
│   ├── models/               # TypeScript interfaces
│   ├── services/             # API services
│   ├── interceptors/         # HTTP interceptors
│   └── app.module.ts         # Main module
├── assets/                   # Static assets
├── environments/             # Environment configuration
└── styles.scss              # Global styles
```

## 👥 User Roles

- **Admin**: Full system access, user management, article management
- **Editor**: Article management, content editing
- **Writer**: Create and edit own articles
- **Reader**: View published articles only

## 🔐 Authentication

The system uses JWT tokens for authentication with automatic refresh:

- Access tokens are stored in localStorage
- Refresh tokens are stored as HttpOnly cookies
- Automatic token refresh on 401 errors
- Secure logout with token cleanup

## 📝 API Endpoints

The frontend expects a backend API with the following endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Articles
- `GET /api/articles` - Get all articles (paginated)
- `GET /api/admin/articles` - Get all articles (admin)
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Users
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## 🎨 UI Components

### Icons
The application uses Font Awesome icons throughout:

- **Dashboard**: `fas fa-tachometer-alt`
- **Articles**: `fas fa-newspaper`
- **Users**: `fas fa-users`
- **Edit**: `fas fa-edit`
- **Delete**: `fas fa-trash`
- **Add**: `fas fa-plus`
- **Search**: `fas fa-search`
- **Logout**: `fas fa-sign-out-alt`

## 🚀 Deployment

### Build for Production
```bash
ng build --configuration production
```

### Environment-specific builds
```bash
# Development
ng build --configuration development

# Production
ng build --configuration production
```

## 🧪 Testing

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e

# Code coverage
ng test --code-coverage
```

## 📦 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run lint` - Run linting
- `npm run e2e` - Run end-to-end tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using Angular 16**
