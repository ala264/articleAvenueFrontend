import './App.css';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RichTextEditor from './components/TextEditor';
import TestComponentViewSaved from './components/TestComponentViewSaved';
import SignIn from './components/sign-in/SignIn';
import Blog from './components/blog/Blog';
import Articles from './components/Articles';
import ImageUploader from './components/ImageUploader';
import HomePage from './components/HomePage/HomePage';
import BecomeAuthor from './components/BecomeAuthor';
import MoreFromAuthor from './components/MoreFromAuthor/MoreFromAuthor'
import SignUp from './components/SignUp';
import Home from './components/Home/HomePage'
import TemplateFrame from './components/sign-in/TemplateFrame';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getSignInTheme from './components/sign-in/theme/getSignInTheme';

function AppContent() {
  const location = useLocation();
  const containerClass = location.pathname === '/sign-in' ? 'content-container sign-in' : 'content-container';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state to handle async check
  const [showCustomTheme, setShowCustomTheme] = useState(true);
  const [mode, setMode] = useState('light');  // Initialize the mode state

  // Create themes after the mode is initialized
  const defaultTheme = createTheme({ palette: { mode },
    typography: {
      fontFamily: 'Roboto, sans-serif',  
    } });
  const SignInTheme = createTheme(getSignInTheme(mode));

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const toggleColorMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode); // Save the selected mode to localStorage
  };

  useEffect(() => {
    // Check if there is a preferred mode in localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      // If no preference is found, it uses system preference
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('https://artuckeavenuebackend-4.onrender.com/check-session/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials for cookies
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);

    } finally {
      setLoading(false); // Set loading to false once the check is complete
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // Run once on mount

  const LayoutWithSidebar = ({ children }) => (
    <>
      <TemplateFrame
        toggleCustomTheme={toggleCustomTheme}
        showCustomTheme={showCustomTheme}
        mode={mode}
        toggleColorMode={toggleColorMode}
      >
      <ThemeProvider theme={showCustomTheme ? SignInTheme : defaultTheme}>
        <CssBaseline enableColorScheme />
          <Sidebar mode = {mode}/>
            <div className="content">
              {children}
            </div>
         </ThemeProvider>
        </TemplateFrame>
      </>
  );

  // While checking authentication, render nothing or a loading spinner
  if (loading) return <div>Loading...</div>;

  return (
    <div className={containerClass}>
      <Routes>
        {/* Routes without Sidebar */}
        <Route path="/sign-in" element={<SignIn className="sign-in" setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/:username/:articleName" element={<Blog />} />
        <Route path="/" element={<Home />} />
        <Route path="/become-an-author" element={<BecomeAuthor />} />
        <Route path="/:username" element={<MoreFromAuthor />} />

        {/* Routes with Sidebar */}
        <Route path="/home" element={isAuthenticated ? <LayoutWithSidebar mode = {mode} /> : <Navigate to="/sign-in" />} >
          {/* Nested routes for authenticated users */}
          <Route index element={<HomePage  mode={mode} toggleColorMode={toggleColorMode}/>} /> {/* Default child route when at "/" */}
          <Route path="/home/saved-drafts" element={<TestComponentViewSaved mode={mode} toggleColorMode={toggleColorMode} />} />
          <Route path="/home/saved-posts" element={<Articles mode={mode} toggleColorMode={toggleColorMode} />} />
          <Route path="/home/create-post" element={<RichTextEditor mode={mode} toggleColorMode={toggleColorMode} />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
