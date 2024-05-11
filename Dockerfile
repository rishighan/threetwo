FROM node:18.15.0-alpine
LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

WORKDIR /threetwo

# Copy package.json and lock file first to leverage Docker cache
COPY package.json ./
COPY yarn.lock ./

# Install build dependencies necessary for native modules
RUN apk --no-cache add g++ make libpng-dev git python3 autoconf automake libjpeg-turbo-dev mesa-dev mesa libxi build-base gcc libtool nasm

# Install node modules
RUN yarn install --ignore-engines

# Copy the rest of the application
COPY . .

EXPOSE 5173

# Use yarn start if you want to stick with yarn, or change to npm start if you prefer npm
ENTRYPOINT [ "yarn", "start" ]
