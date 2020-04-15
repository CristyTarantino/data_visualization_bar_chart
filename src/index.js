'use strict';

import 'normalize.css';

require('./styles/index.scss');

localStorage.setItem('example_project', 'D3: Bar Chart');

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const width = 800,
  height = 400,
  padding = 60;

const svg = d3.select('.chart_container')
  .append('svg')
  .attr('width', width + 100)
  .attr('height', height + padding);

const tooltip = d3.select('.chart_container')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

const overlay = d3.select('.chart_container')
  .append('div')
  .attr('class', 'overlay')
  .style('opacity', 0);

d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', json => {
  const dataset = json.data.map(d => {
    const date = d[0].split('-');
    let quarter = '';

    switch (date[1]) {
      case '01':
        quarter = 'Q1';
        break;
      case '04':
        quarter = 'Q2';
        break;
      case '07':
        quarter = 'Q3';
        break;
      case '10':
        quarter = 'Q4';
        break;
    }

    return {
      dateString: d[0],
      date: new Date(d[0]),
      value: d[1],
      quarter,
      year: date[0]
    }
  });

  const barWidth = width/dataset.length;

  const xScale = d3.scaleTime()
    .domain([d3.min(dataset, d => d.date), d3.max(dataset, d => d.date)])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.value)])
    .range([height, padding]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // User Story #9: Each bar element's height should accurately represent the data's corresponding GDP.
  const linearScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.value)])
    .range([0, height-padding]);

  // Both axes should contain multiple tick labels, each with the corresponding class="tick"
  // User Story #2: My chart should have a g element x-axis with a corresponding id="x-axis".
  svg.append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', `translate(${padding}, ${height})`);

  // User Story #3: My chart should have a g element y-axis with a corresponding id="y-axis".
  svg.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding}, 0)`);

  // User Story #5: My chart should have a rect element for each data point with a corresponding class="bar"
  // displaying the data.
  svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.date) + padding)
    .attr('y', d => height - linearScale(d.value))
    .attr('width', barWidth)
    .attr('height', d => linearScale(d.value))
    // User Story #6: Each bar should have the properties data-date and data-gdp containing date and GDP values.
    .attr('data-date', d => d.dateString)
    .attr('data-gdp', d => d.value)
    // User Story #12: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
    .on('mouseover', (d, i) => {
      const value = linearScale(d.value);

      overlay.transition()
        .duration(0)
        .style('height', value + 'px')
        .style('width', barWidth + 'px')
        .style('opacity', .9)
        .style('left', (i * barWidth) + 'px')
        .style('top', height - value + 'px')
        .style('transform', `translateX(${padding}px)`);

      tooltip.transition()
        .duration(200)
        .style('opacity', .9);

      tooltip.html(`${d.year} ${d.quarter} <br> ${formatter.format(d.value)} Billion`)
        .attr('data-date', d.dateString)
        .style('left', (i * barWidth) + 30 + 'px')
        .style('top', height - 100 + 'px')
        .style('transform', `translateX(${padding}px)`);
    })
    .on('mouseout', () => {
      tooltip.transition()
        .duration(200)
        .style('opacity', 0);

      overlay.transition()
        .duration(200)
        .style('opacity', 0);
    });
});

