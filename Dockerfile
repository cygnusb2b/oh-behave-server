FROM node:8

WORKDIR /app
COPY . /app

ENV NODE_ENV production
ENTRYPOINT ["node", "src/index.js"]
