FROM node:8

WORKDIR /app
COPY . /app

EXPOSE 8266

ENV NODE_ENV production
ENTRYPOINT ["node", "src/index.js"]
