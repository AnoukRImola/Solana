FROM oven/bun:1 AS builder

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
RUN cd apps/server && bun run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy built output, config, and dependencies
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/tsconfig.json ./tsconfig.json
COPY --from=builder /app/apps/server/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/programs/solana-tl ./programs/solana-tl
COPY --from=builder /app/packages/allbridge ./packages/allbridge

EXPOSE 3000

CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]
