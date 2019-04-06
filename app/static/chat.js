
		function onSignIn(){
		  var profile = googleUser.getBasicProfile();
		  document.getElementById('profileinfo').innerHTML = profile.getName() + "<br>"
          document.getElementById("username").innerHTML = profile.getName() 
          
		}
		function signOut() {
		  var auth2 = gapi.auth2.getAuthInstance();
          const signoutElement = document.getElementById('signout');
		  signoutElement.innerHTML =
			  'Sign out'
		  auth2.signOut();
		}
		function onSignedIn(googleUser) {
		  const signoutElement = document.getElementById('signout');
		  signoutElement.innerHTML =
			  'Sign out ' + googleUser.getBasicProfile().getEmail();
		}
window.onload = function() {
    var topic = window.location.href;
    topic = topic.substr(-1, 8);
    //window.history.pushState("object or string", "Title", topic);
    
    var scheme = window.location.protocol == "https:" ? 'wss://' : 'ws://';
    var webSocketUri =  scheme
                        + window.location.hostname
                        + (location.port ? ':'+location.port: '')
                        + '/chat';

      /* Establish the WebSocket connection and register event handlers. */
      var websocket = new WebSocket(webSocketUri);

      websocket.onopen = function() {
        console.log('Connected');
        setTimeout(function(){
            websocket.send(JSON.stringify({type: "enter", msg: ""}))
        }, 300);
        setTimeout(function(){modal.style.display = "block";}, 60000);
      };
      
      // Get the modal
    var modal = document.getElementById('myModal');
    var button = document.getElementById("frontbutton")
      
      button.onclick = function (){
          modal.style.display = "block";
      }
      websocket.onclose = function() {
        console.log('Closed');
      };

      websocket.onmessage = function(e) {
        data = JSON.parse(e.data);
        user_name = data.name;
        msg = data.msg;
        topic = data.topic;

        if(topic=="pancakes-waffles") {
            document.getElementById("topic").innerHTML = "Are pancakes better than waffles? Go!"
        } else if(topic=="milk-cereal") {
            document.getElementById("topic").innerHTML = "Is Milk Cereal Sauce? Go!" 
        } else if(topic=="Eat?") {
            document.getElementById("topic").innerHTML = "If you were starving, would you eat the characters from Veggie Tales? Go!" 
        } else if(topic=="Best Apocalypse") {
            document.getElementById("topic").innerHTML = "Would a zombie apocalypse actually be kind of a good time? Go!"  
        } else if (topic=="tvss") {
            document.getElementById("topic").innerHTML = "Are tabs better than spaces? Go!"  
        }

        console.log("Name: " + user_name);
        console.log("Msg: " + msg);
        
        if(msg != "has entered the chat") {
            var name = document.createElement("div");
            var bubble = document.createElement("div");
            var conv = document.getElementById("conv");

            name.innerHTML = user_name;
            name.style.textAlign = "left";
            name.style.marginTop = "1px";
            name.style.color = "grey";
            name.style.fontSize = "10";

            bubble.innerHTML = msg;
            bubble.style.width = "auto";
            bubble.style.height = "auto";
            bubble.style.display = "table";
            bubble.style.wordBreak = "break-all";
            bubble.style.wordWrap = "normal";
            bubble.style.borderRadius = "10px";
            bubble.style.padding = "7px";
            bubble.style.marginLeft = "5px";
            //bubble.style.marginRight = "0px";
            bubble.style.marginTop = "1px";
            bubble.style.maxWidth = "90%";
            bubble.style.background = "#6666ff";
            bubble.style.color = "white";


            conv.append(name);
            conv.appendChild(bubble);
            conv.scrollTop = conv.scrollHeight;

            if(msg == document.getElementById("text-input").value) {
                document.getElementById("text-input").value = "";
            }   

            //Store chat in database
            //dbStore(window.debate_id, user_name, msg);
            //dbRetrieve();
        }
        else {
            var conv = document.getElementById("conv");
            var bubble = document.createElement("div");
            bubble.style.color = "grey";
            bubble.style.fontSize = "12";
            bubble.style.textAlign = "center";
            bubble.style.fontWeight = "bold";
            bubble.innerHTML = user_name + " has entered the chat";
            conv.append(bubble);
        }
        
      };

      websocket.onerror = function(e) {
        console.log('Error (see console)');
        console.log(e.data);
      };

      window.debate_id = 1
      document.getElementById("send-btn").onclick = function fun(e) {
          e.preventDefault();
          msg = document.getElementById("text-input").value;
          if(msg.trim() != "") {
            websocket.send(JSON.stringify({"type": "message", "msg": msg}));
          }
		}
        
        document.getElementById("text-input")
        .addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("send-btn").click();
            }
        });
}

function dbStore(debate_id, user, transcript){
    //console.log("Stored: " + debate_id + " " + user + " " + transcript)
    $.ajax({
        type: "GET",
        url: "/webservice",
        data: { debate_id: debate_id, 
            user: user, 
            transcript: transcript },
        success: function(response) {
            console.log(response);
        }
    }).done(function(data){
        console.log(data);
    });
}


function dbRetrieve(){
    //console.log("Retrieved")
    $.ajax({
        type: "GET",
        url: "/get_debate",
        data: { },
        success: function(response) {
            console.log(response);
        }
    }).done(function(data){
        console.log(data);
    });
}
