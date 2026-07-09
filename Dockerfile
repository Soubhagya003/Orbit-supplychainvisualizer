FROM node:20-alpine
#node-official image
#alpine - lightweight linux distribution

WORKDIR /app 
#this command telling docker -"from now on treat /app as current directory",after this evry command runs inside /app
#similar to mkdir /app,cd /app

COPY package.json package.json 
#in container it will stored as /app/package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node","server.js"]
#when container starts docker executes -> node server.js
