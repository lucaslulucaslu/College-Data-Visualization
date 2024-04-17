let infoChangeFunc;
let dataAll, rangeData;
infoChangeFunc = () => {
  const yVal1 = jQuery("#info_type .active :input").attr('class');
  const yVal2 = jQuery("#info_level .active :input").attr('class');
  jQuery('#info_level .infoGradButton').removeClass('disabled')
  if (yVal1 == 'tuition') {
    if (dataAll.type == 1) {
      render(yVal1, [yVal1 + '_in_' + yVal2, yVal1 + '_out_' + yVal2, 'room'], ['In-State Tuition', 'Out-of-State Tuition', 'Room & Board']);
    } else {
      render(yVal1, [yVal1 + '_out_' + yVal2, 'room'], ['Tuition (Private Colleges)', 'Room & Board']);
    }
  } else if (yVal1 == 'students') {
    render(yVal1, [yVal1 + '_' + yVal2], ['Students']);
  } else if (yVal1 == 'graduation') {
    jQuery('#info_level .infoUnderButton').addClass('active')
    jQuery('#info_level .infoGradButton').removeClass('active')
    jQuery('#info_level .infoGradButton').addClass('disabled')
    render(yVal1, [yVal1 + '_100_' + 'under', yVal1 + '_150_' + 'under'], ['Graduation Rate', '150% Time Graduation Rate'])
  } else if (yVal1 == 'retention') {
    jQuery('#info_level .infoUnderButton').addClass('active')
    jQuery('#info_level .infoGradButton').removeClass('active')
    jQuery('#info_level .infoGradButton').addClass('disabled')
    render(yVal1, [yVal1 + '_under'], ['Retention'])
  } else if (yVal1 == 's2f') {
    jQuery('#info_level .infoUnderButton').addClass('active')
    jQuery('#info_level .infoGradButton').removeClass('active')
    jQuery('#info_level .infoGradButton').addClass('disabled')
    render(yVal1, [yVal1 + '_under'], ['Students-to-Faculty Ratio'])
  } else if (yVal1 == 'm2w') {
    render(yVal1, [yVal1 + '_men_' + yVal2, yVal1 + '_women_' + yVal2], ["Men's Ratio", "Women's Ratio"])
  }
}
Promise.all([d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/school_information_20240118.php?name=8413&v=jsfiddle'), d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/school_information_range_20240118.php?v=jsfiddle')]).then(([dataLoad, rangeDataLoad]) => {
  dataAll = dataLoad;
  rangeData = rangeDataLoad;
  jQuery("#info_type :input").change(infoChangeFunc);
  jQuery("#info_level :input").change(infoChangeFunc);
  jQuery("#info_compare :input").change(infoChangeFunc);
  infoChangeFunc();
})
  const infoCanvasW = document.getElementById('information_canvas').clientWidth;
const width = 800,
  height = infoCanvasW<500?600:400;
const margin = {
  top: 10,
  right: 25,
  bottom: 50,
  left: 80
};
const yAxisLabelMargin = -60;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3.select('#information_canvas')
  .append("svg")
  .attr("viewBox", [0, 0, width, height]);
svg.append('rect').attr('height', '100%').attr('width', '100%')
  .attr('fill', 'url(#watermark)').attr('opacity', 0.03)
const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);
const colorArray = ["#589dcd", "#f78085", "#05cbae"];
const xAxisG = g.append('g').attr('transform', `translate(0,${innerHeight})`);
const yAxisG = g.append('g');
const yAxisLabelText = g
  .append('text')
  .attr('class', 'axis-label')
  .attr('y', -65)
  .attr('x', -innerHeight / 2)
  .attr('fill', 'black')
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor', 'middle')
const plotG = g.append('g')
const tooltipCanvas = g.append('g');
const mouseLine = tooltipCanvas.append('g')
  .append('path')
  .attr('stroke', '#303030')
  .attr('stroke-width', 1)
  .attr('opacity', 0);
const tooltip = tooltipCanvas.append('g')
  .attr('class', 'tooltip-wrapper')
//.attr('display', 'none');
const focus = g.append('rect')
  .attr('cursor', 'move')
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .attr('width', innerWidth)
  .attr('height', innerHeight)

const tooltipBackground = tooltip.append('rect').attr('fill', '#e8e8e8')
const tooltipText = tooltip.append('text')

const render = (plotType, Ys, legends) => {
  yAxisLabelText.text(jQuery('#info_type label.active').text());
  const compare = jQuery("#info_compare .active :input").attr('class');
  const data = dataAll[plotType];
  const data2 = rangeData[plotType];
  let pType = '',
    tooltipFormat = d3.format('.2%');
  if (plotType == 'tuition') {
    pType = dataAll['type'] == 1 ? '_public' : '_private';
    yAxisFormat = d3.format('$.2s')
    tooltipFormat = d3.format('$,')
  } else if (plotType == 'students') {
    yAxisFormat = d3.format('.2s')
    tooltipFormat = d3.format(',')
  } else if (plotType == 'graduation') {
    yAxisFormat = d3.format('.0%')
  } else if (plotType == 'retention') {
    yAxisFormat = d3.format('.0%')
  } else if (plotType == 's2f') {
    yAxisFormat = d3.format('')
    tooltipFormat = d3.format('')
  } else if (plotType == 'm2w') {
    yAxisFormat = d3.format('.0%')
  }

  const xValue = d => d.year;
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]);
  const xAxisFormat = d3.format('');
  const xAxis = d3.axisBottom(xScale)
    .ticks(innerWidth / 80)
    .tickSize(-innerHeight)
    .tickPadding(20)
    .tickFormat(xAxisFormat);
  xAxisG.transition().call(xAxis);

  let domain_map = [];
  let data_temp = [],
    data_temp2 = [];
  Ys.forEach(function(selectedY, i) {
    domain_map = domain_map.concat(data.map(d => d[selectedY]))
    if (compare == 'compareY') {
      domain_map = domain_map.concat(data2.map(d => d[selectedY + pType + '_min']))
      domain_map = domain_map.concat(data2.map(d => d[selectedY + pType + '_max']))
    }
    const lineElement = data.map(d => {
      let nb = {};
      nb.year = d.year;
      nb.value = d[selectedY];
      return nb;
    });
    const rangeElement = data2.map(d => {
      let nb = {};
      nb.year = d.year;
      nb.min = d[selectedY + pType + '_min'];
      nb.max = d[selectedY + pType + '_max'];
      return nb;
    })
    data_temp.push(lineElement)
    data_temp2.push(rangeElement)
  })
  const yScale = d3.scaleLinear()
    .domain(d3.extent(domain_map)).nice()
    .range([innerHeight, 0]);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .ticks(8)
    .tickPadding(10)
    .tickFormat(yAxisFormat)
  yAxisG.transition().call(yAxis);

  const yValue = d => d.value
  const yValue0 = d => d.min
  const yValue1 = d => d.max
  const areaGenerator = d3.area()
    .x(d => xScale(xValue(d)))
    .y0(d => yScale(yValue0(d)))
    .y1(d => yScale(yValue1(d)))
  const lineGenerator = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    .curve(d3.curveMonotoneX);

  plotG.selectAll('.plotLine')
    .data(data_temp)
    .join(
      function(enter) {
        const gg = enter.append('g')
          .attr('class', 'plotLine')
          .attr('fill', (d, i) => colorArray[i])
        const area = gg.append('path')
          .attr('class', 'range')
          .attr('d', (d, i) => areaGenerator(data_temp2[i]))
        if (compare == 'compareY') {
          area.attr('opacity', 0.2)
        } else {
          area.attr('opacity', 0)
        }
        const line = gg.append('path')
          .attr('class', 'line-draw-animation line')
          .attr('stroke', (d, i) => colorArray[i])
          .attr('stroke-width', 4)
          .attr('fill', 'none')
          .attr('d', d => lineGenerator(d.filter(dd => dd.value)))
          .attr('opacity', 0.5);
        const circles = gg.selectAll('circle')
          .data(d => d.filter(dd => dd.value))
          .join('circle')
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .attr('r', 4)
          .attr('cy', d => yScale(yValue(d)))
          .attr('cx', d => xScale(xValue(d)));
        return enter;
      },
      function(update) {
        update.select('.line')
          .attr('stroke', (d, i) => colorArray[i])
          .transition()
          .attr('d', d => lineGenerator(d.filter(dd => dd.value)))
        update.selectAll('circle')
          .data(d => d.filter(dd => dd.value))
          .join('circle')
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .attr('r', 4)
          .transition()
          .attr('cy', d => yScale(yValue(d)))
          .attr('cx', d => xScale(xValue(d)))
        update.select('.range')
          .transition()
          .attr('d', (d, i) => areaGenerator(data_temp2[i]))
        if (compare == 'compareY') {
          update.select('.range').attr('opacity', 0.2)
        } else {
          update.select('.range').attr('opacity', 0)
        }
      }
    )
  d3.select('#information_legend_canvas').html('')
  Ys.forEach(function(selectedY, i) {
    const legend = d3.select('#information_legend_canvas')
      .append('div')
      .style('display', 'inline-block')
    const legendSvg = legend.append('svg')
      .attr('width', 40)
      .attr('height', 10)
    legendSvg.append('path')
      .attr('d', 'M0 5 H40')
      .attr('stroke-width', 3)
      .attr('stroke', colorArray[i]);
    legendSvg.append('circle')
      .attr('cx', 20)
      .attr('cy', 5)
      .attr('r', 4)
      .attr('stroke-width', 2)
      .attr('fill', colorArray[i])
      .attr('stroke', 'white')
    legend.append('span')
      .html(legends[i])
  })

  ////////////////////////tooltip/////////////////////////////////////////
  focus.on('mousemove', focusMouseMove)
    .on('mouseover', focusMouseOver)
    .on('mouseout', focusMouseOut);

  function focusMouseMove(event) {
    let mouse = d3.pointer(event);
    let dateOnMouse = Math.max(xScale.domain()[0], Math.min(xScale.domain()[1], Math.round(xScale.invert(mouse[0]))));
    const data_temp = data.filter(d => d.year == dateOnMouse)[0];
    mouseLine.attr('d', `M ${xScale(dateOnMouse)} 0 V ${innerHeight}`).attr('opacity', 1);
    tooltipText
      .text(xAxisFormat(dateOnMouse) + ' ' + jQuery('#info_level label.active').text())
    Ys.forEach(function(selectedY, i) {
      tooltipText.append('tspan')
        .attr('x', 0)
        .attr('dy', '1.4em')
        .text(`${legends[i]}: ${tooltipFormat(data_temp[selectedY])+(plotType=='s2f'?':1':'')}`)
    })
    const tooltipBox = tooltipText.node().getBBox();
    tooltipBackground.attr("width", tooltipBox.width + 10)
      .attr("height", tooltipBox.height + 10)
      .attr('x', tooltipBox.x - 5)
      .attr('y', tooltipBox.y - 5);
    if ((xScale(dateOnMouse) + tooltipBox.width) > innerWidth) {
      tooltip.attr("transform", `translate(${xScale(dateOnMouse) - tooltipBox.width - 20},${mouse[1]+25})`);
    } else {
      tooltip.attr("transform", `translate(${xScale(dateOnMouse) + 10},${mouse[1]+25})`);
    }
  }

  function focusMouseOver() {
    mouseLine.attr("opacity", "1");
    tooltip.attr("display", null);

  }

  function focusMouseOut() {
    mouseLine.attr("opacity", "0");
    tooltip.attr("display", "none");
  }
};

window.school_database_info_func=function(value) {
  jQuery("info_level label.btn").removeClass("active")
  jQuery("#info_level label.infoUnderButton").addClass("active")
  jQuery("#info_compare label.btn").removeClass("active")
  jQuery("#info_compare label.compare200").addClass("active")
  jQuery("#info_type label.btn").removeClass("active")
  value = value.toString();
  switch (value) {
    case "0":
      jQuery("#info_type label.tuition").addClass("active");
      jQuery("#info_type label.tuition input").trigger("change");
      break;
    case "1":
      jQuery("#info_type label.students").addClass("active");
      jQuery("#info_type label.students input").trigger("change");
      break;
    case "2":
      jQuery("#info_type label.graduation").addClass("active");
      jQuery("#info_type label.graduation input").trigger("change");
      break;
    case "3":
      jQuery("#info_type label.retention").addClass("active");
      jQuery("#info_type label.retention input").trigger("change");
      break;
    case "4":
      jQuery("#info_type label.s2f").addClass("active");
      jQuery("#info_type label.s2f input").trigger("change");
      break;
    case "5":
      jQuery("#info_type label.m2w").addClass("active");
      jQuery("#info_type label.m2w input").trigger("change");
      break;
  }
}
