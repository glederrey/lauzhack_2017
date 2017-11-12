function emphasisAndShowInfo(d, susp_id) {
    var info = nodes_info[d.id];

    d3.selectAll(".dataNodes")
        .attr("stroke-width", 0);
    d3.select(this)
    .attr("stroke-width", 2);

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

    } else if (info['tag'] == 'atm') {
        document.getElementById("name").innerHTML = 'ATM';

        document.getElementById("info").innerHTML = "<i class=\"fa fa-compass\" aria-hidden=\"true\"></i> (" + round(info["latitude"]) + ", " + round(info["longitude"]) + ")";
    } else if (info['tag'] == 'company') {
        document.getElementById("name").innerHTML = info['name'];

        document.getElementById("info").innerHTML = "<i class=\"fa fa-globe\" aria-hidden=\"true\"></i> " + info["country"] + "<br> <i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> " + info["type"];
    }

    //"6eaea439-1349-4ee5-9013-90a1574c10f0": {"political_views": "Liberal", "address": "612 Manor High Street", "postal_code": 10317, "country": "Guatemala", "city": "New Braunfels"}
}

function selectUser(button) {
    var file_fraud = button.val() + ".json";
    svg.selectAll("*").remove();
    main(file_fraud, button.val() );
}

function round(value) {
    return String(Math.round(value * 100) / 100);
}
