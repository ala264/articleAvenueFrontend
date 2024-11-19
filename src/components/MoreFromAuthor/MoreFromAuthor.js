import React, { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Footer from '../blog/components/Footer';
import TemplateFrame from '../blog/TemplateFrame';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom'; 
import getBlogTheme from '../blog/theme/getBlogTheme';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Latest from './Latest';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function MoreFromAuthor() {
  const [authorDesc, setAuthorDesc] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [name, setName] = useState('');
  const { username } = useParams();
  const [mode, setMode] = useState('light');
  const [showCustomTheme, setShowCustomTheme] = useState(true);
  const blogTheme = createTheme(getBlogTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        const response = await fetch('https://artuckeavenuebackend-5.onrender.com/get-author-info/', {
          method: 'POST',

          body: JSON.stringify({ username }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authorInfo) {
            console.log(data.authorInfo)
            setAuthorDesc(data.authorInfo.author_desc);
            setProfilePic(data.authorInfo.profile_pic);
            setName(data.authorInfo.name);
          } else {
            console.error('Error:', data.error || 'User not found');
          }
        } else {
          console.error('Error:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchAuthorData();
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const toggleCustomTheme = () => {
    setShowCustomTheme((prev) => !prev);
  };
/*
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');
        setProfilePic(base64String);

        try {
          const response = await fetch('http://127.0.0.1:8000/insert-profile-pic/', {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profilePic: base64String }),
          });

          if (response.ok) {
            const responseData = await response.json();
            console.log('Profile picture uploaded successfully:', responseData);
          } else {
            console.error('Error:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };
*/
  return (
    <div>
      <TemplateFrame
        toggleCustomTheme={toggleCustomTheme}
        showCustomTheme={showCustomTheme}
        mode={mode}
        toggleColorMode={toggleColorMode}
      >
  

        <ThemeProvider theme={showCustomTheme ? blogTheme : defaultTheme}>
          <CssBaseline enableColorScheme />
          <div style={{ overflow: 'hidden'}} className="overrideStyles">
            <div
              style={{
                padding: '20px',
                borderRadius: '8px',
                boxShadow: mode === 'light' ? '0 4px 8px rgba(0, 0, 0, 0.1)' : '0 4px 8px rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
              }}
            >
              <h1
                style={{
                  textAlign: 'left',
                  fontFamily: 'Georgia, Times, "Times New Roman", serif',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '10px',
                  color: mode === 'light' ? '#333' : '#f9f9f9',
                  fontSize: '3em',
                  marginLeft: '5em', marginTop: '1em' 
                }}
              >
                {name}
              </h1>
              {console.log(profilePic)}

              <img
                src={`https://artuckeavenuebackend-5.onrender.com${profilePic}`}
                style={{
                  float: 'left',
                  width: '100px',
                  height: 'auto',
                  marginRight: '20px',
                  marginBottom: '10px',
                  boxShadow: mode === 'light' ? '0 4px 8px rgba(0, 0, 0, 0.1)' : '0 4px 8px rgba(255, 255, 255, 0.1)',
                  marginLeft: '5em',
                }}
                alt="Profile"
              />
              <p
                dangerouslySetInnerHTML={{ __html: authorDesc }}
                style={{
                  textAlign: 'left',
                  fontFamily: 'Georgia, Times, "Times New Roman", serif',
                  color: mode === 'light' ? '#000000' : '#ffffff',
                  fontWeight: 'normal',
                  lineHeight: '1.6',
                  clear: 'none',
                  width: '60%',
                  marginLeft: '5em', 
                }}
              ></p>
            </div>
            <hr
              style={{
                border: `1px solid ${mode === 'dark' ? '#808080' : '#000000'}`,
                width: '85%',
                margin: '20px 0',
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '5em',
                marginBottom: '5em',
              }}
            />
            <Latest />
            {mode === 'dark' && (
              <hr
                style={{
                  border: '0.0001px solid #f5f5f5',
                  width: '85%',
                  margin: '20px 0',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            )}
            <div style={{ backgroundColor: mode === 'light' ? '#f5f5f5' : '#000000' }}>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </TemplateFrame>
    </div>
  );
}

export default MoreFromAuthor;
