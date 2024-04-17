const age_canvas_width = document.getElementById('age_canvas').clientWidth;
const age_responsive_flag = age_canvas_width < 500;
d3.select('#age_canvas').style('height', (age_responsive_flag ? (age_canvas_width * 6 / 9) : (age_canvas_width * 4 / 9)) + 'px');

///////////////////////load data and draw chart///////////////////////////
d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/age_mf_20240118.php?name=9228&v=jsfiddle').then(data => {
  d3.selectAll('#age-switchButton input').on('click', function() {
    age_draw(d3.select(this).attr('class'));
  })
  let width = document.getElementById('age_canvas').clientWidth;
  let responsiveFlag = width < 500;
  width = responsiveFlag ? 600 : 900;
  const height = 400;
  const margin = {
    top: 20,
    bottom: 40,
    left: responsiveFlag ? 20 : 80,
    right: responsiveFlag ? 20 : 40
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select("#age_canvas").append('svg')
    .attr("viewBox", [0, 0, width, height]);
  const g = svg.append('g');
  const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);

  const yValue = d => d.cat;
  const yScale = d3.scaleBand().range([margin.top, height - margin.bottom])
    .padding(0.3);
  const yAxisG = svg.append('g').attr('class', 'age_yAxis')
    .attr('transform', `translate(${margin.left},0)`);
  const xAxisG = svg.append('g').attr('class', 'age_xAxis')
    .attr('transform', `translate(0,${height-margin.bottom})`)
  const tooltipInd = svg.append('rect').attr('fill', 'lightgray').attr('opacity', 0.5).attr('display', 'none')
  let focus = svg.append('rect').attr('class', 'temp')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .on('mousemove', focusMouseMove)
    .on('mouseover', focusMouseOver)
    .on('mouseout', focusMouseOut)
  const tooltipG = svg.append('g').attr('display', 'none').attr('pointer-events', 'none');

  const tooltipRect = tooltipG.append('rect').attr('fill', 'lightgray')
  .attr('stroke','white').attr('stroke-width',2).attr('rx',5)
  const tooltipText = tooltipG.append('text')

  if (!data.filter(d => d.underm > 0 || d.underf < 0).length > 0) {
    d3.select('#age-switchButton label.totalButtonLabel').remove();
    d3.select('#age-switchButton label.underButtonLabel').remove();
    d3.select('#age-switchButton label.gradButtonLabel').attr('class', 'btn btn-secondary gradButtonLabel active');
    age_draw('grad');
  } else if (!data.filter(d => d.gradm > 0 || d.gradf < 0).length > 0) {
    d3.select('#age-switchButton label.totalButtonLabel').remove();
    d3.select('#age-switchButton label.gradButtonLabel').remove();
    d3.select('#age-switchButton label.underButtonLabel').attr('class', 'btn btn-secondary underButtonLabel active');
    age_draw('under');
  } else {
    age_draw('total');
  }

  function focusMouseMove(event) {
    const mouse = d3.pointer(event);
    let catIndex = Math.round((mouse[1] - yScale.step() * (0.5 + yScale.padding() / 2)) / yScale.step());
    if (catIndex < 0) {
      catIndex = 0;
    }
    if (catIndex > data.length - 1) {
      catIndex = data.length - 1;
    }
    tooltipInd.attr('x', margin.left)
      .attr('y', margin.top + (catIndex + yScale.padding() / 2) * yScale.step())
      .attr('width', innerWidth)
      .attr('height', yScale.step())
    const focusedData = data[catIndex];
    const m_selected = $('#age-switchButton .active input').attr('class') + 'm';
    const f_selected = $('#age-switchButton .active input').attr('class') + 'f';
    tooltipText.text($('#age-switchButton .active').text())
      .append('tspan')
      .attr('x', 0).attr('dy', '1.2em')
      .text('Age：' + focusedData.cat)
      .append('tspan')
      .attr('x', 0).attr('dy', '1.2em')
      .text('Men：' + focusedData[m_selected] + ', Women: ' + (-focusedData[f_selected]))
    const tooltipBox = tooltipText.node().getBBox();
    tooltipRect
      .attr('x', tooltipBox.x - 10)
      .attr('y', tooltipBox.y - 5)
      .attr("width", tooltipBox.width + 20).attr("height", tooltipBox.height + 10);
    let offsetX, offsetY;
    if (tooltipBox.width + mouse[0] >= innerWidth) {
      offsetX = mouse[0] - tooltipBox.width - 20 + margin.left;
    } else {
      offsetX = mouse[0] + margin.left + 20
    }
    if (tooltipBox.height + mouse[1] >= innerHeight) {
      offsetY = mouse[1] - tooltipBox.height + margin.top;
    } else {
      offsetY = mouse[1] + margin.top + 20
    }
    tooltipG.attr('transform', `translate(${offsetX},${offsetY})`);
  }

  function focusMouseOver() {
    tooltipG.attr('display', null);
    tooltipInd.attr('display', null);
  }

  function focusMouseOut() {
    tooltipG.attr('display', 'none');
    tooltipInd.attr('display', 'none');
  }

  function age_draw(xSelected) {
    const xValueM = d => d[xSelected + 'm'];
    const xValueF = d => d[xSelected + 'f'];

    xScale.domain(d3.extent([].concat(data.map(xValueM)).concat(data.map(xValueF)))).nice();
    yScale.domain(data.map(yValue));
    const yAxis = d3.axisLeft(yScale)
      .tickSize(-innerWidth);
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-innerHeight).tickFormat(Math.abs).ticks(width / 100);
    yAxisG.call(yAxis);
    xAxisG.transition().duration(1000).call(xAxis);
    yAxisG.select('.domain').remove();
    xAxisG.select('.domain').remove();
    yAxisG.selectAll('.tick line').attr('transform', `translate(0,${yScale.step()/2})`)
    if (responsiveFlag) {
      yAxisG.selectAll('.tick text').attr('dx', '60px')
    }
    const ageM = g
      .selectAll('.ageM')
      .data(data);
    ageM.enter()
      .append('rect')
      .attr('class', 'ageM')
      .attr('fill', '#589dcd')
      .attr('x', xScale(0))
      .attr('y', d => yScale(yValue(d)))
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(xValueM(d)) - xScale(0))
      .merge(ageM).transition().duration(1000)
      .attr('x', xScale(0))
      .attr('y', d => yScale(yValue(d)))
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(xValueM(d)) - xScale(0));

    const ageF = g
      .selectAll('.ageF')
      .data(data);
    ageF.enter()
      .append('rect')
      .attr('class', 'ageF')
      .attr('fill', '#ff8e64')
      .attr('x', d => xScale(xValueF(d)))
      .attr('y', d => yScale(yValue(d)))
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(0) - xScale(xValueF(d)))
      .merge(ageF).transition().duration(1000)
      .attr('x', d => xScale(xValueF(d)))
      .attr('y', d => yScale(yValue(d)))
      .attr('height', yScale.bandwidth())
      .attr('width', d => xScale(0) - xScale(xValueF(d)));
  }
})
