import * as d3 from 'd3';
import 'styles';

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

function visualize(data) {
  const margins = {
    top: 10,
    right: 20,
    bottom: 20,
    left: 60,
  };
  const canvasWidth = 800;
  const canvasHeight = 500;
  const width = canvasWidth - margins.right - margins.left;
  const height = canvasHeight - margins.top - margins.bottom;
  // create svg canvas
  const svg = d3.select('#heatmap')
    .append('svg')
      .attr('class', 'heatmap')
      .attr('width', canvasWidth)
      .attr('height', canvasHeight)
      .attr('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);

  const heatmap = svg.append('g')
    .attr('transform', `translate(${margins.left}, ${margins.top})`);
}

d3.json(url, (err, data) => {
  if (err) throw err;
  visualize(data);
});
