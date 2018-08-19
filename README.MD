# Monorepo

- [Monorepo](#monorepo)
  - [Pre-requirements](#pre-requirements)
    - [Local NPM registry](#local-npm-registry)
  - [Getting started](#getting-started)
    - [Repository initialization](#repository-initialization)
    - [Setting up package manager](#setting-up-package-manager)
    - [TypeScript](#typescript)
      - [Installation](#installation)
      - [Configuration](#configuration)
      - [Checking types](#checking-types)
    - [Peer dependencies](#peer-dependencies)
    - [First package](#first-package)

How it works...

## Pre-requirements

Packages:

- NodeJS LTS
- [yarn v1.5+]()
- [Lerna v3+](https://github.com/lerna/lerna)

### Local NPM registry

Local NPM registry will be used in whole article to avoid publishing to global registry plenty of test packages.

## Getting started

### Repository initialization

Simply run next command to have initial structure created by Lerna

```bash
$ lerna init
```

A little bit of important theory about Versioning.

Lerna supports two types of packages versioning:

1.  Independent
2.  Exact

When **exact** type is chosen, Lerna will use the same version for all packages in monorepo. In case when **independent** version is selected, Lerna will release each package with independent version. More details about versioning is on [official Lerna page](https://github.com/lerna/lerna#how-it-works)

This article will consider only independent versioning for all packages.

Going back to real examples:

```
$ lerna init --independent
lerna info version 3.1.1
lerna info Updating package.json
lerna info Creating lerna.json
lerna info Creating packages directory
lerna success Initialized Lerna files
```

and new repository for packages with independent versioning is ready.

### Setting up package manager

By default lerna is using NPM, however, it's quite simple to set Yarn as package manager:

```json
{
  "npmClient": "yarn"
}
```

### TypeScript

TypeScript could be used in two approaches:

- pure TypeScript
- [@babel/preset-typescript](https://babeljs.io/docs/en/next/babel-plugin-transform-typescript.html) with TypeScript preset

Implementation from @babel does not have all features from latest TypeScript, however, in case of usage Babel we do not miss all cool plugins and integration with all tools looks much easier.

Let's take care about Babel and use all benefits from whole set of plugins already created.

#### Installation

Just hit next command to install all required plugins and presets:

```bash
$ yarn add -DW @babel/cli @babel/core @babel/preset-typescript @babel/preset-env babel-bridge babel-core@7.0.0-bridge.0 @babel/preset-react typescript
```

`babel-core@7.0.0-bridge.0` should be noticed separately as it's needed for properly resolving `babel-core` packages for all libs which requires old version of babel and to avoid duplicated packages installed. Next line whould be added to the root `package.json`:

```json
{
  "resolves": {
    "babel-core": "^7.0.0-bridge.0"
  }
}
```

#### Configuration

Let's configure `babel.config.js` with next data:

```javascript
module.exports = api => {
  api.cache(true);

  return {
    presets: [
      [
        "@babel/env",
        {
          targets: {
            browsers: "Last 2 Chrome versions, Firefox ESR",
            node: "8.9"
          }
        }
      ],
      "@babel/preset-react",
      "@babel/preset-typescript"
    ],
    ignore: ["node_modules"]
  };
};
```

Configuration is quite simple and trivial - [@babel/preset-react](https://babeljs.io/docs/en/next/babel-preset-react) and [@babel/preset-typescript](https://babeljs.io/docs/en/next/babel-preset-typescript) plus simple config for [@babel/preset-env](https://babeljs.io/docs/en/next/babel-preset-env). In Release candidate version Babel team has removed support for `stage-*` and `preset-201*` packages, so it means that all actually used plugins should be set by users manually.

Apart from removing `stage-*` packages, Babel has changed approach for looking up config files - it looks for config in `cwd` till the first `package.json`. More details could be found in [official Babel documentation](https://babeljs.io/docs/en/next/babelrc)

Due to this changes, build command in monorepo should have path to `.babelrc` or `babel.config.js` specified. It could be done directly in build commands:

1.  In root package.json:

```json
{
  "scripts": {
    "build":
      "lerna exec --parallel 'babel src --out-dir dist --source-maps --copy-files --extensions .ts,.tsx --config-file ../...babel.config.js --delete-dir-on-start --no-comments'"
  }
}
```

2.  `build` command in each package. In this case each of packages could be built independently without `lerna`. In this case `build` command is a little bit different:

```json
{
  "scripts": {
    "build":
      "babel src --out-dir dist --source-maps --copy-files --extensions .ts,.tsx --delete-dir-on-start --config-file ../../babel.config.js --no-comments"
  }
}
```

Another way how to treat parent babel config is `extends` option provided by latest babel. The easiest approach for that is setting next lines in `package.json` on package level:

```json
{
  "extends": "../../babel.config.js"
}
```

#### Checking types

[@babel/plugin-transform-typescript](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-typescript) does not perform type-check for it's input. However, it could be checked with pure `typescript`. It can be run with option `noEmit` and it will check types only, without emitting any code.

Let's create minimal required `tsconfig.json` in the root of monorepo:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "strict": true,
    "jsx": "react",
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "rootDir": "./",
    "baseUrl": "./",
    "paths": {
      "*": ["node_modules", "packages"]
    }
  },
  "include": ["packages"],
  "exclude": ["node_modules"]
}
```

and put it in `prebuild` step to run type checks automatically prior each build

```json
{
  "scripts": {
    "prebuild": "tsc"
  }
}
```

### Peer dependencies

Lerna does not have ability to add peer dependency for packages. Nevertheless, it can be done with yarn workspaces - all we need is just add workspaces definition to the root `package.json`

```json
  "workspaces": [
    "packages/*"
  ]
```

In our case `react` is definitely peerDependency as our packages will have it, however we don't want to have plenty of dependencies on each package.
As we decided to set `react` as peer dependency, we still should have it, and associated types definitions for typescript, installed in our `node_modules`. So let's add it as `devDependency` to the root of monorepo:

```bash
yarn add -DW react @types/react
```

### First package

Let's init first package

```
$ mkdir packages/login-form && cd packages/login-form/
$ yarn init
yarn init v1.7.0
question name (login-form): @taxi/login-form
question version (1.0.0): 0.0.0
question description: Login form component
question entry point (index.js): /dist/index.ts
question repository url:
question author: chef
question license (MIT):
question private: true
success Saved package.json
Done in 85.84s.
```

and add `react` as peerDependency:

```bash
yarn workspace @taxi/login-form add -P react
```
