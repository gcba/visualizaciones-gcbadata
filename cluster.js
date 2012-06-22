// Basado en ejemplos provistos por Mike Bostock, d3.js.


// Valor para determinar el radio.

var radius = 800/2;

// Valores para determinar el radio del hub.

var cluster = d3.layout.cluster()
    .size([360, radius - 50]);

// Valores ubicar .

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var vis = d3.select("#chart").append("svg")
    .attr("width", radius * 2+200)
    .attr("height", radius * 2+200)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");


function color(d) {
  return d._children ? "#FF0000" : d.children ? "#FF0000" : "#FFFF00";
}


d3.json("ciudad-emergente.json", function(json) {

  var nodes = cluster.nodes(json);

  var link = vis.selectAll("path.link")
      .data(cluster.links(nodes))
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = vis.selectAll("g.node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

  node.append("circle")
      .attr("r", 6)
            .style("fill", color);
           

  node.append("text")
      .attr("dx", function(d) { return d.x < 180 ? 10 : -10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.name; });
});
