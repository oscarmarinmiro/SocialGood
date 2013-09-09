import json
import sys

fileIn = open(sys.argv[1],"rb")

data = json.load(fileIn)

id = 0

for feature in data['features']:
#    if(feature['geometry']['type']=="MultiPolygon"):
#        print id
    print str(id)+","+feature['properties']['LSOA11CD']
    id+=1


