FROM node:17.3-alpine
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

WORKDIR /threetwo

COPY package.json ./
COPY yarn.lock ./
COPY nodemon.json ./
COPY jsdoc.json ./

# RUN apt-get update && apt-get install -y git python3 build-essential autoconf automake g++ libpng-dev make
RUN apk --no-cache add g++ make libpng-dev python3 git libc6-compat autoconf automake  bash libjpeg-turbo-dev libpng-dev mesa-dev mesa libxi build-base gcc libtool nasm
RUN yarn --ignore-engines


COPY . .
EXPOSE 3050

ENTRYPOINT [ "npm", "start" ]