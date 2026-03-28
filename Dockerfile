FROM oven/bun:1 AS builder

# Cache buster - change to force rebuild
ARG CACHEBUST=1

WORKDIR /app

# Copy monorepo root files
COPY package.json bun.lock ./

# Copy workspace packages needed by server
COPY programs/solana-tl/ programs/solana-tl/
COPY packages/allbridge/ packages/allbridge/

# Copy server
COPY apps/server/ apps/server/

# Install dependencies
RUN bun install

# Build server
RUN cd apps/server && rm -rf dist && bun run build \
    && echo "=== BUILD VERIFICATION ===" \
    && head -20 dist/auth/auth.service.js

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy built output and dependencies
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/programs/solana-tl ./programs/solana-tl
COPY --from=builder /app/packages/allbridge ./packages/allbridge

EXPOSE 3000

CMD ["node", "dist/main.js"]
