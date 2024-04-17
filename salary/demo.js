Promise.all([d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/staff_salary_20240118.php?name=9228&v=jsfiddle'), d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/staff_salary_average.php?v=jsfiddle&v2=15')]).then(([dataAll, avgData]) => {
  const width = 900;
  const height = 600;
  const margin = {
    top: 10,
    bottom: 100,
    left: 80,
    right: 60
  };
  /*const ranks = {
    1: '教授',
    2: '副教授',
    3: '助理教授',
    4: '讲师 (Instructor)',
    5: '讲师 (Lecturer)',
    6: '无职称',
    7: '所有教职工'
  }*/
    const ranks = {
    1: 'Professor',
    2: 'Associate Prof.',
    3: 'Assistant Prof.',
    4: 'Instructor',
    5: 'Lecturer',
    6: 'No academic Rank',
    7: 'All'
  }
  const salaryFormat = d => d > 0 ? d3.format('$,')(d) : '-'
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svg = d3.select("#salary_canvas").append('svg')
    .attr("viewBox", [0, 0, width, height]);
  svg.append('rect').attr('height', '100%').attr('width', '100%')
    .attr('fill', 'url(#watermark)').attr('opacity', 0.05)
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  const slider = d3.sliderBottom();
  const years = dataAll.map(d => d.year);
  slider
    .min(d3.min(years))
    .max(d3.max(years))
    .marks(years)
    .default(d3.max(years))
    .width(width * 0.7)
    .tickFormat(d3.format(""))
    .tickValues(years)
    .on("onchange", () => {
      draw();
    });
  const sliderG = svg.append('g')
    .attr('transform', `translate(${width*0.15},${innerHeight+margin.top+50})`)
    .call(slider);
  const xScale = d3.scaleBand().range([0, innerWidth])
    .padding(0.2)
  const xAxis = d3.axisBottom(xScale)
  const xAxisG = g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
  const yScale = d3.scaleLinear().range([innerHeight, 0])
  const yAxisG = g.append('g');
  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .ticks(5)
    .tickFormat(d3.format('$~s'))
  const yAxisLabelText = yAxisG
    .append('text')
    .attr('class', 'axis-label')
    .attr('y', -55)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Salary')
  const backRect = g.append('rect')
    .attr('fill', 'lightgray')
    .attr('height', innerHeight)
    .attr('display', 'none')
  const types = [{
    name: 'Men',
    color: '#6eacd6'
  }, {
    name: 'Women',
    color: '#f78085'
  }, {
    name: 'All',
    color: '#05cbae'
  }]
  let legendText = '',
    legendStyle = '',
    legendRectWidth = 16;
  types.forEach(function(s, index) {
    legendText = legendText + `<span class="staff-salary-${index}">${s.name}</span>`;
    legendStyle = legendStyle + `.staff-salary-${index}{display:inline-flex;align-items:center;margin-right:1em;}.staff-salary-${index}::before{content:"";width:${legendRectWidth}px;height:${legendRectWidth}px;margin-right:0.5em;background:${s.color};}`
  })
  d3.select('#salary_legend_canvas').html('<style>' + legendStyle + '</style><div>' + legendText + '</div>')

  const tooltip = svg.append('g')
    .attr('class', 'tooltip-wrapper')
    .attr('display', 'none');
  const tooltipRect = tooltip.append('rect')
    .attr('fill', '#6eacd6')
    .attr('rx', 15)
    .attr('stroke-width', 2).attr('stroke', 'white');
  const tooltipText = tooltip.append('text');
  const focusA = svg.append('a')
  const focus = focusA.append('rect').attr('class', 'focusRect')
    .attr('transform', `translate(${margin.left},${margin.top})`)
    .attr('cursor', 'pointer')
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .attr('width', innerWidth)
    .attr('height', innerHeight)

  draw();

  function draw() {
    const year = slider.value();
    const data = dataAll.filter(d => d.year == year)[0].data
    const avgNum = avgData.filter(d => d.year == year)[0].avg
    //const avgData = [{
    //  year: slider.value(),
    //  avg: avgNum
    //}]
    xScale
      .domain(data.map(d => ranks[d.r]))
    xAxisG.call(xAxis);
    xAxisG.select('.domain').remove();
    yScale
      .domain([0, d3.max(data.map(d => +d.m).concat(data.map(d => +d.w), avgNum))]).nice();
    yAxisG.call(yAxis);
    yAxisG.select('.domain').remove();
    backRect.attr('width', xScale.step())
      .attr('x', xScale.step() * xScale.padding() / 2)
    const typeMargin = 0.1 * xScale.bandwidth() / 3;
    const salary_m = g.selectAll('.salary_m')
      .data(data)
      .join('rect').attr('class', 'salary_m')
      .attr('fill', '#6eacd6')
      .attr('x', d => xScale(ranks[d.r]) + typeMargin / 2)
      .attr('y', d => yScale(d.m))
      .attr('height', d => yScale(0) - yScale(d.m))
      .attr('width', d => xScale.bandwidth() / 3 - typeMargin)
    const salary_w = g
      .selectAll('.salary_w')
      .data(data)
      .join('rect').attr('class', 'salary_w')
      .attr('fill', '#f78085')
      .attr('x', d => xScale(ranks[d.r]) + xScale.bandwidth() / 3 + typeMargin / 2)
      .attr('y', d => yScale(d.w))
      .attr('height', d => yScale(0) - yScale(d.w))
      .attr('width', d => xScale.bandwidth() / 3 - typeMargin)
    const salary_t = g
      .selectAll('.salary_t')
      .data(data)
      .join('rect').attr('class', 'salary_t')
      .attr('fill', '#05cbae')
      .attr('x', d => xScale(ranks[d.r]) + xScale.bandwidth() * 2 / 3 + typeMargin / 2)
      .attr('y', d => yScale(d.t))
      .attr('height', d => yScale(0) - yScale(d.t))
      .attr('width', d => xScale.bandwidth() / 3 - typeMargin)
    const salary_avg = g.selectAll('.salary_avg')
      .data(avgData.filter(d => d.year == year), d => d.year)
      .join(
        function(enter) {
          const enterG = enter.append('g')
            .attr('class', 'salary_avg')
          enterG.append('path')
            .attr('d', d => `M 0 ${yScale(d.avg)} H ${innerWidth-15}`)
            .attr('stroke', 'gray')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '2 5')
            .attr('fill', 'none')
          enterG.append('text')
            .attr('font-size', 10)
            .attr('transform', d => `translate(${innerWidth+20},${yScale(d.avg)-4})`)
            .attr('text-anchor', 'middle')
            .text('Top200 Colleges')
            .append('tspan')
            .attr('x', 0)
            .attr('dy', '1em')
            .text('Average Salary')
          const enterRect = enterG.append('rect')
          const enterText = enterG.append('text')
            .attr('font-size', 12)
            .attr('x', 0)
            .attr('y', d => yScale(d.avg) + 3)
            .attr('text-anchor', 'end')
            .attr('fill', 'white')
            .text(d => d3.format('$,')((d.avg)))
          const enterTextBox = enterText.node().getBBox();
          enterRect.attr('x', enterTextBox.x - 2.5)
            .attr('y', enterTextBox.y - 5)
            .attr('width', enterTextBox.width + 5)
            .attr('height', enterTextBox.height + 10)
            .attr('fill', 'black')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('rx', 5)
        }
      )
    focus.on('mousemove', focusMouseMove)
      .on('mouseover', focusMouseOver)
      .on('mouseout', focusMouseOut)

    function focusMouseMove(event) {
      const mouse = d3.pointer(event);
      let catIndex = Math.round((mouse[0] - xScale.step() * (0.5 + xScale.padding() / 2)) / xScale.step());
      if (catIndex < 0) {
        catIndex = 0;
      }
      if (catIndex > data.length - 1) {
        catIndex = data.length - 1;
      }
      backRect.attr('x', xScale.step() * catIndex + xScale.step() * xScale.padding() / 2)
      const focusedData = data[catIndex];
      const background = '#05cbae';
      tooltipText.text(year)
        .append('tspan').attr('x', 0).attr('dy', '1.2em')
        .text(ranks[focusedData.r] + ' Average Salary: ' + salaryFormat(focusedData.t))
        .append('tspan').attr('x', 0).attr('dy', '1.2em')
        .text( ranks[focusedData.r] + '(Men): ' + salaryFormat(focusedData.m))
        .append('tspan').attr('x', 0).attr('dy', '1.2em')
        .text(ranks[focusedData.r] + '(Women): ' + salaryFormat(focusedData.w))
      const tooltipBox = tooltipText.node().getBBox();
      tooltipRect.attr('x', tooltipBox.x - 10)
        .attr('y', tooltipBox.y - 10)
        .attr('width', tooltipBox.width + 20)
        .attr('height', tooltipBox.height + 20)
      let tooltipX = mouse[0] + margin.left;
      let tooltipY = mouse[1] + margin.top - tooltipBox.height;
      tooltipX = tooltipBox.width + tooltipX > width - margin.right ? width - margin.right - tooltipBox.width : tooltipX;
      tooltipY = tooltipY < margin.top ? margin.top : tooltipY;
      tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`);
    }

    function focusMouseOver(event, d) {
      tooltip.attr('display', null)
        .attr('transform', `translate(${d3.pointer(event)[0]},${d3.pointer(event)[1]})`);
      backRect.attr('display', null)

    }

    function focusMouseOut() {
      tooltip.attr('display', 'none')
      backRect.attr('display', 'none')
    }
  }

})
