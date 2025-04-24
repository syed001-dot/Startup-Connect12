import React, { Suspense, lazy, useState } from "react";
import { Provider } from 'react-redux';
import store from './store'; // Import the store
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar"; 
import Footer from "./components/common/Footer"; 
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from './utils/ThemeContext';
import { createTheme } from '@mui/material/styles';
import { CircularProgress, Box, Alert } from '@mui/material';
import authService from './services/authService';
import Portfolio from './pages/Portfolio';
import StartupProfile from './pages/StartupProfile';
import InvestorInvestments from "./pages/InvestorInvestments";
import TransactionPage from "./pages/TransactionPage";
import InvestorProfile from './pages/InvestorProfile';

// Error boundary component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      setError(error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Something went wrong. Please try refreshing the page.
        </Alert>
      </Box>
    );
  }

  return children;
};

// Lazy load components with error handling
const lazyLoad = (importFn) => {
  return lazy(() => importFn().catch((error) => {
    console.error('Error loading component:', error);
    return { default: () => <ErrorBoundary><Alert severity="error">Failed to load component. Please try refreshing the page.</Alert></ErrorBoundary> };
  }));
};

// Lazy load components
const Home = lazyLoad(() => import("./pages/Home"));
const Login = lazyLoad(() => import("./pages/Login"));
const Register = lazyLoad(() => import("./pages/Register"));
const RegisterAdmin = lazyLoad(() => import("./pages/RegisterAdmin"));
const StartupDashboard = lazyLoad(() => import("./pages/StartupDashboard"));
const InvestorDashboard = lazyLoad(() => import("./pages/InvestorDashboard"));
const AdminDashboard = lazyLoad(() => import("./pages/AdminDashboard"));
const Startups = lazyLoad(() => import("./pages/Startups"));
const Investors = lazyLoad(() => import("./pages/Investors"));
const InvestmentsReceived = lazyLoad(() => import("./pages/InvestmentsReceived"));

// Loading component
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.user.role)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
            <Box sx={{ flex: 1, mb: 8 }}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} /> {/*src\pages\Home.js */}
                  <Route path="/login" element={<Login />} /> {/*src\pages\Login.js */}
                  <Route path="/register" element={<Register />} /> {/*src\pages\Register.js */}
                  <Route path="/register-admin" element={<RegisterAdmin />} />
                  <Route path="/startups" element={<Startups />} />
                  <Route
                    path="/investors"
                    element={
                      <ProtectedRoute>
                        <Investors />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/startup-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['STARTUP']}>
                        <StartupDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/investments-received"
                    element={
                      <ProtectedRoute allowedRoles={['STARTUP']}>
                        <InvestmentsReceived />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/investor-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['INVESTOR']}>
                        <InvestorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-investments"
                    element={
                      <ProtectedRoute allowedRoles={['INVESTOR']}>
                        <InvestorInvestments />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/startups/:id" element={<StartupProfile />} />
                  <Route path="/transactions/:startupId" element={<TransactionPage />} />
                  <Route path="/startup/:id" element={<StartupProfile />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/investor/:id" element={<InvestorProfile />} />
                  <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
              </Suspense>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
