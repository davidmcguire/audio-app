# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY  . .

# Install dependencies
RUN npm install
RUN npm install -g serve

# Build the app
CMD ["serve", "-s", "build"] 