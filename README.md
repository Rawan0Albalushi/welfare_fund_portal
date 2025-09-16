# Student Welfare Fund Admin Portal

A modern React admin portal for managing the Student Welfare Fund system, built with Vite, TypeScript, Material-UI, and React Query.

## 🚀 Features

- **Modern UI/UX**: Built with Material-UI (MUI) for a professional and responsive design
- **Bilingual Support**: Full Arabic/English support with RTL/LTR switching
- **Authentication**: Secure login system with JWT tokens
- **Dashboard**: Comprehensive overview with statistics and recent activities
- **Categories Management**: CRUD operations for program categories
- **Programs Management**: Full program lifecycle management
- **Applications Management**: Student application review and status updates
- **Donations Management**: Track and manage all donations
- **Settings**: Language and theme preferences
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router v7
- **Internationalization**: i18next
- **Form Handling**: React Hook Form
- **Styling**: MUI Theme + CSS-in-JS

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd welfare-fund-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME=Student Welfare Fund Admin Portal
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── api/                    # API services and client
│   ├── client.ts          # Axios configuration
│   └── services/          # API service functions
├── components/            # Reusable components
│   ├── common/           # Common UI components
│   ├── layout/           # Layout components
│   └── auth/             # Authentication components
├── contexts/             # React contexts
│   ├── ThemeContext.tsx  # Theme management
│   └── LanguageContext.tsx # Language management
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization
│   └── locales/          # Translation files
├── pages/                # Page components
├── types/                # TypeScript type definitions
└── config/               # Configuration files
```

## 🔧 Configuration

### Environment Variables

- `VITE_API_URL`: Backend API base URL
- `VITE_APP_NAME`: Application name

### API Integration

The portal connects to a Laravel backend with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Categories**: `/api/v1/admin/categories`
- **Programs**: `/api/v1/admin/programs`
- **Applications**: `/api/v1/admin/applications`
- **Donations**: `/api/v1/admin/donations`
- **Dashboard**: `/api/v1/admin/dashboard/stats`

## 🌐 Internationalization

The application supports both Arabic and English:

- **English**: Default language with LTR layout
- **Arabic**: RTL layout with Arabic translations
- **Language switching**: Available in the header
- **Persistent**: Language preference is saved in localStorage

## 🎨 Theming

- **Light Theme**: Default Material-UI light theme
- **Dark Theme**: Dark mode support
- **System Theme**: Automatically follows system preference
- **Customizable**: Easy to extend with custom colors and typography

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - xs: 0px
  - sm: 600px
  - md: 900px
  - lg: 1200px
  - xl: 1536px
- **Adaptive Layout**: Sidebar collapses on mobile, responsive tables

## 🔐 Authentication

- **JWT Tokens**: Secure authentication with Bearer tokens
- **Auto-logout**: Automatic logout on token expiration
- **Protected Routes**: All admin routes require authentication
- **Login Persistence**: User session persists across browser refreshes

## 📊 Data Management

- **React Query**: Efficient data fetching and caching
- **Optimistic Updates**: Immediate UI updates with rollback on errors
- **Pagination**: Server-side pagination for large datasets
- **Filtering & Sorting**: Advanced filtering and sorting capabilities
- **Real-time Updates**: Automatic data refresh and invalidation

## 🧪 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **Husky**: Git hooks for quality checks (if configured)

## 🚀 Deployment

### Build Process

1. **Environment Setup**: Ensure all environment variables are set
2. **Build**: Run `npm run build`
3. **Deploy**: Upload the `dist` folder to your web server

### Production Considerations

- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Set production API URLs
- **Caching**: Configure proper caching headers
- **CDN**: Consider using a CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- **Documentation**: Check the API guide in `ADMIN_PORTAL_API_GUIDE.md`
- **Issues**: Create an issue in the repository
- **Contact**: Reach out to the development team

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - Authentication system
  - Dashboard with statistics
  - Categories management
  - Programs management
  - Applications management
  - Donations management
  - Settings page
  - Bilingual support
  - Responsive design

---

**Built with ❤️ for the Student Welfare Fund**