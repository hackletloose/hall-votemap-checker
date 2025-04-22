FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY src/ ./src/
COPY .env ./.env

CMD ["node", "src/main.mjs"]
