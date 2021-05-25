import socketio
import time

print(socketio.__version__)

sio = socketio.Client()
sio.connect('http://127.0.0.1:3300')

global name
name = "A00001"

while True: 
    time.sleep(0.1)
    if (name != "test01") :
        name = "test01"
    else :
        continue
    
    sio.emit('streaming', name)

sio.disconnect()