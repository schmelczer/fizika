import re
import json

regex = r"\((\d+), '(.*?)', '(.*?)', '(.*?)', '(.*?)', '(.*?)', '(.*?)', (\d), '(.+?)', '(.*?)'\)"

sql = open('db/fizika.sql')
lines = sql.readlines()

result = []

for line in lines:
  match = re.match(regex, line)
  if match:
    id, source, description, a, b, c, d, correct, type, image = match.groups()
    image = f'{image}.{"png" if int(id) > 435 else "JPG"}' if image != '' else None

    result.append({
      "id": int(id),
      "source": source,
      "description": description,
      "a": a,
      "b": b,
      "c": c,
      "d": d,
      "correct": int(correct),
      "type": type,
      "image": image,
    })

json.dump(result, open('fizika.json', 'w+'), indent=2)
