# Article Avenue Frontend
## Overview
Article Avenue is a full-stack web application for creating, publishing, and discovering articles. Users can sign up, write and edit articles, save drafts, publish completed posts, and browse public article and author pages.

This repository contains the React frontend of the application, which communicates with a Django backend and PostgreSQL database through REST APIs.

## Technical Details
The frontend was built with React and uses Material UI and Bootstrap for interface components and styling. React Router is used to manage navigation between public pages, authentication pages, and protected user pages.

The application communicates with the Django backend through REST API requests using `fetch()`. Session-based authentication is used to determine whether a user can access protected routes such as the dashboard, saved drafts, saved posts, and the article editor.

Draft.js is used for rich-text article creation and rendering, including formatted text and embedded images. The frontend also includes light and dark themes, with the user's theme preference stored in `localStorage`.

## Features

- User sign-up and sign-in
- Public article and author pages
- Rich-text article creation and editing
- Draft saving and publishing
- Article thumbnail and embedded image support
- Edit and delete published articles
- Protected pages for authenticated users
- Light and dark mode

## Architecture
The diagram below shows the overall Article Avenue architecture and how the React frontend connects to the Django backend and PostgreSQL database.

<img width="100%" alt="Article Avenue Architecture" src="https://github.com/user-attachments/assets/bbae9bf8-465d-4a37-b5a7-9f466081bd7e">

## Challenges
One challenge was improving the performance of the public article page. Article thumbnail images were initially stored directly in PostgreSQL, which increased the amount of data transferred when loading articles. We changed the design so that thumbnail image files were stored on the backend server while the database stored references to them instead. This reduced the amount of data being transferred and improved response times.

## Related Repositories
This frontend repository was created after the original Article Avenue project was separated into frontend and backend repositories to support deployment.

- Backend repository: [Article Avenue Backend](https://github.com/ala264/articleAvenueBackend)
- Original combined repository: [Article Avenue (Earlier Version)](https://github.com/hathaull/article_app)
