import pprint
import json
import sys

fileIn = open(sys.argv[1],"rb")

visData = json.load(fileIn)

fileIn.close()

fileIn = open(sys.argv[2],"rb")

londonData = json.load(fileIn)

fileIn.close()

londonData['data']['foots'] = visData

fileOut = open(sys.argv[3],"wb")

json.dump(londonData,fileOut,indent=4)

fileOut.close()



