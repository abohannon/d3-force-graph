/* global d3:true */
/* eslint no-undef: "error" */

const DATA_URL = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json'

class Chart {
  constructor () {
    this.getCountryData = this.getCountryData.bind(this)
    this.renderCountryData = this.renderCountryData.bind(this)
  }

  getCountryData () {
    fetch(DATA_URL)
      .then((response) => {
        if (response.status !== 200) {
          console.log('Problem with response.', response.status)
        } else {
          return response.json()
        }
      }).then((data) => this.renderCountryData(data))
  }

  renderCountryData (data) {
    console.log('inside render', data)

    const {nodes, links} = data

    // chart dimensions
    const w = 1100
    const h = 900

    // create svg canvas
    const svg = d3.select('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('class', 'chart')
      .style('box-sizing', 'border-box')

    // create force layout

    const force = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-5))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('link', d3.forceLink().id((d, i) => d.index).links(links))
      .on('tick', ticked)

    const link = svg.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')

    const node = svg.append('g')
      .attr('class', 'node')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 8)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // plot the links and nodes according to their data attributes
    function ticked () {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)
      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
    }

    // drag functions
    function dragstarted (d) {
      if (!d3.event.active) {
        force.alphaTarget(0.3).restart()
      }
    }

    function dragged (d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended (d) {
      if (!d3.event.active) {
        force.alphaTarget(0)
      }
      d.fx = undefined
      d.fy = undefined
    }
  }

  initialize () {
    this.getCountryData()
  }
}

const chart = new Chart()
chart.initialize()
