class Grid {
  constructor(props) {
    this.props = props;
    this.props.cell = props.cell || this.identity;
    this.props.row = props.row || this.identity;
  }

  identity(thing) {
    return thing;
  }

  generateRows(rows, cols) {
    let tableRows = [];
    for (let row = 0; row < rows; row++) {
      let cells = [];
      for (let col = 0; col < cols; col++) {
        let index = row + (col * rows);
        if (index < this.props.images.length) {
          let image = this.props.images[index];
          cells.push(this.props.cell(image));
        }
      }
      if (cells.length > 0) {
        tableRows.push(this.props.row(cells, row));
      }
    }
    return tableRows;
  }

  toMatrix() {
    let rows = [];
    switch (this.props.controls.layout) {
      case "horizontal":
        rows = this.generateRows(1, this.props.images.length);
        break;
      case "vertical":
        rows = this.generateRows(this.props.images.length, 1);
        break;
      default:
        let number = Math.ceil(Math.sqrt(this.props.images.length));
        rows = this.generateRows(number, number);
        break;
    }
    return rows;
  }
}

export default Grid;
