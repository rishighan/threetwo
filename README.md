# ThreeTwo!

ThreeTwo! _aims to be_ a comic book curation app.

[![Docker Image CI](https://github.com/rishighan/threetwo/actions/workflows/docker-image.yml/badge.svg)](https://github.com/rishighan/threetwo/actions/workflows/docker-image.yml)

### Screenshots

![](https://github.com/rishighan/threetwo-visual-updates/raw/67e56878eb0381c73c1dea746a45253d3dcaa184/update_december_2022/Dashboard.png)

![](https://github.com/rishighan/threetwo-visual-updates/raw/67e56878eb0381c73c1dea746a45253d3dcaa184/update_december_2022/Library.png)

![](https://github.com/rishighan/threetwo-visual-updates/raw/67e56878eb0381c73c1dea746a45253d3dcaa184/update_december_2022/DC%2B%2B%20integration.png)

![](https://github.com/rishighan/threetwo-visual-updates/raw/67e56878eb0381c73c1dea746a45253d3dcaa184/update_december_2022/ComicVine%20Matching.png)


### 🦄 Early Development Support Channel

Please help me test the early builds of `ThreeTwo!` on its official [Discord](https://discord.gg/n4HZ4j33uT)

Discuss ideas and implementations with me, and get status, progress updates!

## Dependencies

ThreeTwo! currently is set up as:

1. The UI, this repo.
2. [threetwo-core-service](https://github.com/rishighan/threetwo-core-service)
3. [threetwo-metadata-service](https://github.com/rishighan/threetwo-metadata-service)
4. [threetwo-ui-typings](https://github.com/rishighan/threetwo-frontend-types) which are the types used across the UI, installable as an `npm` dependency.

## Docker Instructions

See [threetwo-docker-compose](https://github.com/rishighan/threetwo-docker-compose) for instructions on building the entire stack.

## Local Development

For debugging and troubleshooting, you can run this app locally using these steps:

1. Clone this repo using `git clone https://github.com/rishighan/threetwo.git`
2. `yarn run dev` (you can ignore the warnings)
3. This will open `http://localhost:5173` in your default browser
4. Note that this is simply the UI layer and won't offer anything beyond a scaffold. You have to spin up the microservices locally to get it to work.


## Troubleshooting
### Docker

1. `docker-compose up` is taking a long time
   
   This is primarily because `threetwo-import-service` pulls `calibre` from the CDN and it has been known to be extremely slow. I can't find a more reliable alternative, so give it some time to finish downloading.

2. What folder do my comics go in?
   
   Your comics go in the `comics` directory at the root of this project.
   

## Contribution Guidelines

See [contribution guidelines](https://github.com/rishighan/threetwo/blob/master/contributing.md)

