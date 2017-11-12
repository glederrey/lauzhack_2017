function emphasisAndShowInfo(node) {
    var info = nodes_info[node.id];

    d3.selectAll(".dataNodes")
        .attr("stroke-width", 0);
    d3.select(this)
    .attr("stroke-width", 2);

    d3.selectAll(".edgelabel")
        .attr("opacity", function(d) {
            if ((d.source.id == node.id) || (d.target.id == node.id) || (d.tag == "accomplice")) {
                return 1;
            } else {
                return 0;
            }
        });

    emphasis(info);

}

function emphasisSuspect(id) {
    var info = nodes_info[id];

    emphasis(info);
}

var x;


function emphasis(info) {

    if (info['tag'] == 'client') {
        document.getElementById("name").innerHTML = info['first_name'] + " " + info['last_name'];
        document.getElementById("info").innerHTML = "<i class=\"fa fa-id-card\" aria-hidden=\"true\"></i> " + info["nationality"] + ", " + info["age"] + " y.o., <br> " +
            "<i class=\"fa fa-briefcase\" aria-hidden=\"true\"></i> " + info["occupation"] + "<br>" +
            "<i class=\"fa fa-comments\" aria-hidden=\"true\"></i> " + info["political_views"] + "<br>" +
            "<i class=\"fa fa-globe\" aria-hidden=\"true\"></i> " + info["city"] + ", " + info["country"] + "<br>"
            "<i class=\"fa fa-envelope\" aria-hidden=\"true\"></i> " + info["email"];

        var name = info['first_name'] + " " + info['last_name'];
        var hash = name.hashCode().mod(99+99+9);

        var url;
        if (hash < 99) {
            url = "https://randomuser.me/api/portraits/women/" + hash + ".jpg"
        } else if (hash < (99+99)) {
            url = "https://randomuser.me/api/portraits/men/" + String(hash-99) + ".jpg"
        } else {
            url = "https://randomuser.me/api/portraits/lego/" + String(hash-(99+99)) + ".jpg"
        }

        document.getElementById("image").src = url;

    } else if (info['tag'] == 'atm') {
        document.getElementById("name").innerHTML = 'ATM';

        document.getElementById("info").innerHTML = "<i class=\"fa fa-compass\" aria-hidden=\"true\"></i> (" + round(info["latitude"]) + ", " + round(info["longitude"]) + ")";

        document.getElementById("image").src = "img/atm.jpg";
    } else if (info['tag'] == 'company') {
        document.getElementById("name").innerHTML = info['name'];

        document.getElementById("info").innerHTML = "<i class=\"fa fa-globe\" aria-hidden=\"true\"></i> " + info["country"] + "<br> <i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> " + info["type"];

        document.getElementById("image").src = "img/agency.png";

    }

    //"6eaea439-1349-4ee5-9013-90a1574c10f0": {"political_views": "Liberal", "address": "612 Manor High Street", "postal_code": 10317, "country": "Guatemala", "city": "New Braunfels"}
}

function selectUser(button) {
    var arr = button.val().split('_');
    var file_fraud = arr[0]+ ".json";
    svg.selectAll("*").remove();

    main(file_fraud, arr[0], arr[1]);
}

function round(value) {
    return String(Math.round(value * 100) / 100);
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};
