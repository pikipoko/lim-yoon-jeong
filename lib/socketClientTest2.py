import socketio
import time

print(socketio.__version__)

sio = socketio.Client()
sio.connect('http://127.0.0.1:3300')

global data
data = {'id':'aa', 'pass':'pa'}

def dd(data1):
    print(2)
    global data
    data = data1

while True: 
    time.sleep(1)
    sio.on('pay', dd)
    print(data)
    sio.emit('pay', data)

sio.disconnect()