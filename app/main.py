# Command to run locally:
# gunicorn3 -b 127.0.0.1:8080 -k flask_sockets.worker main:app
# Run sudo apt-get install gunicorn3 first
# Deploy using gcloud beta app deploy

# [START gae_flex_websockets_app]
from __future__ import print_function

from flask import Flask, redirect, request, jsonify, session
from google.cloud import datastore
from flask_sockets import Sockets
import sys
import json

from google.oauth2 import id_token
from google.auth.transport import requests
a = "739915422482-gmra2df2r5tvlp0aktbt6l8pvb9gndfr.apps.googleusercontent.com"
CLIENT_ID = a
u_to_client = {}                  # map users to Client object
r_to_client = {}
# map room to list of Clients connected`(uses Object from gevent API)

app = Flask(__name__)
sockets = Sockets(app)
app.secret_key = "super duper secret"

# helper for when new client enters room
# store new Client object, map uname to Client object for removal


def add_client(clients, room, uname, ip, port):
    # use IP port tuple to identify client
    # find client with matching info, map for later messages
    if room not in r_to_client.keys():
        r_to_client[room] = []  # if empty, create new list
    client_tuple = (str(ip), int(port))
    print(list(clients.keys()), file=sys.stderr, flush=True)
    print(client_tuple, file=sys.stderr, flush=True)   # DEBUG
    for ip_tuple in list(clients.keys()):
        if ip_tuple == client_tuple:
            print('found client!', file=sys.stderr, flush=True)
            found_client = clients[ip_tuple]
            u_to_client[uname] = found_client
            r_to_client[room].append(found_client)
            break

# helper from when client leaves room
# remove Client entry for uname and from room list
# update client list


def remove_client(uname, room):
    global r_to_client
    global u_to_client
    to_rem = u_to_client.pop(uname)  # remove leaving client entry and get val
    print(to_rem, file=sys.stderr, flush=True)  # DEBUG
    if to_rem in r_to_client[room]:
        print('removing client', file=sys.stderr, flush=True)  # DEBUG
        r_to_client[room].remove(to_rem)
    if not r_to_client[room]:
        print('room ' + room + ' is empty!', file=sys.stderr, flush=True)
        r_to_client.pop(room)  # remove room


def decide_request(req, uname, clients, room, ip, port):
    resp = ""
    req_type = req['type']
    if req_type == 'enter':
        # person joined room, must take difference of new clients list and old
        # use to track person in room
        add_client(clients, room, uname, ip, port)
        resp = {"name": uname, "msg": "has entered the chat", "topic": room}
    elif req_type == 'message':
        # someone is sending a message
        resp = {"name": uname, "msg": req['msg']}
    elif req_type == 'leave':
        # someone leaving the room remove from room client list to avoid issues
        # print status
        # need to update sheet for leaving user key = UID + title, IF NOT EMPTY
        if req['msg']:
            session['u_token']
        remove_client(uname, room)

    return json.dumps(resp)


@sockets.route('/chat')
def chat_socket(ws):
    # while socket is open, process messages
    while not ws.closed:
        message = ws.receive()
        # print(message, file=sys.stderr, flush=True)
        if message is None:  # message is "None" if the client has closed.
            continue
        # store name of sender
        uname = session.get('email')
        client_ip = request.environ['REMOTE_ADDR']  # store IP of client
        client_port = request.environ['REMOTE_PORT']  # store port of client
        msg = json.loads(message)  # convert to dict
        # now process message dependent on type + room, clients
        if ws.handler.server.clients:
            clients = ws.handler.server.clients
        room = session.get('topic')
        res = decide_request(msg, uname, clients, room, client_ip, client_port)

        for client in r_to_client[room]:
            print("sending", file=sys.stderr, flush=True)
            # print(resp, file=sys.stderr, flush=True)
            print(res, file=sys.stderr, flush=True)
            client.ws.send(res)

# [END gae_flex_websockets_app]


@app.after_request
def add_header(resp):
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp


@app.route('/')
def index():
    return redirect("static/ChangeMyMind.html")


@app.route("/webservice", methods=['GET', 'POST'])
def my_webservice():
    return jsonify(result=put_debate(**request.args))


@app.route('/put_debate', methods=['GET', 'POST'])
def put_debate(debate_id, user, transcript):
    '''
    ds = get_client()
    task_key = ds.key("debate") # unique ID for this entity
    task = datastore.Entity(key=task_key)
    task["debate_id"] = debate_id
    task["user"] = user
    task["transcript"] = transcript
    ds.put(task)
    return task
    '''


@app.route('/get_debate', methods=['GET', 'POST'])
def get_debates():
    ds = get_client()
    return str(list(ds.query(kind="debate").fetch()))


@app.route('/get_client', methods=['GET', 'POST'])
def get_client():
    return datastore.Client()


@app.route('/get_token', methods=['GET', 'POST'])
def get_token():
    token = str(request.form['user_token'])
    email = str(request.form['user_email'])
    print(email)
    # print(token)
    idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
    site = 'accounts.google.com'
    site1 = 'https://accounts.google.com'
    if idinfo['iss'] not in [site, site1]:
        return jsonify(success=False)
    userid = idinfo['sub']
    print("userid =", userid)
    session["userid"] = userid
    session["email"] = email
    return jsonify(success=True)


@app.route('/get_topic', methods=['GET', 'POST'])
def get_topic():
    topic = str(request.form['topic'])
    print(topic)
    session["topic"] = topic
    return redirect('/static/chatbox.html', code=302)


if __name__ == '__main__':
    print("""
This can not be run directly because the Flask development server does not
support web sockets. Instead, use gunicorn:
gunicorn -b 127.0.0.1:8080 -k flask_sockets.worker main:app
""")


'''
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'vnkdjnfjknfl1232#'
socketio = SocketIO(app)

@app.route('/')
def root():
    return redirect("static/ChangeMyMind.html", code=302)
    #return render_template('chatbox.html')

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)

@app.route('/get_client', methods=['GET', 'POST'])
def get_client():
    return datastore.Client()

@app.route('/put_debate', methods=['GET', 'POST'])
def put_debate(debate_id, user, transcript):
    ds = get_client()
    task_key = ds.key("debate") # unique ID for this entity
    task = datastore.Entity(key=task_key)
    task["debate_id"] = debate_id
    task["user"] = user
    task["transcript"] = transcript
    ds.put(task)
    return task

@app.route("/webservice", methods=['GET', 'POST'])
def my_webservice():
    return jsonify(result=put_debate(**request.args))

@app.route('/get_debate', methods=['GET', 'POST'])
def get_debates():
    ds = get_client()
    return ds.query(kind="debate").fetch()


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
'''
