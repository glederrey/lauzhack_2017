var width = 960;
var height = 600;

// Define the variables for the nodes
var radius = 6,
    padding = 1; // Distance between the nodes

var foci = {'source': {"x": 0.4*width, "y": 0.5*height},
    'target': {"x": 0.6*width, "y": 0.5*height}};

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
    .force("collision", d3.forceCollide().radius(radius+2*padding).iterations(5).strength(0.1))
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100).strength(0));

var nodes;
var links;

var colors = {'suspect': '#FF0000',
    'accomplice': '#FFDD00',
    'usual': '#BFBFBF'};

$.getJSON('../json/nodes.json', function(nodes_info) {
    d3.json("../json/1.json", function(error, graph) {
        if (error) throw error;

        nodes = graph.nodes;
        links = graph.links;

        for(var i=0; i<nodes.length; i++) {
            // Add additional fields in the JSON object
            nodes[i]["x"] = 0.5 * width;
            nodes[i]["y"] = 0.5 * height;
            nodes[i]["radius"] = radius;
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

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("path")
            .attr("stroke-width", 2)//function(d) { return Math.sqrt(d.group); })
            .attr("fill", function(d) {return "none";})
            .attr("stroke", function(d) { return colors[d.tag]; });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", function(d) { return colors[d.tag]; })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", clicked)
            .on("mouseover", emphasisAndShowInfo);

        link.append("title")
            .text(function(d) { return 1;});

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
})


function linkArc(d) {
    var dx = (d.target.x - d.source.x),
        dy = (d.target.y - d.source.y),
        dr = Math.sqrt(dx * dx + dy * dy),
        unevenCorrection = (d.sameUneven ? 0 : 0.5),
        arc = ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection));

    if (d.sameMiddleLink) {
        arc = 0;
    }

    return "M" + d.source.x + "," + d.source.y + "A" + arc + "," + arc + " 0 0," + d.sameArcDirection + " " + d.target.x + "," + d.target.y;
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