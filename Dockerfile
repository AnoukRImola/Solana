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

# Install dependencies with bun (supports workspace:*)
RUN bun install

# Build server with npm (more stable with NestJS)
RUN cd apps/server && rm -rf dist && npx nest build

WORKDIR /app/apps/server

EXPOSE 3000

# Use npm start which includes dotenv config
CMD ["npm", "run", "start"]
