FROM node:18-alpine
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev
# Bundle app source
RUN apk add --no-cache nodejs npm
RUN npm install -g faker

COPY . .
EXPOSE 5000
CMD [ "node", "src/index.js" ]

CMD [ "k6", "run", "src/testing/fakerless/load_test.js" ]