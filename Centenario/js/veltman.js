

      // https://a.tiles.mapbox.com/v3/gcbadata.gdmoea7m/page.html?secure=1#13/-34.62063622492369/-58.449840545654304


      var width = 600, height = 540, chartHeight = 90, chartMargin = 5,
        layer = d3.select("div.layer").style("width",width+"px").style("height",height+"px"),
        chart = d3.select("div.chart").style("width",width+"px").attr("height",chartHeight+"px").append("svg").attr("width",width).attr("height",chartHeight),      
        map = d3.select("div.map").style("width",width+"px").attr("height",height+"px").select("div.svg").append("svg").attr("width",width).attr("height",height),
        container = d3.select("div.container").style("width",(width+2)+"px"),
        tile = d3.geo.tile().size([width, height]),      
        prefix = prefixMatch(["webkit", "ms", "Moz", "O"]),
        clipPath = chart.append("defs").append("clipPath").attr("id", "clip").append("rect").attr("width", 0).attr("height", chartHeight),
        dragging = false,
        cutoff,interval,projection,stations,areaPaths,marker,markerPath,markerLabel,distanceLabel,reticle,cornerLabel,mostRecent,currentSegment,timeout, images;      

      d3.json("data/subte.json",function(error,subte) {    

        //console.log(subte);      

        var areaLayers = ["A","B","C","D","E","H"].reverse(), stationList = [];  

        var xScale = d3.scale.linear().domain(d3.extent(subte.segments.map(function(d){return d.totalMonths;}))).range([chartMargin,width-chartMargin]).clamp(true);      
        xScale.domain([xScale.domain()[0]-12,xScale.domain()[1]+4]);      
        
        var yScale = d3.scale.linear().domain([0,d3.max(subte.areaChartValues[0].map(function(d){return d.distance;}))]).range([chartHeight,30]).clamp(true);

        var g = chart.append("g").attr("class","chart");      
        g.append("g").attr("class","monochrome").selectAll("path").data(subte.areaChartValues).enter().append("path")                
          .style("fill",function(d,i){ return monochrome(subte.colors[areaLayers[i]]); })
          .attr("d",function(d){ return getAreaPathString(d); });    

        
        areaPaths = g.append("g").attr("class","color").attr("clip-path", "url(#clip)").selectAll("path").data(subte.areaChartValues).enter().append("path")        
          .style("fill",function(d,i){ return subte.colors[areaLayers[i]];})
          .attr("d",function(d){ return getAreaPathString(d); });        
        
        marker = chart.append("g").attr("class","marker");

        markerPath = marker.append("path").attr("d","M0,0 L 0,"+chartHeight);

        markerLabel = marker.append("text").attr("x",0).attr("y",16).attr("x",-5).text("");
        distanceLabel = marker.append("text").attr("class","distance").attr("x",-5).attr("y",30).text("");

        // imagenes = ["http://i.imgur.com/t6K5vB8.jpg", "http://i.imgur.com/zk926Ki.jpg"]

        // images = chart.append("g")
        // .attr("class","image")
        // .selectAll("image")
        //   .data(imagenes)
        //   .enter()
        //   .append("svg:image")
        //   .attr("x", "60")
        //   .attr("y", "60")
        //   .attr("xlink:href", function(d){ return d;})
        //   .attr("width", "200")
        //   .attr("height", "200"); 

        for (var s in subte.stations) {
          stationList.push(subte.stations[s]);
          
        }      
        console.log(stationList);
        projection = d3.geo.mercator()
            .scale(1)
            .translate([0, 0]);

        var path = d3.geo.path()
            .projection(projection);

        var stationGeoJSON = {"type": "MultiPoint", "coordinates": stationList.map(function(d){return d.lnglat;})};

          var b = path.bounds(stationGeoJSON),
              //s = .8 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
              s = Math.pow(2,21)/2/Math.PI*0.8,
              t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection = projection.scale(s).translate(t);

        var tiles = tile
          .scale(s*2*Math.PI)
          .translate(t)
          ();

        var image = layer
          .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
          .selectAll(".tile")
          .data(tiles, function(d) { return d; })
          .enter().append("img")
          .attr("class", "tile")

          .attr("src", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 2 | 0] + ".tiles.mapbox.com/v3/gcbadata.gdmoea7m/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })


          // .attr("src", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/veltman.map-5p16q1wt/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
          .style("left", function(d) { return (d[0] << 8) + "px"; })
          .style("top", function(d) { return (d[1] << 8) + "px"; })      
        
        var monochromePaths = map.append("g").attr("class","monochrome line").selectAll("path").data(subte.lineOrder).enter().append("path").attr("d",function(d){ return getMapPathString(d);}).style("stroke",function(d){ return monochrome(subte.colors[d]);});

        var colorG = map.append("g").attr("class","color line");
        
        var colorPaths = colorG.selectAll("path").data(subte.lineOrder).enter().append("path").attr("d","M0,0").style("stroke",function(d){ return subte.colors[d]; });

        mostRecent = colorG.append("path").attr("d","M0,0");



        stations = map.append("g").attr("class","stations").selectAll("circle").data(stationList).enter().append("circle")
          .attr("class","not-yet")
          .attr("r",5)
          .attr("cx",function(d){ return projection(d.lnglat)[0]; })
          .attr("cy",function(d){ return projection(d.lnglat)[1]; });

        reticle = map.append("g").attr("class","reticle").append("rect").attr("x",0).attr("y",0).attr("width",0).attr("height",0);

        cornerLabel = map.append("g").attr("class","corner-label");
        cornerLabel = [cornerLabel.append("text").attr("class","stops").attr("x",width-60).attr("y",24),cornerLabel.append("text").attr("class","completed").attr("x",width-12).attr("y",40)];  


        
        chart.on("click",function() {
          clearInterval(interval);        
          clearTimeout(timeout);
          updateCutoff(xScale.invert(d3.mouse(chart.node())[0]));
        });

        chart.on("mousedown",function() {
          clearInterval(interval);
          clearTimeout(timeout);
          dragging = true;
          updateCutoff(xScale.invert(d3.mouse(chart.node())[0]));
        })
        .on("mousemove",function() {        
          if (dragging) updateCutoff(xScale.invert(d3.mouse(chart.node())[0]));
        })
        .on("mouseup",function() {
          dragging = false;
        })
        .on("mouseleave",function() {
          dragging = false;
        });

        // document.getElementById("play").onclick = function() {
        //   clearInterval(interval);
        //   updateCutoff(xScale.domain()[0]);
        //   interval = setInterval(function() {        
        //     updateCutoff(cutoff+3);
        //   },90);
        //   return false;
        // };

        d3.select("body").attr("class","loaded");

        //updateCutoff(1912*12+1);

        $('.chart').hide();
        $('.map').hide();
        $('.nav-container').hide();
        $('.year-1910 h2, .year-1910 p, .year-1910 .sharp, .year-1920 h2, .year-1920 p, .year-1920 .sharp, .year-1930 h2, .year-1930 p, .year-1930 .sharp, .year-1940 h2, .year-1940 p, .year-1940 .sharp, .year-1950 h2, .year-1950 p, .year-1950 .sharp, .year-1960 h2, .year-1960 p, .year-1960 .sharp, .year-1970 h2, .year-1970 p, .year-1970 .sharp, .year-1980 h2, .year-1980 p, .year-1980 .sharp, .year-1990 h2, .year-1990 p, .year-1990 .sharp, .year-2000 h2, .year-2000 p, .year-2000 .sharp, .year-2010 h2, .year-2010 p, .year-2010 .sharp').css({ opacity: 0 });

        $('#inicio').waypoint(function() {
          $('.year-1910 h2, .year-1910 p, .year-1910 .sharp').stop().animate({ opacity: 0}, 1000);
          $('.chart').fadeOut(300);
          $('.map').fadeOut(300);
          $('.nav-container').fadeOut(250);
        }, { offset: -150 });

        // 1913, 1914, 1930, 1931, 1934, 1936, 1937, 1940, 1944,
        // 1966, 1973, 1985, 1986, 1987, 1997, 1999, 2000, 2003,
        // 2007, 2008, 2010, 2011, 2013

        
        $('.year-1910').waypoint(function() {
          $('.year-1910 h2, .year-1910 p, .year-1910 .sharp').stop().animate({ opacity: 1 }, 1000);
          $('.chart').slideDown(700);
          $('.map').slideDown(500);
          $('.nav-container').fadeIn(500);
          updateCutoff(1913*12+12);
        }, { offset: 50 });
        
        $('.year-1910').waypoint(function() {
          $('.chart').fadeIn(500);
          $('.map').fadeIn(1000);
          $('.nav-container').fadeIn(500);
          updateCutoff(1914*12+12);
        }, { offset: -50 });
        
        $('.year-1910').waypoint(function() {
          $('.chart').fadeIn(500);
          $('.map').fadeIn(1000);
          $('.nav-container').fadeIn(500);
          updateCutoff(1915*12+12);
        }, { offset: -100 });

        $('.year-1920').waypoint(function() {
          $('.year-1920 h2, .year-1920 p, .year-1920 .sharp').stop().animate({ opacity: 1 }, 1000);
          updateCutoff(1920*12+1);
        });

        $('.year-1930').waypoint(function() {
          $('.year-1930 h2, .year-1930 p, .year-1930 .sharp').stop().animate({ opacity: 1 }, 1000);
          updateCutoff(1930*12+1);
        });

        $('.year-1930').waypoint(function() {
          updateCutoff(1931*12+1);
        }, { offset: -50 });

        $('.year-1930').waypoint(function() {
          updateCutoff(1932*12+1);
        }, { offset: -100 });

        $('.year-1930').waypoint(function() {
          updateCutoff(1933*12+1);
        }, { offset: -150 });

        $('.year-1940').waypoint(function() {
          updateCutoff(1940*12+1);
        });

        $('.year-1950').waypoint(function() {
          updateCutoff(1950*12+1);
        });

        $('.year-1960').waypoint(function() {
          updateCutoff(1960*12+1);
        });

        $('.year-1970').waypoint(function() {
          updateCutoff(1970*12+1);
        });

        $('.year-1980').waypoint(function() {
          updateCutoff(1980*12+1);
        });

        $('.year-1990').waypoint(function() {
          updateCutoff(1990*12+1);
        });

        $('.year-2000').waypoint(function() {
          updateCutoff(2000*12+1);
        });

        $('.year-2010').waypoint(function() {
          updateCutoff(2010*12+1);
        });


        function updateCutoff(months) {

          cutoff = months;

          if (cutoff >= xScale.domain()[1]) {
            clearInterval(interval);
            return true;          
          }

          colorPaths.attr("d",function(d){return getMapPathString(d,cutoff);});


          clipPath.attr("width",xScale(cutoff));
          //areaPaths.attr("d",function(d){ return getAreaPathString(d,cutoff);});

          marker.attr("transform","translate("+xScale(cutoff)+")");

          var x = 5, anch = "start";
          if (xScale(cutoff) > width - 100) {
            x = -x;
            anch = "end";
          }
          
          var filtered = subte.areaChartValues[0].filter(function(e){return (e.months <= cutoff); }).map(function(e){ return e.distance; });
          markerLabel.text(Math.floor((cutoff-1)/12)).attr("x",x).style("text-anchor",anch);        
          var dist = filtered.length ? d3.max(filtered) : 0;
          distanceLabel.text(Math.round(dist/1000*10)/10+" km de vías").attr("x",x*1.2).style("text-anchor",anch);;

          stations.classed("not-yet",function(d) { return d.firstAppearance > months; });

          if (filtered.length) {
            
            if (filtered.length-1 != currentSegment) {


              currentSegment = filtered.length - 1;
              var last = subte.segments[filtered.length-1];

              var lnglats = last.stationIds.map(function(d) {
                return subte.stations[d].lnglat;
              });

              var sw = projection([d3.min(lnglats.map(function(d){ return d[0]; })),d3.min(lnglats.map(function(d){ return d[1]; }))]),
              ne = projection([d3.max(lnglats.map(function(d){ return d[0]; })),d3.max(lnglats.map(function(d){ return d[1]; }))]);          

              reticle.attr("x",sw[0]-10).attr("y",ne[1]-10).attr("width",ne[0]-sw[0]+20).attr("height",sw[1]-ne[1]+20);  


              
       
              cornerLabel[0].text(last.from+" - "+last.to).style("fill",subte.colors[last.line]);
              cornerLabel[1].text("Completado " + last.prettyDate).style("fill",subte.colors[last.line]);          
              
              mostRecent.attr("d","M "+lnglats.map(projection).join(" L ")).style("stroke",highlighted(subte.colors[last.line]));

            }

          } else {          
            reticle.attr("width",0).attr("height",0);
            cornerLabel[0].text("");
            cornerLabel[1].text("");        
            mostRecent.attr("d","M0,0");
          }

        }


        function getMapPathString(lineLetter,cut) {        
          if (typeof cut !== 'number') {
            cut = Infinity;
          }

          var points = [];        
          var last = subte.segments.filter(function(d){return (d.line == lineLetter && d.totalMonths <= cut); }).pop();

          if (!last) return "M 0,0";

          var points = last.totalStationsSoFar.map(function(s) { return projection(subte.stations[s].lnglat); });
          return "M "+points.join(" L ");

        }

        function getAreaPathString(d,cut) {
          
          if (typeof cut !== 'number') {
            cut = Infinity;
          }        

          var filtered = d.filter(function(e){return (e.months <= cut); });

          var points = filtered.map(function(e) {
            return [xScale(e.months),yScale(e.distance)];
          });        

          if (!points.length) return "M 0,0";

          var strPoints = [];

          points.forEach(function(p,i) {
            var beforeY = yScale.range()[0];
            if (strPoints.length) {
              beforeY = strPoints[strPoints.length-1][1];            
            }
            strPoints.push([p[0],beforeY]);
            strPoints.push(p);
          });

          var lastX = Math.min(xScale.range()[1],xScale(cut));

          strPoints.push([lastX,strPoints[strPoints.length-1][1]]);        

          return "M "+lastX+","+yScale.range()[0]+" L "+xScale.range()[0]+","+yScale.range()[0]+" L "+strPoints.join(" L ") + "Z";
        }

      });

      function monochrome(color) {
        var c = d3.hsl(color);
        return d3.hsl(c.h,0,c.l).brighter(1.9).toString();
      }

      function highlighted(color) {
        return d3.rgb(color).brighter(1.5).toString();
      }    

      function matrix3d(scale, translate) {
        var k = scale / 256, r = scale % 1 ? Number : Math.round;
        return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
      }

      function prefixMatch(p) {
        var i = -1, n = p.length, s = document.body.style;
        while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
        return "";
      }