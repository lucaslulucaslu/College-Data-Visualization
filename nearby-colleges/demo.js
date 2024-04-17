const map_canvas_width = document.getElementById('map-canvas').clientWidth;
d3.select('#map-canvas').style('height', map_canvas_width * 610 / 975 + 'px');


const epsilon = 1e-6;

function geoAlbersUsaPr() {
  var cache,
    cacheStream,
    lower48 = d3.geoAlbers(),
    lower48Point,
    alaska = d3.geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]),
    alaskaPoint,
    hawaii = d3.geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]),
    hawaiiPoint,
    puertoRico = d3.geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]),
    puertoRicoPoint,
    point,
    pointStream = {
      point: function(x, y) {
        point = [x, y];
      }
    };

  function albersUsa(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return point = null,
      (lower48Point.point(x, y), point) ||
      (alaskaPoint.point(x, y), point) ||
      (hawaiiPoint.point(x, y), point) ||
      (puertoRicoPoint.point(x, y), point);
  }

  albersUsa.invert = function(coordinates) {
    var k = lower48.scale(),
      t = lower48.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;
    return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska :
      y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii :
      y >= 0.204 && y < 0.234 && x >= 0.320 && x < 0.380 ? puertoRico :
      lower48).invert(coordinates);
  };

  albersUsa.stream = function(stream) {
    return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream), puertoRico.stream(stream)]);
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_), alaska.precision(_), hawaii.precision(_), puertoRico.precision(_);
    return reset();
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_), puertoRico.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(),
      x = +_[0],
      y = +_[1];

    lower48Point = lower48
      .translate(_)
      .clipExtent([
        [x - 0.455 * k, y - 0.238 * k],
        [x + 0.455 * k, y + 0.238 * k]
      ])
      .stream(pointStream);

    alaskaPoint = alaska
      .translate([x - 0.307 * k, y + 0.201 * k])
      .clipExtent([
        [x - 0.425 * k + epsilon, y + 0.120 * k + epsilon],
        [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]
      ])
      .stream(pointStream);

    hawaiiPoint = hawaii
      .translate([x - 0.205 * k, y + 0.212 * k])
      .clipExtent([
        [x - 0.214 * k + epsilon, y + 0.166 * k + epsilon],
        [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]
      ])
      .stream(pointStream);

    puertoRicoPoint = puertoRico
      .translate([x + 0.350 * k, y + 0.224 * k])
      .clipExtent([
        [x + 0.320 * k, y + 0.204 * k],
        [x + 0.380 * k, y + 0.234 * k]
      ])
      .stream(pointStream);

    return reset();
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  return albersUsa.scale(1070);
}

function multiplex(streams) {
  const n = streams.length;
  return {
    point(x, y) {
      for (const s of streams) s.point(x, y);
    },
    sphere() {
      for (const s of streams) s.sphere();
    },
    lineStart() {
      for (const s of streams) s.lineStart();
    },
    lineEnd() {
      for (const s of streams) s.lineEnd();
    },
    polygonStart() {
      for (const s of streams) s.polygonStart();
    },
    polygonEnd() {
      for (const s of streams) s.polygonEnd();
    }
  };
}
const width = 975;
const height = 610;
const imageSize = 40;
const svg = d3.select('#map-canvas')
  .append("svg")
  .attr("viewBox", [0, 0, width, height]);
const goHomeButton = d3.select('#map-canvas').append('div')
  .html('<a style="color:white;" class="btn btn-secondary goHomeButton">Return</a><a style="margin-left:10px;color:white;" class="btn btn-secondary fullMapButton">Top300</a>')
  .style('position', 'absolute')
  .style('top', '10px')
  .style('left', '15px')
const g = svg.append("g");
const projection = geoAlbersUsaPr()
  .scale(1300)
  .translate([width / 2, height / 2]);
const path = d3.geoPath(projection);

const zoom = d3.zoom()
  .scaleExtent([1, 512])
  .on("zoom", zoomed);
const colors = {
  'null': '#f9949c',
  1: '#8dd9ef',
  2: '#8ef7ad'
};
let homeZoomLevel, homeZoomPoint;
let states, images3, ranking_year, schoolName;
let temp;


Promise.all([d3.json('https://www.forwardpathway.com/d3v7/maps/states-10m.php'), d3.json('https://www.forwardpathway.com/d3v7/dataphp/school_database/school_nearby_fpus_20210921.php?fpus=13188&v=jsfiddle')]).then(([us, data]) => {

  homeZoomPoint = [data.zoomPoint.longitude, data.zoomPoint.latitude];
  homeZoomLevel = data.zoomLevel;
  images3 = data.images3;
  ranking_year = data.ranking;
  schoolName = data.images[0].name;
  states = g.append("g")
    .attr("fill", "#b3d8f2")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .join("path")
    .on("click", clicked)
    .attr("d", path);
  states.append("title")
    .text(d => d.properties.name);
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

  g.append('g')
    .attr('class', 'school-lines')
    .attr('transform', `translate(${(imageSize/2)},${imageSize/2})`)
    .selectAll('.school-line')
    .data(data.lines).enter()
    .append('path')
    .attr('class', 'school-line')
    .attr('d', function(d) {
      let startPoint = projection([d[0].longitude, d[0].latitude]);
      let endPoint = projection([d[1].longitude, d[1].latitude]);
      //startPoint=[startPoint[0]+imageSize/2,startPoint[1]+imageSize/2];
      //endPoint=[endPoint[0]+imageSize/2,endPoint[1]+imageSize/2];
      return `M${startPoint} L${endPoint}`;
    })
    .attr('stroke', '#b5b5b5')
  //.attr('transform',`translate(${imageSize/2},${imageSize/2})`)


  g.selectAll('.school-nearby')
    .data(data.images2).enter()
    .append("a")
    .attr('xlink:href', d => 'https://www.forwardpathway.us/' + d.myurl)
    .append('image')
    .attr('class', 'school-nearby')
    .attr('width', imageSize)
    .attr('height', imageSize)
    .attr('xlink:href', d => 'https://www.forwardpathway.com/wp-content/uploads/logos/hotlink-ok/PNG50/' + d.imageURL + '.png')
    .attr('transform', d => `translate(${projection([d.longitude, d.latitude])})`)
    .on('mouseover', map_mouseover)
    .on('mouseout', map_mouseout);

  const school_canvas = g.selectAll('.school-canvas')
    .data(data.images).enter()
    .append('g')
    .attr('class', 'school-canvas')
    .attr('transform', d => `translate(${projection([d.longitude, d.latitude])})`);
  school_canvas.append('image')
    .attr('class', 'school')
    .attr('width', imageSize)
    .attr('height', imageSize)
    .attr('xlink:href', d => 'https://www.forwardpathway.com/wp-content/uploads/logos/hotlink-ok/PNG50/' + d.imageURL + '.png')
    .on('mouseover', map_mouseover)
    .on('mouseout', map_mouseout);
  school_canvas.append('text')
    .attr('class', 'school')
    .attr('x', imageSize / 2)
    .attr('y', -imageSize / 2 + 5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '1.2em')
    .text(d => d.name)
    .call(getTextBox);

  school_canvas.insert('rect', 'text')
    .attr('class', 'school')
    .attr("x", function(d) {
      return d.bbox.x - 10
    })
    .attr("y", function(d) {
      return d.bbox.y - 5
    })
    .attr("width", function(d) {
      return d.bbox.width + 20
    })
    .attr("height", function(d) {
      return d.bbox.height + 10
    })
    .style("fill", "red");

  function getTextBox(d) {
    d.each(function(d) {
      d.bbox = this.getBBox();
    });
  }

  svg.call(zoom);
  goHome();
  d3.select('.goHomeButton').on('click', goHome);
  d3.select('.fullMapButton').on('click', fullMap);

});

function map_mouseover(event, d) {
  const map_tooltip = svg.append('g')
    .attr('class', 'mapTooltip')
    .attr('font-size', '1.2em');
  const map_tooltip_canvas = map_tooltip.append('rect');
  const map_tooltip_text = map_tooltip.append('text');

  map_tooltip_text.attr('font-weight', 'bold').text(d.name)
  if (d.rank) {
    if (d.type == 1) {
      var rankString = ' USNews Best Colleges Ranking: '
    } else {
      var rankString = ' Liberal Arts Colleges Ranking: '
    }
    map_tooltip_text.append('tspan')
      .attr('x', 0).attr('dy', '1.2em')
      .attr('font-weight', 'normal')
      .text(ranking_year + rankString + d.rank)
  }
  if (d.d) {
    map_tooltip_text.append('tspan')
      .attr('x', 0).attr('dy', '1.2em')
      .attr('font-weight', 'normal')
      .text(d.d + ' miles away from ' + schoolName)
      .append('tspan').attr('x', 0).attr('dy', '1.2em').text('Click for more information');
  }

  const ratioX = svg.node().clientWidth / width;
  const ratioY = svg.node().clientHeight / height;
  const tooltipWidth = map_tooltip_text.node().getBBox().width;
  const tooltipHeight = map_tooltip_text.node().getBBox().height;
  map_tooltip_canvas
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .attr('x', map_tooltip_text.node().getBBox().x - 8)
    .attr('y', map_tooltip_text.node().getBBox().y - 8)
    .attr('width', tooltipWidth + 16)
    .attr('height', tooltipHeight + 16)
    .attr('fill', colors[d.type])

  let tooltipX, tooltipY;
  if (tooltipWidth + event.layerX / ratioX + 30 > width) {
    tooltipX = event.layerX / ratioX - tooltipWidth - 30;
  } else {
    tooltipX = event.layerX / ratioX + 30;
  }
  if (tooltipHeight + event.layerY / ratioY + 30 > height) {
    tooltipY = event.layerY / ratioY - tooltipHeight - 30
  } else {
    tooltipY = event.layerY / ratioY + 30;
  }
  map_tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`)
}

function map_mouseout() {
  svg.selectAll('.mapTooltip').remove();
}

function zoomed(event) {
  const {
    transform
  } = event;
  g.attr("transform", transform);
  g.attr("stroke-width", 1 / transform.k);
  g.selectAll('.school')
    .attr('transform', `scale(${1/transform.k})`)
  g.selectAll('.school-nearby')
    .attr('width', imageSize / transform.k)
    .attr('height', imageSize / transform.k);
  g.selectAll('.school-full-map')
    .attr('width', imageSize / transform.k)
    .attr('height', imageSize / transform.k);
  g.selectAll('.school-lines')
    .attr('transform', `translate(${(imageSize/2)/transform.k},${(imageSize/2)/transform.k})`)
  g.attr("stroke-width", 1 / transform.k);
}

function clicked(event, d) {
  const [
    [x0, y0],
    [x1, y1]
  ] = path.bounds(d);
  event.stopPropagation();
  states.transition().style("fill", null);
  d3.select(this).transition().style("fill", "#87c2eb");
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
    d3.pointer(event, svg.node())
  );
}

function goHome() {
  states.transition().style("fill", null);
  const point = projection(homeZoomPoint);
  const scale = homeZoomLevel;
  //scale=scale/2;
  return svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity
    .translate(width / 2 - point[0] * scale, height / 2 - point[1] * scale)
    .scale(scale)
  );
}

function fullMap() {
  g.selectAll('.school-full-map')
    .data(images3).enter()
    .append("a")
    .attr('xlink:href', d => 'https://www.forwardpathway.us/' + d.myurl)
    .append('image')
    .attr('class', 'school-full-map')
    .attr('width', imageSize)
    .attr('height', imageSize)
    .attr('xlink:href', d => 'https://www.forwardpathway.com/wp-content/uploads/logos/hotlink-ok/PNG50/' + d.imageURL + '.png')
    .attr('transform', d => `translate(${projection([d.longitude, d.latitude])})`)
    .on('mouseover', map_mouseover)
    .on('mouseout', map_mouseout);
  states.transition().style("fill", null);
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
  );
}
