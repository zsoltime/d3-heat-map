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
    bottom: 80,
    left: 60,
  };
  const canvasWidth = window.innerWidth * 0.8;
  const canvasHeight = window.innerHeight * 0.8;
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

  // const scaleColor = d3.scaleQuantile()
  //   .domain([0, colors.length, d3.max(data, d => baseTemperature + d.variance)])
  //   .range(colors);

  const scaleColor = d3.scaleLinear()
    .domain([
      d3.min(data, d => baseTemperature + d.variance),
      baseTemperature,
      d3.max(data, d => baseTemperature + d.variance),
    ])
    .range([colors[0], colors[Math.floor(colors.length / 2)], colors[colors.length - 1]]);

  // define axes
  const axisX = d3.axisBottom(scaleX)
    .ticks(12)
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
      .attr('transform', `translate(${width}, 6)`)
      .attr('dy', '1em')
      .attr('text-anchor', 'end')
      .style('opacity', '0.5')
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
    .style('opacity', '0.5')
    .text('Month');

  // add bars(?), I wish I knew their name :)
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

  // gradient for the legend
  const scaleTemp = d3.scaleLinear()
    .domain([0, d3.max(data, d => baseTemperature + d.variance)])
    .range(0, width);

  const numberOfStops = 10;
  const countRange = scaleTemp.domain();
  countRange[2] = countRange[1] - countRange[0];
  const temperatureStops = [];

  for (let i = 0; i < numberOfStops; i++) {
    temperatureStops.push(
      ((i * countRange[2]) / (numberOfStops - 1)) + countRange[0]
    );
  }

  svg.append('defs')
    .append('linearGradient')
    .attr('id', 'temp')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .selectAll('stop')
    .data(d3.range(numberOfStops))
    .enter()
    .append('stop')
    .attr('offset', (d, i) => `${(i * 100) / numberOfStops}%`)
    .attr('stop-color', (d, i) => scaleColor(temperatureStops[i]));

  // draw the legend
  const legendWidth = width * 0.5;

  const legends = svg.append('g')
    .attr('transform', `translate(${width / 2}, ${canvasHeight - 20})`);

  legends.append('rect')
    .attr('x', -legendWidth / 2)
    .attr('y', 0)
    .attr('width', legendWidth)
    .attr('height', 10)
    .style('fill', 'url(#temp)');

  legends.append('text')
    .attr('x', 0)
    .attr('y', -8)
    .style('text-anchor', 'middle')
    .text('Temperature in ˚C');

  const legendPosX = i => (i * (legendWidth / numberOfStops)) +
    (-legendWidth / 2) +
    ((legendWidth * 0.3) / numberOfStops);

  legends.append('g')
    .selectAll('.temp')
    .data(d3.range(numberOfStops))
    .enter()
    .append('text')
    .attr('class', 'temp')
    .attr('x', (d, i) => (
      `${legendPosX(i)}`)
    )
    .attr('y', '20')
    .text((d, i) => `${Math.round(temperatureStops[i])}˚C`);
}

d3.json(url, (err, data) => {
  if (err) throw err;
  visualize(data);
});
