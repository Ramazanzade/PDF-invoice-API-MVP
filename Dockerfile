FROM mcr.microsoft.com/playwright:v1.48.2-jammy

RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-noto-core \
 && fc-cache -f \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]