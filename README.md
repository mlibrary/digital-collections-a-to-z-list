# Digital Collections

> Maintained by the [Digial Collections Project Tech Build Team](dcp-tech-build-team@umich.edu)

## Development Quick Start

Clone the repo

```
git clone https://github.com/mlibrary/digital-collections-landing.git
```

Install 11ty and dependencies

```
npm install
```

Start development server, build public folder, and watch Sass files

```
npm start
```

View in browser

```
http://localhost:8080
```

## Dev Scripts

- `npm start` to start the eleventy server (serves the `/public` folder) and watch the Sass `scss` folder
- `npm build` to create a production build. Outputs into `/public`.

### Building and watching files

`npm-run-all` is a CLI tool to run multiple npm-scripts in parallel or sequential. This is used in the dev scripts to watch Sass files and hot reload 11ty files in parallel.

---

## Resources

**11ty**

Please visit the official [11ty](https://www.11ty.dev/docs/) docs.

## Bug Reports

Please file an issue or submit a PR.
