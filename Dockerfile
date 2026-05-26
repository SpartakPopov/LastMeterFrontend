# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY LastMeterFrontend/package.json LastMeterFrontend/package-lock.json* ./
RUN npm install

# Copy the rest of the application source code
COPY LastMeterFrontend/ .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
