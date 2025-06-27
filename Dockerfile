# Use the Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (pnpm's lock file)
COPY package.json ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install

RUN pnpm install express

COPY .env .env
# Copy the entire app code
COPY . .

# Generate Prisma Client (requires schema.prisma to be present)
RUN pnpm prisma generate

# Build the NestJS application
RUN pnpm run build

# Expose the port for the application
EXPOSE 2002

# Start the application
CMD ["pnpm", "run", "start:prod"]
