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
RUN npm install --legacy-peer-deps

# Build server
RUN cd apps/server && rm -rf dist && npm run build

WORKDIR /app/apps/server

EXPOSE 3000

# Use npm start which includes dotenv config
CMD ["npm", "run", "start"]
