import React, { useState } from 'react';
import TemplateFrame from './sign-in/TemplateFrame';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getSignInTheme from './sign-in/theme/getSignInTheme';
import Footer from './blog/components/Footer';
import Button from '@mui/material/Button'; // Import MUI Button

const BecomeAuthor = () => {
  const [response, setResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const [mode, setMode] = React.useState('light');  // Initialize the mode state

  // Create themes after the mode is initialized
  const defaultTheme = createTheme({ palette: { mode } });
  const SignInTheme = createTheme(getSignInTheme(mode));

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };

  const toggleColorMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode); // Save the selected mode to localStorage
  };

  React.useEffect(() => {
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (response.trim() === '') {
      setErrorMessage('Please provide your response');
      return;
    }

    try {
      const res = await fetch('https://artuckeavenuebackend-4.onrender.com/submit-author-response/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response,
        }),
        credentials: 'include', // Include this if your Django backend uses sessions
      });

      const result = await res.json();
      
      if (res.ok) {
        setSuccessMessage('Your response has been submitted successfully. We will get back to you soon!');
        setResponse(''); // Clear the textarea after successful submission
      } else {
        setErrorMessage('Failed to submit the response. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while submitting your response.');
    }
  };

  return (
    <TemplateFrame
      toggleCustomTheme={toggleCustomTheme}
      showCustomTheme={showCustomTheme}
      mode={mode}
      toggleColorMode={toggleColorMode}
    >
      <ThemeProvider theme={showCustomTheme ? SignInTheme : defaultTheme}>
        <CssBaseline enableColorScheme />
        <div>
          <h2 style= {{marginTop:'50px'}}>Why do you want to become an author?</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows="5"
                cols="50"
                placeholder="Write your response here... and don't forgot to include your contact info!"
              />
            </div>
            <div>
              {/* Replaced the plain button with MUI Button */}
              <Button 
                type="submit" 
                variant="contained" 
                color="secondary" 
                style={{ marginTop: '20px' }}
                
              >
                Submit
              </Button>
            </div>
          </form>

          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: 'green',  }}>{successMessage}</p>}
        </div>
        <div style={{ backgroundColor: mode === 'light' ? '#f5f5f5' : '#000000', marginTop:'100px' }}>
          <Footer />
        </div>
      </ThemeProvider>
   </TemplateFrame>
  );
};

export default BecomeAuthor;
