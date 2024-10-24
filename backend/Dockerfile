FROM node:16 AS base

RUN apt-get update && \
    apt-get install -y python3 python3-pip supervisor wget gnupg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 5080 5081
CMD ["supervisord", "-c", "supervisord.conf"]
