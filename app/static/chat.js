window.onload = function() {
    var topic = window.location.href;
    topic = topic.substr(-1, 8);
    //window.history.pushState("object or string", "Title", topic);

    document.getElementById("topic").innerHTML = "Pancakes v.s. Waffles...Go!" //grab from db
    
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
            var signout = document.getElementById("signout").textContent.split(" ");
            user_name = signout[signout.length-1];
            //websocket.send(JSON.stringify([user_name, "has entered the chat"]))
            websocket.send(JSON.stringify({type: "enter", msg: ""})) 
        }, 300);
        setTimeout(function(){modal.style.display = "block";}, 60000);
      };
      
      // Get the modal
var modal = document.getElementById('myModal');
      
      
      websocket.onclose = function() {
        console.log('Closed');
      };

      websocket.onmessage = function(e) {
        console.log("message sent");
        data = JSON.parse(e.data);
        name = data.name;
        msg = data.msg;
        console.log("Name: " + name);
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
            var signout = document.getElementById("signout").textContent.split(" ");
            var user_name = signout[signout.length-1];
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
