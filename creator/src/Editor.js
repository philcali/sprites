import React from 'react';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Preview from './Preview';
import Grid from './Grid';
import icons from './Icons';

/**
 * Basic editor pane for all sprites.
 */
class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.downloadLink = React.createRef();
    this.state = {
      controls: {
        layout: 'horizontal'
      },
      images: []
    };
  }

  setLayout(layout) {
    this.setState(state => {
      return {
        controls: {
          layout
        }
      }
    });
  }

  /**
   * Filter out images that have already been loaded
   */
  isAlreadyLoaded(file) {
    return this.state.images.filter(i => i.name === file.name).length > 0;
  }

  onAddImage(e) {
    const file = e.target.files[0];
    if (file && !this.isAlreadyLoaded(file)) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        let image = new Image();
        image.src = reader.result;
        image.alt = file.name;
        this.setState(state => {
          let images = state.images.concat(image);
          images.sort((left, right) => {
            return left.alt.localeCompare(right.alt);
          });
          return {
            images
          };
        });
      });
      reader.readAsDataURL(file);
    }
  }

  /**
   * Will render the preview grid on a hidden canvas, and then invoke a download
   */
  onDownloadImage(e) {
    let grid = new Grid({...this.state});
    let max = { height: 0, width: 0 };
    let matrix = grid.toMatrix();
    matrix.forEach(row => {
      let rowWidth = 0;
      let rowHeight = 0;
      row.forEach(cell => {
        rowWidth += cell.width;
        rowHeight = Math.max(rowHeight, cell.height);
      });
      max.width = Math.max(rowWidth, max.width);
      max.height += rowHeight;
    });
    this.canvas.current.width = max.width;
    this.canvas.current.height = max.height;
    let context = this.canvas.current.getContext('2d');
    let y = 0;
    matrix.forEach(row => {
      let x = 0;
      let maxMoveY = 0;
      row.forEach(cell => {
        context.drawImage(cell, x, y, cell.width, cell.height);
        x += cell.width;
        maxMoveY = Math.max(cell.height, maxMoveY);
      });
      y += maxMoveY;
    });
    // There is probably a better way to do this?
    this.downloadLink.current.download = "spritesheet.png";
    this.downloadLink.current.href = this.canvas.current
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
  }

  render() {
    return (
      <>
        <ButtonToolbar aria-label="Sprite Editing Controls">
          <ToggleButtonGroup onChange={this.setLayout.bind(this)} className="mr-2" type="radio" name="layout" defaultValue="horizontal" aria-label="Grid Layout">
            <ToggleButton value="horizontal" variant="outline-dark">{icons.icon('horizontal')}</ToggleButton>
            <ToggleButton value="vertical" variant="outline-dark">{icons.icon('vertical')}</ToggleButton>
            <ToggleButton value="grid" variant="outline-dark">{icons.icon('grid')}</ToggleButton>
          </ToggleButtonGroup>
          <ButtonGroup aria-label="Add Image">
            <Button as='label' variant="outline-success">
              {icons.icon('upload')}
              <input style={{ display: 'none' }} accept="image/*" type="file" onChange={this.onAddImage.bind(this)}/>
            </Button>
            <Button href="/" ref={this.downloadLink} onClick={this.onDownloadImage.bind(this)} disabled={this.state.images.length === 0 } variant="outline-success">
              {icons.icon('download')}
            </Button>
          </ButtonGroup>
        </ButtonToolbar>
        <hr/>
        <Row>
          <Col md><h3>Preview</h3></Col>
        </Row>
        <Row>
          <Col md>
            <Preview {...this.state}/>
            <canvas ref={this.canvas} style={{ display: 'none' }}/>
          </Col>
        </Row>
      </>
    );
  }
}

export default Editor;
