# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev --workspace=server

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000
CMD ["node", "server/dist/index.js"]
