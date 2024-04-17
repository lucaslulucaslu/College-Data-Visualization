const student_comp_canvas_width = document.getElementById('student_comp_canvas').clientWidth;
d3.select('#student_comp_canvas').style('height', student_comp_canvas_width * 4 / 9 + 'px');

const width = 900;
const height = 400;
const transitionDuration = 500;
const radius = height/2-25;
const radius2 = height /3-25;
const marginX = 80;
const marginY = height / 2 - radius;
const pie_sep = width / 2;
var student_comp_tooltip = d3.select('#student_comp_canvas')
  .append('div').attr('class', 'studentCompTooltip');

const svg = d3.select('#student_comp_canvas').append('svg')
  .attr('viewBox', [-radius - marginX, -radius - marginY, width, height]);
svg.append('rect').attr('height', '100%').attr('width', '100%')
  .attr('transform',`translate(${-radius - marginX},${-radius - marginY})`)
    .attr('fill', 'url(#watermark)').attr('opacity', 0.03)
const g = svg.append("g");
const g2 = svg.append("g")
  .attr('transform', `translate(${pie_sep},0)`);
const line1 = svg.append('line').attr('stroke', '#b6b6b6').attr('stroke-dasharray', '2 2'),
  line2 = svg.append('line').attr('stroke', '#b6b6b6').attr('stroke-dasharray', '2 2');
const pie = d3.pie()
  .sort(null)
  .value(d => d.value);
d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/student_comp_20240118.php?name=9228&v=jsfiddle').then(data => {
  const converArray = {
    'uf': '本科新生',
    'uj': '本科老生',
    'ut': '本科转学',
    'gr': '研究生',
    'nd': '无学位',
    'wh': '白人',
    'as': '亚裔',
    'la': '拉丁裔',
    'pa': '太平洋岛民及其他',
    'af': '非裔',
    'nr': '留学生'
  };
  const total = d3.sum(data, function(d) {
    return d.value;
  })
  data.forEach(function(d) {
    d.name = converArray[d.name];
    d.percentage = Math.round(d.value / total * 10000) / 100;
    const total2 = d3.sum(d.subs, function(dd) {
      return dd.value;
    })
    d.subs.forEach(function(dd) {
    	dd.top=d.name;
      dd.name = converArray[dd.name];
      dd.percentage = Math.round(dd.value / total2 * 10000) / 100;
    })
  })
  svg.append('text')
  .attr('text-anchor','middle')
  .attr('font-size','2em')
  .attr('dominant-baseline','middle')
  .text(data[0].year+'年')
  const arc = d3.arc()
    .innerRadius(radius / 2)
    .outerRadius(radius - 1)
  const selected_offset = 10
  const arc_selected = d3.arc()
    .innerRadius(radius / 2 + selected_offset)
    .outerRadius(radius - 1 + selected_offset)
    .padAngle(0.01)

  const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius);
  const arcs = pie(data);

  g.attr("stroke", "white")
    .selectAll(".path")
    .data(arcs)
    .join("path")
    .attr('class', 'path')
    .attr("fill", d => d.data.color)
    .attr("d", arc)
    .on('click', clicked)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', function() {
      student_comp_tooltip.style('display', 'none');
    });

  const text = g.append("g")
    .attr("font-size", '1.2em')
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(arcs)
    .join("text");

  text.attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.05).append("tspan")
      .attr('stroke', 'none')
      .attr('y', '0.2em')
      .attr('pointer-events', 'none')
      .text(d => d.data.name));

  function clicked(event, d) {
    g.selectAll('.path').filter(dd => dd.data.name != d.data.name)
      .attr('d', arc)
    g.selectAll('.path').filter(dd => dd.data.name == d.data.name)
      .attr('d', arc_selected)
    var rotate = 90 - ((d.startAngle + d.endAngle) / 2 * 180) / Math.PI;
    g.transition().duration(transitionDuration)
      .attr('transform', `rotate(${rotate})`);
    text.filter(dd => dd.data.name != d.data.name)
      .transition().duration(transitionDuration)
      .attr('transform', function(dd) {
        const width = this.getBBox().width / 2;
        const height = this.getBBox().height / 2;
        const theta = (dd.startAngle + dd.endAngle) / 2;
        return `translate(${arcLabel.centroid(dd)[0]},${arcLabel.centroid(dd)[1]})` + ` rotate(${-rotate})` + ` translate(${width*Math.sin(theta+rotate*Math.PI/180)},${-height*Math.cos(theta+rotate*Math.PI/180)})`;
      });
    text.filter(dd => dd.data.name == d.data.name)
      .transition().duration(transitionDuration)
      .attr('transform', function(dd) {
        const width = this.getBBox().width / 2;
        const height = this.getBBox().height / 2;
        const theta = (dd.startAngle + dd.endAngle) / 2;
        return `translate(${arcLabel.centroid(dd)[0]},${arcLabel.centroid(dd)[1]})` + ` rotate(${-rotate})` + ` translate(${width*Math.sin(theta+rotate*Math.PI/180)},${-height*Math.cos(theta+rotate*Math.PI/180)})` + ` translate(${selected_offset},0)`;
      });
    let startAng = d.startAngle + rotate * Math.PI / 180;
    let endAng = d.endAngle + rotate * Math.PI / 180;
    if (Math.abs(startAng - endAng) > Math.PI * 0.999) {
      startAng = 0;
      endAng = Math.PI;
    }
    line2.transition().duration(transitionDuration)
      .attr('x1', (radius + selected_offset) * Math.sin(startAng + 0.005))
      .attr('y1', (radius + selected_offset) * Math.cos(startAng + 0.005));
    line1.transition().duration(transitionDuration)
      .attr('x1', (radius + selected_offset) * Math.sin(endAng - 0.005))
      .attr('y1', (radius + selected_offset) * Math.cos(endAng - 0.005));
    draw_second_pie(d.data.subs);
  }
  clicked(null, arcs[0]);
  draw_second_pie(data[0].subs);
  line1.attr('x1', radius * Math.sin(arcs[0].startAngle))
    .attr('y1', -radius * Math.cos(arcs[0].startAngle))
    .attr('x2', pie_sep)
    .attr('y2', -radius2);

  line2.attr('x1', radius * Math.sin(arcs[0].endAngle))
    .attr('y1', -radius * Math.cos(arcs[0].endAngle))
    .attr('x2', pie_sep)
    .attr('y2', radius2);
  //.attr('transform',`translate()`);
})

function draw_second_pie(data2) {
  const arc2 = d3.arc()
    .innerRadius(0)
    .outerRadius(radius2 - 1)
  const arcs2 = pie(data2);


  const pieChart2 = g2.attr("stroke", "white")
    .selectAll(".path2")
    .data(arcs2);
  pieChart2
    .enter().append('path')
    .attr('class', 'path2')
    .attr("fill", d => d.data.color)
    .attr("d", arc2)
    .each(function(d) {
      this._current = d;
    })
    .merge(pieChart2)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', function() {
      student_comp_tooltip.style('display', 'none');
    })
    .transition().duration(transitionDuration)
    .attrTween("d", arcTween);

  function arcTween(a) {
    let i = d3.interpolate(this._current, a);
    this._current = a;
    return function(t) {
      return arc2(i(t));
    };
  }
}

function mouseover(event, d) {
  student_comp_tooltip.style('display', 'block')
    .style('background-color', d.data.color)
    .html((d.data.top?d.data.top+"中：<br>":"")+d.data.name + d.data.value + "人，占比" + d.data.percentage + "%<br>其中男生" + d.data.ratioM + "%，女生" + d.data.ratioW + "%");
  if (d.data.name == '白人') {
    student_comp_tooltip.style('color', 'black')
  } else {
    student_comp_tooltip.style('color', 'white')
  }
}

function mousemove(event, d) {
  let tooltipX = width / 2;
  if (event.layerX > width / 2) {
    tooltipX = event.layerX - student_comp_tooltip.node().clientWidth - 10;
  } else {
    tooltipX = event.layerX + 10;
  }
  student_comp_tooltip.style('top', (event.layerY + 10) + 'px')
    .style('left', tooltipX + 'px');
}
