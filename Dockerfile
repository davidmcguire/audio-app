FROM node:16 AS build

WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install

# Install server dependencies and copy server code
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Install client dependencies and copy client code
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./

# Build client
RUN npm run build

# Second stage: lightweight production image
FROM node:18-alpine

WORKDIR /app

# Copy necessary package files for production server dependencies
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only for root and server
RUN npm install --only=production
RUN cd server && npm install --only=production

# Copy server code
COPY server ./server
# Copy built client files from build stage
COPY --from=build /app/client/build ./client/build
# Copy necessary root files
COPY *.js *.json ./

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "run", "production"] 