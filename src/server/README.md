# Server side boilerplate with MongoDB as database, Express framework with Typescript

## Introduction

In the Server side of boilerplate, MongoDB and Express framework with Typescript has been utilized to reach a well structured and fully separated concerns source code.
the source code has been separated into multiple layers and every layer fully explaind with lots of details in their own README files.


### Nodemon

Nodemon is a utility monitors for any changes in the server-side source code, and automatically restarts the server. Nodemon is just for development purposes only.
**nodemon.json** file is used to hold the configurations for Nodemon.

### Express

Express is a web application framework for Node.js. It is used to build our backend API's.

**src/server/index.ts** is the entry point to the server application which starts a server and listens on port 8085 for connections. The app responds with `{username: <username>}` for requests to the URL (/api/test). It is also configured to serve the static files from **dist** directory.
