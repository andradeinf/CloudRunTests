FROM node:16-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server.js ./

CMD ["npm", "run", "start"]