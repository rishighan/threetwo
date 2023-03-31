FROM node:18.15.0-alpine
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

WORKDIR /threetwo

COPY package.json ./
COPY yarn.lock ./
COPY nodemon.json ./
COPY jsdoc.json ./

# RUN apt-get update && apt-get install -y git python3 build-essential autoconf automake g++ libpng-dev make
RUN apk --no-cache add g++ make libpng-dev git python3 libc6-compat autoconf automake libjpeg-turbo-dev libpng-dev mesa-dev mesa libxi build-base gcc libtool nasm
RUN yarn --ignore-engines


COPY . .
EXPOSE 5173

ENTRYPOINT [ "npm", "start" ]