import React from 'react';
import Cell from './Cell';
import Grid from './Grid';

class Preview extends React.Component {
  /**
   * Utilize the preview controls to generate a preview table
   */
  determineRows() {
    let grid = new Grid({...this.props,
      cell: image => {
        return <Cell key={image.alt} image={image}/>;
      },
      row: (cells, id) => {
        return (
          <tr key={`preview-row-${id}`}>
            {cells}
          </tr>
        );
      }});
    return grid.toMatrix();
  }

  render() {
    const styles = {
      height: '320px',
      width: '100%',
      overflow: 'scroll'
    };
    return (
      <div style={styles}>
        <table id="sprite-preview">
          <tbody>
            {this.determineRows()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Preview;
