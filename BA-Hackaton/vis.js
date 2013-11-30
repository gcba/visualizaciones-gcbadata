
$(document).ready(function() {
    if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"))
    {    
        function newpostReq(url,callBack)
        {
            var xmlhttp;
            if (window.XDomainRequest)
            {
                xmlhttp=new XDomainRequest();
                xmlhttp.onload = function(){callBack(xmlhttp.responseText)};
            }
            else if (window.XMLHttpRequest)
                xmlhttp=new XMLHttpRequest();
            else
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.onreadystatechange=function()
            {
                if (xmlhttp.readyState==4 && xmlhttp.status==200)
                    callBack(xmlhttp.responseText);
            }
            xmlhttp.open("GET",url,true);
            xmlhttp.send();
        }
    
        // Set width and height
        var w = 500;
        var h = 420;
        if ($("#logoVizContainer").size() > 0)
        {
            //var wTemp = 6000;
            var wTemp = $(window).width();
            if (wTemp < 800)
                wTemp = 800;
            var hTemp = wTemp;
            $("#OKfestContainer").css({"top": -(wTemp - $("#logoVizContainer").height() - 50)/2});
            
        }
            else
        {
            var wTemp = $(window).width()-130;
            var hTemp = $(window).height()-100;
        }
        if(wTemp<=w || hTemp<=h) {}
        else if(wTemp>hTemp) {
        	h = hTemp;
        	w = hTemp+50;
        }
        else {
        	w = wTemp;
        	h = wTemp-50;
        }
        
        var r = w/2-130,
            maxLine = 2*r,
            minLine = 10,
            colors = ['#ff6666', '#66ccff', '#ffcc66'],
            nodes = [],
            links = [],
            //loose = [],
            maxTweetLength,
            minTweetLength,
            angleTwist = Math.random() * Math.PI;
            colorIndex = Math.round(Math.random() * colors.length);
        
        var logoTextWidth = w/8;
        var logoTextTop = h/2-logoTextWidth/3;
        var logoTextLeft = w/2-logoTextWidth/2;
        
        var vis = d3.select("#OKfestContainer").append("svg:svg")
                .attr("width", w)
                .attr("height", h);
        
        var force = d3.layout.force()
                .nodes(nodes)
                .links(links)
                .gravity(0.7)
                .linkDistance(function (link, index) { return linkLength(link.target.text.length); })
                .linkStrength(function (link, index) { return 0.1; })
                .charge(function (d) { if (d.type == "tag") return 0; if (d.type == 'linked') return -150000*r*r / (d3.select('#LogoVizNodes').selectAll("span")[0].length*450*450);})
                .size([w, h]);
        /*
        var looseForce = d3.layout.force()
                .nodes(loose)
                .gravity(0.8)
                .charge(-50)
                .size([w, h]);
        */
         function tick() {
            vis.selectAll("line.link")
              .attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });
        
            vis.selectAll("circle")
              .attr('cx', function (d) { return d.x})
              .attr('cy', function (d) { return d.y})
        }
        
        force.on("tick", tick);
        //looseForce.on("tick", loosetick)
        
        /*
        function loosetick() {
            vis.selectAll("circle.loose")
              .attr('cx', function (d) { return d.x})
              .attr('cy', function (d) { return d.y})
        }
        */
        function nextInLine()
        {
            var color = colors[colorIndex];
            colorIndex++;
            if (colorIndex >= colors.length)
                colorIndex = 0;
            return color;
        }
        
        function linkLength(length)
        {
            return ((maxLine - minLine)/(maxTweetLength - minTweetLength)) * (length - maxTweetLength) + maxLine;
        }
        
        function findItemIndex(id, array)
        {
            for (key in array)
            {
                if (array[key].id == id)
                    return key;
            }
            return false;
        }
        
        function formatTweet(tweet)
        {
            console.log(tweet);
            return '<p><strong>' + tweet.user + ':</strong> ' + tweet.text + '</p><p><a href="https://twitter.com/'+tweet.user+'/status/'+tweet.id+'" target="_blank">View in Twitter</a></p>';
        }
        
        function getRelatedTweets(tag)
        {
            var relatedTweets = [];
            vis.selectAll("line.link").each(function (d) {if (d.source.id == tag.id) {relatedTweets.push(d.target);};});
            var text = "<h1>"+tag.text+"</h1>";
            for (key in relatedTweets)
                text += "<div>"+ formatTweet(relatedTweets[key]) +"</div>";
            return text;
        }
        
        function calculateX(currentX, length, angle)
        {
            return  currentX + Math.cos(angle) * length;
        }
        
        function calculateY(currentY, length, angle)
        {
            return  currentY + Math.sin(angle) * length;
        }
        
        function updateData(starting) {
            newpostReq("http://floapps.com/lab/misc/oklogo/interface.json", function(json) {
                json = JSON.parse(json);
                minTweetLength = json.minLength;
                maxTweetLength = json.maxLength;
                
                var tagCount = 0;
                /*
                //updating loose nodes based on the loose array
                
                var ownLoose = d3.select('#LogoVizLoose').selectAll("span").data(json.loose, function (d) {return d.id});
                ownLoose.enter().append("span").each(function (d) { loose.push(d); });
                ownLoose.exit().each(function (d) {
                    var key = findItemIndex(d.id, loose);
                    if (key)
                    {
                        loose.splice(key, 1)
                    }
                }).remove();
        
        
                var loosenode = vis.selectAll("circle.loose").data(loose, function (d) {return d.id;});
        
                loosenode.enter().append("svg:circle")
                    .attr("cx", function (d) { return d.x })
                    .attr("cy", function (d) { return d.y })
                    .attr("class", "loose")
                    .attr("r", 2).on('click', function (d) {alert("hoi");});;
        
                loosenode.exit().remove()
        
        
                looseForce.start();
                */
                // we make spans to keep track of changing collections and updating links and nodes arrays
                var ownNodes = d3.select('#LogoVizNodes').selectAll("span").data(json.nodes, function (d) {return d.id});
                ownNodes.enter().append("span").each(function (d) { nodes.push(d); });
                ownNodes.each(function (d) {
                    if (d.type == "tag") {
                        tagCount++;
                        var key = findItemIndex(d.id, nodes);
                        if (key)
                        {
                            nodes[key].x = calculateX(w/2, r, d.angle + angleTwist);
                            nodes[key].y = calculateY(h/2, r, d.angle + angleTwist);
                        }
                    }
                }).on('click', function (d) {alert("hoi");});
        
                ownNodes.exit().each(function (d) {
                    var key = findItemIndex(d.id, nodes);
                    if (key)
                    {
                        nodes.splice(key, 1)
                    }
                }).remove();
                
                $("#tagCount").html(tagCount);
        
                var ownLinks = d3.select('#LogoVizLinks').selectAll("span").data(json.links, function (d) {return d.id});
                ownLinks.enter().append("span").each(function (d) { links.push({"target" : nodes[findItemIndex(d.targetid, nodes)], "source" : nodes[findItemIndex(d.sourceid, nodes)], id : d.id}); });
                ownLinks.exit().each(function (d) {
                    var key = findItemIndex(d.id, links);
                    if (key)
                    {
                        links.splice(key, 1)
                    }
                }).remove();
                //updating nodes based on the nodes array
                var node = vis.selectAll("circle.node").data(nodes, function (d) {return d.id;});
        
                node.enter().append("svg:circle")
                    .attr("cx", function (d) { if (d.type == "tag") return calculateX(w/2, r, d.angle + angleTwist); return d.x })
                    .attr("cy", function (d) { if (d.type == "tag") return calculateY(h/2, r, d.angle + angleTwist); d.y })
                    .attr("style", function (d) { if (d.type == "tag") return "fill:black;"; if (d.type == "tag" || d.type == "linked") return "display:none;" })
                    .attr("class", function (d) { if (d.type == "tag") return "node tag"; return "node"; })
                    .attr("r", 0.5)
                    .each(function (d) { if (d.type == "tag") d.color = nextInLine(); });
        
                node.exit().remove();
        
        
                //updating links based on the links array
                var link = vis.selectAll("line.link").data(links, function (d) {return d.id});
                link.enter().insert("svg:line")
                    .attr("class", "link")
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; })
                    .attr("style", function (d) { if (typeof d.source == "object") return "stroke:"+d.source.color; return "stroke:"+nodes[d.source].color;});
        
                link.exit().remove();
        
        
                //moving tags on the circle
                vis.selectAll("circle.tag").transition().each(function (d) {d.cx = d.x; d.px = d.x; d.cy = d.y; d.py = d.y;});
        
                var text = vis.selectAll("text.text").data(json.texts, function (d) {return d.id});
                text.enter().append("text")
                  .attr("x", function (d) {return calculateX(w/2, r, d.angle + angleTwist) + (Math.abs(Math.cos(d.angle + angleTwist)) < 0.2 ? - d.text.length * 4 : Math.cos(d.angle + angleTwist) > 0 ? 2 : - d.text.length * 8);})
                  .attr("y", function (d) {return calculateY(h/2, r, d.angle + angleTwist) + (Math.sin(d.angle + angleTwist) > 0 ? Math.sin(d.angle + angleTwist)*15 : -2);})
                  .attr("class", 'text')
                  .text(function(d) {return d.text;});
        
                vis.selectAll("line.link").on('click', function (d) {
                	d3.select('#LogoVizText #textNode').html(formatTweet(d.target));
                	d3.select('#LogoVizText').style("display", "block");
                	d3.select('#LogoVizText').style("left", d3.event.pageX+"px").style("top", d3.event.pageY+20+"px");
                });
                d3.select('#closeTweet').on('click', function() {
        			d3.select('#LogoVizText').style("display", "none");
                });
                
                /*
                loosenode.on("click", function(d) {
                   d3.select('#LogoVizText').html(formatTweet(d));
                });
        
                */
                text
                    .on('click', function (d) {
                      /*  d3.select('#LogoVizText').html(getRelatedTweets(d)); */
                      window.open('http://twitter.com/#!/search/'+escape("#okfest "+d.text))
                    }).transition()
                  .attr("x", function (d) {return calculateX(w/2, r, d.angle + angleTwist) + (Math.abs(Math.cos(d.angle + angleTwist)) < 0.2 ? - d.text.length * 4 : Math.cos(d.angle + angleTwist) > 0 ? 2 : - d.text.length * 7);})
                  .attr("y", function (d) {return calculateY(h/2, r, d.angle + angleTwist) + (Math.sin(d.angle + angleTwist) > 0 ? Math.sin(d.angle + angleTwist)*15 : -2);});
        
                text.exit().remove();        
        
                force.start();
                /*
                if (starting === true)
                    for (var i = 0; i < 100; ++i) 
                    {
                        looseForce.tick();
                        force.tick();
                    }
                */
                
                if (json.minTime)
                {
                    $("#logoMinTime").html(json.minTime);
                    $("#logoMinMonth").html(json.minMonth);
                    $("#logoMinDay").html(json.minDay);
                    $("#infoBlock").show();
                }
            });
            
            setTimeout(updateData, 60000);
        }
        // Logo text
    	$('#logoText').width(logoTextWidth);
    	$('#logoText').css({ 'top': logoTextTop, 'left': logoTextLeft });
    	$('#OKfestContainer').css({ "fontFamily": "Gudea, Sans Serif", 'width': r*2+260, 'height': h }).show();
        
        updateData(true);
    }
    else
    {
        $("#OKfestContainer").append("Your browser does not support the logo");
    } 
});