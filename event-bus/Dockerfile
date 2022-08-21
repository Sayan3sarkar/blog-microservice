# Specify base image
FROM node:16-alpine3.15
# FROM node:alpine

WORKDIR /usr/app
COPY ./package.json ./
RUN npm install -g pm2
RUN npm install --production

COPY ./ ./

CMD ["pm2-runtime", "ecosystem.config.js"]