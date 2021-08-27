FROM node:buster
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

RUN mkdir -p /usr/src/threetwo
WORKDIR /usr/src/threetwo

RUN apt-get -y install glibc xdg-utils python xvfb imagemagick
RUN wget --no-check-certificate -nv -O- https://raw.githubusercontent.com/kovidgoyal/calibre/master/setup/linux-installer.py | sudo python -c "import sys; main=lambda:sys.stderr.write('Download failed\n'); exec(sys.stdin.read()); main()"

COPY package.json /usr/src/threetwo
COPY nodemon.json /usr/src/threetwo

RUN npm i -g yarn && \
    yarn

COPY . /usr/src/threetwo
EXPOSE 3050

CMD yarn run dev