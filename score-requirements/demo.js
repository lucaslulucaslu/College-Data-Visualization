const score_required_canvas_width = document.getElementById('score_required_canvas').clientWidth;
const score_required_responsive_flag = score_required_canvas_width < 500;
d3.select('#score_required_canvas')
  .style('height', (score_required_responsive_flag ? (score_required_canvas_width * 0.8) : (score_required_canvas_width * 4 / 9)) + 'px');

d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/score10_20231213.php?name=9228&v=jsfiddle').then(data => {
  const convertArray = {
    'SATR': 'SAT Reading',
    'SATM': 'SAT Math',
    'ACTC': 'ACT Composite',
    'ACTE': 'ACT English',
    'ACTM': 'ACT Math'
  };
  for (const year in data) {
    data[year]['score'].forEach(function(d) {
      d.name = convertArray[d.name];
    })
  }
  let width = document.getElementById('score_required_canvas').clientWidth;
  const height = 400;
  let responsiveFlag = width < 500;
  width = responsiveFlag ? 500 : 900;
  const margin = {
    top: 10,
    bottom: 70,
    left: 80,
    left2: 10,
    right: 20,
  };
  const sliderPadding = 80;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select("#score_required_canvas").append('svg')
    .attr("viewBox", [0, 0, width, height])
  const slider = d3.sliderBottom();

  const xValueStart = d => d.start;
  const xValueEnd = d => d.end;
  const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);

  const yValue = d => d.name;
  const yScale = d3.scaleBand().range([margin.top, height - margin.bottom])
    .padding(0.08);
  const yAxisG = svg.append('g').attr('class', 'score_yAxis')
    .attr('transform', `translate(${margin.left},0)`);
  svg.append('path').attr('d', `M${margin.left},${margin.top} L${margin.left},${height-margin.bottom}`)
    .attr('stroke', 'black')
  const times = Object.keys(data);
  slider
    .min(d3.min(times))
    .max(d3.max(times))
    .step(1)
    //.marks(times)
    .default(times[times.length - 1])
    .width(width - sliderPadding * 2)
    .ticks(width / 100)
    .tickFormat(d3.format(""))
    //.tickValues(times)
    .on("onchange", (val) => {
      draw(data[val]);
    });
  const sliderG = svg.append('g')
    .attr('transform', `translate(${sliderPadding},${height-margin.bottom+20})`)
    .call(slider);

  draw(data[times[times.length - 1]]);

  function draw(data) {
    const dataS = data.score.filter(d => d.start != null)
    const dataP = data.per
    yScale.domain(dataS.map(yValue));

    const yAxis = d3.axisLeft(yScale)
      .tickSizeOuter(0)
      .tickSize(-width + margin.left + margin.right);
    yAxisG.transition().duration(500).call(yAxis);
    yAxisG.selectAll('.tick').select('line')
      .transition().duration(500)
      .attr('stroke-width', yScale.bandwidth() / 2)
      .attr('stroke', '#aaa');
    yAxisG.select('.domain').remove();
    yAxisG.selectAll('.tick text').attr('dx', 15)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'start')

    const score_required = svg
      .selectAll('.score_required')
      .data(dataS)
      .join(
        enter => enter.append('rect')
        .attr('class', 'score_required')
        .attr('rx', 10)
        .attr('fill', '#589dcd')
        .style('cursor', 'pointer')
        .attr('x', function(d) {
          if (d.start > 36) {
            return xScale(d.start / 800);
          } else {
            return xScale(d.start / 36);
          }
        })
        .attr('y', d => yScale(d.name))
        .attr('height', yScale.bandwidth())
        .attr('width', 0)
        .on('click', clicked),
        update => update,
        exit => exit.remove()
      )
      .transition().duration(500)
      .attr('x', function(d) {
        if (d.start > 36) {
          return xScale(d.start / 800);
        } else {
          return xScale(d.start / 36);
        }
      })
      .attr('y', d => yScale(d.name))
      .attr('height', yScale.bandwidth())
      .attr('width', function(d) {
        if (d.end > 36) {
          return xScale(d.end / 800) - xScale(d.start / 800);
        } else {
          return xScale(d.end / 36) - xScale(d.start / 36);
        }
      })


    const score_labels = svg.selectAll('.score-labels')
      .data(dataS)
      .join(
        enter => enter.append('text')
        .attr('class', 'score-labels')
        .attr('font-size', '12px')
        .attr('fill', 'white')
        .attr('pointer-events', 'none')
        .attr('text-anchor', function(d) {
          const scoreT = d.end > 36 ? 800 : 36;
          if ((d.end - d.start) / scoreT <= 0.04 && d.end / scoreT >= 0.96) {
            return 'end'
          } else {
            return 'middle'
          }
        })
        .attr('dx', function(d) {
          const scoreT = d.end > 36 ? 800 : 36;
          if ((d.end - d.start) / scoreT <= 0.04 && d.end / scoreT >= 0.96) {
            return (xScale(d.end / scoreT) - xScale(d.start / scoreT)) / 2
          } else {
            return 0
          }
        })
        .attr('x', function(d) {
          if (d.end > 36) {
            return (xScale(d.start / 800) + xScale(d.end / 800)) / 2;
          } else {
            return (xScale(d.start / 36) + xScale(d.end / 36)) / 2;
          }
        })
        .attr('y', d => yScale(d.name) + yScale.step() / 2),
        update => update,
        exit => exit.remove()
      )
      .transition().duration(500)
      .text(d => d.start + '-' + d.end)
      .attr('text-anchor', function(d) {
        const scoreT = d.end > 36 ? 800 : 36;
        if ((d.end - d.start) / scoreT <= 0.04 && d.end / scoreT >= 0.96) {
          return 'end'
        } else {
          return 'middle'
        }
      })
      .attr('dx', function(d) {
        const scoreT = d.end > 36 ? 800 : 36;
        if ((d.end - d.start) / scoreT <= 0.04 && d.end / scoreT >= 0.96) {
          return (xScale(d.end / scoreT) - xScale(d.start / scoreT)) / 2
        } else {
          return 0
        }
      })
      .attr('x', function(d) {
        if (d.end > 36) {
          return (xScale(d.start / 800) + xScale(d.end / 800)) / 2;
        } else {
          return (xScale(d.start / 36) + xScale(d.end / 36)) / 2;
        }
      })
      .attr('y', d => yScale(d.name) + yScale.step() / 2)

    const score_per = svg.selectAll('.score_per_bra')
      .data(dataP)
      .join('path')
      .attr('class', 'score_per_bra')
      .attr('fill', 'none')
      .attr('stroke', '#d0d0d0')
      .attr('d', function(d) {
        const ys = yScale.domain().filter(dd => dd.indexOf(d.name) > -1)
        let ysArray = [];
        ys.forEach(dd => ysArray = ysArray.concat(yScale(dd)))
        return ys.length <= 1 ? null : `M ${margin.left} ${d3.min(ysArray)+yScale.bandwidth()/4} h -${(margin.left-margin.left2)/2+5} v ${(d3.max(ysArray)-d3.min(ysArray)+yScale.bandwidth()/2-margin.left+margin.left2)/2-3} M ${margin.left} ${d3.max(ysArray)+3*yScale.bandwidth()/4} h -${(margin.left-margin.left2)/2+5} v -${(d3.max(ysArray)-d3.min(ysArray)+yScale.bandwidth()/2-margin.left+margin.left2)/2-3}`
      })

    const pie = d3.pie()
      .sort(null)
      .value(d => d.per)
    const arc = d3.arc()
      .innerRadius((margin.left - margin.left2) / 2 - 10)
      .outerRadius((margin.left - margin.left2) / 2)
    const score_pie_g = svg.selectAll('.score_pie')
      .data(dataP)
      .join('g')
      .attr('class', 'score_pie')
      .attr('text-anchor', 'middle')
      .attr('pointer-events','bounding-box')
      .attr('transform', function(d) {
        const ys = yScale.domain().filter(dd => dd.indexOf(d.name) > -1)
        let ysArray = [];
        ys.forEach(dd => ysArray = ysArray.concat(yScale(dd)))
        return `translate(${(margin.left+margin.left2)/2-5},${(d3.min(ysArray)+d3.max(ysArray)+yScale.bandwidth())/2})`
      })
    score_pie_g.selectAll('title')
    	.data(d=>[d])
      .join('title')
      .text(d => '录取学生中' + d.name + '成绩提交比例为' + d.per + '%')
    score_pie_g.selectAll('path')
      .data(function(d) {
        let ds = []
        ds.push({
          name: d.name,
          per: +d.per
        })
        ds.push({
          name: d.name + '2',
          per: (100 - d.per)
        })
        return pie(ds);
      })
      .join('path')
      .attr('fill', (d, i) => i == 0 ? '#589dcd' : '#d0d0d0')
      .attr('d', arc)
    score_pie_g.selectAll('text')
      .data(d => [d])
      .join('text')
      .attr('dominant-baseline', 'middle')
      .text(d => d.per + '%')
      .attr('class', 'test')
  }

  function clicked(event, dd) {
    let data2 = [];
    for (const year in data) {
      const start = data[year].score.filter(d => d.name == dd.name)[0].start
      const end = data[year].score.filter(d => d.name == dd.name)[0].end
      if (start > 0 && end > 0) {
        data2.push({
          'year': year,
          'start': start,
          'end': end
        })
      }
    }
    const margin2 = {
      left: 30,
      right: 15,
      top: 30,
      bottom: 30
    }
    const g2 = svg.append('g').attr('class', 'score_trends')
    g2.append('rect').attr('x', 3)
      .attr('y', margin.top / 2)
      .attr('width', width - margin.left2 / 2 - margin.right / 2)
      .attr('height', 0)
      .attr('opacity', 0.5)
      .on('click', trends_close)
      .transition().duration(500)
      .attr('height', height - margin.top / 2)

    g2.append('rect')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('width', 0)
      .attr('height', 0)
      .transition().duration(500).delay(500)
      .attr('x', width / 6)
      .attr('y', height / 6)
      .attr('width', width * 2 / 3)
      .attr('height', height * 2 / 3)
      .attr('fill', 'white')
    const g3 = g2.append('g').attr('display', 'none')
    setTimeout(function() {
      g3.attr('display', null)
    }, 1000)
    const x = d3.scaleLinear()
      .domain(d3.extent(data2, d => d.year))
      .range([width / 6 + margin2.left, width * 5 / 6 - margin2.right])
    const y = d3.scaleLinear()
      .domain([d3.min(data2, d => d.start) * 0.9, d3.max(data2, d => d.end) * 1.1])
      .range([height * 5 / 6 - margin2.bottom, height / 6 + margin2.top])
    const xAxis = g3.append('g').call(
        d3.axisBottom(x).ticks(d3.min([6, data2.length - 1])).tickFormat(d3.format('')).tickSize(-height * 2 / 3 + margin2.top + margin2.bottom)
      )
      .attr('transform', `translate(${0},${height*5/6-margin2.bottom})`)
    const yAxis = g3.append('g').call(d3.axisLeft(y).ticks(6).tickSize(-width * 2 / 3 + margin2.left + margin2.right))
      .attr('transform', `translate(${width/6+margin2.left},${0})`)
    g3.selectAll('.domain').remove()
    const area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(d => x(d.year))
      .y0(d => y(d.start))
      .y1(d => y(d.end))(data2)
    g3.append('g')
      .append('path')
      .attr('d', area)
      .attr('fill', 'steelblue')
      .attr('opacity', 0.8)
    g3.append('text')
      .attr('transform', `translate(${width/6+margin2.left},${height/6+margin.top+15})`)
      .text(dd.name)
    g3.append('text')
      .attr('transform', `translate(${width*5/6-margin2.right-20},${height/6+margin.top+20})`)
      .text('X')
      .attr('font-size', 20)
      .attr('cursor', 'pointer')
      .on('click', trends_close)
  }

  function trends_close() {
    svg.select('.score_trends').remove();
  }
})
