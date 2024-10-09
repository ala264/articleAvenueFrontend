import React, { useEffect, useState, useRef } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw} from 'draft-js';
import { Card, CardContent, CardHeader, Typography, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Articles.css';

// Custom block renderer to handle images
const blockRenderer = (block) => {
    if (block.getType() === 'atomic') {
        return {
            component: ImageComponent,
            editable: false
        };
    }
    return null;
};

// Component to render images
const ImageComponent = (props) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src, width, height, left, top } = entity.getData();

    return (
     <img
        src={src}
        alt="Image"
        style={{
            position: 'relative',
            width: width ? `${width}px` : 'auto',
            height: height ? `${height}px` : 'auto',
            left: left ? `${left}px` : 'auto',
            top: top ? `${top}px` : 'auto',
            display: 'block',
        }}
    />
    );
};

const Articles = ({ mode }) => {
    const [savedEntries, setSavedEntries] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
            const fetchArticles = async () => {
                try {
                    const response = await getArticles();                        
                    if (Array.isArray(response)) {
                        const entries = response.map(entry => ({
                            title: entry.title,
                            id: entry.id,
                            thumbnail: entry.thumbnail,
                            category: entry.tag,
                            filename: entry.filename,
                            description: EditorState.createWithContent(
                                convertFromRaw(JSON.parse(entry.description))
                            ),
                            editorState: EditorState.createWithContent(
                                convertFromRaw(JSON.parse(entry.contents))
                            ),
                        }));
                        setSavedEntries(entries);

                    } 
                } catch (error) {
                    console.error('Error fetching articles:', error);
                }
            };
            fetchArticles();
    }, []);
    

    const handleTitleClick = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const getArticles = async () => {

        try {

            const username = await getSessionData();
            console.log('Username:', username); 

            const response = await fetch('https://artuckeavenuebackend-4.onrender.com/get-articles-by-username/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username})
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

    const getSessionData = async () => {
        try {
            const response = await fetch('https://artuckeavenuebackend-4.onrender.com/get-session-data/', {
                method: 'GET',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                const sessionData = await response.json();
                if (sessionData.email) { // Check if session data is present
                    return sessionData.username; // Extract the username
                } else {
                    console.error('No session data found');
                    return null;
                }
            } else {
                console.error('Error fetching session data:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };
    

    const handleEdit = (index, id, event) => {

        event.stopPropagation();

        const { title, thumbnail, category, filename, editorState, description } = savedEntries[index];
        const content = convertToRaw(editorState.getCurrentContent());
        const descriptionContent = convertToRaw(description.getCurrentContent())

        navigate('/create-post', {
            state: { 
                id: id, 
                type: 'completed', 
                title: title,
                content: content,
                thumbnail: thumbnail,
                category: category,
                filename: filename,
                description: descriptionContent,
            }
        });
    };


    const handleDelete = async (article_id, event) => {
        // Handle the delete action
        event.stopPropagation();

        const updatedEntries = savedEntries.filter((entry) => entry.id !== article_id);
        setSavedEntries(updatedEntries);

        try {
            // Send DELETE request to the backend
            const response = await fetch(`https://artuckeavenuebackend-4.onrender.com/delete-completed-article/${article_id}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {

            } else {
                console.error('Failed to delete article:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    return (
        <div className="article-container">
            {savedEntries.map((entry, index) => (
                <Card
                    key={index}
                    className="saved-article"
                    style={{
                        marginBottom: '30px',
                        cursor: 'pointer',
                        backgroundColor: mode === 'dark' ? '#000' : '#fff',
                        color: mode === 'dark' ? 'white' : 'black',
                    }}
                    onClick={() => handleTitleClick(index)}
                >
                    {entry.thumbnail && (
                        <div className="article-thumbnail-container">
                            <img 
                                src={`https://artuckeavenuebackend-4.onrender.com${entry.thumbnail}`} 
                                className="article-thumbnail"
                                alt={entry.title}
                            />
                        </div>
                    )}
                    <CardHeader
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '10px' }}>
                                <Typography variant="h3">{entry.title}</Typography>
                                <div className="icon-buttons">
                                    <Tooltip title="Edit">
                                        <IconButton onClick={(event) => handleEdit(index, entry.id, event)} aria-label="edit">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={(event) => handleDelete(entry.id, event)} aria-label="delete">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                        }
                    />
                    {expandedIndex === index && (
                        <CardContent>
                            <Editor
                                editorState={entry.editorState}
                                readOnly={true}
                                blockRendererFn={blockRenderer}
                            />
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default Articles;
