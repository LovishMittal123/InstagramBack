FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install deps based on the lockfile if present
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Default port
ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/app.js"]
