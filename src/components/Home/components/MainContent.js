import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import { useNavigate} from 'react-router-dom';  // Import useParams from react-router-dom
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Editor, EditorState, convertFromRaw, convertToRaw} from 'draft-js';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import SitemarkIcon from './SitemarkIcon';

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


const SyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const SyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 16,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

function Author({ author, date, profilePic }: AuthorProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
      }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}
      >
        <Avatar
          alt={author}
          src={`https://artuckeavenuebackend-4.onrender.com${profilePic}`}
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="caption" fontFamily='Roboto, sans-seriff'>
          {author}
        </Typography>
      </Box>
      <Typography variant="caption" fontFamily='Roboto, sans-seriff'>{date}</Typography>
    </Box>
  );
}

// Update PropTypes to reflect that author is a string
Author.propTypes = {
  author: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  profilePic: PropTypes.string.isRequired,
};


export function Search({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = (event) => {
    setQuery(event.target.value);
    onSearch(event.target.value);
  };

  return (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        value={query}
        onChange={handleChange}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          'aria-label': 'search',
        }}
      />
    </FormControl>
  );
}

export default function MainContent({mode}) {

  const [focusedCardIndex, setFocusedCardIndex] = useState(null);
  const [savedEntries, setSavedEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([])
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesData, setCategoriesData] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    // Define an async function inside useEffect to handle async operations
    const fetchArticles = async () => {
      try {
        // Fetch articles from the API
        const response = await getArticles(category);                        
  
        // Ensure response is an array before proceeding
        if (response) {
          // Transform the data for all articles and categories
          const transformData = (articles) => articles.map(entry => ({
            title: entry.title,
            id: entry.id,
            thumbnail: entry.thumbnail,
            tag: entry.tag,
            username: entry.username,
            date: formatTimestamp(entry.created_at),
            editorState: EditorState.createWithContent(
              convertFromRaw(JSON.parse(entry.contents))
            ),
            description: convertFromRaw(JSON.parse(entry.description)).getPlainText(),
            profilePic: entry.profile_pic,
          }));
  
          // Store transformed data in state
          const transformedData = {
            all_articles: transformData(response.all_articles),
            general: transformData(response.general),
            sports: transformData(response.sports),
            worldnews: transformData(response.worldnews),
            science: transformData(response.science),
          };
  
          setCategoriesData(transformedData);
          setSavedEntries(transformedData.all_articles);
          setFilteredEntries(transformedData.all_articles);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
  
    // Call the async function to fetch articles
    fetchArticles();
  }, []); // Include `category` as a dependency if it can change
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {

      if (searchQuery.trim() === '') {
        // Reset to original entries when search query is empty
        setSavedEntries(filteredEntries);
      }
      else{
        const filtered = savedEntries.filter((entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSavedEntries(filtered);
      } 
    }, 500); 

    return () => clearTimeout(delayDebounceFn); // Cleanup the timeout if query changes too quickly
  }, [searchQuery, savedEntries]);

  const getArticles = async () => {
      try {
          const response = await fetch('https://artuckeavenuebackend-4.onrender.com/get-articles-categories/', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          if (response.ok) {
              const responseData = await response.json();
              return responseData
          } else {
              console.error('Error:', response.statusText);
          }
      } catch (error) {
          console.error('Error:', error);
      }
 }

 function formatTimestamp(timestamp) {
  // Parse the timestamp string into a Date object
  const date = new Date(timestamp);

  // Define the options for formatting
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  // Create a formatter with the specified options
  const formatter = new Intl.DateTimeFormat('en-CA', options);

  // Format the date
  return formatter.format(date);
}

  const handleFocus = (index) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handleClick = (newCategory) => {
    setCategory(newCategory);
  
    if (categoriesData) {
      let categoryData;
  
      // Brute force check for each possible category
      switch (newCategory) {
        case 'General':
          categoryData = categoriesData.general;
          break;
        case 'Sports':
          categoryData = categoriesData.sports;
          break;
        case 'World-News':
          categoryData = categoriesData.worldnews; // Ensure this matches the key in categoriesData
          break;
        case 'Science':
          categoryData = categoriesData.science;
          break;
        case 'All':
          categoryData = categoriesData.all_articles;
          break;
        default:
          console.error('Unknown category:', newCategory);
          categoryData = [];
          break;
      }
      
      setSavedEntries(categoryData);
      setFilteredEntries(categoryData);
    }
  };

  const getChipStyle = (chip) => ({
    backgroundColor: category === chip ? '#003366' : 'transparent',
    // or any color you prefer for the selected state
    border: 'none',
  });

  const handleViewArticle = (username, title) => {
    const formattedTitle = title.split(' ').join('-');
    navigate(`/${username}/${formattedTitle}`);
  }


  const handleSearch = (query) => {
    setSearchQuery(query);
  };



  if (loading) return <div>Loading...</div>;

  return (
    <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      p: { xs: 1 },
      borderRadius: '8px',
    }}
  >
    <div>
      {/* Title */}
      <Typography
        variant="h1"
        sx={{
          fontWeight: 700,
          fontFamily: 'Playfair Display, serif', // Updated font family
          color: mode === 'dark' ? '#fff' : '', // White text
          textAlign: 'center',
          mb: 1,
         
        }}
      >
        Article Avenue
      </Typography>
    
      {/* Subtitle */}
      <Typography
        variant="h5"
        sx={{
          color: mode === 'dark' ? '#ddd' : '', // Light grey for contrast
          fontFamily: 'Playfair Display, serif', // Use the Google Font
          textAlign: 'center',
          maxWidth: '600px',
          margin: 'auto',
          marginBottom: '20px',
        }}
      >
        Dive into stories that inspire, inform, and ignite curiosity.
      </Typography>
      <SitemarkIcon className="icon-margin" />
    </div>

    {/* Responsive Search and RSS feed button */}
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'row',
        gap: 2,
        justifyContent: 'center',
        width: '100%',
        mt: 2,
      }}
    >
      <Search onSearch={handleSearch} />
      <IconButton
        size="medium"
        aria-label="RSS feed"
        sx={{
          color: '#fff', // White icon
          backgroundColor: '#1976d2',
          borderRadius: '50%',
          '&:hover': { backgroundColor: '#fff', color: '#1976d2' }, // Invert colors on hover
        }}
      >
        <RssFeedRoundedIcon />
      </IconButton>
    </Box>

    {/* Categories and search bar */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column-reverse', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'start', md: 'center' },
        gap: 4,
        mt: 3,
      }}
    >
      {/* Chip categories */}
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'center',
        }}
      >
        {['All', 'General', 'Sports', 'Science', 'World-News'].map((category) => (
          <Chip
            key={category}
            onClick={() => handleClick(category)}
            size="medium"
            label={category}
            sx={{
              ...getChipStyle(category),
              fontFamily: 'Roboto, sans-serif',
              borderRadius: '16px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              color: '#fff', // White text on chip
              backgroundColor: '',
              '&:hover': { backgroundColor: mode==='light' ? 'darkorange' : '#007FFF', color: '#fff' },
            }}
          />
        ))}
      </Box>

      {/* Search for larger screens */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'row',
          gap: 1,
          justifyContent: 'center',
        }}
      >
        <Search onSearch={handleSearch} />
      </Box>
    </Box>
      <Grid container spacing={2} columns={12}>
      {savedEntries.length > 0 && (<Grid size={{ xs: 12, md: 6 }}>
          <SyledCard
            variant="outlined"
            onFocus={() => handleFocus(0)}
            onClick={() => handleViewArticle(savedEntries[0].username, savedEntries[0].title)}
            onBlur={handleBlur}
            tabIndex={0}
            className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
          >
            <CardMedia
              component="img"
              alt="green iguana"
              image={`https://artuckeavenuebackend-4.onrender.com${savedEntries[0].thumbnail}`} // the base64 image
              aspect-ratio="16 / 9"
              sx={{
                height: 350, // Set a fixed height for the image
                objectFit: 'cover', // Ensures the aspect ratio is maintained
                width: '100%', // Ensure the image takes full width of the container
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            />
            <SyledCardContent>
              <Typography gutterBottom variant="caption" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[0].tag}
              </Typography>
              <Typography gutterBottom variant="h6" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[0].title}
              </Typography>
              <StyledTypography variant="body2" color="text.secondary" gutterBottom fontFamily='Roboto, sans-seriff'>
                {savedEntries[0].description}
              </StyledTypography>
            </SyledCardContent>
            <Author author={savedEntries[0].username} date={savedEntries[0].date} profilePic={savedEntries[0].profilePic} />
          </SyledCard>
        </Grid>)}
        {savedEntries.length > 1 && (<Grid size={{ xs: 12, md: 6 }}>
          <SyledCard
            variant="outlined"
            onFocus={() => handleFocus(1)}
            onClick={() => handleViewArticle(savedEntries[1].username, savedEntries[1].title)}
            onBlur={handleBlur}
            tabIndex={0}
            className={focusedCardIndex === 1 ? 'Mui-focused' : ''}
          >
            <CardMedia
              component="img"
              alt="green iguana"
              image={`https://artuckeavenuebackend-4.onrender.com${savedEntries[1].thumbnail}`} // the base64 image
              aspect-ratio="16 / 9"
              sx={{
                height: 350, // Set a fixed height for the image
                objectFit: 'cover', // Ensures the aspect ratio is maintained
                width: '100%', // Ensure the image takes full width of the container
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            />
            <SyledCardContent>
              <Typography gutterBottom variant="caption" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[1].tag}
              </Typography>
              <Typography gutterBottom variant="h6" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[1].title}
              </Typography>
              <StyledTypography variant="body2" color="text.secondary" gutterBottom fontFamily='Roboto, sans-seriff'>
                {savedEntries[1].description}
              </StyledTypography>
            </SyledCardContent>
            <Author author={savedEntries[1].username} date={savedEntries[1].date} profilePic={savedEntries[1].profilePic}/>
          </SyledCard>
        </Grid>)}
        {savedEntries.length > 2 && (<Grid size={{ xs: 12, md: 6 }}>
          <SyledCard
            variant="outlined"
            onFocus={() => handleFocus(2)}
            onClick={() => handleViewArticle(savedEntries[2].username, savedEntries[2].title)}
            onBlur={handleBlur}
            tabIndex={0}
            className={focusedCardIndex === 2 ? 'Mui-focused' : ''}
            sx={{ height: '100%' }}
          >
            <CardMedia
              component="img"
              alt="green iguana"
              image={`https://artuckeavenuebackend-4.onrender.com${savedEntries[2].thumbnail}`}
              aspect-ratio="16 / 9"
              sx={{
                height: 350, // Set a fixed height for the image
                objectFit: 'cover', // Ensures the aspect ratio is maintained
                width: '100%', // Ensure the image takes full width of the container
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            />
            <SyledCardContent>
              <Typography gutterBottom variant="caption" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[2].tag}
              </Typography>
              <Typography gutterBottom variant="h6" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[2].title}
              </Typography>
              <StyledTypography variant="body2" color="text.secondary" gutterBottom fontFamily='Roboto, sans-seriff'>
                {savedEntries[2].description}
              </StyledTypography>
            </SyledCardContent>
            <Author author={savedEntries[2].username}  date={savedEntries[2].date} profilePic={savedEntries[2].profilePic} />
          </SyledCard>
        </Grid>)}
        {savedEntries.length > 3 && (<Grid size={{ xs: 12, md: 6 }}>
          <SyledCard
            variant="outlined"
            onFocus={() => handleFocus(3)}
            onClick={() => handleViewArticle(savedEntries[3].username, savedEntries[3].title)}
            onBlur={handleBlur}
            tabIndex={0}
            className={focusedCardIndex === 3 ? 'Mui-focused' : ''}
            sx={{ height: '100%' }}
          >
            <CardMedia
              component="img"
              alt="green iguana"
              image={`https://artuckeavenuebackend-4.onrender.com${savedEntries[3].thumbnail}`}
              aspect-ratio="16 / 9"
              sx={{
                height: 350, // Set a fixed height for the image
                objectFit: 'cover', // Ensures the aspect ratio is maintained
                width: '100%', // Ensure the image takes full width of the container
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            />
            <SyledCardContent>
              <Typography gutterBottom variant="caption" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[3].tag}
              </Typography>
              <Typography gutterBottom variant="h6" component="div" fontFamily='Roboto, sans-seriff'>
                {savedEntries[3].title}
              </Typography>
              <StyledTypography variant="body2" color="text.secondary" gutterBottom fontFamily='Roboto, sans-seriff'>
                {savedEntries[3].description}
              </StyledTypography>
            </SyledCardContent>
            <Author author={savedEntries[3].username} date={savedEntries[3].date} profilePic={savedEntries[3].profilePic}/>
          </SyledCard>
        </Grid>)}
      </Grid>
      <div>
      {savedEntries.length > 4 && (
        <Typography variant="h2" gutterBottom fontFamily='Roboto, sans-seriff'>
          Latest
        </Typography>
      )} 
      <Grid container spacing={8} columns={12} sx={{ my: 4 }}>
        {savedEntries.slice(4).map((article, index) => (
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
              <Typography gutterBottom variant="caption" component="div" fontFamily='Roboto, sans-seriff'>
                {article.tag}
              </Typography>
              <TitleTypography
                gutterBottom
                fontFamily='Roboto, sans-seriff'
                variant="h6"
                onFocus={() => handleFocus(index)}
                onClick={() => handleViewArticle(savedEntries[index+4].username, savedEntries[index+4].title)}
                onBlur={handleBlur}
                tabIndex={0}
                className={focusedCardIndex === index ? 'Mui-focused' : ''}
              >
                {article.title}
                <NavigateNextRoundedIcon
                  className="arrow"
                  sx={{ fontSize: '1rem' }}
                />
              </TitleTypography>
              <StyledTypography variant="body2" color="text.secondary" gutterBottom fontFamily='Roboto, sans-seriff'>
                {article.description}
              </StyledTypography>

              <Author author={article.username} date={article.date} profilePic={article.profilePic} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </div>
    </Box>
    
  );
}
