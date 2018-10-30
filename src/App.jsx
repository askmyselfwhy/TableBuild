import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      tableData: null
    }
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
    return <td {...options} key={options.id || value}>
      {value}
    </td>
  }
  getCell({ obj, rowsNumber, depthLevel }) {
    let colSpan = this.getWide(obj);
    let rowSpan = rowsNumber - this.getDepth(obj, depthLevel);
    return this.makeTd(obj.value, {
      "valign": "top",
      "colSpan": colSpan === 1 ? null : colSpan,
      "rowSpan": obj.children ? null : rowSpan
    })
  }
  buildTableHeaders(tableData) {
    let depths = tableData.title.map(title => this.getDepth(title, 1));
    let maxDepth = this.getMax(depths);
    let children = [...tableData.title];
    let rowsToRender = [];

    for (let i = 0; i < maxDepth; i++) {
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
              cells.push(this.getCell({
                obj: currentTitle,
                rowsNumber: maxDepth,
                depthLevel: i
              }));
              if (currentTitle.children) {
                children[j] = children[j] ? children[j].concat(currentTitle.children) : currentTitle.children;
              }
            }
          }
          // Если обходится 1 объект
        } else {
          cells.push(this.getCell({
            obj: title,
            rowsNumber: maxDepth,
            depthLevel: i
          }));
          children[j] = title.children ? [...title.children] : null;
        }
      }
      rowsToRender.push(<tr key={i}>{cells}</tr>)
    }
    return rowsToRender;
  }
  buildTable(tableData) {
    return <table border="1" className="app__table">
      <thead>
        {this.buildTableHeaders(tableData).map(row => row)}
      </thead>
      <tbody>
        {tableData.content.map((row, index) =>
          <tr key={index}>
            {row.map(col => this.makeTd(col || "-", { id: col + Math.random() }))}
          </tr>)}
      </tbody>
    </table>
  }
  render() {
    const { tableData } = this.state;
    return (
      <div className="app">
        <div className="container">
          {tableData ?
            this.buildTable(tableData)
            :
            <div>Loading...</div>
          }
        </div>
      </div>
    );
  }
}

export default App;
