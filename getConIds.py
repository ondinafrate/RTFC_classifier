import json

f = open('highlights.json')

data = json.load(f)

convSet = set()

for i in data:
    convSet.add(i['conversation_id'])

print(convSet)
 
f.close()