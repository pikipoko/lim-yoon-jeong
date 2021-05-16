import socketio
import time

print(socketio.__version__)

sio = socketio.Client()
sio.connect('http://127.0.0.1:3300')

while True:
    time.sleep(0.1)
    sio.emit('streaming', "second-test")

sio.disconnect()