# Use Node.js 22 as the base image
FROM node:22-alpine

LABEL maintainer="Rishi Ghan <rishi.ghan@gmail.com>"

# Set the working directory inside the container
WORKDIR /threetwo

# Copy package.json and yarn.lock to leverage Docker cache
COPY package.json yarn.lock ./

# Install build dependencies necessary for native modules (for node-sass)
RUN apk --no-cache add \
    g++ \
    make \
    python3 \
    autoconf \
    automake \
    libtool \
    nasm \
    git

# Install node modules
RUN yarn install --ignore-engines

# Explicitly install sass
RUN yarn add -D sass

# Copy the rest of the application files into the container
COPY . .

# Expose the application port (default for Vite)
EXPOSE 5173

# Start the application with yarn
ENTRYPOINT ["yarn", "start"]
