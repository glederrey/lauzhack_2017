var width = 960;
var height = 600;

// Define the variables for the nodes
var radius = 8,
    padding = 5; // Distance between the nodes

var foci = {'source': {"x": 0.3*width, "y": 0.5*height},
    'target': {"x": 0.7*width, "y": 0.5*height}};

var svg = d3.select("div#viz")
    .append("div")
    .classed("svg-container", true) //container class to make it responsive
    .append("svg")
    //responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 900 600")
    //class to make it responsive
    .classed("svg-content-responsive", true);

var simulation = d3.forceSimulation().alphaDecay(0)
// Decay in velocity in order to avoid the nodes to giggle
    .velocityDecay(0.1)
    // Collision forces in order to avoid overlap
    .force("collision", d3.forceCollide().radius(radius+padding).iterations(5).strength(0.1))
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100).strength(0));

var nodes;
var links;

var colors = {'suspect': '#FF0000',
    'accomplice': '#FFDD00',
    'usual': '#BFBFBF'};

var nodes_info,
    ranked_list;

$.getJSON('../json/nodes.json', function(json) {
    nodes_info = json;
    $.getJSON('../json/ranked_list.json', function(json) {
        ranked_list = json;

        // Load the ranked list
        $.each(ranked_list, function(idx) {

            var elem = ranked_list[idx];
            var id = elem["id"];

            $('#userSelection').append($("<option/>", {
                value: id,
                text: nodes_info[id]['first_name'] + " " + nodes_info[id]['last_name']
            }));
        });

        var id = ranked_list[0]["id"];
        var file_fraud = id + ".json";
        var score = ranked_list[0]["score"]

        main(file_fraud, id, score);

    });
});

function main(file_fraud, id, score) {
    emphasisSuspect(id);
    document.getElementById("score").innerHTML = round(score);

    d3.json("../json/" + file_fraud, function(error, graph) {
        document.getElementById("message").innerHTML = graph.message;
        if (error) throw error;

        nodes = graph.nodes;
        links = graph.links;

        for(var i=0; i<nodes.length; i++) {
            // Add additional fields in the JSON object
            nodes[i]["x"] = 0.5 * width;
            nodes[i]["y"] = 0.5 * height;
            if (nodes[i]["id"] == id) {
                nodes[i]["radius"] = 1.5*radius;
            } else {
                nodes[i]["radius"] = radius;
            }

        }

        _.each(links, function(link) {

            // find other links with same target+source or source+target
            var same = _.where(links, {
                'source': link.source,
                'target': link.target
            });
            var sameAlt = _.where(links, {
                'source': link.target,
                'target': link.source
            });
            var sameAll = same.concat(sameAlt);

            _.each(sameAll, function(s, i) {
                s.sameIndex = (i + 1);
                s.sameTotal = sameAll.length;
                s.sameTotalHalf = (s.sameTotal / 2);
                s.sameUneven = ((s.sameTotal % 2) !== 0);
                s.sameMiddleLink = ((s.sameUneven === true) && (Math.ceil(s.sameTotalHalf) === s.sameIndex));
                s.sameLowerHalf = (s.sameIndex <= s.sameTotalHalf);
                s.sameArcDirection = s.sameLowerHalf ? 0 : 1;
                s.sameIndexCorrected = s.sameLowerHalf ? s.sameIndex : (s.sameIndex - Math.ceil(s.sameTotalHalf));
            });
        });

        var maxSame = _.chain(links)
            .sortBy(function(x) {
                return x.sameTotal;
            })
            .last()
            .value().sameTotal;

        _.each(links, function(link) {
            link.maxSameHalf = Math.floor(maxSame / 3);
        });

        var marker = svg.append("g")
            .attr("class", "links")
            .selectAll("marker")
            .data(graph.links)
            .enter().append("svg:marker")
            .attr("id", function(d, i){return i;})
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", function(d) {
                if (d.target == id) {
                    return -7;
                } else {
                    return 18;
                }
            })
            .attr("refY", 0)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .attr("fill", function(d) {return colors[d.tag];})
            .attr("stroke", function(d) { return "#000000"; })
            .attr("stroke-width", 2)
            .attr("opacity", 0)
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("path")
            .attr("stroke-width", 2)
            .attr("fill", function() {return "none";})
            .attr("stroke", function(d) { return colors[d.tag]; })
            .attr("stroke-width", 2)
            .attr("opacity", 0)
            .attr("marker-end", function(d, i) {
                if (d.target == id) {
                    return "none";
                } else {
                    return "url(#" + i + ")";
                }
            })
            .attr("marker-start", function(d, i) {
                if (d.source == id) {
                    return "none";
                } else {
                    return "url(#" + i + ")";
                }
            });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "dataNodes")
            .attr("r", function(d) { return d.radius; })
            .attr("fill", function(d) { return colors[d.tag]; })
            .attr("stroke", function(d) { return "#000000"; })
            .attr("stroke-width", function(d, i) {
                if (i==0) {
                    return 2;
                } else {
                    return 0;
                }
            })
            //.attr("stroke-width", 2)
            .attr("opacity", 0)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", clicked)
            .on("mouseover", emphasisAndShowInfo);

        // Transitions

        node.transition()
            .duration(function(d, i) {
                if (i==0) {
                    return 100;
                } else {
                    return 300 + (i+1)*400;
                }})
            .attr("opacity", 1);

        link.transition()
            .duration(function(d, i) {return 300 + (i+2)*400;})
            .attr("opacity", 1);

        d3.selectAll("marker")
            .transition()
            .duration(function(d, i) {return 300 + (i+2)*100;})
            .attr("opacity", 1);

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        svg.on("dblclick", dbclick);

        function ticked() {
            link.attr("d", linkArc);

            node
                .each(gravity())
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
    });
}


function linkArc(d) {
    var dx = (d.target.x - d.source.x),
        dy = (d.target.y - d.source.y),
        dr = Math.sqrt(dx * dx + dy * dy),
        unevenCorrection = (d.sameUneven ? 0 : 0.5),
        arc = ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection));

    if (d.sameMiddleLink) {
        arc = 0;
    }

    return "M" + d.source.x + "," + d.source.y + "A" + arc + "," + 0 + " 0 0," + d.sameArcDirection + " " + d.target.x + "," + d.target.y;
}

function clicked(d) {

    if (d.type != 'suspect') {
        d.fx = null;
        d.fy = null;
    }
}

function dbclick() {
    nodes.forEach(function(o) {
        if (o.type != 'suspect') {
            o.fx = null;
            o.fy = null;
        }
    });
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    if (d.type != 'suspect') {
        d.fx = d.x;
        d.fy = d.y;
    }
}

function dragged(d) {
    if (d.type != 'suspect') {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
}

function dragended(d) {
    if (d.type != 'suspect') {
        if (!d3.event.active) simulation.alphaTarget(0);
        //d.fx = null;
        //d.fy = null;
    }
}

// Function to apply the gravity on the nodes
function gravity() {
    return function(d) {
        if (d.type != 'suspect') {
            var alpha,
                focus_x,
                focus_y;

            // We need to get the focus of the given node
            focus_x = foci[d.type].x;
            focus_y = foci[d.type].y;

            // Then, we get the intensity of the force
            alpha = 0.005;

            // Get the distance between the node and its focus
            var dx = focus_x - d.x;
            var dy = focus_y - d.y;

            // Change its position
            d.x += dx * alpha;
            d.y += dy * alpha;

            // Avoid that the points go outside the viz
            // TODO: Check why it can go outside at the bottom
            //d.x = Math.max(0, Math.min(width, d.x));
            //d.y = Math.max(0, Math.min(width, d.y));
        } else {
            d.fx = 0.5*width;
            d.fy = 0.5*height;
        }

    };
}
