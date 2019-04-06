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

window.onload = function() {
    var slideIndex = 0;
    showSlides();
    // Get the modal
    var modal = document.getElementById('myModal');
    var modal2 = document.getElementById('myModal2');
    // Get the button that opens the modal
    var btn = document.getElementById("frontbutton");
    var btn1 = document.getElementById("frontbutton2");
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    var span1 = document.getElementsByClassName("close1")[0];

    btn.onclick = function() {
        var signedIn = document.getElementById("signout").textContent;
        if (signedIn.length > 8){
            modal.style.display = "block";
        }
        else {
            modal2.style.display = "block";
        }  
    }
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }
    span1.onclick = function() {
        var signedIn = document.getElementById("signout").textContent;
        if (signedIn.length > 8){
            modal2.style.display = "none";
            const mess = document.getElementById("message")
            mess.innerHTML = 'Please sign in in order to debate!';
            mess.style.color = "#000000"
        }
        else {
            const mess = document.getElementById("message")
            mess.innerHTML = 'Please sign in in order to debate!<br>' + "You must sign in to continue!";
            mess.style.color = "#FF0000"
        }
    }
    btn1.onclick = function() {
        var signedIn = document.getElementById("signout").textContent;
        if (signedIn.length > 8){
            modal2.style.display = "none";
            const mess = document.getElementById("message")
            mess.innerHTML = 'Please sign in in order to debate!';
            mess.style.color = "#404040"
        }
        else {
            const mess = document.getElementById("message")
            mess.innerHTML = 'Please sign in in order to debate!<br>' + "You must sign in to continue!";
            mess.style.color = "#404040"
        }
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    function showSlides() {
        var i;
        var slides = document.getElementsByClassName("mySlides");
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        slideIndex++;
        if (slideIndex > slides.length) {slideIndex = 1}    
        slides[slideIndex-1].style.display = "block";  
        slides[slideIndex-1].style.marginLeft = "auto";
        slides[slideIndex-1].style.marginRight = "auto";
        setTimeout(showSlides, 5000); // Change image every 2 seconds
    }  
}
// When the user clicks the button, open the modal 
