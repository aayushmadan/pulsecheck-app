FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json .

RUN npm install

FROM node:22-slim

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN apt-get update -y && apt-get install -y openssl && npm run prisma:generate

EXPOSE 3000

CMD ["npm", "start"]