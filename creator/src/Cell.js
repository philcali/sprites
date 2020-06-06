import React from 'react';

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
