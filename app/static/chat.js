function onSignIn(){
    var profile = googleUser.getBasicProfile();
    document.getElementById('profileinfo').innerHTML = profile.getName() + "<br>"
    document.getElementById("username").innerHTML = profile.getName() 
    
}
function onSignedIn(googleUser) {
    const signoutElement = document.getElementById('username');
    signoutElement.innerHTML =
        googleUser.getBasicProfile().getEmail();
}

window.onload = function() {     
    // Get the modal
    var modal = document.getElementById('myModal');
    var button = document.getElementById("frontbutton");
    var button1 = document.getElementById("home");

    window.client_num = 0;

    button.onclick = function (){
        if(window.client_num <= 2) {
            modal.style.display = "block";
            websocket.send(JSON.stringify({type: "exit", msg: ""}))
        }
    }
    button1.onclick = function (){
        if(window.client_num <= 2) {
            modal.style.display = "block";
            websocket.send(JSON.stringify({type: "exit", msg: ""}))
        }
    }

    // Create new websocket
    var scheme = window.location.protocol == "https:" ? 'wss://' : 'ws://';
    var webSocketUri =  scheme
            + window.location.hostname
            + (location.port ? ':'+location.port: '')
            + '/chat';
    var websocket = new WebSocket(webSocketUri);

    /* Establish the WebSocket connection and register event handlers. */
    websocket.onopen = function() {
        console.log('Connected');
        websocket.send(JSON.stringify({type: "enter", msg: ""}))
    }

    websocket.onclose = function() {
        console.log('Closed');
        websocket.send(JSON.stringify({type: "exit", msg: ""}))
    };

   window.onbeforeunload = function() {
        console.log('Closed');
        websocket.send(JSON.stringify({type: "exit", msg: ""}))
        websocket.close();
    }; 

    websocket.onmessage = function(e) {
        data = JSON.parse(e.data);
        user_name = data.name;
        msg = data.msg;
        topic = data.topic;

        //Set client number 
        if(window.client_num == 0) {
            window.client_num = data.num_clients;
            console.log("Client num: " + data.num_clients)
        } 

        if(window.client_num <= 2) {
            setTimeout(function(){modal.style.display = "block";}, 200000);
        }

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
        
        if(msg != "has entered the chat" && msg != "has left the chat") {
            var name = document.createElement("div");
            var bubble = document.createElement("div");
            var conv = document.getElementById("conv");
            name.innerHTML = user_name;
            var comp = document.getElementById("username").innerHTML;
            
            if(comp == user_name){
                name.style.textAlign = "right";
            }
            else {
                name.style.textAlign = "left";
            }
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

            var comp = document.getElementById("username").innerHTML;
            if(comp == user_name){
                bubble.style.marginLeft = "auto";
		        bubble.style.marginRight = "0px";
            }
            else{
                bubble.style.marginRight = "auto";
		        bubble.style.marginLeft = "0px";
            }
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
            //dbStore(user_name, 1);
            //dbRetrieve();
        }
        else {
            var conv = document.getElementById("conv");
            var bubble = document.createElement("div");
            bubble.style.color = "grey";
            bubble.style.fontSize = "12";
            bubble.style.textAlign = "center";
            bubble.style.fontWeight = "bold";
            bubble.innerHTML = user_name + " " + msg;
            conv.append(bubble);
        }
        
      };

      websocket.onerror = function(e) {
        console.log('Error (see console)');
        console.log(e.data);
      };

      document.getElementById("send-btn").onclick = function fun(e) {
          e.preventDefault();
          msg = document.getElementById("text-input").value;
          if(msg.trim() != "" && window.client_num <= 2) {
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

function dbStore(user, add_points){
    //console.log("Stored: " + debate_id + " " + user + " " + transcript)
    $.ajax({
        type: "POST",
        url: "/put_debate",
        data: { user: user, 
            add_points: add_points},
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
