# Use the Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (pnpm's lock file)
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install

# Copy the entire app code
COPY . .

# Build the NestJS application
RUN pnpm run build

# Expose the port for the application
EXPOSE 2002

# Start the application
CMD ["pnpm", "run", "start:prod"]
