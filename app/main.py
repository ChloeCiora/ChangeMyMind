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
r_to_client = {}  # map room to list of Clients connected

app = Flask(__name__)
sockets = Sockets(app)
app.secret_key = "super duper secret"


def add_client(clients, topic, name, ip, port):
    # Map client to IP port
    if topic not in r_to_client.keys():
        r_to_client[topic] = []
    client_tuple = (str(ip), int(port))
    for ip_tuple in list(clients.keys()):
        if ip_tuple == client_tuple:
            print('New client', file=sys.stderr, flush=True)
            found_client = clients[ip_tuple]
            u_to_client[name] = found_client
            r_to_client[topic].append(found_client)
            break


def remove_client(name, room):
    global r_to_client
    global u_to_client
    to_rem = u_to_client.pop(name)  # remove leaving client
    if to_rem in r_to_client[room]:
        print('removing client', file=sys.stderr, flush=True)
        r_to_client[room].remove(to_rem)
    if not r_to_client[room]:
        print('room ' + room + ' is empty!', file=sys.stderr, flush=True)
        r_to_client.pop(room)  # remove room


def decide_request(req, name, clients, topic, ip, port):
    res = ""
    request = req['type']
    if request == 'enter':
        add_client(clients, topic, name, ip, port)
        res = {"name": name, "msg": "has entered the chat", "topic": topic}
    elif request == 'message':
        res = {"name": name, "msg": req['msg'], "topic": topic}
    elif request == 'exit':
        res = {"name": name, "msg": "has left the chat", "topic": topic}
        remove_client(name, topic)
    return json.dumps(res)


@sockets.route('/chat')
def chat_socket(ws):
    while not ws.closed:
        message = ws.receive()
        if message is None:  # message is "None" if the client has closed.
            continue
        # store name of sender
        name = session.get('email')
        room = session.get('topic')
        client_ip = request.environ['REMOTE_ADDR']  # store IP of client
        client_port = request.environ['REMOTE_PORT']  # store port of client
        msg = json.loads(message)  # convert to dict
        if ws.handler.server.clients:
            clients = ws.handler.server.clients
        res = decide_request(msg, name, clients, room, client_ip, client_port)
        for client in r_to_client[room]:
            print("sending", file=sys.stderr, flush=True)
            print(res, file=sys.stderr, flush=True)
            client.ws.send(res)


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
