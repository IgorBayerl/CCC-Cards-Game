#! /bin/bash
docker stop ccc-cards-game-server
docker rm ccc-cards-game-server

docker rmi igorbayerl/ccc-cards-game-server:master
docker pull igorbayerl/ccc-cards-game-server:master

docker run -t -d -p 3000:3000 --name ccc-cards-game-server igorbayerl/ccc-cards-game-server:master


# this script is used to update the server
# should be in the ./~ directory
# The github pipeline will run this script


# docker run --rm -it -v "/etc/letsencrypt:/etc/letsencrypt" -v "/var/lib/letsencrypt:/var/lib/letsencrypt" certbot/certbot certonly --standalone --email dev.igorbayerl@gmail.com --agree-tos -d cyberchaoscards.com -d www.cyberchaoscards.com


# Get the certbot up and running (certbot is a bot to update the ssl certificates)
# Follow this video
# https://www.youtube.com/watch?v=sD8X4CApdpo&ab_channel=TheFullStackJunkie
# apt update
# apt upgrade
# sudo apt install snapd
# snap install --classic certbot

# sudo ln -s /snap/bin/certbot /usr/bin/certbot

