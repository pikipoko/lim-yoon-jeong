import face_recognition
import pickle
import time
import dlib
import numpy as np
import cv2
import socketio

sio = socketio.Client()
sio.connect('http://127.0.0.1:3300')

encoding_file = 'encodings.pickle'
unknown_name = 'Unknown'
# Either cnn  or hog. The CNN method is more accurate but slower. HOG is faster but less accurate.
model_method = 'cnn'

RIGHT_EYE = list(range(36, 42))
LEFT_EYE = list(range(42, 48))
EYES = list(range(36, 48))

predictor_file = './model/shape_predictor_68_face_landmarks.dat'
MARGIN_RATIO = 1.5
OUTPUT_SIZE = (300, 300)

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(predictor_file)


# 사진 짜르기 메소드
def getFaceDimension(rect):
    return (rect.left(), rect.top(), rect.right() - rect.left(), rect.bottom() - rect.top())


def getCropDimension(rect, center):
    width = (rect.right() - rect.left())
    half_width = width // 2
    (centerX, centerY) = center
    startX = centerX - half_width
    endX = centerX + half_width
    startY = rect.top()
    endY = rect.bottom()
    return (startX, endX, startY, endY)


# 얼굴인식후 표시 메소드
def detectAndDisplay(image):
    global name
    unknown_check = False

    start_time = time.time()
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # detect the (x, y)-coordinates of the bounding boxes corresponding
    # to each face in the input image, then compute the facial embeddings
    # for each face
    boxes = face_recognition.face_locations(rgb,
                                            model=model_method)
    encodings = face_recognition.face_encodings(rgb, boxes)
    # initialize the list of names for each face detected
    names = []

    # loop over the facial embeddings
    for encoding in encodings:
        # attempt to match each face in the input image to our known
        # encodings
        # if face_recognition.face_distance(data["encodings"], encoding) <= 0.45:
        #     matches = True
        # else :
        #     matches = False
        #
        # print(matches)
        # matches = face_recognition.compare_faces(data["encodings"], encoding)
        distance = face_recognition.face_distance(data["encodings"], encoding)

        distance_bool = []

        for i in distance:
            if i < 0.42:
                distance_bool.append(True)
            else:
                distance_bool.append(False)

        # check to see if we have found a match
        if True in distance_bool:
            # find the indexes of all matched faces then initialize a
            # dictionary to count the total number of times each face
            # was matched
            matchedIdxs = [i for (i, b) in enumerate(distance_bool) if b]
            counts = {}

            # loop over the matched indexes and maintain a count for
            # each recognized face face
            for i in matchedIdxs:
                name = data["names"][i]
                counts[name] = counts.get(name, 0) + 1

            unknown_check = True
            # determine the recognized face with the largest number of
            # votes (note: in the event of an unlikely tie Python will
            # select first entry in the dictionary)
            name = max(counts, key=counts.get)

        # update the list of names
        if unknown_check == False:
            names.append("unknown_name")
        else:
            names.append(name)
        print(names)

    # loop over the recognized faces
    for ((top, right, bottom, left), name) in zip(boxes, names):
        # draw the predicted face name on the image
        y = top - 15 if top - 15 > 15 else top + 15
        color = (0, 255, 0)
        line = 2
        if (name == "unknown_name"):
            color = (0, 0, 255)
            line = 1
            name = ''

        cv2.rectangle(image, (left, top), (right, bottom), color, line)
        y = top - 15 if top - 15 > 15 else top + 15
        cv2.putText(image, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,
                    0.75, color, line)
    end_time = time.time()
    process_time = end_time - start_time
    # print("=== A frame took {:.3f} seconds".format(process_time))
    # show the output image

    cv2.imshow("Recognition", image)

    Date = str(time.localtime().tm_year) + "-" + str(time.localtime().tm_mon) + "-" + str(
        time.localtime().tm_mday) + "-" + str(time.localtime().tm_hour) + ":" + str(time.localtime().tm_min)
    print(name, Date)

    if name != '':
        # 소켓 서버에 인증 결과 전송
        sio.emit('streaming', name)
        time.sleep(0.5)


# load the known faces and embeddings
data = pickle.loads(open(encoding_file, "rb").read())

cap = cv2.VideoCapture(0)

while True:

    success, image = cap.read()

    # image_origin = image.copy()
    try:
        image_origin = image[100:401, 170:451].copy()
    except Exception as e:
        print(str(e))

    cv2.rectangle(image, (170, 100), (450, 400), (0, 255, 255), 1)

    (image_height, image_width) = image_origin.shape[:2]
    gray = cv2.cvtColor(image_origin, cv2.COLOR_BGR2GRAY)

    rects = detector(gray, 1)

    if image is None:
        print('--(!) No captured image -- Break!')
        # close the video file pointers

        cap.release()
        # close the writer point
        break

    # 카메라 화면
    cv2.imshow("", image)

    # Hit 'q' on the keyboard to quit!
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

    # Input Data 전처리
    for (i, rect) in enumerate(rects):
        (x, y, w, h) = getFaceDimension(rect)
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)

        points = np.matrix([[p.x, p.y] for p in predictor(gray, rect).parts()])
        show_parts = points[EYES]

        right_eye_center = np.mean(points[RIGHT_EYE], axis=0).astype("int")
        left_eye_center = np.mean(points[LEFT_EYE], axis=0).astype("int")

        # cv2.circle(image, (right_eye_center[0, 0], right_eye_center[0, 1]), 5, (0, 0, 255), -1)
        # cv2.circle(image, (left_eye_center[0, 0], left_eye_center[0, 1]), 5, (0, 0, 255), -1)
        #
        # cv2.circle(image, (left_eye_center[0, 0], right_eye_center[0, 1]), 5, (0, 255, 0), -1)
        #
        # cv2.line(image, (right_eye_center[0, 0], right_eye_center[0, 1]),
        #          (left_eye_center[0, 0], left_eye_center[0, 1]), (0, 255, 0), 2)
        # cv2.line(image, (right_eye_center[0, 0], right_eye_center[0, 1]),
        #          (left_eye_center[0, 0], right_eye_center[0, 1]), (0, 255, 0), 1)
        # cv2.line(image, (left_eye_center[0, 0], right_eye_center[0, 1]),
        #          (left_eye_center[0, 0], left_eye_center[0, 1]), (0, 255, 0), 1)

        eye_delta_x = right_eye_center[0, 0] - left_eye_center[0, 0]
        eye_delta_y = right_eye_center[0, 1] - left_eye_center[0, 1]
        degree = np.degrees(np.arctan2(eye_delta_y, eye_delta_x)) - 180

        eye_distance = np.sqrt((eye_delta_x ** 2) + (eye_delta_y ** 2))
        aligned_eye_distance = left_eye_center[0, 0] - right_eye_center[0, 0]
        scale = aligned_eye_distance / eye_distance

        eyes_center = ((left_eye_center[0, 0] + right_eye_center[0, 0]) // 2,
                       (left_eye_center[0, 1] + right_eye_center[0, 1]) // 2)
        # cv2.circle(image, eyes_center, 5, (255, 0, 0), -1)

        metrix = cv2.getRotationMatrix2D(eyes_center, degree, scale)
        cv2.putText(image, "{:.5f}".format(degree), (right_eye_center[0, 0], right_eye_center[0, 1] + 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

        warped = cv2.warpAffine(image_origin, metrix, (image_width, image_height),
                                flags=cv2.INTER_CUBIC)

        (startX, endX, startY, endY) = getCropDimension(rect, eyes_center)
        croped = warped[startY:endY, startX:endX]

        try:
            output = cv2.resize(croped, OUTPUT_SIZE, cv2.INTER_AREA)
        except Exception as e:
            print(str(e))

        # 전처리한 Input Data 얼굴인식
        try:
            detectAndDisplay(output)
        except Exception as e:
            print(str(e))

        for (i, point) in enumerate(show_parts):
            x = point[0, 0]
            y = point[0, 1]
            cv2.circle(image, (x, y), 1, (0, 255, 255), -1)
    time.sleep(0.3)

cv2.destroyAllWindows()
sio.disconnect()