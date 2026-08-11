# ─── Build Stage ──────────────────────────────────────────
# Pinned patch for reproducible builds (was node:20-alpine — floating tag)
FROM node:20.19.1-alpine AS builder

# Install build tools needed for bcrypt native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /build

# Copy package files first (leverage Docker cache)
COPY backend/package*.json ./
RUN npm ci

# Copy source files — node_modules from host (Windows) is excluded by .dockerignore
COPY backend/ .

# Force rebuild bcrypt for Linux Alpine (avoids Windows binary mismatch)
RUN npm rebuild bcrypt --build-from-source

# ─── Production Stage ─────────────────────────────────────
FROM node:20.19.1-alpine

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
