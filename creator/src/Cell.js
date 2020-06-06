import React from 'react';

/**
 * An individual cell in a preview-like container.
 */
class Cell extends React.Component {
  render() {
    return (
      <td>
        <img src={this.props.image.src} alt={this.props.image.alt}/>
      </td>
    );
  }
}

export default Cell;
