FROM ubuntu:latest
RUN apt-get update && \
    apt-get install -y curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install || true
COPY . .
CMD ["node", "architect.mjs"]
