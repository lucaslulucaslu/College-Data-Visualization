d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/degree_all_20230920.php?name=9228&v=jsfiddle').then(data => {
  const width = document.getElementById('major_canvas').clientWidth < 600 ? 430 : 750,
    height = 400,
    format = d3.format(",d")
  const treemap = (data, selected) => d3.treemap()
    .tile(tile)
    (d3.hierarchy(data)
      .sum(d => d[selected])
      .sort((a, b) => b[selected] - a[selected]))
  const color = d3.scaleOrdinal(d3.schemeTableau10)
  const color2 = d3.scaleOrdinal()
    .domain(['White', 'Asian', 'Latino', 'Pacific and others', 'African', 'International'])
    .range(['#f1e2c8', '#cfb5a0', '#955b45', '#714341', '#3b2d34', '#77bd98']);
  const color_mw = d3.scaleOrdinal()
    .domain(['Men', 'Women'])
    .range(['#589dcd', '#f78085']);
  const levelArray = {
    'all': 'count',
    'associate': 'count0',
    'under': 'count1',
    'master': 'count2',
    'doctor': 'count3'
  }
  const levelNameArray = {
    'all': '',
    'associate': 'Associate',
    'under': 'Under',
    'master': 'Master',
    'doctor': 'Doctor'
  }
  const name = d => d.ancestors().reverse().map(d => d.data.ename).join("/")
  const x = d3.scaleLinear().rangeRound([0, width]);
  const y = d3.scaleLinear().rangeRound([0, height]);
  const svg = d3.select('#major_canvas').append('svg')
    .attr('viewBox', [0.5, -25.5, width, height + 25])
  const g = svg.append('g')
  const g_tooltip = svg.append('g')
    .attr('display', 'none')
    .attr('pointer-events', 'none')
  const tooltipRect = g_tooltip.append('rect')
    .attr('rx', 8)
    .attr('stroke', 'white').attr('stroke-width', 2)
  const tooltipText = g_tooltip.append('text')
    .attr('fill', 'white')
    .attr('font-size', '0.8em')
  let group = g.append("g")
  d3.selectAll('#major_switchButton input').on('click', function() {
    x.domain([0, 1]);
    y.domain([0, 1]);
    render(group, treemap(data, levelArray[d3.select(this).attr('class')]), d3.select('#major_displayType label.active input').attr('class'))
  })
  d3.selectAll('#major_displayType input').on('click', function() {
    if (d3.select(this).attr('class') == 'allMajors') {
      d3.select('#major_displayType_text').text('*All majors')
    } else {
      d3.select('#major_displayType_text').text('*Click any group block to show next level')
    }
    x.domain([0, 1]);
    y.domain([0, 1]);
    render(group, treemap(data, levelArray[d3.select('#major_switchButton label.active input').attr('class')]), d3.select(this).attr('class'))
  })
  if (!data.flags.flag0) {
    d3.select('#major_switchButton label.associateLabel').remove()
  }
  if (!data.flags.flag1) {
    d3.select('#major_switchButton label.underLabel').remove()
  }
  if (!data.flags.flag2) {
    d3.select('#major_switchButton label.masterLabel').remove()
  }
  if (!data.flags.flag3) {
    d3.select('#major_switchButton label.doctorLabel').remove()
  }

  render(group, treemap(data, 'count'), 'clickMajors')

  function render(group, root, type) {
    let displayData = [];
    if (type == 'allMajors') {
      root.each(d => d.depth == 2 ? displayData.push(d) : null)
      displayData.push(root)
    } else {
      displayData = root.children.concat(root);
    }
    const node = group
      .selectAll("g")
      .data(displayData, d => d.data.ename + d.depth)
      .join(
        function(enter) {
          enter = enter.append('g')
            .attr("transform", d => d === root ? `translate(0,-25)` : `translate(${x(d.x0)},${y(d.y0)})`)
          if (type == 'clickMajors') {
            enter.filter(d => d === root ? d.parent : d.children)
              .attr("cursor", "pointer")
              .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d))
          }
          enter.append("rect")
            .attr("fill", function(d) {
              if (d === root) {
                return '#f0f0f0';
              } else if (d.depth == 3) {
                return color2(d.data.ename)
              } else if (d.depth == 4) {
                return color_mw(d.data.ename)
              } else {
                while (d.depth > 1) {
                  d = d.parent
                }
                return color(d.data.ename);
              }
            })
            .attr("stroke", "#fff")
            .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
            .attr("height", d => d === root ? 25 : y(d.y1) - y(d.y0))
            .filter(d => d !== root)
            .on('mouseover', function(event, d) {
              d3.select(this).attr("fill", function(d) {
                if (d.depth == 3) {
                  return d3.color(color2(d.data.ename)).darker(0.3)
                } else if (d.depth == 4) {
                  return d3.color(color_mw(d.data.ename)).darker(0.3)
                } else {
                  while (d.depth > 1) {
                    d = d.parent
                  }
                  return d3.color(color(d.data.ename)).darker(0.3);
                }
              })
              mouseover();
              mousemove(event, d);
            })
            .on('mouseout', function(event, d) {
              d3.select(this).attr("fill", function(d) {
                if (d.depth == 3) {
                  return color2(d.data.ename)
                } else if (d.depth == 4) {
                  return color_mw(d.data.ename)
                } else {
                  while (d.depth > 1) {
                    d = d.parent
                  }
                  return color(d.data.ename)
                }
              })
              mouseout();
            })
            .on('mousemove', mousemove)

          enter.filter(d => d.depth === 1)
            .append('image')
            .attr('class', 'classLogo')
            .attr('xlink:href', d => 'https://static.forwardpathway.com/logos/hotlink-ok/degreelogo/' + d.data.name + '-min.png')
            .attr('width', d => logoSize(d, root).size)
            .attr('height', d => logoSize(d, root).size)
            .attr('transform', d => `translate(${logoSize(d,root).xOffset},${logoSize(d,root).yOffset})`)
            .attr('pointer-events', 'none')
            .attr('opacity', 0.1)
          enter.filter(d => d === root || d.depth > 1)
            .append('text').attr('class', 'className')
            .attr('pointer-events', 'none')
            .attr('font-size', d => d.depth == 2 && type == 'allMajors' ? '0.6em' : '0.8em')
            .attr('text-anchor', d => d === root ? null : 'middle')
            .attr('fill', d => d === root ? '#000' : '#fff')
            .attr('x', d => (d === root ? 10 : x(d.x1) - x(d.x0)) / 2)
            .attr('y', d => (d === root ? 35 : y(d.y1) - y(d.y0)) / 2)
            .text(d => d === root ? d.data.ename + ' ' + data.year + ' graduates' : labelText(d, type))

          enter.filter(d => d.depth > 1)
            .append('text').attr('class', 'classValue')
            .attr('pointer-events', 'none')
            .attr('font-size', d => d.depth == 2 && type == 'allMajors' ? '0.6em' : '0.8em')
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .attr('x', d => (d === root ? 10 : x(d.x1) - x(d.x0)) / 2)
            .attr('y', d => (d === root ? 35 : y(d.y1) - y(d.y0)) / 2 + 15)
            .text(d => d === root || (x(d.x1) - x(d.x0)) < 20 || (y(d.y1) - y(d.y0)) < 30 ? null : d.value)
          return enter;
        },
        function(update) {
          update.transition().duration(500)
            .attr("transform", d => d === root ? `translate(0,-25)` : `translate(${x(d.x0)},${y(d.y0)})`)
          update.select("rect")
            .attr("fill", function(d) {
              if (d == root) {
                return '#f0f0f0';
              } else if (d.depth == 3) {
                return color2(d.data.ename)
              } else if (d.depth == 4) {
                return color_mw(d.data.ename)
              } else {
                while (d.depth > 1) {
                  d = d.parent
                }
                return color(d.data.ename);
              }
            })
            .transition().duration(500)
            .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
            .attr("height", d => d === root ? 25 : y(d.y1) - y(d.y0));
          update.select('.classLogo')
            .transition().duration(500)
            .attr('width', d => logoSize(d, root).size)
            .attr('height', d => logoSize(d, root).size)
            .attr('transform', d => `translate(${logoSize(d,root).xOffset},${logoSize(d,root).yOffset})`)
          update.select('.className')
            .attr('text-anchor', d => d === root ? null : 'middle')
            .attr('font-size', d => d.depth == 2 && type == 'allMajors' ? '0.6em' : '0.8em')
            .text(d => d === root ? d.data.ename + data.year + ' graduates' : labelText(d, type))
            .attr('fill', d => d === root ? '#000' : '#fff')
            .transition().duration(500)
            .attr('x', d => (d === root ? 10 : x(d.x1) - x(d.x0)) / 2)
            .attr('y', d => (d === root ? 35 : y(d.y1) - y(d.y0)) / 2)
          update.select('.classValue')
            .text(d => d === root || (x(d.x1) - x(d.x0)) < 20 || (y(d.y1) - y(d.y0)) < 30 ? null : d.value)
            .attr('font-size', d => d.depth == 2 && type == 'allMajors' ? '0.6em' : '0.8em')
            .transition().duration(500)
            .attr('x', d => (d === root ? 10 : x(d.x1) - x(d.x0)) / 2)
            .attr('y', d => (d === root ? 35 : y(d.y1) - y(d.y0)) / 2 + 15)

          return update;
        },
        remove => remove.remove()
      );
  }

  function labelText(d, type) {
    const nodeWidth = x(d.x1) - x(d.x0),
      nodeHeight = y(d.y1) - y(d.y0),
      k = (type == 'allMajors' ? 12 : 20)
    const maxLength = Math.floor(nodeWidth / k)
    if (nodeHeight > 20 && maxLength > 0) {
      return d.data.ename.length > maxLength ? (d.data.ename.slice(0, maxLength) + '...') : d.data.ename
    } else {
      return null;
    }

  }

  function tile(node, x0, y0, x1, y1) {
    d3.treemapBinary(node, 0, 0, width, height);
    for (const child of node.children) {
      child.x0 = x0 + child.x0 / width * (x1 - x0);
      child.x1 = x0 + child.x1 / width * (x1 - x0);
      child.y0 = y0 + child.y0 / height * (y1 - y0);
      child.y1 = y0 + child.y1 / height * (y1 - y0);
    }
  }

  function position(group, root) {
    group.selectAll("g")
      .attr("transform", d => d === root ? `translate(0,-25)` : `translate(${x(d.x0)},${y(d.y0)})`)
      .select("rect")
      .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
      .attr("height", d => d === root ? 25 : y(d.y1) - y(d.y0));
    group.selectAll('.classLogo')
      .attr('width', d => logoSize(d, root).size)
      .attr('height', d => logoSize(d, root).size)
      .attr('transform', d => `translate(${logoSize(d,root).xOffset},${logoSize(d,root).yOffset})`)
    group.selectAll('.className')
      .attr('x', d => (d === root ? 10 : x(d.x1) - x(d.x0)) / 2)
      .attr('y', d => (d === root ? 35 : y(d.y1) - y(d.y0)) / 2)
      .text(function(d) {
        if (d.depth === 0) {
          return d.data.ename + data.year + ' graduates'
        } else {
          return d === root ? d.ancestors().reverse().map(d => d.data.ename).join("≫") : labelText(d, null)
        }
      })
    group.selectAll('.classValue')
      .attr('x', d => (d === root ? 10 : x(d.x1) - x(d.x0)) / 2)
      .attr('y', d => (d === root ? 35 : y(d.y1) - y(d.y0)) / 2 + 15)
      .text(d => d === root || (x(d.x1) - x(d.x0)) < 20 || (y(d.y1) - y(d.y0)) < 30 ? null : d.value + '人')
  }

  function logoSize(d, root) {
    let size, xOffset, yOffset;
    if (d === root) {
      size = Math.min(x(d.x1) - x(d.x0), y(d.y1) - y(d.y0)) * 0.9;
      xOffset = (x(d.x1) + x(d.x0) - size) / 2;
      yOffset = (y(d.y1) + y(d.y0) - size) / 2 + 25;
    } else {
      size = Math.min(x(d.x1) - x(d.x0), y(d.y1) - y(d.y0)) * 0.9;
      xOffset = (x(d.x1) - x(d.x0) - size) / 2;
      yOffset = (y(d.y1) - y(d.y0) - size) / 2;
    }
    return {
      size: size,
      xOffset: xOffset,
      yOffset: yOffset
    };
  }

  function zoomin(d) {
    g_tooltip.attr('display', 'none')
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = g.append("g").call(render, d, 'clickMajors');
    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);
    g.transition()
      .duration(500)
      .call(t => group0.transition(t)
        .call(position, d.parent).remove())
      .call(t => group1.transition(t)
        .attrTween("opacity", () => d3.interpolate(0, 1))
        .call(position, d));
    group1.append('text').attr('text-anchor', 'end')
      .attr('font-size', '0.8em')
      .attr('x', width - 10)
      .attr('y', -7)
      .attr('pointer-events', 'none')
      .text('click to go back')
  }

  function zoomout(d) {
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = g.insert("g", 'g').call(render, d.parent, 'clickMajors');
    x.domain([d.parent.x0, d.parent.x1]);
    y.domain([d.parent.y0, d.parent.y1]);
    g.transition()
      .duration(500)
      .call(t => group0.transition(t)
        .attrTween("opacity", () => d3.interpolate(1, 0))
        .call(position, d).remove())
      .call(t => group1.transition(t)
        .call(position, d.parent));
    if (d.depth > 1) {
      group1.append('text').attr('text-anchor', 'end')
        .attr('font-size', '0.8em')
        .attr('x', width - 10)
        .attr('y', -7)
        .attr('pointer-events', 'none')
        .text('click to go back')
    }
  }

  function mouseover() {
    g_tooltip.attr('display', null)
  }

  function mouseout() {
    g_tooltip.attr('display', 'none')
  }

  function mousemove(event, d) {
    const levelName = levelNameArray[d3.selectAll('#major_switchButton label.active input').attr('class')]
    const mouse = d3.pointer(event, svg.node())
    let selectedData, selectedLevel, tooltipX, tooltipY
    if (d.depth == 1) {
      tooltipText.text(data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'bold')
        .text(d.data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em')
        .text(d.data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'normal')
        .text(data.year + ' graduates: ' + levelName + d.value + '（' + d3.format('.2%')(d.value / d.parent.value) + '）')
        .append('tspan').attr('x', 0).attr('dy', '1.3em')
        .text('click for next level')
    } else if (d.depth == 2) {
      const type = d3.select('#major_displayType label.active input').attr('class')
      tooltipText.text(d.parent.data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'bold')
        .text(d.data.ename + ' major')
        .append('tspan').attr('x', 0).attr('dy', '1.3em')
        .text(d.data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'normal')
        .text(data.year + ' graduates: ' + levelName + d.value + '（' + d3.format('.2%')(d.value / (type == 'clickMajors' ? d.parent.value : d.parent.parent.value)) + '）')
      if (type == 'clickMajors') {
        tooltipText.append('tspan').attr('x', 0).attr('dy', '1.3em')
          .text('click for next level')
      }
    } else if (d.depth == 3) {
      tooltipText.text(d.parent.data.ename + ' major')
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'bold')
        .text(d.data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em')
        .text(d.data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'normal')
        .text(data.year + ' graduates: ' + levelName + d.value + '（' + d3.format('.2%')(d.value / d.parent.value) + '）')
        .append('tspan').attr('x', 0).attr('dy', '1.3em')
        .text('click for M/W ratio')
    } else if (d.depth == 4) {
      tooltipText.text(d.parent.parent.data.ename + ' major')
        .append('tspan').attr('x', 0).attr('dy', '1.3em')
        .text(d.parent.data.ename)
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'bold')
        .text(d.data.ename + ' (' + d.data.ename + ')')
        .append('tspan').attr('x', 0).attr('dy', '1.3em').attr('font-weight', 'normal')
        .text(data.year + ' graduates: ' + levelName + d.value + '人（' + d3.format('.2%')(d.value / d.parent.value) + '）')
    }
    const tooltipBox = tooltipText.node().getBBox();
    tooltipRect.attr('x', tooltipBox.x - 10)
      .attr('y', tooltipBox.y - 5)
      .attr('width', tooltipBox.width + 20)
      .attr('height', tooltipBox.height + 10)
      .attr("fill", function(dd = d) {
        if (dd.depth == 3) {
          return d3.color(color2(dd.data.ename)).darker()
        } else if (dd.depth == 4) {
          return d3.color(color_mw(dd.data.ename)).darker()
        } else {
          while (dd.depth > 1) {
            dd = dd.parent
          }
          return d3.color(color(dd.data.ename)).darker();
        }
      })
    if (mouse[0] + tooltipBox.width + 20 > width) {
      tooltipX = mouse[0] - tooltipBox.width - 20
    } else {
      tooltipX = mouse[0] + 25
    }
    if (mouse[1] + tooltipBox.height + 20 > height) {
      tooltipY = mouse[1] - tooltipBox.height + 20
    } else {
      tooltipY = mouse[1] + 30
    }
    g_tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`)
  }
});
