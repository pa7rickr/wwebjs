FROM node:lts-buster

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  chromium \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN npm install

RUN npm install yt-search

RUN npm install pm2 -g

COPY . .

CMD ["pm2", "start", "node", "--", "index.js", "--db", "mongodb+srv://pa7rickr:123Patrickr@cluster0.bo7ovfq.mongodb.net/?retryWrites=true&w=majority", "--server", "&&", "pm2", "save", "&&", "pm2", "logs"]
