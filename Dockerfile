FROM node:12.21.0
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

ENV UNDERLYING_HOST ghost

RUN mkdir -p /usr/src/threetwo
WORKDIR /usr/src/threetwo

COPY package.json /usr/src/threetwo
COPY yarn.lock /usr/src/threetwo
COPY nodemon.json /usr/src/threetwo
COPY jsdoc.json /usr/src/threetwo

RUN yarn

COPY . /usr/src/threetwo
EXPOSE 3050

ENTRYPOINT [ "npm", "start" ]