import React, { Component } from 'react';
import { getMax } from './_helpers';
import './App.css';

class App extends Component {
  static makeTd(value, options) {
    return (
      <td {...options.props} key={options.id}>
        {value}
      </td>
    );
  }

  constructor() {
    super();
    this.state = {
      tableData: null,
    };
  }

  componentDidMount() {
    fetch('http://demo4452328.mockable.io/table/1')
      .then(response => response.json())
      .then(tableData => this.setState({ tableData }));
  }

  getDepth(obj, prevDepth) {
    let maxDepth = 0;
    if (obj.children) {
      const depths = obj.children.map(child => this.getDepth(child, prevDepth + 1));
      maxDepth = getMax(depths);
    }
    return obj.children ? maxDepth : prevDepth;
  }

  getWide(obj) {
    let sumOfWides = 0;
    if (obj.children) {
      const wides = obj.children.map(child => this.getWide(child));
      sumOfWides = wides.reduce((a, b) => a + b, 0);
    }
    return obj.children ? sumOfWides : 1;
  }

  getCell({ obj, rowsNumber, depthLevel }) {
    const colSpan = this.getWide(obj);
    const rowSpan = rowsNumber - this.getDepth(obj, depthLevel);
    return App.makeTd(obj.value, {
      props: {
        colSpan: colSpan === 1 ? null : colSpan,
        rowSpan: obj.children ? null : rowSpan,
      },
      id: obj.value + colSpan + rowSpan,
    });
  }

  buildTableHeaders(tableData) {
    const numberOfCells = tableData.title.length;
    const depths = tableData.title.map(title => this.getDepth(title, 1));
    const maxDepth = getMax(depths);
    const cellsByRow = Array(...Array(numberOfCells)).map(() => []);
    const children = tableData.title.map(title => [title]);

    for (let i = 0; i < numberOfCells; i += 1) {
      const depth = depths[i];
      for (let j = 0; j < depth; j += 1) {
        const cells = [];
        const title = children[i];
        children[i] = [];

        // Обход массива детей
        for (let k = 0; k < title.length; k += 1) {
          const currentTitle = title[k];
          cells.push(this.getCell({
            obj: currentTitle,
            rowsNumber: maxDepth,
            depthLevel: j,
          }));
          if (currentTitle.children) {
            children[i] = children[i] ? children[i].concat(currentTitle.children)
              : currentTitle.children;
          }
        }
        cellsByRow[j].push(cells);
      }
    }

    return cellsByRow.map((cells, index) => <tr key={index}>{cells}</tr>);
  }

  buildTable(tableData) {
    return (
      <table border="1" className="app__table">
        <thead valign="middle" align="middle">
          {this.buildTableHeaders(tableData).map(row => row)}
        </thead>
        <tbody valign="middle" align="middle">
          {tableData.content.map((row, rowIndex) => (
            <tr key={row}>
              {row.map((col, colIndex) => App.makeTd(col || '-', { props: {}, id: (col + rowIndex + colIndex) }))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    const { tableData } = this.state;
    return (
      <div className="app">
        <div className="container">
          {tableData
            ? this.buildTable(tableData)
            : <div>Loading...</div>
          }
        </div>
      </div>
    );
  }
}

export default App;
