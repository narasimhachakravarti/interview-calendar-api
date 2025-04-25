# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the NestJS project
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main"]
