# ─── Build Stage ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files and install ALL dependencies (dev included for migrations)
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/ .

# Rebuild native modules for Alpine Linux (avoids Windows/Linux binary mismatch)
RUN npm rebuild bcrypt --build-from-source

# ─── Production Stage ─────────────────────────────────────
FROM node:20-alpine

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production dependencies only
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/ .

# Copy frontend static files for serving
COPY frontend/ ./frontend/

EXPOSE 3000

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "index.js"]
