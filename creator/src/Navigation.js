import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from './logo.svg';

function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" sticky="top">
      <Navbar.Brand href="/">
        <img
          src={logo}
          width="40"
          heigth="40"
          className="d-inline-block align-top"
          alt="Sprite Animations"
        />
      </Navbar.Brand>
      <Nav className="mr-auto">
        <Nav.Link href="/">Home</Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default Navigation;
