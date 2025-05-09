# Stage 1: Build the application
FROM node:slim AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy application files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Run the application
FROM node:slim AS runner

# Set working directory
WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm install --only=production

# Copy built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the application's port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]