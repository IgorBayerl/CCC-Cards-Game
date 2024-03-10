import requests

def fetch_deck_data(deck_id):
    print(f">>> Fetching deck {deck_id}")
    url = f"https://decks.rereadgames.com/api/decks/{deck_id}"
    headers = {
        'accept': '*/*',
        'accept-language': 'en,en-US;q=0.9',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'referer': f'https://decks.rereadgames.com/decks/{deck_id}',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    response = requests.get(url, headers=headers)
    print(f">>> Deck {deck_id} fetched")
    return response.json()

def convert_to_new_format(original_data):
    print(f">>> Converting deck {original_data.get('name')}")
    title = original_data.get("name")
    description = "Converted from original deck"  # You can customize this
    darknessLevel = 3  # Placeholder, adjust as needed
    icon = "icon_identifier_or_url"  # Placeholder, adjust as needed
    language = original_data.get("language", "en")  # Assuming default to "en"
    
    questions = []
    for call in original_data.get("calls", []):
        # Initialize an empty string for the question text
        call_text = ""
        placeholder_count = 0
        
        # Process each part of the call
        for part in call[0]:
            if part == "" or isinstance(part, dict):
                # For each placeholder, add "___" to the call text and increment the count
                call_text += "___"
                placeholder_count += 1
            else:
                # For normal text, just append it to the call text
                call_text += part
        
        # Ensure there's at least one space if placeholder_count is zero
        spaces = max(1, placeholder_count)
        
        questions.append({"text": call_text, "spaces": spaces})
    
    answers = [{"text": response} for response in original_data.get("responses", [])]
    
    new_data = {
        "title": title,
        "description": description,
        "darknessLevel": darknessLevel,
        "icon": icon,
        "language": language,
        "cards": {
            "questions": questions,
            "answers": answers
        }
    }
    
    return new_data



def post_new_deck(new_deck_data):
    print(f">>> Posting deck {new_deck_data['title']}")
    post_url = "http://localhost:2567/decks/decks/new-with-cards"  # Replace with your actual Node.js app endpoint URL for adding decks
    response = requests.post(post_url, json=new_deck_data)
    return response.json()

# Main flow
if __name__ == "__main__":
    # deck_id = input("Enter the deck ID: ")  # For example, "DNGXN"
    deck_id = "M4G6Q"
    original_data = fetch_deck_data(deck_id)
    print(">>>>")
    new_deck_data = convert_to_new_format(original_data)
    post_response = post_new_deck(new_deck_data)
    print(post_response)
