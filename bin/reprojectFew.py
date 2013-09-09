# The imports

import json
import pyproj
import pprint
import sys

# PyProj alias

bng = pyproj.Proj(init='epsg:27700')
wgs84 = pyproj.Proj(init='epsg:4326')

# Open, load and transform every point in every line in every polygon

print "Loading and reprojecting..."

fileIn = open(sys.argv[1],"rb")

myData = json.load(fileIn)

for feature in myData['features']:
    coor = feature['geometry']['coordinates']
    if feature['geometry']['type'] == "Polygon":
        for line in coor:
            for point in line:
                point[0],point[1] = pyproj.transform(bng,wgs84,point[0],point[1])
   
    if feature['geometry']['type'] == "MultiPolygon":
        for poly in coor:
            for line in poly:
                for point in line:
                    point[0],point[1] = pyproj.transform(bng,wgs84,point[0],point[1])
    
fileIn.close()

# Dump to sys.argv[2]

print "Cutting..."

myData['features'] = myData['features'][:int(sys.argv[3])]

#myData['features'] = myData['features'][]

print "Dumping...."

fileOut = open(sys.argv[2],"wb")

json.dump(myData,fileOut,indent=4)

fileOut.close()

