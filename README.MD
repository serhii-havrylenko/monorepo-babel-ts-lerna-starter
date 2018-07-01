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
lerna info version 3.0.0-beta.21
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
- [@babel](https://github.com/babel/babel/tree/master/packages/babel-preset-typescript) with TypeScript preset

Implementation from @babel does not have all features from latest TypeScript, however, in case of usage Babel we do not miss all cool plugins and integration with all tools looks much easier.

Let's take care about Babel and use all benefits from whole set of plugins already created.

#### Installation

Just hit next command to install all required plugins and presets:

```bash
$ yarn add -DW @babel/cli @babel/core @babel/preset-typescript @babel/preset-stage-0 babel-bridge typescript
```

#### Configuration
