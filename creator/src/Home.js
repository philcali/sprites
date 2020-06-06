import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import icons from './Icons';

/**
 * Home page with banner and marketing and stuff.
 */
class Home extends React.Component {
  render() {
    return (
      <>
        <Jumbotron>
          <Container>
            <h1 className="display-3">Sprite Creator</h1>
            <p>Build sprites entirely in the browser!</p>
            <p>
              <Link to="/sprites/new">
                <Button variant="success">Create New Sprite</Button>
              </Link>
            </p>
          </Container>
        </Jumbotron>
        <Container>
          <Row>
            <Col md>
              <h2>{icons.icon('online')} {' '} Online</h2>
              <p>No need to install an image editor on your device to simply stitch together a few frames. Simply use your browser!</p>
            </Col>
            <Col md>
              <h2>{icons.icon('verify')} {' '} Verify</h2>
              <p>Run the animations side by side to verify the animation.</p>
            </Col>
            <Col md>
              <h2>{icons.icon('reorder')} {' '} Reorder</h2>
              <p>Take an existing image and quickly rearrange frame to create new animations and images.</p>
            </Col>
          </Row>
          <hr/>
        </Container>
      </>
    );
  }
}

export default Home;
