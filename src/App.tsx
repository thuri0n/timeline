import React, { useEffect, useRef } from 'react'
import './App.css';
import * as d3 from 'd3'

const data = [
  {'begin': 2001, 'end': 2005, 'pos': 1},
  {'begin': 2006, 'end': 2010, 'pos': 1},
  {'begin': 2008, 'end': 2012, 'pos': 2},
  {'begin': 2011, 'end': 2015, 'pos': 3}
]

function App() {
  const timeLineRef = useRef(null)
  const margin = { top: 20, right: 30, bottom: 50, left: 40 }
  const width = 500 - margin.left - margin.right;
  const height = 120 - margin.top - margin.bottom;
  const xScale = d3.scaleBand();
  const yScale = d3.scaleBand();
  const xAxis = d3.axisBottom(xScale);
  const minX = d3.min(data, d => d.begin);
  const maxX = d3.max(data, d => d.end);

  const drawTimeLine = () => {
    // const xAccessor = (d: any) => d["Date"]
    // const yAccessor = (d: any) => d["Value"]

    const wrapper = d3.select(timeLineRef.current)
        .append('svg')
        .attr('viewBox', `0 0 ${window.screen.width} 500`)

      wrapper.append('circle')
          .attr('cx', 50)
          .attr('cy', 50)
          .attr('r', 50)
          .style('fill', '#333')
  }

  useEffect(() => {
    drawTimeLine()
  }, [])
  return (
    <div className="App">
      <div id={'timeline'} ref={timeLineRef} />
    </div>
  );
}

export default App;
