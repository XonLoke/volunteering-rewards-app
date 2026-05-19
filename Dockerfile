FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ .

# Copy frontend static files
COPY frontend/ ../frontend/

EXPOSE 3000

CMD ["node", "index.js"]
