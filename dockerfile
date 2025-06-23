# Use Node.js 20 as the base image
FROM node:20


# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./


# Copy the rest of your application's source code
COPY . .


# Start the applicationß
CMD [ "node", "build/index.js" ]