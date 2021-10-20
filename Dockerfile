FROM node:12.21.0
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

RUN mkdir -p /usr/src/threetwo
WORKDIR /usr/src/threetwo

COPY package.json /usr/src/threetwo
COPY yarn.lock /usr/src/threetwo
COPY nodemon.json /usr/src/threetwo
COPY jsdoc.json /usr/src/threetwo

RUN yarn
ENV DOCKER_SOCKET_HOST cat /etc/hostname

COPY . /usr/src/threetwo
EXPOSE 3050

CMD npm start 