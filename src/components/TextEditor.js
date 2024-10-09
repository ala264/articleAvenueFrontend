
import React, { useState, useEffect, useRef } from 'react';
import { ResizableBox } from 'react-resizable';
import { Editor, EditorState, RichUtils, AtomicBlockUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw } from 'draft-js';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import 'react-resizable/css/styles.css';
import './TextEditor.css';
import '../../node_modules/draft-js/dist/Draft.css';
import ImageUploader from './ImageUploader';

// Image block renderer
const imageBlockRenderer = (block, { onUpdateEntity }) => {
    if (block.getType() === 'atomic') {
        return {
            component: (props) => <Image {...props} onUpdateEntity={onUpdateEntity} />,
            editable: false,
        };
    }
    return null;
};

const Image = (props) => {
    const { block, contentState, onUpdateEntity } = props;
    const entityKey = block.getEntityAt(0);
    const entity = contentState.getEntity(entityKey);
    const { src, width, height, left, top } = entity.getData();

    const [editorWidth, setEditorWidth] = useState(window.innerWidth);
    const [editorHeight, setEditorHeight] = useState(window.innerHeight);

    useEffect(() => {
        const updateEditorDimensions = () => {
            const editorElement = document.querySelector('.RichEditor-editor');
            if (editorElement) {
                setEditorWidth(editorElement.offsetWidth);
                setEditorHeight(editorElement.offsetHeight);
            }
        };

        updateEditorDimensions();
        window.addEventListener('resize', updateEditorDimensions);

        return () => window.removeEventListener('resize', updateEditorDimensions);
    }, []);

    const handleResizeStop = (e, { size }) => {
        // Update entity data with new size
        onUpdateEntity(entityKey, src, size.width, size.height, left, top);
    };

    return (
            <ResizableBox
                width={width || 200}
                height={height || 200}
                lockAspectRatio
                minConstraints={[50, 50]}
                maxConstraints={[editorWidth, editorHeight]}
                onResizeStop={handleResizeStop}
            >
                <img src={src} alt="Image" style={{ width: '100%', height: '100%',  objectFit: 'contain'}} />
            </ResizableBox>
    );
};

const RichTextEditor = ({ mode }) => {
    const location = useLocation();
    const [richTextState, setRichTextState] = useState(EditorState.createEmpty()); // Renamed from editorState
    const [richDescriptionState, setRichDescriptionState] = useState(EditorState.createEmpty());
    const [title, setTitle] = useState('');
    const [id, setId] = useState(null)
    const [type, setType] = useState('');
    const [thumbnail, setThumbnail] = useState(null)
    const [filename, setFileName] = useState('Choose Thumbnail');
    const [sessionData, setSessionData] = useState(null);
    const [category, setCategory] = React.useState('');

    const editorRef = useRef(null);
    const navigate = useNavigate();

    const containerStyle = {
        backgroundColor: mode === 'dark' ? 'black' : 'white', // Background for dark mode or light mode
        color: mode === 'dark' ? 'white' : 'black', // Text color based on mode
        padding: '20px',
        minHeight: '100vh', // Ensure the page covers the full height
    };

    const editorStyle = {
        backgroundColor: mode === 'dark' ? 'black' : 'white', // Editor background based on mode
        color: mode === 'dark' ? 'white' : 'black', // Editor text color based on mode
        border: `1px solid ${mode === 'dark' ? 'white' : '#ddd'}`, // Border color based on mode
        padding: '10px',
        minHeight: '300px', // Ensure editor has a minimum height
    };

    useEffect(() => {
        if (location.state) {
            const { id, type, title, content, thumbnail, category, filename, description} = location.state;
            if (content) {
                try {
                    setId(id);
                    setTitle(title);
                    setType(type);
                    fetchImage(`https://artuckeavenuebackend-4.onrender.com${thumbnail}`, filename).then(file => {
                        if (file) setThumbnail(file);
                    });
                    setCategory(category)
                    setFileName(filename)
                    setRichTextState(EditorState.createWithContent(convertFromRaw(content))); // Updated variable name
                    setRichDescriptionState(EditorState.createWithContent(convertFromRaw(description)))
                } catch (error) {
                    console.error('Error parsing content:', error);
                }
            }
        }

    }, [location.state]);

    useEffect(()=>{
            const fetchSessionData = async () => {
              try {
                const response = await fetch('https://artuckeavenuebackend-4.onrender.com/get-session-data/', {
                  method: 'GET',
                  credentials: 'include', // Include cookies in the request
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
        
                if (!response.ok) {
                  throw new Error('An error occurred while fetching session data');
                }
        
                const data = await response.json();
        
                if (data.email) {
                  setSessionData(data);
                } else {
                  console.error('No session data found');
                }
              } catch (err) {
                console.error(err.message);
              }
            };
        
            fetchSessionData();
          }, []);

    const fetchImage = async (url, filename) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const blob = await response.blob();
                const file = new File([blob], filename, { type: blob.type });
                return file;
            } catch (error) {
                console.error('Error fetching image:', error);
                return null; // Return null if there is an error
            }
     };
        


    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(richTextState, command); // Updated variable name
        if (newState) {
            setRichTextState(newState); // Updated variable name
            return true;
        }
        return false;
    };

    const handleKeyCommandDescription = (command) => {
        const newState = RichUtils.handleKeyCommand(richDescriptionState, command); // Updated variable name
        if (newState) {
            setRichDescriptionState(newState); // Updated variable name
            return true;
        }
        return false;
    };


    const mapKeyToEditorCommand = (e) => {
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(e, richTextState, 4 /* maxDepth */); // Updated variable name
            if (newEditorState !== richTextState) {
                setRichTextState(newEditorState); // Updated variable name
            }
            return;
        }
        return getDefaultKeyBinding(e);
    };

    const mapKeyToEditorCommandDescription = (e) => {
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(e, richDescriptionState, 4 /* maxDepth */); // Updated variable name
            if (newEditorState !== richDescriptionState) {
                setRichDescriptionState(newEditorState); // Updated variable name
            }
            return;
        }
        return getDefaultKeyBinding(e);
    };

    const toggleBlockType = (blockType) => {
        setRichTextState(RichUtils.toggleBlockType(richTextState, blockType)); // Updated variable name
        setRichDescriptionState(RichUtils.toggleBlockType(richDescriptionState, blockType))
    };

    const toggleInlineStyle = (inlineStyle) => {
        setRichTextState(RichUtils.toggleInlineStyle(richTextState, inlineStyle)); // Updated variable name
        setRichDescriptionState(RichUtils.toggleInlineStyle(richDescriptionState, inlineStyle))
    };

    const handlePastedFiles = (files) => {
        const contentState = richTextState.getCurrentContent(); // Updated variable name
        const file = files[0];

        if (file.type.indexOf('image/') === 0) {
            const reader = new FileReader();
            reader.onload = () => {
                const contentStateWithEntity = contentState.createEntity(
                    'IMAGE',
                    'MUTABLE',
                    {
                        src: reader.result,
                        width: 200,
                        height: 200,
                        left: 0,
                        top: 0
                    }
                );
                const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                const newEditorState = AtomicBlockUtils.insertAtomicBlock(richTextState, entityKey, ' '); // Updated variable name
                setRichTextState(newEditorState); // Updated variable name
            };
            reader.readAsDataURL(file);
            return 'handled';
        }

        return 'not-handled';
    };



    const saveContent = () => {
        const contentState = richTextState.getCurrentContent(); 
        const descriptionState = richDescriptionState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        const rawDescription = convertToRaw(descriptionState)

        
        const isContentEmpty = rawContent.blocks.every(
            block => !block.text.trim() && 
            Object.keys(rawContent.entityMap).length === 0 
        );

        const isDescriptionEmpty = rawDescription.blocks.every(
            block => !block.text.trim() && 
            Object.keys(rawContent.entityMap).length === 0 
        );

        if(!isContentEmpty || !isDescriptionEmpty){
            if (type !== "") {
                if (type === "draft") {
                    edit_draft_article(id, rawContent, title, thumbnail, category, filename, rawDescription)
                }
                else if(type === "completed"){
                    insert_draft_article(sessionData.username, rawContent, title, thumbnail, category, filename, rawDescription);
                } 
            }else {
                insert_draft_article(sessionData.username, rawContent, title, thumbnail, category, filename, rawDescription);
            }

            setTimeout(() => {
                navigate("/saved-drafts");
            }, 500);
        }
        else{
            alert("please write some content")
        }
    };

    const saveArticle = async () => {
        const contentState = richTextState.getCurrentContent(); 
        const descriptionState = richDescriptionState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        const rawDescription = convertToRaw(descriptionState)

        const isContentEmpty = rawContent.blocks.every(
            block => !block.text.trim() && 
            Object.keys(rawContent.entityMap).length === 0 
        );

        const isDescriptionEmpty = rawDescription.blocks.every(
            block => !block.text.trim() && 
            Object.keys(rawContent.entityMap).length === 0 
        );

        if (title && title !== "") {

            if(!isContentEmpty || !isDescriptionEmpty){
                if (type !== "") {
                    if (type === "draft") {
                        delete_draft_article(id)
                        insert_completed_article(sessionData.username, rawContent, title, thumbnail, category, filename, rawDescription)
                    }else if(type === "completed"){
                        edit_completed_article(id, rawContent, title, thumbnail, category, filename, rawDescription)
                    } 
                }else {
                    insert_completed_article(sessionData.username, rawContent, title, thumbnail, category, filename, rawDescription)
                }
                setTimeout(() => {
                    navigate("/saved-posts");
                }, 500)
            
            }
            else{
                alert("please add content to the article")
            }
        }
        else{
            alert("please enter a title")
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setThumbnail(file);  
            setFileName(file.name);
        }
    };
    
    const insert_completed_article = async (username, contents, title, thumbnail, category, filename, description) => {
        const formData = new FormData();
        formData.append('contents', JSON.stringify(contents));  // Contents are still JSON
        formData.append('title', title);
        formData.append('username', username);
        formData.append('thumbnail', thumbnail);  // Attach file object directly
        formData.append('category', category);
        formData.append('filename', filename);
        formData.append('description', JSON.stringify(description));
    
        try {
            const response = await fetch('https://artuckeavenuebackend-4.onrender.com/', {
                method: 'POST',
                body: formData,  // No need for headers, FormData sets them automatically
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData);
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    const insert_draft_article = async (username, contents, title, thumbnail, category, filename, description) => {
        const formData = new FormData();
        formData.append('contents', JSON.stringify(contents));  // Contents are still JSON
        formData.append('title', title);
        formData.append('username', username);
        formData.append('thumbnail', thumbnail);  // Attach file object directly
        formData.append('category', category);
        formData.append('filename', filename);
        formData.append('description', JSON.stringify(description));
    
        try {
            const response = await fetch('https://artuckeavenuebackend-4.onrender.com/insert-draft-article/', {
                method: 'POST',
                body: formData,  // No need for headers, FormData sets them automatically
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log(responseData);
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const edit_draft_article = async (article_id, contents, title, thumbnail, category, filename, description) => {
        const formData = new FormData();
        formData.append('contents', JSON.stringify(contents));  // Contents are still JSON
        formData.append('title', title);
        formData.append('thumbnail', thumbnail);  // Attach file object directly
        formData.append('category', category);
        formData.append('filename', filename);
        formData.append('description', JSON.stringify(description));
           
        try {
            const response = await fetch(`https://artuckeavenuebackend-4.onrender.com/update-draft-article/${article_id}/`, {
                method: 'POST', // Use PUT or PATCH depending on your backend implementation
                body: formData
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log('Draft article edited successfully:', responseData);
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const edit_completed_article = async (article_id, contents, title, thumbnail, category, filename, description) => {
        const formData = new FormData();
        formData.append('contents', JSON.stringify(contents));  // Contents are still JSON
        formData.append('title', title);
        formData.append('thumbnail', thumbnail);  // Attach file object directly
        formData.append('category', category);
        formData.append('filename', filename);
        formData.append('description', JSON.stringify(description));
        
        try {
            const response = await fetch(`https://artuckeavenuebackend-4.onrender.com/update-completed-article/${article_id}/`, {
                method: 'POST', // Use PUT or PATCH depending on your backend implementation
                body: formData  
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log('Complete article edited successfully:', responseData);
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const delete_draft_article = async (article_id) => {
        // Handle the delete action
        try {
            // Send DELETE request to the backend
            const response = await fetch(`https://artuckeavenuebackend-4.onrender.com/delete-draft-article/${article_id}/`, {
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

    const updateEntity = (entityKey, src, width, height, left, top) => {
        const contentState = richTextState.getCurrentContent(); // Updated variable name
        const updatedContentState = contentState.replaceEntityData(entityKey, { src, width, height, left, top });
        const updatedEditorState = EditorState.push(richTextState, updatedContentState, 'apply-entity'); // Updated variable name
        setRichTextState(updatedEditorState); // Updated variable name
    };

    let className = 'RichEditor-editor';
    const contentState = richTextState.getCurrentContent(); // Updated variable name
    if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
            className += ' RichEditor-hidePlaceholder';
        }
    }

    const descriptionContentState = richDescriptionState.getCurrentContent();
    if (!descriptionContentState.hasText()) {
        if (descriptionContentState.getBlockMap().first().getType() !== 'unstyled') {
            className += ' RichEditor-hidePlaceholder';
        }
    }


   const handleChange = (event) => {
    setCategory(event.target.value);
   };

  
    return (
        <>
            <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title here" style = {{backgroundColor: mode === 'dark' ? 'black': '', border: mode === 'dark' ? 'white': ''}} />
            <div className="RichEditor-root" style = {{backgroundColor: mode === 'dark' ? 'black' : 'white'}}>
            <Box sx={{ minWidth: 120,  mb: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Category</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={category}
                        label="Category"
                        onChange={handleChange}
                        >
                        <MenuItem value="Sports">Sports</MenuItem>
                        <MenuItem value="Science">Science</MenuItem>
                        <MenuItem value="General">General</MenuItem>
                        <MenuItem value="World-News">World News</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <BlockStyleControls editorState={richTextState} onToggle={toggleBlockType} /> {/* Updated variable name */}
                <InlineStyleControls editorState={richTextState} onToggle={toggleInlineStyle} /> {/* Updated variable name */}
                <div class="file-upload-container">
                    <label for="file-upload" class="custom-file-upload" style = {{color: mode === 'dark' ? 'white': 'black', backgroundColor: mode === 'dark' ? '#007FFF': '', border: mode === 'dark' ? '#007FFF': ''}}>
                        {filename}
                    </label>
                    <input type="file" id="file-upload" onChange={handleFileChange}/>
                </div>
                <div className={className} id="description" style = {{backgroundColor: mode === 'dark' ? 'black' : 'white'}}> 
                    <Editor
                        editorState={richDescriptionState} // Updated variable name
                        handleKeyCommand={handleKeyCommandDescription}
                        keyBindingFn={mapKeyToEditorCommandDescription}
                        onChange={setRichDescriptionState} // Updated variable name
                        placeholder="Description..."
                        spellCheck={true}
                    />
                </div>
                <div className={className} style = {{backgroundColor: mode === 'dark' ? 'black' : 'white'}}>
                    <Editor
                        editorState={richTextState} // Updated variable name
                        handleKeyCommand={handleKeyCommand}
                        keyBindingFn={mapKeyToEditorCommand}
                        onChange={setRichTextState} // Updated variable name
                        placeholder="Tell a story..."
                        ref={editorRef}
                        spellCheck={true}
                        handlePastedFiles={handlePastedFiles}
                        blockRendererFn={(block) => imageBlockRenderer(block, { onUpdateEntity: updateEntity })}
                    />
                </div>
            </div>
            <button onClick={saveContent} className="btn btn-primary" id="saveButton" style={{backgroundColor: mode === 'dark' ? '#007FFF': 'darkOrange', border: mode === 'dark' ? '#007FFF': 'darkOrange' }}>Save as Draft</button> <br />
            <button onClick={saveArticle} id="new-post" className="btn btn-primary" style={{backgroundColor: mode === 'dark' ? '#007FFF': 'darkOrange', border: mode === 'dark' ? '#007FFF': 'darkOrange'}}>Create New Post</button>
        </>
    );
};

// Block style controls
const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) => (
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            ))}
        </div>
    );
};

// Inline style controls
const INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Monospace', style: 'CODE' },
];

const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();
    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type) => (
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            ))}
        </div>
    );
};

// Style button component
const StyleButton = (props) => {
    const onToggle = (e) => {
        e.preventDefault();
        props.onToggle(props.style);
    };

    let className = 'RichEditor-styleButton';
    if (props.active) {
        className += ' RichEditor-activeButton';
    }

    return (
        <span className={className} onMouseDown={onToggle}>
            {props.label}
        </span>
    );
};

export default RichTextEditor;