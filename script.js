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
    const w = 960
    const h = 600
    const flagSize = 16

    // create svg canvas
    const svg = d3.select('svg')
      .attr('width', w)
      .attr('height', h)
      .attr('class', 'chart')
      .style('box-sizing', 'border-box')

    // create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)

    // create force layout
    const force = d3.forceSimulation(nodes)
      .alphaDecay(0.03)
      .force('charge', d3.forceManyBody().strength(-2))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('link', d3.forceLink().id((d, i) => d.index).links(links))
      .force('collision', d3.forceCollide().radius(flagSize))
      .on('tick', ticked)

    // create the links between nodes
    const link = svg.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')

    // create the nodes
    const node = d3.select('#flags')
      .selectAll('img')
      .data(nodes)
      .enter().append('img')
      .attr('xlink:href', 'blank.gif')
      .attr('class', d => `flag flag-${d.code}`)
      .style('position', 'absolute')
      .on('mouseover', d => {
        tooltip
          .transition()
          .style('opacity', 1)
        tooltip
          .html(`${d.country}`)
          .style('left', d.x + 50 + 'px')
          .style('top', d.y + 80 + 'px')
      })
      .on('mouseout', d => {
        tooltip
          .transition()
          .style('opacity', 0)
      })
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
        .style('left', (d) => Math.max(0, Math.min(w - flagSize, d.x)) - w / 2 + 'px')
        .style('top', (d) => Math.max(0, Math.min(h - flagSize, d.y)) + 80 + 'px')
    }

    // drag functions
    function dragstarted (d) {
      if (!d3.event.active) {
        force.alphaTarget(0.2).restart()
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
