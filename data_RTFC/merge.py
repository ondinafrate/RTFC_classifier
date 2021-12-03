import json
import csv

f = open('highlights.json')

data = json.load(f)

highlight_text = {}

with open('highlight_text.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        highlight_text[row['highlight_id']] = row['highlight_words']

for i in data:
    hConvId = i['conversation_id']
    hAnnotationId = i['id']

    with open(str(hConvId) + ".json", "r") as jsonFile:
        convData = json.load(jsonFile)
        
    snippetIds = convData['data']['entities']['annotations'][str(hAnnotationId)]['snippet_ids']

    for snippetId in snippetIds:
        convData['data']['entities']['snippets'][str(snippetId)]['tags'] = i['tags']
        if str(hAnnotationId) in highlight_text:
            convData['data']['entities']['snippets'][str(snippetId)]['highlight_words'] = highlight_text[str(hAnnotationId)]
            convData['data']['entities']['snippets'][str(snippetId)]['highlight_id'] = hAnnotationId
            convData['data']['entities']['snippets'][str(snippetId)]['neighborhood'] = i['neighborhood']
            print("added words for " + str(hAnnotationId))
        
    
    with open(str(hConvId) + ".json", 'w', encoding='utf-8') as f:
        json.dump(convData, f, ensure_ascii=False, indent=4)

 
f.close()