//const height = document.getElementById('crime_canvas').clientHeight;
let crimeCanvasWidth = document.getElementById('crime_canvas').clientWidth;
d3.select('#crime_canvas')
  .style('height', (crimeCanvasWidth < 600 ? crimeCanvasWidth : 600) + 'px');

const width = document.getElementById('crime_canvas').clientWidth < 600 ? 600 : 900;
const height = 600;
//const height=600,width=600;
const margin = {
  top: 10,
  bottom: 45,
  left: 20,
  right: 20
};
const innerRadius = 70;

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const barHeight = (Math.min(innerWidth, innerHeight) - innerRadius) / 2;
const sliderWidth = width / 2;

const svg = d3.select("#crime_canvas").append('svg')
  .attr("viewBox", [0, 0, width, height])
  .append('g').attr('transform', `translate(${margin.left+innerWidth/2},${margin.top+innerHeight/2})`);
const g=svg.append('g')

const slider = d3.sliderBottom();

d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/crime_yearly_20240324.php?name=9228&v=jsfiddle').then(dataAll => {
const translateArray={'WA':'Weapon Arrest','DA':'Drug Arrest','LA':'Liquor Arrest','WD':'Weapon Discipline','DD':'Drug Discipline','LD':'Liquor Discipline','DoV':'Domestic Violence','DaV':'Dating Violence','S':'Stalking','M':'Murder','NM':'Negligent Manslaughter','Ra':'Rape','F':'Fondling','I':'Incest','Ro':'Robbery','AA':'Aggravated Assault','B':'Burglary','VT':'Vehicle Theft','A':'Arson','RHF':'Residence Hall Fire'};
const translateShort={'Weapon Arrest':'Weapon(A)','Drug Arrest':'Drug(A)','Liquor Arrest':'Liquor(A)','Weapon Discipline':'Weapon(D)','Drug Discipline':'Drug(D)','Liquor Discipline':'Liquor(D)','Domestic Violence':'Domestic','Dating Violence':'Dating','Stalking':'Stalking','Murder':'Murder','Negligent Manslaughter':'Negligent','Rape':'Rape','Fondling':'Fondling','Incest':'Incest','Robbery':'Robbery','Aggravated Assault':'Assault','Burglary':'Burglary','Vehicle Theft':'Vehicle','Arson':'Arson','Residence Hall Fire':'Fire'};
  dataAll.forEach(function(d){d.subdata.forEach(function(dd){dd.type=translateArray[dd.type]})});
  const times = dataAll.map(d => d.year);
  slider
    .min(d3.min(times))
    .max(d3.max(times))
    .marks(times)
    .default(times[times.length - 1])
    .width(sliderWidth)
    .tickFormat(d3.format(""))
    .tickValues(times)
    .on("onchange", (val) => {
      draw(dataAll[times.indexOf(val)].subdata, dataAll[times.indexOf(val)].avg1000);
    });
  const sliderG = svg.append('g')
    .attr('transform', `translate(${-(innerWidth-sliderWidth)/2},${innerHeight/2})`)
    .call(slider);
  const data = dataAll[times.length - 1].subdata;
  const avg1000 = dataAll[times.length - 1].avg1000;

  let extent = d3.extent(data, d => d.number);
  let barScale = d3.scaleLog()
    .domain(extent)
    .range([innerRadius, barHeight])
    .nice();

  const keys = data.map(d => d.type);
  const numBars = keys.length;

  let xScale = d3.scaleLog()
    .domain(extent)
    .range([-innerRadius, -barHeight])
    .nice();

  let xAxis = d3.axisRight(xScale)
    .ticks(2)
    .tickSize(0)
    .tickFormat(d => d);

  const xAxisG = svg.append('g');

  const arc = d3.arc()
    .startAngle((d, i) => {
      return (i * 2 * Math.PI) / numBars;
    })
    .endAngle((d, i) => {
      return ((i + 1) * 2 * Math.PI) / numBars;
    })
    .padAngle(0.05)
    .innerRadius(innerRadius)
    .outerRadius(d => barScale(d.number));

  const arc2 = d3.arc()
    .startAngle(0)
    .endAngle(2 * Math.PI / numBars)
    .padAngle(0)
    .innerRadius(innerRadius)
    .outerRadius(barHeight);

  const lines = g.selectAll('.segment-line')
    .data(keys).enter().append('line')
    .attr('class', 'segment-line')
    .attr('y1', -innerRadius)
    .attr('y2', -barHeight - 10)
    .attr('stroke', 'black')
    .attr('stroke-width', '.5px')
    .attr('transform', (d, i) => {
      return `rotate(${i*360/numBars})`;
    });

  var labelRadius = barHeight * 1.04;

  var labels = svg.append("g")
    .classed("labels", true);

  labels.append("def")
    .append("path")
    .attr("id", "label-path")
    .attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");
  labels.selectAll("text")
    .data(keys)
    .enter().append("text")
    .style("text-anchor", "middle")
    .attr('font-size', 14)
    //.style("font-weight","bold")
    .style("fill", function(d, i) {
      return "#3e3e3e";
    })
    .append("textPath")
    .attr("xlink:href", "#label-path")
    .attr("startOffset", function(d, i) {
      return i * 100 / numBars + 50 / numBars + '%';
    })
    .text(d => translateShort[d]);

  const centerLabel = svg.append('g')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('cursor', 'pointer')
    .append('a')
    .attr('xlink:href', 'https://www.forwardpathway.com/39815')
  const centerLabel1 = centerLabel.append('tspan').attr('y', '-0.6em').attr('x', 0);
  const centerLabel2 = centerLabel.append('tspan').attr('y', '1em').attr('x', 0);

  draw(data, avg1000);
  const tooltipSeg = svg.append('path')
    .attr('fill', 'grey')
    .attr('opacity', 0.3)
    .attr('d', arc2)
    .attr('display', 'none')

  svg.append('circle')
    .attr('r', barHeight)
    .attr('class', 'outer')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', '1.5px')
    .attr('pointer-events', 'all')
    .on('mouseover', function() {
      tooltipSeg.attr('display', null)
      tooltip.attr('display', null)
    })
    .on('mousemove', function(event) {
      const mouse = d3.pointer(event);
      const mouseR = Math.sqrt(mouse[0] * mouse[0] + mouse[1] * mouse[1]);
      const data = dataAll[times.indexOf(slider.value())].subdata;
      const theta = (Math.atan2(mouse[1], mouse[0]) + 5 * Math.PI / 2) % (2 * Math.PI);
      const mouseIndex = Math.floor(theta * numBars / Math.PI / 2)
      const d = data[mouseIndex];

      tooltipText.text(slider.value() + ' ' + d.type + '：' + d.numberR + ' cases')
        .append('tspan').attr('x', 0).attr('dy', '1.2em')
        .text('locations:')
        .append('tspan').attr('x', 0).attr('dy', '1.2em')
        .text('oncampus: ' + d.oncampus + ', among them ' + d.residencehall+' are in residence hall')
        .append('tspan').attr('x', 0).attr('dy', '1.2em')
        .text('off campus：' + d.noncampus + ', public property: ' + d.publicproperty)
      const tooltipBox = tooltipText.node().getBBox();
      tooltipRect.attr('x', tooltipBox.x - 10)
        .attr('y', tooltipBox.y - 8)
        .attr('width', tooltipBox.width + 20)
        .attr('height', tooltipBox.height + 16)
      let tooltipY;
      if (theta >= Math.PI / 2 && theta <= Math.PI * 3 / 2) {
        tooltipY = mouse[1] + 40;
      } else {
        tooltipY = mouse[1] - tooltipBox.height - 10;
      }
      tooltip.attr('transform', `translate(${mouse[0]-tooltipBox.width/2},${tooltipY})`)
      tooltipSeg.attr('transform', `rotate(${360/numBars*mouseIndex})`)
    })
    .on('mouseout', function() {
      tooltipSeg.attr('display', 'none');
      tooltip.attr('display', 'none');
    });

  svg.append('a')
    .attr('xlink:href', 'https://www.forwardpathway.com/39815')
    .append('circle')
    .attr('r', innerRadius)
    .attr('class', 'outer')
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', '1.5px')
    .attr('pointer-events', 'all')
    .on('mouseover', function() {
      labelTooltip.attr('display', null)
    })
    .on('mouseout', function() {
      labelTooltip.attr('display', 'none')
    })
    .attr('cursor', 'pointer')

  const labelTooltip = svg.append('g').attr('class', 'labelTooltip')
    .attr('transform', 'translate(0,-60)').attr('display', 'none').attr('pointer-events', 'none')
  const labelTooltipRect = labelTooltip.append('rect')
    .attr('fill', 'black').attr('rx', 10)
  const labelTooltipText = labelTooltip.append('text')
    .attr('text-anchor', 'middle').attr('fill', 'white')
    .attr('font-size', '1.2em')
    .text('The method for calculating rate: total cases/total students number*1000')
    .append('tspan').attr('x', '0').attr('y', '1em')
    .text('Click for detailed calculation method and Top300 colleges crime rate');
  const labelTooltipBox = labelTooltip.node().getBBox();
  labelTooltipRect.attr('x', labelTooltipBox.x - 8)
    .attr('y', labelTooltipBox.y - 8)
    .attr('width', labelTooltipBox.width + 16)
    .attr('height', labelTooltipBox.height + 16)

  const tooltip = svg.append('g').attr('class', 'segmentTooltip')
    .attr('display', 'none')
  const tooltipRect = tooltip.append('rect').attr('stroke','white').attr('stroke-width',2)
    .attr('fill', 'steelblue').attr('rx', 10)
  const tooltipText = tooltip.append('text').attr('fill', 'white')

  function draw(data, avg1000) {
    extent = d3.extent(data, d => d.number);
    barScale = d3.scaleLog()
      .domain(extent)
      .range([innerRadius, barHeight])
      .nice();
    xScale = d3.scaleLog()
      .domain(extent)
      .range([-innerRadius, -barHeight]).nice();
    xAxis = d3.axisRight(xScale)
      .ticks(2)
      .tickSize(0)
      .tickFormat(d => d);
    xAxisG.attr('class', 'x axis')
      .transition().duration(500).call(xAxis);
    xAxisG.select('.domain').remove();
    xAxisG.selectAll('text').attr('y', 6)
    const circles = g.selectAll('.circle-mark')
      .data(xScale.ticks(2));
    circles.enter().append('circle')
      .attr('class', 'circle-mark')
      .attr('r', d => barScale(d))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-width', '.5px')
      .merge(circles).transition().duration(500)
      .attr('r', d => barScale(d))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '2,2')
      .attr('stroke-width', '.5px')
    circles.exit().remove();

    const segments = g.selectAll('.segments')
      .data(data);
    segments.enter().append('path')
      .attr('class', 'segments')
      .attr('fill', 'steelblue')
      .attr('d', arc)
      .each(function(d) {
        this._current = barScale(d.number);
      })
      .merge(segments)
      .attr('class', 'segments')
      .attr('fill', 'steelblue')
      .transition().duration(500)
      .attrTween('d', arcTween);
    centerLabel1.text(slider.value() + ' average');
    centerLabel2.text('crime rate: ' + avg1000);

    function arcTween(d, index) {
      let i = d3.interpolate(this._current, barScale(d.number));
      return function(t) {
        this._current = i(t);
        arc.outerRadius(i(t))
        return arc(d, index);
      };
    }
  }
})
