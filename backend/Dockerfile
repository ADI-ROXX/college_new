# backend/Dockerfile

# Use an official Node.js runtime as the base image
FROM node:16

# Install Python 3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip

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

# Expose ports for both servers
EXPOSE 5080 5081

# Copy the start script
COPY start.sh .

# Give execute permission to the start script
RUN chmod +x start.sh

# Start both servers
CMD ["./start.sh"]
