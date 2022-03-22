FROM node:12.17.0-alpine
# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY ./.env.enc ./
COPY ./resources/ ./resources
RUN npm install
RUN npm run build
EXPOSE 80

CMD [ "npm", "run", "start" ]
