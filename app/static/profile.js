window.onload = function getPoints(){
    //console.log("Retrieved")
    $.ajax({
        type: "GET",
        url: "/get_points",
        data: { },
        success: function(response) {
            console.log(response);
            var resp = JSON.parse(response)
            document.getElementById("username").innerHTML = "Username: " + resp.user;
            document.getElementById("points").innerHTML = "Minds Changed: " + resp.points;
        }
    }).done(function(data){
        console.log(data);
    });
}