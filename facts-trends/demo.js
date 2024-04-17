const international_canvas_width = document.getElementById('international_canvas').clientWidth;
d3.select('#international_canvas').style('height', (international_canvas_width * 5 / 8) + 'px');

Promise.all([d3.json('https://www.forwardpathway.com/d3v6/dataphp/talks/Lin/information.php?name=8672&v=jsfiddle&v2=5'), d3.json('https://www.forwardpathway.com/d3v6/dataphp/school_database/events_international_students.php?v=jsfiddle')]).then(([dataAll, us_events]) => {
 var data=[];
 for(i=13;i>=0;i--){
 data.push({
 	"year": dataAll.finance[i].year,
      "invest":dataAll.finance[i]['revenue'].filter(d => d.type == "投资回报")[0]? dataAll.finance[i]['revenue'].filter(d => d.type == "投资回报")[0]["num"]:0,
      "revenue":d3.sum(dataAll.finance[i].revenue.map(d => d.num))
 });
 }

	console.log(data)
  jQuery("#level_switchButton :input").change(function() {
    const yVal1 = jQuery(this).attr('class');
    const yVal2 = jQuery("#race_switchButton .active :input").attr('class');
    render(yVal1, yVal2);
  });
  jQuery("#race_switchButton :input").change(function() {
    const yVal1 = jQuery("#level_switchButton .active :input").attr('class');
    const yVal2 = jQuery(this).attr('class');
    render(yVal1, yVal2);
  });
  let legendText1, legendText2;


  const width = 800,
    height = 500,
    covidIconW = 30;
  const margin = {
    top: 20,
    right: 80,
    bottom: 85,
    left: 75
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select('#international_canvas')
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);
  svg.append('rect').attr('height', '100%').attr('width', '100%')
    .attr('fill', 'url(#watermark)').attr('opacity', 0.03)
  const circleRadius = 6;
  const rectWidth = 8;
  const legendWidth = 180;
  const color_green = '#589dcd';
  const color_blue='#05cbae';
  const color_red='#f78085';
  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleBand()
    .range([0, innerWidth]);
  const xAxisG = g.append('g').attr('class', 'xAxis')
    .attr('transform', `translate(0,${innerHeight})`);

  const yScale = d3.scaleLinear()
    .range([innerHeight, 0]).nice();
  const yAxisG = g.append('g').attr('class', 'yAxis');
  const yScale2 = d3.scaleLinear()
    .range([innerHeight, 0]).nice();
  const yAxisG2 = g.append('g').attr('class', 'yAxis2').attr('transform', `translate(${innerWidth},0)`);
  const yAxisLabelText2 = g
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', -40)
    .attr('x', innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', `translate(${innerWidth},0)` + ' rotate(90)')
    .attr('text-anchor', 'middle')
    .text('总收入');

const rectG = g.append('g');
  const lineGroup = g.append('g').append('path').attr('class', 'line').attr('opacity', 0.6);
  
  const circleG = g.append('g')
  const tooltipCanvas = g.append('g').attr('class', 'tooltipCanvas');
  const iconG = g.append('g')

  const legendCanvas = g.append('g')
    .attr('class', 'legendCanvas');
  const legendGroup = legendCanvas.append('g')
    .attr('transform', `translate(1,0)`);
  const legend1 = legendGroup.append('rect');
  const legend1Text = legendGroup.append('text')
  const yAxisLabelText = g
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', -40)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('投资收入');
  const legendGroup2 = legendCanvas.append('g')
    .attr('transform', `translate(${legendWidth},0)`);
  const legend2 = legendGroup2.append('path');
  const legend2Circle = legendGroup2.append('circle');
  const legend2Text = legendGroup2.append('text');
  const numberFormat = d=>d3.format('$~s')(d).replace("G","B");
  //////////////////////////////////////////////////////
  const render = (yVal1, yVal2) => {
    const xValue = d => d.year;
    xScale.domain(data.map(d => d.year))
      .range([0, innerWidth])
      .padding(0.4);
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-innerHeight)
      .tickPadding(10)
      .tickFormat(d => d + '年');
    xAxisG.transition().duration(1000)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', `translate(${(xScale.bandwidth()-10)/2},0) rotate(-45)`)
      .style('text-anchor', 'end');

    const yValue = d => d.invest;
    yScale.domain(d3.extent(data, yValue)).nice();
    const yAxis = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .ticks(5)
      .tickPadding(10)
      .tickFormat(numberFormat);
    yAxisG.transition().duration(1000)
      .call(yAxis);

    const yValue2 = d => d.revenue;
    yScale2.domain(d3.extent(data, yValue2)).nice();
    const yAxis2 = d3.axisRight(yScale2)
      .tickSize(0)
      .ticks(5)
      .tickPadding(10)
      .tickFormat(numberFormat);
    yAxisG2.transition().duration(1000)
      .call(yAxis2);

    /////////////////////////开始Chart///////////////////////////////////
    const rectGroup = rectG.selectAll('.rect')
      .data(data);
    rectGroup
      .enter().append('rect').attr('class', 'rect')
      .attr('x', d => xScale(xValue(d)))
      .attr('y', d => yValue(d)>0?yScale(yValue(d)):yScale(0))
      .attr('height', d => Math.abs(yScale(0) - yScale(yValue(d))))
      .attr('width', xScale.bandwidth())
      .attr('fill', d=>yValue(d)>0?color_blue:color_red)
      .merge(rectGroup)
      .transition().duration(1000)
      .attr('x', d => xScale(xValue(d)))
      .attr('y', d => yValue(d)>0?yScale(yValue(d)):yScale(0))
      .attr('height', d => Math.abs(yScale(0) - yScale(yValue(d))))
      .attr('width', xScale.bandwidth())
      .attr('fill', d=>yValue(d)>0?color_blue:color_red);

    const lineGenerator = d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale2(yValue2(d)))
      .curve(d3.curveMonotoneX);

    lineGroup
      .transition().duration(1000)
      .attr('stroke', color_green)
      .attr('d', lineGenerator(data))
      .attr('transform', `translate(${xScale.bandwidth()/2},0)`);

    const circleGroup = circleG.selectAll('.circle')
      .data(data);
    circleGroup
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('stroke', color_green)
      .attr('fill', 'white')
      .attr('r', circleRadius)
      .attr('cy', d => yScale2(yValue2(d)))
      .attr('cx', d => xScale(xValue(d)) + xScale.bandwidth() / 2)
      .merge(circleGroup).transition().duration(1000)
      .attr('stroke', color_green)
      .attr('cy', d => yScale2(yValue2(d)))
      .attr('cx', d => xScale(xValue(d)) + xScale.bandwidth() / 2);

    legendText1 = "投资收入";

    legend1
      .attr('height', '20')
      .attr('width', '20')
      .attr('y', -15)
      .attr('fill', color_blue);
    legend1Text
      .attr('x', 30)
      .text(legendText1);
    legend2.attr('d', 'M 0,-4 L40,-4')
      .attr('class', 'line')
      .attr('stroke', color_green);
    legend2Circle
      .attr('stroke', color_green)
      .attr('fill', 'white')
      .attr('r', circleRadius)
      .attr('cx', 20)
      .attr('cy', -4)
    legend2Text
      .attr('x', 50)
      .text('总收入');

    const legendCanvasWidth = legendCanvas.node().getBBox().width;
    legendCanvas.attr('transform', `translate(${(innerWidth-legendCanvasWidth)/2},${innerHeight+75})`);

  };
  render('under', 'nr');
  ////////////////////////tooltip/////////////////////////////////////////
  /*
  let eventIcons = [];
  us_events.forEach((event_element, index) => {
    if (event_element.year >= xScale.domain()[0] && event_element.year <= xScale.domain()[xScale.domain().length - 1]) {
      if (event_element.link != null) {
        eventIcons[index] = iconG.append('a')
          .attr('xlink:href', 'https://www.forwardpathway.com/' + event_element.link)
          .append('image')
          .attr('xlink:href', 'https://www.forwardpathway.com/wp-content/uploads/logos/hotlink-ok/axisIcon/' + event_element.icon)
      } else {
        eventIcons[index] = iconG.append('image')
          .attr('xlink:href', 'https://www.forwardpathway.com/wp-content/uploads/logos/hotlink-ok/axisIcon/' + event_element.icon)
      }
      eventIcons[index]
        .attr('width', covidIconW)
        .attr('x', xScale(event_element.year) + xScale.step() * event_element.month / 12)
        .attr('y', -covidIconW / 2)
        .attr('name', event_element.name)
        .on('mousemove', focusMouseMove)
        .on('mouseover', focusMouseOver)
        .on('mouseout', focusMouseOut);
    }
  })*/

  const mouseLine = tooltipCanvas.append('g')
    .append('path')
    .attr('class', 'mouse-line')
    .attr('stroke', '#303030')
    .attr('stroke-width', 1)
    .attr('opacity', 0);
  const tooltip = tooltipCanvas.append('g')
    .attr('class', 'tooltip-wrapper')
    .attr('display', 'none');
  const focus = tooltipCanvas.append('rect')
    .attr('cursor', 'move')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .on('mousemove', focusMouseMove)
    .on('mouseover', focusMouseOver)
    .on('mouseout', focusMouseOut);

  const tooltipBackground = tooltip.append('rect').attr('fill', '#e8e8e8');
  const tooltipText = tooltip.append('text');
  const tooltipTextYear = tooltipText.append('tspan').attr('class', 'tooltip-text-line')
    .attr('x', 5)
    .attr('y', 5)
    .attr('dy', '1.1em')
    .attr('font-weight', 'bold');
  const tooltipText1 = tooltipText.append('tspan').attr('class', 'tooltip-text-line ')
    .attr('x', 5)
    .attr('dy', '1.1em');
  const tooltipText2 = tooltipText.append('tspan').attr('class', 'tooltip-text-line ')
    //.attr('fill', colors(colorArray[i]))
    .attr('x', 5)
    .attr('dy', '1.1em');


  function focusMouseMove(event) {
    const bandStep = xScale.step();
    const bandPadding = xScale.padding();
    const yVal1 = jQuery("#level_switchButton .active :input").attr('class');
    const yVal2 = jQuery("#race_switchButton .active :input").attr('class');
    tooltip.attr('display', null);
    const mouse = d3.pointer(event);

    let index = Math.round(((mouse[0] - bandPadding * bandStep / 2 - bandStep / 2) / bandStep));
    if (index < 0) {
      index = 0;
    }
    if (index > data.length - 1) {
      index = data.length - 1;
    }
    let dateOnMouse = xScale.domain()[index];
    let nearestDateXcord = xScale(dateOnMouse);
    if (this.tagName == 'rect') {
      mouseLine.attr('d', `M ${nearestDateXcord+xScale.bandwidth()/2} 0 V ${innerHeight}`).attr('opacity', 1);

      tooltipTextYear.text(dateOnMouse + '年');
      tooltipText1.text(`投资收入：${numberFormat(data[index]["invest"])}`);
      tooltipText2.text(`总收入：${numberFormat(data[index]["revenue"])}`);

      var tooltipWidth = tooltipText.node().getBBox().width;
      var tooltipHeight = tooltipText.node().getBBox().height;
      tooltipBackground.attr("width", tooltipWidth + 10).attr("height", tooltipHeight + 10);
      if ((nearestDateXcord + tooltipWidth) > innerWidth) {
        tooltip.attr("transform", `translate(${nearestDateXcord - tooltipWidth - 20},${mouse[1]+5})`);
      } else {
        tooltip.attr("transform", `translate(${nearestDateXcord + 10},${mouse[1]+5})`);
      }
    } else {
      tooltipTextYear.text(dateOnMouse + '年');
      let event_element = us_events.find(d => d.name == d3.select(this).attr('name'))
      tooltipText1.text(event_element.title);
      tooltipText2.text(event_element.des)
      var tooltipWidth = tooltipText.node().getBBox().width;
      var tooltipHeight = tooltipText.node().getBBox().height;
      tooltipBackground.attr("width", tooltipWidth + 10).attr("height", tooltipHeight + 10);
      if ((nearestDateXcord + tooltipWidth) > innerWidth) {
        tooltip.attr("transform", `translate(${nearestDateXcord - tooltipWidth - 20},${mouse[1]+25})`);
      } else {
        tooltip.attr("transform", `translate(${nearestDateXcord + 10},${mouse[1]+25})`);
      }
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
})
