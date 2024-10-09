import React, { useState } from 'react';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        username: '',
        author_desc: '',
        profile_pic: null,
        filename: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            profile_pic: file,
            filename: file ? file.name : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('name', formData.name);
        form.append('email', formData.email);
        form.append('password', formData.password);
        form.append('username', formData.username);
        form.append('author_desc', formData.author_desc);
        if (formData.profile_pic) {
            form.append('profile_pic', formData.profile_pic);
            form.append('filename', formData.filename);
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/signup/', {
                method: 'POST',
                body: form,
            });

            if (response.ok) {
                console.log('User signed up successfully');
            } else {
                console.error('Sign-up failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div>
                <label>Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>

            <div>
                <label>Password:</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
            </div>

            <div>
                <label>Username:</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required />
            </div>

            <div>
                <label>Author Description:</label>
                <textarea name="author_desc" value={formData.author_desc} onChange={handleInputChange} />
            </div>

            <div>
                <label>Profile Picture:</label>
                <input type="file" name="profile_pic" onChange={handleFileChange} />
            </div>

            <button type="submit">Sign Up</button>
        </form>
    );
};

export default SignUp;
