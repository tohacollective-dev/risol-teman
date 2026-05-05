FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 3001

WORKDIR /app/backend

CMD ["node", "server.js"]
