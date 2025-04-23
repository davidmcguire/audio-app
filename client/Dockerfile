# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY  . .

# Install dependencies
RUN npm install

# Build the app
CMD ["npm", "run", "start"] 