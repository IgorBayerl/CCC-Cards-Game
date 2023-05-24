import json
import os


def convert_json(input_json, language):
    input_data = json.loads(input_json)

    output_json = {
        "id": "1",
        "name": input_data["name"],
        "description": input_data["description"],
        "language": language,
        "cards": {"questions": [], "answers": []},
    }

    for idx, black_card in enumerate(input_data["blackCards"]):
        question = {"text": black_card["text"], "spaces": black_card["pick"]}
        output_json["cards"]["questions"].append(question)

    for white_card in input_data["whiteCards"]:
        answer = {"text": white_card}
        output_json["cards"]["answers"].append(answer)

    return output_json


# Read input JSON from file
with open("input_deck.json", "r", encoding="utf-8") as file:
    input_json = file.read()

language = input("Enter the language: ")
output_data = convert_json(input_json, language)

# Create 'outputs' folder if it doesn't exist
os.makedirs("outputs", exist_ok=True)

output_file = f"outputs/{language}_deck_{output_data['id']}.json"

# Check if the output file already exists
file_exists = os.path.isfile(output_file)
if file_exists:
    # Increment the ID until finding an available filename
    id_counter = 1
    while file_exists:
        id_counter += 1
        output_file = f"outputs/{language}_deck_{id_counter}.json"
        file_exists = os.path.isfile(output_file)

    output_data["id"] = str(id_counter)

with open(output_file, "w", encoding="utf-8") as file:
    json.dump(output_data, file, ensure_ascii=False, indent=4)

print(f"Output JSON file '{output_file}' generated successfully.")
