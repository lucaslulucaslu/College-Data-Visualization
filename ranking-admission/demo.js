const ranking_admin_canvas_width = document.getElementById('ranking_admin_canvas').clientWidth;
const ranking_admin_responsive_flag = ranking_admin_canvas_width < 500;
d3.select('#ranking_admin_canvas')
  .style('height', (ranking_admin_responsive_flag ? (ranking_admin_canvas_width * 0.8) : (ranking_admin_canvas_width * 4 / 9)) + 'px');
let promises = [d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/ranking_admin_20231213.php?name=9228&v=jsfiddle'), d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/events_international_students.php?v=jsfiddle&v2=2')]
Promise.all(promises).then(([data, us_events]) => {
  let ranking_admin_active = 1;
  jQuery("#adm_switchButton :input").change(function() {
    if ($(this).attr('class') === 'adm_rate_button') {
      ranking_admin_active = 1;
      updateChart(1);
    } else {
      ranking_admin_active = 2;
      updateChart(2);
    }
  });
  data.forEach(d => {
    d.year = parseInt(d.year);
    d.rate = +d.rate;
    d.rate2 = +d.rate2;
  });

  const width = ranking_admin_responsive_flag ? 500 : 900;
  const height = 400;
  const margin = {
    top: 10,
    right: ranking_admin_responsive_flag ? 25 : 65,
    bottom: 60,
    left: ranking_admin_responsive_flag ? 25 : 70
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;


  const svg = d3.select('#ranking_admin_canvas')
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);
  svg.append('rect').attr('height', '100%').attr('width', '100%')
    .attr('fill', 'url(#watermark)').attr('opacity', 0.03)
  const circleRadius = 4;
  const rectWidth = 10;
  const colors = d3.scaleOrdinal()
    .domain(['blue', 'green', 'red', 'yellow', 'deny', 'defer', 'enroll'])
    .range(["#589dcd", "#fcb02a", "#f78085", '#f7e02c', '#ffc1c1', '#6eacd6', '#57ce98']);
  const xValue = d => d.year;
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]); //align last tick to number

  const yValue = d => d.rate;
  const yValue2 = d => d.rate2;
  const yValue3 = d => d.rank;
  //const yValue4 = d => d.qs_rank;

  const y_domain_map = data.map(yValue).concat(data.map(yValue2));
  const y_rank_domain_map = data.map(yValue3);
  const yScale = d3.scaleLinear()
    .domain(d3.extent(y_domain_map)).nice()
    .range([innerHeight, 0]);
  const yScale_rank = d3.scaleLinear()
    .domain([d3.min(y_rank_domain_map) - 1, d3.max(y_rank_domain_map) + 1])
    .range([0, innerHeight]).nice();

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  const plotG = g.append('g')
  const xAxisFormat = d => d;
  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(20)
    .tickFormat(xAxisFormat)
    .ticks(data.length);
  const xAxisG = g.append('g');
  xAxisG.call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);
  xAxisG.selectAll('text')
    .attr('transform', 'rotate(-45)')
    .attr('x', -25);
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .ticks(6)
    .tickPadding(ranking_admin_responsive_flag ? -45 : 10)
    .tickFormat(d3.format('~%'));
  const yAxisG = g.append('g').attr('class', 'adm_rate');
  yAxisG.call(yAxis);
  const yAxisLabelText = yAxisG
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', ranking_admin_responsive_flag ? -10 : -50)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Admission Rate');

  const yAxis2 = d3.axisRight(yScale_rank)
    .tickSize(0)
    .ticks(5)
    .tickPadding(ranking_admin_responsive_flag ? -20 : 10);

  const yAxisG2 = g.append('g');
  yAxisG2.attr('transform', `translate(${innerWidth},0)`)
    .call(yAxis2);
  const yAxisLabelText2 = yAxisG2
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', ranking_admin_responsive_flag ? -10 : -45)
    .attr('x', innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', 'rotate(90)')
    .attr('text-anchor', 'middle')
    .text('USNews Ranking');

  const lineGenerator = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    .curve(d3.curveMonotoneX);
  const line = plotG.append('path')
    .attr('stroke-width', 4)
    .attr('fill', 'none')
    .attr('stroke', colors('blue'))
    .attr('d', lineGenerator(data.filter(d => d.rate > 0)))
    .attr('opacity', 1)
  const circles = plotG.selectAll('.men-adm-rate-circle')
    .data(data.filter(d => d.rate > 0))
    .enter()
    .append('circle')
    .attr('class', 'men-adm-rate-circle')
    .attr('stroke', colors('blue'))
    .attr('fill', 'white')
    .attr('r', circleRadius)
    .attr('cy', d => yScale(yValue(d)))
    .attr('cx', d => xScale(xValue(d)))
    .attr('opacity', 1)
  if (data.filter(d => d.rate > 0).length > 0) {
    const legendDiv = d3.select('#ranking_admin_legend').append('div')
      .attr('class', 'adm_rate')
      .style('display', 'inline-block')
    const legendSvg = legendDiv.append('svg')
      .attr('width', 40)
      .attr('height', 20)
    legendSvg.append('path')
      .attr('d', 'M2 10 H38').attr('stroke-width', 3)
      .attr('stroke', colors('blue'));
    legendSvg.append('circle')
      .attr('stroke', colors('blue'))
      .attr('fill', 'white')
      .attr('r', 4)
      .attr('cx', 20)
      .attr('cy', 10)
    legendDiv.append('span').html('ADM rate (Men)');
  }

  const lineGenerator2 = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue2(d)))
    .curve(d3.curveMonotoneX);
  const line2 = plotG.append('path')
    .attr('stroke-width', 4)
    .attr('fill', 'none')
    .attr('stroke', colors('red'))
    .attr('d', lineGenerator2(data.filter(d => d.rate2 > 0)))
    .attr('opacity', 1)
  const circles2 = plotG.selectAll('.women-adm-rate-circle')
    .data(data.filter(d => d.rate2 > 0))
    .enter()
    .append('circle')
    .attr('class', 'women-adm-rate-circle')
    .attr('stroke', colors('red'))
    .attr('fill', 'white')
    .attr('r', circleRadius)
    .attr('cy', d => yScale(yValue2(d)))
    .attr('cx', d => xScale(xValue(d)))
    .attr('opacity', 1)
  if (data.filter(d => d.rate2 > 0).length > 0) {
    const legendDiv2 = d3.select('#ranking_admin_legend').append('div')
      .attr('class', 'adm_rate')
      .style('display', 'inline-block')
    const legendSvg2 = legendDiv2.append('svg')
      .attr('width', 40)
      .attr('height', 20)
    legendSvg2.append('path')
      .attr('d', 'M2 10 H38').attr('stroke-width', 3)
      .attr('stroke', colors('red'));
    legendSvg2.append('circle')
      .attr('stroke', colors('red'))
      .attr('fill', 'white')
      .attr('r', 4)
      .attr('cx', 20)
      .attr('cy', 10)
    legendDiv2.append('span').html('ADM rate (Women)');
  }
  /////////////////////////////////

  const series = d3.stack().keys(['deny', 'defer', 'enroll'])(data.filter(d => d.enroll));
  yScale
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
  const area = d3.area()
    .x(d => xScale(d.data.year))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))

  const areas = plotG.append("g")
    .selectAll("path")
    .data(series)
    .join("path")
    .attr("fill", ({
      key
    }) => colors(key))
    .attr("d", area)
    .attr('opacity', 0)
  areas.append("title")
    .text(({
      key
    }) => key);
  if (data.filter(d => d.enroll > 0).length > 0) {
    const legendDiv_n1 = d3.select('#ranking_admin_legend').append('div')
      .attr('class', 'adm_number')
      .style('display', 'inline-block')
    const legendSvg_n1 = legendDiv_n1.append('svg')
      .attr('width', 40)
      .attr('height', 20)
    legendSvg_n1.append('path')
      .attr('d', 'M2 10 H38').attr('stroke-width', 6)
      .attr('stroke', colors('deny'));
    legendDiv_n1.append('span').html('Rejected');

    const legendDiv_n2 = d3.select('#ranking_admin_legend').append('div')
      .attr('class', 'adm_number')
      .style('display', 'inline-block')
    const legendSvg_n2 = legendDiv_n2.append('svg')
      .attr('width', 40)
      .attr('height', 20)
    legendSvg_n2.append('path')
      .attr('d', 'M2 10 H38').attr('stroke-width', 6)
      .attr('stroke', colors('defer'));
    legendDiv_n2.append('span').html('Not enrolled');

    const legendDiv_n3 = d3.select('#ranking_admin_legend').append('div')
      .attr('class', 'adm_number')
      .style('display', 'inline-block')
    const legendSvg_n3 = legendDiv_n3.append('svg')
      .attr('width', 40)
      .attr('height', 20)
    legendSvg_n3.append('path')
      .attr('d', 'M2 10 H38').attr('stroke-width', 6)
      .attr('stroke', colors('enroll'));
    legendDiv_n3.append('span').html('Enrolled');

  }
  //////////////////////////////////////////////////////

  const lineGenerator3 = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale_rank(yValue3(d)))
    .curve(d3.curveStep);
  const line3 = plotG.append('path')
    .attr('class', 'line-move-animation')
    .attr('stroke-width', 4)
    .attr('fill', 'none')
    .attr('stroke', colors('yellow'))
    .attr('d', lineGenerator3(data.filter(d => d.rank)));
  plotG.append('g')
    .attr('class', 'rectGroup')
    .selectAll('.rect3')
    .data(data.filter(d => d.rank != null))
    .enter()
    .append('rect')
    .attr('class', 'rect3')
    .attr('stroke', colors('yellow'))
    .attr('fill', colors('yellow'))
    .attr('width', rectWidth)
    .attr('height', rectWidth)
    .attr('y', d => yScale_rank(yValue3(d)) - rectWidth / 2)
    .attr('x', d => xScale(xValue(d)) - rectWidth / 2);
  if (data.filter(d => d.rank != null).length > 0) {
    const legendDiv3 = d3.select('#ranking_admin_legend').append('div')
      .style('display', 'inline-block')
    const legendSvg3 = legendDiv3.append('svg')
      .attr('width', 40)
      .attr('height', 20)
    legendSvg3.append('path')
      .attr('d', 'M2 10 H38').attr('stroke-width', 3)
      .attr('stroke', colors('yellow'));
    legendSvg3.append('rect')
      .attr('stroke', colors('yellow'))
      .attr('fill', colors('yellow'))
      .attr('width', 8)
      .attr('height', 8)
      .attr('x', 20 - 4)
      .attr('y', 10 - 4);
    legendDiv3.append('span').html('USNews Ranking');
  }
/*
  const lineGenerator4 = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale_rank(yValue4(d)))
    .curve(d3.curveStep);
  const line4 = plotG.append('path')
    .attr('stroke-width', '4')
    .attr('fill', 'none')
    .attr('stroke', colors('green'))
    .attr('d', lineGenerator4(data.filter(d => d.qs_rank)));
  plotG.selectAll('.rect4')
    .data(data.filter(d => d.qs_rank))
    .enter()
    .append('rect')
    .attr('class', 'rect4')
    .attr('stroke', colors('green'))
    .attr('fill', colors('green'))
    .attr('width', rectWidth)
    .attr('height', rectWidth)
    .attr('y', d => yScale_rank(yValue4(d)) - rectWidth / 2)
    .attr('x', d => xScale(xValue(d)) - rectWidth / 2);
  if (data.filter(d => d.qs_rank != null).length > 0) {


    const legendDiv4 = d3.select('#ranking_admin_legend').append('div')
      .style('display', 'inline-block')
    const legendSvg4 = legendDiv4.append('svg')
      .attr('width', 40)
      .attr('height', 20)
    legendSvg4.append('path')
      .attr('d', 'M2 10 H38').attr('stroke-width', 3)
      .attr('stroke', colors('green'));
    legendSvg4.append('rect')
      .attr('stroke', colors('green'))
      .attr('fill', colors('green'))
      .attr('width', 8)
      .attr('height', 8)
      .attr('x', 20 - 4)
      .attr('y', 10 - 4);
    legendDiv4.append('span').html('QS美国大学排名');
  }*/
  ////////////////////////tooltip/////////////////////////////////////////
  let tooltipCanvas = g.append('g');

  let mouseLine = tooltipCanvas.append('g')
    .append('path')
    .attr('stroke', '#303030')
    .attr('stroke-width', 1)
    .attr('opacity', 0);

  let tooltip = tooltipCanvas.append('g')
    .attr('display', 'none');
  let focus = g.append('rect')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .on('mousemove', focusMouseMove)
    .on('mouseover', focusMouseOver)
    .on('mouseout', focusMouseOut);

  let tooltipBackground = tooltip.append('rect')
    .attr('fill', '#e8e8e8')
    .attr('rx', 15)
    .attr('stroke', 'white')
    .attr('stroke-width', 2);
  let tooltipText = tooltip.append('text')
    .attr('x', 5)
    .attr('y', 5)
    .attr('dy', '13px')

  /////////////////Covid/////////////////////////////
  const covidIconW = 30;
  const iconCanvas = g.append('g')
  let eventIcons = [];
  us_events.forEach((event_element, index) => {
    if (event_element.year > xScale.domain()[0] && event_element.year <= xScale.domain()[1]) {
      if (event_element.link != null) {
        eventIcons[index] = iconCanvas.append('a')
          .attr('xlink:href', 'https://www.forwardpathway.com/' + event_element.link)
          .append('image')
          .attr('xlink:href', 'https://static.forwardpathway.com/logos/hotlink-ok/axisIcon/' + event_element.icon)
          .attr('width', covidIconW)
          .attr('x', xScale(event_element.year + event_element.month / 12) - covidIconW / 2)
          .attr('y', innerHeight - covidIconW / 2)
          .attr('name', event_element.name)
          .on('mousemove', focusMouseMove)
          .on('mouseover', focusMouseOver)
          .on('mouseout', focusMouseOut);
      } else {
        eventIcons[index] = iconCanvas
          .append('image')
          .attr('xlink:href', 'https://static.forwardpathway.com/logos/hotlink-ok/axisIcon/' + event_element.icon)
          .attr('width', covidIconW)
          .attr('x', xScale(event_element.year + event_element.month / 12) - covidIconW / 2)
          .attr('y', innerHeight - covidIconW / 2)
          .attr('name', event_element.name)
          .on('mousemove', focusMouseMove)
          .on('mouseover', focusMouseOver)
          .on('mouseout', focusMouseOut);
      }
    }
  })
  //////////////////////////////////////////////////

  function focusMouseMove(event) {
    tooltip.attr('display', null);
    let mouse = d3.pointer(event);
    let dateOnMouse = xScale.invert(mouse[0]);
    const closestDate = Math.round(dateOnMouse);
    const nearestDateXcord = xScale(closestDate)
    mouseLine.attr('d', `M ${nearestDateXcord} 0 V ${innerHeight}`).attr('opacity', 1);
    tooltipText
      .text(xAxisFormat(closestDate));
    if (this.tagName == 'rect') {
      let selectedData = data.filter(d => d.year == closestDate)[0]
      if (selectedData.rank) {
        tooltipText.append('tspan')
          .attr('class', 'tooltip-text-line')
          .attr('x', 5)
          .attr('dy', '1.5em')
          .text('USNews Ranking: ' + selectedData.rank)
      }
      if (selectedData.qs_rank) {
        tooltipText.append('tspan')
          .attr('class', 'tooltip-text-line')
          .attr('x', 5)
          .attr('dy', '1.5em')
          .text('QS Ranking: ' + selectedData.qs_rank)
      }
      if (ranking_admin_active == 1) {
        if (selectedData.rate) {
          tooltipText.append('tspan')
            .attr('class', 'tooltip-text-line')
            .attr('x', 5)
            .attr('dy', '1.5em')
            .text('ADM Rate (Men): ' + d3.format('.2%')(selectedData.rate))
        }
        if (selectedData.rate2) {
          tooltipText.append('tspan')
            .attr('class', 'tooltip-text-line')
            .attr('x', 5)
            .attr('dy', '1.5em')
            .text('ADM Rate (Women): ' + d3.format('.2%')(selectedData.rate2))
        }
      } else {
        if (selectedData.deny || selectedData.enroll) {
          const apply = d3.format(',')(selectedData.deny + selectedData.defer + selectedData.enroll) + '人';
          const deny = d3.format(',')(selectedData.deny) + '人';
          const enroll = d3.format(',')(selectedData.enroll) + '人';
          tooltipText.append('tspan')
            .attr('class', 'tooltip-text-line ')
            .attr('x', 5)
            .attr('dy', '1.5em')
            .text(`Apply: ${apply}, Rejected: ${deny}`)
            .append('tspan')
            .attr('x', 5)
            .attr('dy', '1.5em')
            .text(`Enrolled: ${enroll}`);
        }
      }
    } else {
      let event_element = us_events.find(d => d.name == d3.select(this).attr('name'))
      tooltipText.append('tspan')
        .attr('class', 'tooltip-text-line')
        .attr('x', 5)
        .attr('dy', '1.5em')
        .text(event_element.title)
        .append('tspan')
        .attr('x', 5)
        .attr('dy', '1.5em')
        .text(event_element.des)
    }

    const tooltipBox = tooltipText.node().getBBox();
    tooltipBackground
      .attr('x', tooltipBox.x - 10)
      .attr('y', tooltipBox.y - 5)
      .attr("width", tooltipBox.width + 20)
      .attr("height", tooltipBox.height + 10);
    let tooltipX, tooltipY;
    if ((nearestDateXcord + tooltipBox.width) > innerWidth) {
      tooltipX = innerWidth - tooltipBox.width - 10;
    } else {
      tooltipX = nearestDateXcord + 10;
    }
    if (tooltipBox.height + mouse[1] > innerHeight - 30) {
      tooltipY = innerHeight - tooltipBox.height - 30
    } else {
      tooltipY = mouse[1] + 5
    }
    tooltip.attr("transform", `translate(${tooltipX},${tooltipY})`);

  }

  function focusMouseOver() {
    mouseLine.attr("opacity", "1");
    tooltip.attr("display", null);
  }

  function focusMouseOut() {
    mouseLine.attr("opacity", "0");
    tooltip.attr("display", "none");
  }

  function updateChart(option) {
    if (option == 1) {
      yScale
        .domain(d3.extent(y_domain_map)).nice()
      yAxis
        .tickFormat(d3.format('~%'));
      yAxisG.call(yAxis);
      yAxisLabelText
        .text('Admission Rate');
      line.transition().duration(500).delay(100).attr('opacity', 1)
      line2.transition().duration(500).delay(100).attr('opacity', 1)
      circles.transition().duration(500).delay(100).attr('opacity', 1)
      circles2.transition().duration(500).delay(100).attr('opacity', 1)
      areas.transition().attr('opacity', 0)
      d3.selectAll('#ranking_admin_legend .adm_rate').style('display', 'inline-block');
      d3.selectAll('#ranking_admin_legend .adm_number').style('display', 'none');
    } else {
      yScale
        .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
      yAxis
        .tickFormat(d3.format('~s'));
      yAxisG.call(yAxis);
      yAxisLabelText
        .text('Apply, Enrollment');
      line.transition().attr('opacity', 0)
      line2.transition().attr('opacity', 0)
      circles.transition().attr('opacity', 0)
      circles2.transition().attr('opacity', 0)
      areas.transition().duration(500).delay(100).attr('opacity', 1)
      d3.selectAll('#ranking_admin_legend .adm_rate').style('display', 'none');
      d3.selectAll('#ranking_admin_legend .adm_number').style('display', 'inline-block');
    }
  }
  updateChart(1)
})
