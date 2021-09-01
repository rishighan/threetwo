# ThreeTwo!

ThreeTwo! is a comic book curation app.

⚠️ This project is in early stages of development and as such, not ready for general use.

## Dependencies

ThreeTwo! currently is set up as:

1. The UI, this repo.
2. `threetwo-import-service` [https://github.com/rishighan/threetwo-import-service]
3. `comicvine-service` [https://github.com/rishighan/comicvine-service]
4. `threetwo-ui-typings` [https://github.com/rishighan/threetwo-frontend-types] which are the types used across the UI, installable as an `npm` dependency.
## Docker Instructions

The recommended approach is to simply use `docker-compose` which spins up containers for the UI and all the associated microservices and data store.
To do that:
Make sure that you have `docker` and `docker-compose` installed.

1. Clone this repo using `git clone https://github.com/rishighan/threetwo.git`
2. Create an external docker network using `docker network create proxy`
3. Run `docker-compose up --build -d`
4. Note that the first time, the process could take up to 10 minutes, since it is building containers for `threetwo`, `threetwo-import-service`, `comicvine-service`, `mongo`, `nats`, `nginx`
5. For posterity, check that all containers are up using `docker ps`

## Local Development

For debugging and troubleshooting, you can run this app locally using these steps:

1. Clone this repo using `git clone https://github.com/rishighan/threetwo.git`
2. `yarn run dev` (you can ignore the warnings)
3. This will open `http://localhost:3050` in your default browser
4. Note that this is simply the UI layer and won't offer anything beyond a scaffold. You have to spin up the microservices locally to get it to work.

