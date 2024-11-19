import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { Editor, convertFromRaw } from 'draft-js';
import { styled } from '@mui/material/styles';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useNavigate, useParams } from 'react-router-dom';  // Import useParams from react-router-dom

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const TitleTypography = styled(Typography)(({ theme }) => ({
  position: 'relative',
  textDecoration: 'none',
  '&:hover': { cursor: 'pointer' },
  '& .arrow': {
    visibility: 'hidden',
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '&:hover .arrow': {
    visibility: 'visible',
    opacity: 0.7,
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '3px',
    borderRadius: '8px',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: '1px',
    bottom: 0,
    left: 0,
    backgroundColor: theme.palette.text.primary,
    opacity: 0.3,
    transition: 'width 0.3s ease, opacity 0.3s ease',
  },
  '&:hover::before': {
    width: '100%',
  },
}));

function Author({ authors, date, profilePic, name }) {
  console.log(profilePic)
  console.log(authors)
  const formattedDate = new Date(date).toLocaleDateString('en-CA'); // en-CA formats to YYYY-MM-DD
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}
      >
        <AvatarGroup max={3}>
            <Avatar
              alt={name}
              src={`https://artuckeavenuebackend-5.onrender.com${profilePic}`}
              sx={{ width: 24, height: 24 }}
            />
        </AvatarGroup>
        <Typography variant="caption">
          {name}
        </Typography>
      </Box>
      <Typography variant="caption">{formattedDate}</Typography>
    </Box>
  );
}

Author.propTypes = {
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default function Latest() {
  const [focusedCardIndex, setFocusedCardIndex] = React.useState(null);
  const [articleInfo, setArticleInfo] = React.useState([]);  // Initialize as an empty array
  const [authorInfo, setAuthorInfo] = React.useState(null);  // Initialize as null
  const [loading, setLoading] = React.useState(true);  // Add a loading state
  const { username } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesResponse = await fetch('https://artuckeavenuebackend-5.onrender.com/get-articles-by-username/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),  
        });
        const articlesData = await articlesResponse.json();
        setArticleInfo(articlesData || []);  // Ensure data is an array or empty array

        const authorResponse = await fetch('https://artuckeavenuebackend-5.onrender.com/get-author-info/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });

        const authorData = await authorResponse.json();
        if (authorData.authorInfo) {
          setAuthorInfo(authorData.authorInfo);

        }

        // Once both requests are done, set loading to false
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);  // Set loading to false even on error to stop waiting
      }
    };

    fetchData();
  }, [username]);

  
  const handleFocus = (index) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handleNavigate = (title) => {
    const formattedTitle = title.split(' ').join('-');
    navigate(`/${username}/${formattedTitle}`);
  };


  if (loading) {
    return <Typography>Loading...</Typography>;  // Show a loading message while fetching
  }

  return (
    <div>
      <Typography variant="h2" gutterBottom>
        {`${authorInfo.name}'s Articles`}
      </Typography>
      <Grid container spacing={8} columns={12} sx={{ my: 4 }}>
        {articleInfo && articleInfo.length > 0 ? (
          articleInfo.map((article, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 1,
                  height: '100%',
                }}
              >
                <Typography gutterBottom variant="caption" component="div">
                  {article.tag || 'No tag available'}
                </Typography>
                <TitleTypography
                  gutterBottom
                  variant="h6"
                  onFocus={() => handleFocus(index)}
                  onBlur={handleBlur}
                  tabIndex={0}
                  className={focusedCardIndex === index ? 'Mui-focused' : ''}
                  onClick={() => handleNavigate(article.title)}
                >
                  {article.title}
                  <NavigateNextRoundedIcon
                    className="arrow"
                    sx={{ fontSize: '1rem' }}
                  />
                </TitleTypography>
                <StyledTypography variant="body2" color="text.secondary" gutterBottom>
                  {article.description ? convertFromRaw(JSON.parse(article.description)).getPlainText() : 'No description available'}
                </StyledTypography>
                <Author authors={article.authors || []} date={article.date || new Date()} profilePic={authorInfo ? authorInfo.profile_pic : ''} name={authorInfo.name}/>
              </Box>
            </Grid>
          ))
        ) : (
          <Typography>No articles found</Typography>
        )}
      </Grid>
    </div>
  );
}
