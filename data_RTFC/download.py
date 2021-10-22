import urllib.request 


opener = urllib.request.build_opener()
opener.addheaders = [('Cookie', 'sessionid=mirv6jjjahmisytqoquz1nzj8de3imnb')]
urllib.request.install_opener(opener)

fruits = [1412, 1413, 1414, 1434, 1441, 1442, 1446, 1447, 1463, 1464, 1465, 1466, 1478, 1483, 1484, 1489, 1490, 1495, 1496, 1497, 1499, 1503, 1504, 1379, 1380, 1508, 1382, 1509, 1511, 1512, 1521, 1527, 1528, 1529, 1530, 1403, 1406, 1407]
for x in fruits:
  print(x)
  urllib.request.urlretrieve("https://app.lvn.org/api/conversations/detail/" + str(x), str(x) + ".json")

