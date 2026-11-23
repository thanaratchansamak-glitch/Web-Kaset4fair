# Multi-stage Dockerfile: React Frontend + Node.js Backend + SQLite
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app

# Install native compilation dependencies for SQLite
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/server.js backend/exhibitions-seed.js ./
COPY --from=frontend-builder /app/backend/public ./public

EXPOSE 4001
ENV PORT=4001
ENV NODE_ENV=production
ENV DB_PATH=/app/data/kaset4fair.db

CMD ["node", "server.js"]
