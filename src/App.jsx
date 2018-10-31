import React, { Component } from 'react';
import { getMax } from './_helpers';
import './App.css';

class App extends Component {
  static makeTd(value, options) {
    return (
      <td {...options} key={options.id || value}>
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
      colSpan: colSpan === 1 ? null : colSpan,
      rowSpan: obj.children ? null : rowSpan,
    });
  }

  buildTableHeaders(tableData) {
    const depths = tableData.title.map(title => this.getDepth(title, 1));
    const maxDepth = getMax(depths);
    const rowsToRender = [];
    const children = [];

    for (let i = 0; i < tableData.title.length; i += 1) {
      children[i] = [tableData.title[i]];
    }

    for (let i = 0; i < maxDepth; i += 1) {
      const cells = [];
      for (let j = 0; j < tableData.title.length; j += 1) {
        const title = children[j];
        // Обход массива детей
        if (title && title.length) {
          children[j] = null;
          for (let k = 0; k < title.length; k += 1) {
            const currentTitle = title[k];
            cells.push(this.getCell({
              obj: currentTitle,
              rowsNumber: maxDepth,
              depthLevel: i,
            }));
            if (currentTitle.children) {
              children[j] = children[j] ? children[j].concat(currentTitle.children)
                : currentTitle.children;
            }
          }
        }
      }
      rowsToRender.push(<tr key={i}>{cells}</tr>);
    }
    return rowsToRender;
  }

  buildTable(tableData) {
    return (
      <table border="1" className="app__table">
        <thead valign="middle" align="middle">
          {this.buildTableHeaders(tableData).map(row => row)}
        </thead>
        <tbody valign="middle" align="middle">
          {tableData.content.map((row, index) => (
            <tr key={index}>
              {row.map(col => App.makeTd(col || '-', { id: col + Math.random() }))}
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
