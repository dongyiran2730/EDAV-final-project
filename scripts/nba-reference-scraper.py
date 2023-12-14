import requests
from bs4 import BeautifulSoup
import csv

url = 'https://www.basketball-reference.com/leaders/most_championships.html'

# Fetch the webpage and the relevant tags
response = requests.get(url)
player_data = []
if response.status_code == 200:
    soup = BeautifulSoup(response.content, 'html.parser')
    player_data = soup.find_all('tr')
else:
    print("Failed to retrieve the webpage")

# Retrieve player name and championships from tags
player_dict = {}
for player in player_data:
    if player.find('td', {'data-stat': 'player'}):
        player_name = player.find('td', {'data-stat': 'player'}).get_text(strip=True).rstrip('*')
        champ_count = player.find('td', {'data-stat': 'champ_count'}).get_text(strip=True)
        player_dict[player_name] = champ_count

# Export data to file
filename = 'championship_players.csv'
with open(filename, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Player Name', 'Total'])
    for key, value in player_dict.items():
        writer.writerow([key, value])
