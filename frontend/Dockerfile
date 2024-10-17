# frontend/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:18.17.1

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000 (the default port for Next.js)
EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "start"]
