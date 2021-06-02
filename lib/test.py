import hashlib
import pickle
import base64
import json
import socketio
import time

print(socketio.__version__)

encoding_file = 'encodings.pickle'
data = pickle.loads(open(encoding_file, "rb").read())

sio = socketio.Client()
sio.connect('http://127.0.0.1:3300')

global name
name = "test01"
hashValue = hashlib.sha256(str(data).encode()).hexdigest()

data = {'code':'K00001', 'hashValue':hashValue}

isFinish = True

def dd(data1):
    global isFinish
    print('1', data1)
    isFinish = False

while isFinish: 
    time.sleep(0.1)
    sio.on('streaming', dd)
    if (name != "K00001"):
        name = "K00001"
    else:
        continue
    sio.emit('streaming', data)

sio.disconnect()

#json.dumps(data, separators=(',', ':'), sort_keys=True).encode()
#encoded = json.dumps(data["names"], sort_keys=True).encode()

#encoded = json.dumps(data["encodings"].decode('utf8'), sort_keys=True).encode()

#print(hashlib.sha256(str(data["encodings"]).encode()).hexdigest())

#print(hashlib.sha256(encoded).hexdigest())

#print(data["encodings"][0])