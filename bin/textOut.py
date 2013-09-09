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
    print row[7]
