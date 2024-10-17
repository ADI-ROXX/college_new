# backend/Dockerfile

# Use an official Node.js runtime as the base image
FROM node:16

# Install Python 3 and pip, and required tools
RUN apt-get update && \
    apt-get install -y python3 python3-pip wget gnupg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install MongoDB
RUN wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - && \
    echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list && \
    apt-get update && \
    apt-get install -y mongodb-org && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json for Node.js dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy requirements.txt for Python dependencies
COPY ./requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir -r ./requirements.txt

# Copy the rest of the backend application code
COPY . .

# Create data directory for MongoDB
RUN mkdir -p /app/data/db

# Expose ports for servers
EXPOSE 5080 5081

# Copy the start script
COPY start.sh .

# Give execute permission to the start script
RUN chmod +x start.sh

# Start all services
CMD ["./start.sh"]
