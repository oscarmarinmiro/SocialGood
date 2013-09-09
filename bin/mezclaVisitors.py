import csv
import json
import sys
import pprint


# Open id translation to a dict

idTable = {}

fileIn = open(sys.argv[1],"rb")

reader = csv.reader(fileIn)

for row in reader:
    idTable[row[0]] = row[1]


fileIn.close()

#pprint.pprint(idTable)

# Open visitors info, generate a json

finalStruct = {}

fileIn = open(sys.argv[2],"rb")

reader = csv.reader(fileIn)

maxValue = -1

for row in reader:
    finalId = idTable[row[0]]
    date = row[1][1:]
    divNumber = float(row[3])
    hourData = row[4:28]
    
    newHourData = []

    for myData in hourData:
        number = float(myData) / divNumber / 16620.0
        if number > maxValue:
            maxValue = number
        newHourData.append(number)

    if finalId not in finalStruct:
        finalStruct[finalId] = {}

    finalStruct[finalId][date] = newHourData

fileIn.close()

#pprint.pprint(finalStruct)

fileOut = open(sys.argv[3],"wb")

json.dump(finalStruct,fileOut,indent=4)

fileOut.close()

print maxValue
    


