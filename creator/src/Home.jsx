import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const FEATURES = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 1h8a1 1 0 011 1v1H3V4a1 1 0 011-1zm-1 3v7a1 1 0 001 1h8a1 1 0 001-1V6H3z"/>
        <path d="M5 8.5a.5.5 0 011 0v2a.5.5 0 01-1 0v-2zm3 0a.5.5 0 011 0v2a.5.5 0 01-1 0v-2zm3 0a.5.5 0 011 0v2a.5.5 0 01-1 0v-2z"/>
      </svg>
    ),
    title: 'Crop & Resize',
    desc: 'Precisely crop sprites and resize to any dimension while preserving aspect ratio.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3a5 5 0 104.546 2.914.5.5 0 01.908-.417A6 6 0 118 2v1z"/>
        <path d="M8 1a.5.5 0 01.5.5v4a.5.5 0 01-1 0v-4A.5.5 0 018 1z"/>
        <path d="M8 5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 5z"/>
      </svg>
    ),
    title: 'Flip & Rotate',
    desc: 'Flip sprites horizontally or vertically. Rotate in 90° increments or free-rotate.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1"/>
        <path d="M8 1a7 7 0 000 14V1z" fill="currentColor"/>
      </svg>
    ),
    title: 'Color Adjustments',
    desc: 'Fine-tune brightness, contrast, saturation, and hue to match your game\'s palette.'
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 1a6 6 0 00-6 6c0 1.65.533 3.167 1.414 4.343L8 15l4.586-3.657A6 6 0 008 1zm0 1.5a4.5 4.5 0 013.182 1.318.5.5 0 01-.707.707A3.5 3.5 0 008 4a3.5 3.5 0 00-2.475 1.025.5.5 0 11-.707-.707A4.5 4.5 0 018 2.5z"/>
      </svg>
    ),
    title: 'Eraser & BG Removal',
    desc: 'Paint with an eraser for transparency, or remove a background color in one click.'
  }
];

function Home() {
  return (
    <Container>
      <div className="text-center py-5">
        <h1 className="display-4 fw-bold mb-3">Sprite Creator</h1>
        <p className="lead text-muted mb-4">
          Edit sprites entirely in your browser — crop, resize, flip, rotate, adjust colors, and remove backgrounds.
        </p>
        <Link to="/editor">
          <Button variant="primary" size="lg">Open Editor</Button>
        </Link>
      </div>

      <hr className="my-5" />

      <Row className="g-4 text-center">
        {FEATURES.map((f, i) => (
          <Col md={3} key={i}>
            <div className="mb-2 text-muted">{f.icon}</div>
            <h5 className="fw-bold">{f.title}</h5>
            <p className="text-muted small">{f.desc}</p>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Home;
