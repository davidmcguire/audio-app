#!/bin/bash

# Build the client
echo "Building client..."
npm run build

# Start the server in production mode
echo "Starting server in production mode..."
npm run production 