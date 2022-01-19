FROM node:17.3-alpine
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

RUN mkdir -p /usr/src/threetwo
WORKDIR /usr/src/threetwo

COPY package.json /usr/src/threetwo
COPY yarn.lock /usr/src/threetwo
COPY nodemon.json /usr/src/threetwo
COPY jsdoc.json /usr/src/threetwo

# RUN apt-get update && apt-get install -y git python3 build-essential autoconf automake g++ libpng-dev make
RUN apk --no-cache add g++ make libpng-dev python3 git libc6-compat autoconf automake  bash libjpeg-turbo-dev libpng-dev mesa-dev mesa libxi build-base gcc libtool nasm
RUN yarn --ignore-engines


COPY . /usr/src/threetwo
EXPOSE 3050

ENTRYPOINT [ "npm", "start" ]