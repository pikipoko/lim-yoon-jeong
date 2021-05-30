import face_recognition
import pickle
import time
import dlib
import numpy as np
import cv2
import os
import socketio

# sio = socketio.Client()
# sio.connect('http://127.0.0.1:3300')

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



image_total = 0
img_num = 0
true_count = 0


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
    unknown_check = False

    start_time = time.time()
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    boxes = face_recognition.face_locations(rgb,
                                            model=model_method)
    encodings = face_recognition.face_encodings(rgb, boxes)
    names = []

    # loop over the facial embeddings
    for encoding in encodings:

        distance = face_recognition.face_distance(data["encodings"], encoding)
        # print(distance)
        distance_bool = []

        for i in distance:
            if i < 0.43:
                distance_bool.append(True)
            else:
                distance_bool.append(False)

        # check to see if we have found a match
        if True in distance_bool:
            matchedIdxs = [i for (i, b) in enumerate(distance_bool) if b]
            counts = {}


            for i in matchedIdxs:
                name = data["names"][i]
                counts[name] = counts.get(name, 0) + 1

            unknown_check = True


            # print(counts)

            name = max(counts, key=counts.get)

        if unknown_check == False:
            names.append("unknown_name")
        else:
            names.append(name)

    # loop over the recognized faces
    for ((top, right, bottom, left), name) in zip(boxes, names):
        y = top - 15 if top - 15 > 15 else top + 15
        color = (0, 255, 0)
        line = 2
        if (name == "unknown_name"):
            color = (0, 0, 255)
            line = 1
            name = '_None'

        cv2.rectangle(image, (left, top), (right, bottom), color, line)
        y = top - 15 if top - 15 > 15 else top + 15
        cv2.putText(image, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,
                    0.75, color, line)
    end_time = time.time()

    return name

    process_time = end_time - start_time
    # print("=== A frame took {:.3f} seconds".format(process_time))
    # show the output image

    # cv2.imshow(cl+TestImage, image)

    Date = str(time.localtime().tm_year) + "-" + str(time.localtime().tm_mon) + "-" + str(
        time.localtime().tm_mday) + "-" + str(time.localtime().tm_hour) + ":" + str(time.localtime().tm_min)
    print(name, Date)

    # if name != '':
    #     # 소켓 서버에 인증 결과 전송
    #     sio.emit('streaming', name)
    #     time.sleep(0.5)


data = pickle.loads(open(encoding_file, "rb").read())

folder_path = './image/Test'
image_name = []
myFolderList = os.listdir(folder_path)

print(myFolderList)
for cl in myFolderList:
    image_path = folder_path + '/' + cl
    myImageList = os.listdir(image_path)

    for TestImage in myImageList:
        img_num = img_num + 1
        image_file_path =  image_path + '/' + TestImage

        # print(image_file_path)

        image = cv2.imread(image_file_path)

        # cv2.imshow("", image)
        (image_height, image_width) = image.shape[:2]
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        rects = detector(gray, 1)  # gray에 있는 얼굴들 get_frontal_face_detector을 통하여 전면 얼굴 검출하기

        # Input Data 전처리
        image_total += 1

        for (i, rect) in enumerate(rects):
            (x, y, w, h) = getFaceDimension(rect)

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

            warped = cv2.warpAffine(image, metrix, (image_width, image_height),
                                    flags=cv2.INTER_CUBIC)

            (startX, endX, startY, endY) = getCropDimension(rect, eyes_center)
            croped = warped[startY:endY, startX:endX]

            try:
                output = cv2.resize(croped, OUTPUT_SIZE, cv2.INTER_AREA)
            except Exception as e:
                print(str(e))
            # 전처리한 Input Data 얼굴인식
            try:
                identify_name = detectAndDisplay(output)
            except Exception as e:
                print(str(e))

            if identify_name == cl:
                true_count = true_count + 1
                print(cl+TestImage)
                # print(True)


print(true_count/img_num)
print(image_total)

cv2.destroyAllWindows()
# sio.disconnect()