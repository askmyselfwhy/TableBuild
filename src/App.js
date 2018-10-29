import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    tableData: null
  }
  componentDidMount() {
    fetch('http://demo4452328.mockable.io/table/1')
      .then(response => response.json())
      .then(tableData => this.setState({ tableData }))
  }
  getMax(arr) {
    return Math.max.apply(null, arr);
  }
  getDepth(obj, prevDepth) {
    let maxDepth = 0;
    if (obj.children) {
      let depths = obj.children.map(child => this.getDepth(child, prevDepth + 1));
      maxDepth = this.getMax(depths);
    }
    return obj.children ? maxDepth : prevDepth;
  }
  getWide(obj) {
    let sumOfWides = 0;
    if (obj.children) {
      let wides = obj.children.map(child => this.getWide(child));
      sumOfWides = wides.reduce((a, b) => a + b, 0);
    }
    return obj.children ? sumOfWides : 1;
  }
  makeTd(value, options) {
    return <td {...options}>
      {value}
    </td>
  }
  calculateDimensionsAndPush(cells, { obj, rowsNumber, depthLevel }) {
    let colspan = this.getWide(obj);
    let rowspan = rowsNumber - this.getDepth(obj, depthLevel);
    cells.push(this.makeTd(obj.value, {
      "valign": "top",
      colSpan: colspan,
      rowSpan: obj.children ? 1 : rowspan
    }));
  }
  buildTableHeaders(tableData) {
    let depths = tableData.title.map(title => this.getDepth(title, 0));
    let maxDepth = this.getMax(depths);
    let rowsNumber = maxDepth + 1;
    let children = [...tableData.title];
    let rowsToRender = [];
    for (let i = 0; i < rowsNumber; i++) {
      let cells = [];
      for (let j = 0; j < tableData.title.length; j++) {
        let title = children[j];
        if (title === null)
          continue;
        // Если обходится массив
        if (title.length) {
          children[j] = null;
          for (let k = 0; k < title.length; k++) {
            let currentTitle = title[k];
            if (currentTitle.value) {
              this.calculateDimensionsAndPush(cells, {
                obj: currentTitle,
                rowsNumber: rowsNumber,
                depthLevel: i
              });
              if (currentTitle.children) {
                children[j] = children[j] ? children[j].concat(currentTitle.children) : currentTitle.children;
              }
            }
          }
          // Если обходится 1 объект
        } else {
          this.calculateDimensionsAndPush(cells, {
            obj: title,
            rowsNumber: rowsNumber,
            depthLevel: i
          });
          children[j] = title.children ? [...title.children] : null;
        }
      }
      rowsToRender.push(<tr>{cells.map(cell => cell)}</tr>)
    }
    return rowsToRender;
  }
  buildTable(tableData) {
    return <table border="1">
      <thead>
        {this.buildTableHeaders(tableData).map(row => row)}
      </thead>
      <tbody>
        {tableData.content.map(row => <tr>{row.map(col => <td>{col || '-'}</td>)}</tr>)}
      </tbody>
    </table>
  }
  render() {
    const { tableData } = this.state;
    return (
      <div className="App">
        {tableData ?
          this.buildTable(tableData)
          :
          <div>Loading...</div>
        }
      </div>
    );
  }
}

export default App;
