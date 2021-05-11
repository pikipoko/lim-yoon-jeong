import numpy as np
import sys

print(np.__version__)

def name(code):
    print(code)
    return "james"

print(name(sys.argv[1]))
