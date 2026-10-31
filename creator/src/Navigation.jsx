import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" sticky="top" className="mb-3">
      <Navbar.Brand as={Link} to="/" className="ms-3">
        <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 1a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H1a1 1 0 01-1-1V1zm1 1v4h4V2H2zm6 0v4h4V2H8zM2 9v4h4V9H2zm6 0v4h4V9H8z"/>
        </svg>
        {' '}Sprite Creator
      </Navbar.Brand>
      <Nav className="ms-auto me-3">
        <Nav.Link as={Link} to="/">Home</Nav.Link>
        <Nav.Link as={Link} to="/editor">Editor</Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default Navigation;
