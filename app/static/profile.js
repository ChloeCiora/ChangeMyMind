function onSignIn(){
    var profile = googleUser.getBasicProfile();
	document.getElementById('profileinfo').innerHTML = profile.getName() + "<br>"
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut();
    
    const signoutElement = document.getElementById('signout');
    signoutElement.innerHTML =
        'Sign out'
}

function onSignedIn(googleUser) {
    const signoutElement = document.getElementById('signout');
    signoutElement.innerHTML =
        'Sign out ' + googleUser.getBasicProfile().getEmail();
        
    var id_token = googleUser.getAuthResponse().id_token;
    //console.log("ID Token: " + id_token);
    send_token(id_token, googleUser.getBasicProfile().getEmail());
}
function send_token(user_token, user_email){
    console.log("login_info_sent")
    $.ajax({
            type: "POST",
            url: "/get_token",
            data: {user_token: user_token,
            user_email: user_email},
            success: function(response) {
                console.log(response);
            }
        }).done(function(data){
            console.log(data);
        });
    }

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