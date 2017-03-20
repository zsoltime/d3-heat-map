import * as d3 from 'd3';
import 'styles';

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const getMonth = num => months[num - 1];

function visualize({ baseTemperature, monthlyVariance }) {
  const margins = {
    top: 0,
    right: 20,
    bottom: 20,
    left: 60,
  };
  const canvasWidth = 1000;
  const canvasHeight = 400;
  const width = canvasWidth - margins.right - margins.left;
  const height = canvasHeight - margins.top - margins.bottom;
  const colors = [
    '#1d91c0',
    '#41b6c3',
    '#c7e8b3',
    '#edf8b3',
    '#fee08b',
    '#ffb880',
    '#ff7b4d',
    '#df4b33',
    '#9e0343',
  ];

  const data = monthlyVariance.map(d => (Object.assign({}, d, {
    date: new Date(d.year, d.month - 1),
    monthName: getMonth(d.month),
  })));
  const rectHeight = Math.floor(height / 12);
  const rectWidth = Math.floor(width / (
    d3.max(data, d => d.year) - d3.min(data, d => d.year)
  ));

  // create svg canvas
  const svg = d3.select('#heatmap')
    .append('svg')
      .attr('class', 'heatmap')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight)
      .attr('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);

  const heatmap = svg.append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`);

  // set ranges and scale the range of data
  const scaleX = d3.scaleTime()
    .domain([
      d3.min(data, d => d.date),
      d3.max(data, d => d.date),
    ])
    .rangeRound([0, width]);
  const scaleY = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.month),
      d3.max(data, d => d.month),
    ])
    .rangeRound([height - rectHeight, rectHeight]);

  const scaleColor = d3.scaleQuantile()
    .domain([0, colors.length, d3.max(data, d => baseTemperature + d.variance)])
    .range(colors);

  // define axes
  const axisX = d3.axisBottom(scaleX)
    .ticks(10)
    .tickFormat(d3.timeFormat('%Y'));
  const axisY = d3.axisLeft(scaleY)
    .tickPadding(5)
    .tickFormat(d => getMonth(d));

  // add x axis
  heatmap.append('g')
    .attr('class', 'heatmap__axis heatmap__axis--x')
    .attr('transform', `translate(0, ${height})`)
    .call(axisX)
    .append('text')
      .attr('class', 'heatmap__label')
      .attr('transform', `translate(${width}, ${margins.bottom * 0.3})`)
      .attr('dy', '1em')
      .attr('text-anchor', 'end')
      .text('Year');

  // add y axis
  const y = heatmap.append('g')
    .attr('class', 'heatmap__axis heatmap__axis--y')
    .call(axisY);

  y.selectAll('.tick text')
    .style('transform', `translateY(${rectHeight / 2}px)`);

  y.append('text')
    .attr('class', 'heatmap__label')
    .attr('y', 25)
    .style('transform', 'translateX(-10px)')
    .text('Month');

  // add bars(?)
  heatmap.append('g')
    .attr('class', 'heatmap__bars')
    .selectAll('.heatmap__bar')
    .data(data)
    .enter()
    .append('rect')
      .attr('class', '.heatmap__bar')
      .attr('fill', d => scaleColor(baseTemperature + d.variance))
      .attr('x', d => scaleX(d.date))
      .attr('y', d => scaleY(d.month))
      .attr('width', rectWidth)
      .attr('height', rectHeight);
}

d3.json(url, (err, data) => {
  if (err) throw err;
  visualize(data);
});
