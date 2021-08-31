FROM node:12-alpine
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

RUN mkdir -p /usr/src/threetwo
WORKDIR /usr/src/threetwo

COPY package.json yarn.lock /usr/src/threetwo/
COPY nodemon.json /usr/src/threetwo
COPY jsdoc.json /usr/src/threetwo

RUN apk add --no-cache --virtual .build-deps make gcc g++ python \
 && yarn \
 && apk del .build-deps


COPY . /usr/src/threetwo
EXPOSE 3050

CMD npm start 