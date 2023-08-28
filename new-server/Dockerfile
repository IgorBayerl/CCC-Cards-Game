# Colyseus.js Server
FROM node:14 AS colyseus-server

WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY . .

EXPOSE 2567

CMD ["npm", "start"]
