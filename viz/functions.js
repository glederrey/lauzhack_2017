function emphasisAndShowInfo(d) {
    var info = nodes_info[d.id];

    if (info['tag'] == 'client') {
        document.getElementById("name").innerHTML = info['first_name'] + " " + info['last_name'];
    } else if (info['tag'] == 'atm') {
        document.getElementById("name").innerHTML = 'ATM';
    } else if (info['tag'] == 'company') {
        document.getElementById("name").innerHTML = info['name'];
    }

}

function selectUser(button) {
    var file_fraud = button.val() + ".json";
    svg.selectAll("*").remove();
    main(file_fraud, button.val() );
}