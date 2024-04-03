# Bergamot-doc

The documents for [Bergamot](https://github.com/LoveLonelyTime/Bergamot).

![Bergamot social card](/static/img/bergamot-social-card.png)

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

We are using GitHub pages and GitHub actions for hosting. When you push to `main` branch, it will be deployed automatically using `.github\workflows\deploy.yml`.