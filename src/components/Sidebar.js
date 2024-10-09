import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Optional: For icons
import './Sidebar.css';

function Sidebar({ mode }) {
  const [activeLink, setActiveLink] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update active link based on current path
    if (location.pathname === '/') {
      setActiveLink('home');
    } else if (location.pathname === '/create-post') {
      setActiveLink('createNewPost');
    } else if (location.pathname === '/saved-posts') {
      setActiveLink('yourArticles');
    } else if (location.pathname === '/saved-drafts') {
      setActiveLink('yourDrafts');
    }
  }, [location.pathname]);

  const handleNavigation = (link) => {
    if (activeLink !== link) {  
        setActiveLink(link);
        switch (link) {
          case 'home':
                navigate('/');
                break;
            case 'createNewPost':
                navigate('/create-post');
                break;
            case 'yourArticles':
                navigate('/saved-posts');
                break;
            case 'yourDrafts':
                navigate('/saved-drafts');
                break;
            default:
                break;
        }
    }
};
useEffect(() => {
  document.body.className = mode === 'dark' ? 'dark-mode' : ''; // Toggle the class on the body
}, [mode]);

  return (
    <div className="container-fluid">
      <div className="row" >
        {/* Sidebar */}
        <nav
          id="sidebar"
          className={`col-md-3 col-lg-2 d-md-block bg-light sidebar ${isCollapsed ? 'collapsed' : ''}`}
          style={{ minHeight: '100vh',  }}
        >
          <div className="position-sticky">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a
                  className={`nav-link d-flex align-items-center ${activeLink === 'articleAvenue' ? 'active' : ''}`}
                  aria-current="page"
                  
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <i className="bi bi-justify" style={{ fontSize: '24px' }}></i>
                  {!isCollapsed && 'Article Avenue'}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeLink === 'home' ? 'active' : ''}`}
                  aria-current="page"
                  onClick={() => handleNavigation('home')}
                >
                  <i className="bi bi-house"></i>
                  {!isCollapsed && 'Home'}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeLink === 'createNewPost' ? 'active' : ''}`}
                  onClick={() => handleNavigation('createNewPost')}
                >
                  <i className="bi bi-plus-circle"></i>
                  {!isCollapsed && 'Create New Post'}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeLink === 'yourArticles' ? 'active' : ''}`}
                  onClick={() => handleNavigation('yourArticles')}
                >
                  <i className="bi bi-book-fill"></i>
                  {!isCollapsed && 'Your Articles'}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeLink === 'yourDrafts' ? 'active' : ''}`}
                  onClick={() => handleNavigation('yourDrafts')}
                >
                  <i className="bi bi-book-half"></i>
                  {!isCollapsed && 'Your Drafts'}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeLink === 'analytics' ? 'active' : ''}`}
                  onClick={() => handleNavigation('analytics')}
                >
                  <i className="bi bi-bar-chart"></i>
                  {!isCollapsed && 'Analytics'}
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Sidebar;
