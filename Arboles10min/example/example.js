(function() {
  
var width = 420,
    barHeight = 20;

var x = d3.scale.linear()
    .range([0, width]);

var chart = d3.select("#vis")
    .attr("width", width);

d3.tsv("arboles-y-familias.csv", type, function(error, data) {
  x.domain([0, d3.max(data, function(d) { return d.cant; })]);

  chart.attr("height", barHeight * data.length);

  var bar = chart.selectAll("g")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

  bar.append("rect")
      .attr("width", function(d) { return x(d.cant); })
      .attr("height", barHeight - 1);

  bar.append("text")
      .attr("x", function(d) { return x(d.cant) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d) { return d.cant; });
});

function type(d) {
  d.cant = +d.cant; // coerce to number
  return d;
}

}());