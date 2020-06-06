import React from 'react';
import Container from 'react-bootstrap/Container';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Editor from './Editor';

class NewSprite extends React.Component {
  render() {
    return (
      <>
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item active>New Sprite</Breadcrumb.Item>
      </Breadcrumb>
      <Container>
        <Editor />
        <hr/>
      </Container>
      </>
    );
  }
}

export default NewSprite;
