import cv2
import face_recognition
import pickle

dataset_paths = ['image/son-align/', 'image/tedy-align/', 'image/Changmin-align/', 'image/unknown-align/']
names = ['Son', 'Tedy', 'ChangMin', 'Unknown']
number_images = 20
image_type = '.jpg'
encoding_file = 'encodings.pickle'

model_method = 'cnn'  # model은 CNN방식을 사용한다.

# initialize the list of known encodings and known names
knownEncodings = []
knownNames = []

# loop over the image paths
for (i, dataset_path) in enumerate(dataset_paths):
    # extract the person name from names
    name = names[i]

    for idx in range(number_images):
        file_name = dataset_path + str(idx + 1) + image_type
        print(file_name)

        # load the input image and convert it from BGR
        # to dlib ordering
        image = cv2.imread(file_name)
        print(image)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # detect the (x,y)- coordinates of the bounding boxes
        # corresponding to each face in the input image
        boxes = face_recognition.face_locations(rgb, model=model_method)

        # compute the facial embedding for the face
        encodings = face_recognition.face_encodings(rgb, boxes)

        # loop over the encodings
        for encoding in encodings:
            # add each encoding + name to our set of known names and encodings
            print(file_name, name, encoding)
            knownEncodings.append(encoding)
            knownNames.append(name)

# save the facial encodings + names to disk
data = {"encodings": knownEncodings, "names": knownNames}
f = open(encoding_file, "wb")
f.write(pickle.dumps(data))
