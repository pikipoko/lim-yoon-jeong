import socketio
import time

print(socketio.__version__)

sio = socketio.Client()
sio.connect('http://127.0.0.1:3300')

global data
data = {'code':'A00001', 'price':'4000'}


isFinish = True

def dd(data1):
    global isFinish
    print('1', data1)
    #isFinish = False

for i in range(2):
    sio.on('pay', dd)
    print(data)
    sio.emit('pay', data)
    time.sleep(5)

sio.disconnect()