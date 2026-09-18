# Multi-stage build produksi — Next.js 15 (App Router).
#   docker build --build-arg SITE_URL=https://domain-anda -t niumination .
#   docker run -p 3000:3000 --env-file .env.local niumination
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG SITE_URL=https://niumination.github.io
ENV SITE_URL=$SITE_URL
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
