import json

f = open('highlights.json')

data = json.load(f)


for i in data:
    hConvId = i['conversation_id']
    hAnnotationId = i['id']

    with open(str(hConvId) + ".json", "r") as jsonFile:
        convData = json.load(jsonFile)
        
    snippetIds = convData['data']['entities']['annotations'][str(hAnnotationId)]['snippet_ids']

    for snippetId in snippetIds:
        convData['data']['entities']['snippets'][str(snippetId)]['tags'] = i['tags']
    
    with open(str(hConvId) + ".json", 'w', encoding='utf-8') as f:
        json.dump(convData, f, ensure_ascii=False, indent=4)

 
f.close()