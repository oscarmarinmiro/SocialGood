import csv
import sys
import io
import pprint


fileIn = open(sys.argv[1],"rb")

csvRead = csv.reader(fileIn)

fields = csvRead.next()

locDict = {}
originDict = {}

for row in csvRead:
    latLong = str(row[9]) + str(row[10])

    if latLong != '51.500152-0.126236':
        pass

    if latLong not in locDict:
        locDict[latLong] = 0

    orig = row[8].lower()

    if orig not in originDict:
        originDict[orig] = 0

    locDict[latLong]+=1
    originDict[orig]+=1

#pprint.pprint(locDict)

#pprint.pprint(originDict)

sortedKeys = sorted(originDict.keys(), key = lambda orig: originDict[orig], reverse = True)

for key in sortedKeys:
    print "%s %d" % (key, originDict[key])
