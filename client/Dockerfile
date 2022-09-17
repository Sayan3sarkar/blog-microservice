# Specify base image
FROM node:16-alpine3.15
 
# Add the following lines
ENV CI=true
ENV WDS_SOCKET_PORT=0
 
# Set working directory
WORKDIR /usr/app

# Install dependencies
COPY ./package.json ./
RUN npm install --omit=dev

# Copy codebase
COPY ./ ./
 
CMD ["npm", "start"]