FROM node:22-slim

RUN npm install -g bun

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
RUN cd apps/server && rm -rf dist && bun run build

WORKDIR /app/apps/server

EXPOSE 3000

CMD ["node", "dist/main.js"]
