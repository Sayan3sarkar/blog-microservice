# Specify base image
FROM node:16-alpine3.15
# FROM node:alpine

# Set working directory
WORKDIR /usr/app

# Install dependencies
COPY ./package.json ./
RUN npm install -g pm2
RUN npm install --production

# Copy codebase
COPY ./ ./

# Execute container command
CMD ["pm2-runtime", "ecosystem.config.js"]