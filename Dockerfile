### Stage 1: deps — install all dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

### Stage 2: builder — compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

### Stage 3: production — lean runtime image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
USER node

CMD ["sh", "-c", "node node_modules/.bin/typeorm -d dist/infrastructure/database/data-source.js migration:run && node dist/main"]
