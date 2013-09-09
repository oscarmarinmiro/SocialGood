import shapefile
import sys
import pprint

reader = shapefile.Reader(sys.argv[1])
fields = reader.fields

pprint.pprint(fields)
