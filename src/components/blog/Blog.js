import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppAppBar from './components/AppAppBar';
import Footer from './components/Footer';
import TemplateFrame from './TemplateFrame';
import { Editor, EditorState, convertFromRaw } from 'draft-js';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom'; // Import useParams from react-router-dom
import getBlogTheme from './theme/getBlogTheme';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'
export default function Blog() {
  const { username, articleName } = useParams(); // Get username and article name from the URL
  const [author, setAuthor] = React.useState('');
  const [date, setDate] = React.useState('')
  const [thumbnail, setThumbnail] = React.useState('')
  const [mode, setMode] = React.useState('light');
  const [showCustomTheme, setShowCustomTheme] = React.useState(true);
  const [article, setArticle] = React.useState(null); // State to store the fetched article
  const blogTheme = createTheme(getBlogTheme(mode));
  const defaultTheme = createTheme({ palette: { mode } });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // 12-hour clock
    };
  
    // Format the date part as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
  
    // Format the time part
    const formattedTime = date.toLocaleTimeString([], options);
  
    return `${formattedDate} ${formattedTime}`;
  };
  

  React.useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
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

  React.useEffect(() => {
    const formattedArticleName = articleName.replace(/-/g, ' ');
    // Fetch the article based on the username and formatted article name in the URL
    const fetchArticle = async () => {
      try {
        const response = await fetch(`https://artuckeavenuebackend-4.onrender.com/get-article-by-username-and-name/?username=${username}&name=${formattedArticleName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          const responseData = await response.json();
          if (responseData) {
            setArticle({
              title: responseData.title,
              editorState: EditorState.createWithContent(
                convertFromRaw(JSON.parse(responseData.contents))
              ),
            });
            setAuthor(responseData.author);
            setDate(responseData.date)
            setThumbnail(responseData.thumbnail)
          }
        } else {
          console.error('Error:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    fetchArticle();
  }, [username, articleName]); // Removed author from dependencies
  

  return (

    <TemplateFrame
      toggleCustomTheme={toggleCustomTheme}
      showCustomTheme={showCustomTheme}
      mode={mode}
      toggleColorMode={toggleColorMode}
    >
      <ThemeProvider theme={showCustomTheme ? blogTheme : defaultTheme}>
        <CssBaseline enableColorScheme />
        <AppAppBar />
        <Container maxWidth="lg" component="main" sx={{ my: 16 }}>
          {article ? (
            <>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              style={{
                fontSize: '5em',
                fontWeight: 'bold',          
                letterSpacing: '0.5px',      
                color: mode === 'light' ? '#000000' : '#ffffff', // Black for light mode, white for dark mode
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                fontFamily:'Times New Roman, serif' 

              }}
            >
            {article.title}
          </Typography>
         <p
         style={{
          fontWeight:'bold',
          fontFamily:'Times New Roman, serif',
          fontSize:'1.6em', 
          margin:0,
          display:'inline'
        }}
         >Written By: &nbsp;
         </p>
         <Link 
          to = {`https://article-avenue-frontend.vercel.app/${username}`}
          style={{
              fontWeight:'bold',
              fontFamily:'Times New Roman, serif',
              fontSize:'1.6em', 
              color: mode === 'dark' ? '#0066b2' : '#0066b2', // Black for light mode, white for dark mode
              color: mode === 'light' ? '#0066b2' : '#0066b2', // Black for light mode, white for dark mode
              margin:0,
              display:'inline',
             
            }}
            >
              {author}
          </Link>
          <p
            style={{
              fontWeight:'bold',
              fontFamily:'Times New Roman, serif',
              fontSize:'1.6em', 
              margin:0,
              display:'inline'
            }}
          >&nbsp;&nbsp; &nbsp;&nbsp; Posted On: {formatDate(date)}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} className="thumbnail container">
            <img 
              src={`https://article-avenue-frontend.vercel.app${thumbnail}`} 
              style={{ width: '40em', height: '20em',  }}
            />
          </div>
          </p>
            <div style = {{ fontFamily:'Times New Roman, serif', marginLeft:'4em', marginTop:'4em', fontWeight:'bold', fontSize:'1.4em',}}>
              <Editor
                editorState={article.editorState}
                readOnly={true}
                blockRendererFn={(block) => {
                  if (block.getType() === 'atomic') {
                    return {
                      component: ({ block, contentState }) => {
                        const entity = contentState.getEntity(block.getEntityAt(0));
                        const { src, width, height } = entity.getData();
                        return (
                          <img
                            src={src}
                            alt=""
                            style={{ width: width || '100%', height: height || 'auto', objectFit: 'cover' }}
                          />
                        );
                      },
                      editable: false,
                    };
                  }
                  return null;
                }}
              />
              </div>
            </>
          ) : (
            <Typography variant="h6" component="p">
              Loading article...
            </Typography>
          )}
        </Container>
        {mode === 'dark' && (<hr style={{ border: '0.0001px f5f5f5', width: '85%', margin: '20px 0', marginLeft:'auto', marginRight:'auto' }}/>)}

        <div style = {{backgroundColor: mode === 'light' ? '#f5f5f5' : '#000000'}}>
          <Footer ></Footer>
        </div>
      </ThemeProvider>
    </TemplateFrame>
  );
}
