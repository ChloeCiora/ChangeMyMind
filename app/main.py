from flask import Flask, redirect, render_template, request, jsonify
from flask_socketio import SocketIO
from google.cloud import datastore

from google.oauth2 import id_token
from google.auth.transport import requests
CLIENT_ID = "739915422482-gmra2df2r5tvlp0aktbt6l8pvb9gndfr.apps.googleusercontent.com"


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

@app.after_request
def add_header(resp):
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp
    
@app.route('/get_token', methods = ['GET', 'POST'])
def get_login_token():
    user_token = str(request.form['get_token'])
    print(user_token)
    try:
        idinfo = id_token.verify_oauth2_token(user_token, requests.Request(), CLIENT_ID)
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        userid = idinfo['sub']
        print("userid =", userid, flush = True)
        session["userid"] = userid
    except ValueError:
        # Invalid token
        pass
    return True

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
