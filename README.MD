# Monorepo

- [Monorepo](#monorepo)
  - [The goal](#the-goal)
  - [Pre-requirements](#pre-requirements)
    - [Local NPM registry](#local-npm-registry)
  - [Getting started](#getting-started)
    - [Repository initialization](#repository-initialization)
    - [Setting up package manager](#setting-up-package-manager)
    - [TypeScript](#typescript)
      - [Installation](#installation)
      - [Configuration](#configuration)
      - [Building packages](#building-packages)
      - [Checking types](#checking-types)
    - [Peer dependencies](#peer-dependencies)
    - [Static code analyser](#static-code-analyser)
      - [Tslint](#tslint)
      - [Stylelint](#stylelint)
      - [All together](#all-together)
    - [Code formatting](#code-formatting)
    - [Testing](#testing)
    - [Storybook](#storybook)
      - [Installation](#installation-1)
      - [Typescript](#typescript)
      - [Tslint](#tslint-1)
      - [Addons](#addons)
    - [Final build](#final-build)
  - [First package](#first-package)
    - [Development](#development)
    - [Storybook](#storybook-1)
    - [Testing](#testing-1)
    - [Build](#build)

Everyone is tired with creating templates for each type of NPM package with pre-configured skeletons, managing different dependencies across own packages, linking packages for local development with instant packages rebuilding which is wasting developers time, writing proper configuration for linters, `babel`, `typescript`, etc. The worst part appears when one of the key dependencies is getting breaking change upgrade, for instance `babel` - it produces plenty of duplicated changes in each of the package, massive amount of merge request to be reviewed and introduces high change to make a mistake (or even worse - forget about change) in on of the packages. Hopefully, it's year 2018 and JavaScript world has a solution for managing group of the packages in the one repository. This approach calls `monorepo`.

There are many of approaches how to implement monorepo - `yarn workspaces`, `buck`, `pants`, `lerna`, and others. In this article we'll cover `lerna` approach with `yarn` as package manager. Moreover, `lerna` integrates so greatly with `yarn workspaces` as it allows to use workspaces commands directly in the repository even without `lerna`.

## The goal

The goal of this article is to create monorepo starter with Babel for building packages, TypeScript for having benefits of statically typed languages in the JavaScript world, static code analyzing tools (Tslint, Stylelint), Prettier for having automatically formated code (no more tabs or spaces holly wars), Storybook for developing components, and last, but not least - Lerna for publishing. All components will be written with React and StyledComponents for CSS-in-JS styling.

Let's not waste time on long talks about what are those tools and why they are so important, and proceed to the real configuration and will see how everyone will benefit from each in the future.

For those who are impatient, [here is the link to the repository](https://github.com/serhii-havrylenko/monorepo-babel-ts-lerna-starter) which contains whole set of results form this article - configured monorepo, ready to go and use.

## Pre-requirements

Packages:

- NodeJS LTS
- [yarn v1.5+](https://yarnpkg.com/)
- [Lerna v3+](https://lernajs.io/)

### Local NPM registry

Local NPM registry will be used in whole article to avoid publishing to global registry plenty of test packages. There are plenty of ways how to set up private NPM repository. In this example [Verdaccio](https://github.com/verdaccio/verdaccio) will be used for such purpose.

Configuration is simple tnd trivial:

```bash
yarn global add verdaccio
verdaccio &

npm set registry http://localhost:4873/
npm adduser --registry http://localhost:4873
Username: test
Password: ***
Email: ***
```

Now we could test how it works:

```
yarn info @babel/cli
```

should still show package details and in console where we started `verdaccio` we should see incoming request

```
 http --> 200, req: 'GET https://registry.npmjs.org/@babel%2Fcli' (streaming)
 http --> 200, req: 'GET https://registry.npmjs.org/@babel%2Fcli', bytes: 0/85596
```

Moreover, you could open [`http://localhost:4873/`](http://localhost:4873/) for searching published packages.

## Getting started

Time to start our configuration.

### Repository initialization

<p align="center">
  <a href="https://lernajs.io/">
    <img alt="Lerna" src="https://cloud.githubusercontent.com/assets/952783/15271604/6da94f96-1a06-11e6-8b04-dc3171f79a90.png" width="150">
  </a>
</p>

```bash
$ lerna init
```

And you have initial structure of the monorepo created by Lerna.

A little bit of important theory about packages Versioning. This step is the most important one on the repository creation stage as it would impact how do we publish/tags our packages.

Lerna supports two types of packages versioning:

1.  Independent
2.  Exact

When **exact** type is chosen, Lerna will use the same version for all packages in monorepo. In case when **independent** version is selected, Lerna will release each package with independent version. More details about versioning is on [official Lerna page](https://github.com/lerna/lerna#how-it-works)

This article will consider only independent versioning for all packages as on the initial stage of packages development some packages would have much more releases then others, and with independent versioning we would have only required packages released.

Going back to the real examples:

```
$ lerna init --independent
lerna info version 3.4.0
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
  "packages": ["packages/*"],
  "version": "independent",
  "useWorkspace": true,
  "npmClient": "yarn"
}
```

Moreover, with `"useWorkspace": true` we allow `lerna` to support `yarn workspaces` and with `"packages": ["packages/*"]` we specify in which folder(s) we would have all our packages.

### TypeScript

<p align="center">
  <a href="https://www.typescriptlang.org/">
    <img alt="typescript" src="https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-card.png" width="150">
  </a>
</p>

TypeScript could be used in two ways:

- native TypeScript with `tsc`
- [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)

Implementation from `babel` does not have all features from latest TypeScript (like `const enum`), however, in case of usage `babel` we do not miss all cool plugins and integration with all tools looks much easier.

In this article we would use only `babel` with `typescript` preset.

#### Installation

Just hit next command to install all required plugins and presets:

```bash
$ yarn add -DW @babel/cli @babel/core @babel/preset-typescript @babel/preset-env babel-core@7.0.0-bridge.0 @babel/preset-react typescript @types/node
```

`babel-core@7.0.0-bridge.0` should be noticed separately as it's needed for properly resolving `babel-core` packages for all libs which requires old version of babel and for avoiding duplicated packages installed and possible misusage of `babel` configuration. Next line have to be added to the root `package.json`:

```json
{
  "resolutions": {
    "babel-core": "^7.0.0-bridge.0"
  }
}
```

#### Configuration

<p align="center">
  <a href="https://babeljs.io/">
    <img alt="babel" src="https://raw.githubusercontent.com/babel/logo/master/babel.png" width="150">
  </a>
</p>

Configuration is quite simple and trivial - [@babel/preset-react](https://babeljs.io/docs/en/babel-preset-react) and [@babel/preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript) plus simple config for [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env).

In Release candidate version, Babel team has removed support for `stage-*` and `preset-201*` packages, so it means that all actually used plugins should be set by users manually.

Apart from removing `stage-*` packages, Babel has changed approach for looking up config files - it looks for config in `cwd` till the first `package.json`. More details could be found in [official Babel documentation](https://babeljs.io/docs/en/config-files)

Let's configure `babel.config.js` with next data:

```javascript
module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/env',
        {
          targets: {
            browsers: 'Last 2 Chrome versions, Firefox ESR',
            node: '8.9',
          },
        },
      ],
      [
        '@babel/preset-react',
        {
          development: process.env.BABEL_ENV !== 'build',
        },
      ],
      '@babel/preset-typescript',
    ],
    env: {
      build: {
        ignore: [
          '**/*.test.tsx',
          '**/*.test.ts',
          '**/*.story.tsx',
          '__snapshots__',
          '__tests__',
          '__stories__',
        ],
      },
    },
    ignore: ['node_modules'],
  };
};
```

#### Building packages

Due to changes for config lookup, build command in monorepo should have path to `.babelrc` or `babel.config.js` specified, or as [--root-mode option](https://babeljs.io/docs/en/options#rootmode). It could be done directly in build commands:

1.  In root package.json:

```json
{
  "scripts": {
    "build": "lerna exec --parallel 'BABEL_ENV=build babel src --out-dir dist --source-maps --extensions .ts,.tsx --config-file ../../babel.config.js --delete-dir-on-start --no-comments'"
  }
}
```

2.  `build` command in each package. In this case each of packages could be built independently without `lerna`. In this case `build` command is a little bit different:

```json
{
  "scripts": {
    "build": "BABEL_ENV=build babel src --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --config-file ../../babel.config.js --no-comments"
  }
}
```

3. Another way how to treat parent babel config is `extends` option provided by latest babel. The easiest approach for that is setting next lines in `package.json` on package level:

```json
{
  "extends": "../../babel.config.js"
}
```

- In this case build command doesn't require passing path to babel config and will be simplified:

```json
{
  "scripts": {
    "build": "lerna exec --parallel 'BABEL_ENV=build babel src --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments'"
  }
}
```

4. Last and easiest option is just add `--root-mode=upward` option to the build command which allows to resolve babel config upward from the current root. In this case build command looks like:

```json
{
  "scripts": {
    "build": "lerna exec --parallel 'BABEL_ENV=build babel --root-mode upward src --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments'"
  }
}
```

#### Checking types

[@babel/plugin-transform-typescript](https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-typescript) does not perform type-check for it's input. However, it could be checked with native `typescript` compiler (`tsc`). It should be run with option `noEmit` for checking types only without emitting any code.

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
    "esModuleInterop": true,
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
{
  "workspaces": ["packages/*"]
}
```

In our case `react`, as well as `styled-components`, are defined as peerDependencies as all our packages will have them, however we don't want to have plenty of dependencies on each package installed separately.

As we decided to set `react` and `styled-components` as peer dependency, we still should have them, and associated types definitions for typescript, installed in our `node_modules`. So let's add them as `devDependency` to the root of monorepo:

```bash
yarn add -DW react @types/react styled-components
```

### Static code analyser

Having typescript for types checking could protect us from creating plenty of mistakes and save a lot of time for writing basic unit tests related to incorrect input data. However, it won't protect us from writing over-complicated, unreadable, or even hacky code. Even more, it won't protect us from using incorrect or unsupported CSS rules, would it be CSS, SCSS or CSS-in-JS.

#### Tslint

<p align="center">
  <a href="https://palantir.github.io/tslint/">
    <img alt="tslint" src="https://www.feram.io/images/modules/tslint.svg" width="150">
  </a>
</p>

The easiest solution for automating such checks is using `tslint` for static code analyzing.

Let's install it as devDependency in the root of our monorepo:

```bash
yarn add -DW tslint tslint-react
```

and create simple config file for it `tslint.json`:

```json
{
  "extends": ["tslint:latest", "tslint-react"],
  "rules": {
    "semicolon": "single"
  }
}
```

and new script in package.json for linting `*.ts` files:

```json
{
  "scripts": {
    "lint:ts": "tslint 'packages/**/*.ts{,x}'"
  }
}
```

Now static code analyzer could be run with simple `yarn lint:ts` command.

#### Stylelint

<p align="center">
  <a href="https://stylelint.io/">
    <img alt="stylelint" src="https://stylelint.io/_/src/components/DefaultHeadMeta/favicon.7f672624abe02127db4972965ea73002.ico" width="150">
  </a>
</p>

Let's use `stylelint` for improving our CSS styles quality and readability. It could be easily used for analyzing CSS-in-JS as well as with simple CSS or SCSS files.

Installation and configuration process as simple as with `tslint`:

```bash
yarn add -DW stylelint stylelint-processor-styled-components stylelint-config-styled-components stylelint-config-standard
```

Create simple config file for it `tslint.json`:

```json
{
  "processors": ["stylelint-processor-styled-components"],
  "extends": ["stylelint-config-standard", "stylelint-config-styled-components"]
}
```

and new script in package.json for linting `*.ts` files:

```json
{
  "scripts": {
    "lint:css": "stylelint 'packages/**/*.ts{,x}'"
  }
}
```

Now static code analyzer could be run with simple `yarn lint:css` command.

#### All together

For now we have `lint:ts` for checking typescript code quality and `lint:css` for CSS, however, they are still separated commands and it would be uncomfortable to run them separately all the time. Let's group them in one unified `lint` command and run it with `npm-run-al`:

```bash
yarn add -DW npm-run-all
```

and new script in the root `package.json`:

```json
{
  "scripts": {
    "lint": "run-p -c lint:*",
    "lint:ts": "tslint 'packages/**/*.ts{,x}'",
    "lint:css": "stylelint 'packages/**/*.ts{,x}'"
  }
}
```

**Note:** `run-p -c` allows to run all `lint:*` commands even if one of them failed. It's useful in case of separated static code analyzer steps, as after one run we have output from `tslint` and `stylelint`, instead of only first failed.

### Code formatting

<p align="center">
  <a href="https://palantir.github.io/tslint/">
    <img alt="prettier" src="https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png" width="150">
  </a>
</p>

For now we have `typescript` for static types checking, `tslint` and `stylelint` for static code analyzing. Still, we could write unreadable or not well formatted code. We could avoid all issues relate to code formatting with `prettier`. It will automatically format our code according to predefined standards. Moreover, it will fix some issues reported by `tslint`.

As usual, installation and configuration is very simple:

```bash
yarn add -DW prettier tslint-config-prettier tslint-plugin-prettier
```

Next is needed is `.prettierrc`:

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "always"
}
```

and integration with `tslint`, as both of the tools have common rules (like tabWidth, trailingComma, etc). Next lines should be added to the `tslint.json` to make it work with prettier:

```json
{
  "extends": [
    "tslint:latest",
    "tslint-react",
    "tslint-plugin-prettier",
    "tslint-config-prettier"
  ],
  "rules": {
    "prettier": true,
    "quotemark": [
      true,
      "single",
      "avoid-escape",
      "avoid-template",
      "jsx-double"
    ]
  }
}
```

Important note is `quotemark` rule. Because of `jsx` usage we have to override default recommended rules which requires to have single quotemark everywhere.

Last but not least, let's add script to the root `package.json` for automatic code formatting based on defined above rules:

```json
{
  "scripts": {
    "fix": "yarn lint:ts --fix"
  }
}
```

### Testing

<p align="center">
  <a href="https://jestjs.io/">
    <img alt="jest" src="https://camo.githubusercontent.com/f6414ee20933d5fb8b06dc32ed38c8aa175da559/687474703a2f2f64702e68616e6c6f6e2e696f2f3331337933753244307033382f6a6573742e706e67" width="150">
  </a>
</p>

For now we have TypeScript for checking types, `tslint` and `stylelint` for static code quality analyzing. Last, but not least part is testing. Let's use `jest` as test runner and test assertion tool. It has the best support for `react`, including snapshot testing, extensive mocking library, build-in coverage reporting and ability to run tests in different processes. `ts-jest` should be used for running `typescript` code. Installation is also quite simple:

```bash
yarn add -DW jest ts-jest @types/jest
```

`jest` could be configured in two ways:

- `yarn jest --init` and answer for all questions
- manually create config file with minimum required configuration

Here is basic setup from `jest.config.js` in the root of the monorepo

```javascript
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  notify: true,
  notifyMode: 'always',
  roots: ['<rootDir>packages'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.test.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

Notes:

- `ts-jest` could use babel config or pure typescript compiler. In our case we have babel configured, so it could be used with just 1 line in config:

```
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
    },
  },
```

- `coverageThreshold` is protecting us from writing not enough tests and having poor test coverage.

As soon as we have basic config, it's time to install `enzyme` (and all related libraries) which is extending support for `react`:

```bash
yarn add -DW enzyme enzyme-adapter-react-16 @types/enzyme @types/enzyme-adapter-react-16
```

Add `setupTestFrameworkScriptFile: '<rootDir>jest/setupTests.ts'` into `jest.config.js` file and proper setup for `enzyme` into `jest/setupTests.ts`:

```typescript
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });
```

Now `jest` is able to render `react` components, however, it will serialize snapshots as pure objects and we want to have it serialized as HTML markup. We could achieve it with proper serializer:

```bash
yarn add -DW  enzyme-to-json@next
```

and `snapshotSerializers: ['enzyme-to-json/serializer']` in `jest.config.js.`

We are almost there, we are able to run tests and create proper snapshots. Nevertheless, we still have issues with `styled-components` - on each change in styles, `styled-components` is creating different class name. Based on it we'll have plenty of false negative tests fails just because of class name is changed. Let's fix it with proper tool

```bash
yarn add -DW jest-styled-components
```

`import 'jest-styled-components'` should be added to the `jest/setupTests.ts`.

Just to sum up, `jest.config.js`:

```javascript
module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  notify: true,
  notifyMode: 'always',
  roots: ['<rootDir>packages'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)', '**/*.test.+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupTestFrameworkScriptFile: '<rootDir>jest/setupTests.ts',
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
```

That's it, `jest` is configured and could be run. Let's add `test` to the root `package.json` scripts:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

### Storybook

<p align="center">
  <a href="https://storybook.js.org/">
    <img alt="storybook" src="https://camo.githubusercontent.com/34ab12e06afbf839047bf3c19ed3e76082921f85/68747470733a2f2f64337676366c703535716a6171632e636c6f756466726f6e742e6e65742f6974656d732f33783051313531343431317a336c314f326131512f73746f7279626f6f6b732d6f6c642e706e673f582d436c6f75644170702d56697369746f722d49643d643430373439383635383733643762356162333263383038353231353066373426763d6530643332303332" width="150">
  </a>
</p>

We already able to write code in monorepo with `typescript`, analyze it with `tslint` and `stylelint`, test it with `jest`. However, we still cannot see how our components will look like and we cannot even debug it properly.

There are plenty of ways how to present react component. Let's go with most famous one - `storybook`. It allows to present separate components and/or group of them as well as testing it in real browsers, and having documentation close to it.

#### Installation

Latest stable version of `storybook@3.4.10` works with `webpack@3`, `babel@^6` and `typescript@^2.7`. As we have latest `@babel@^7` and `typescript@^3` it's better to use `next` version of storybook which has the same set of dependencies as our monorepo, even if it's bleeding edge version.

If you do it for the first time, you should have `@storybook@cli` installed globally on your machine and init:

```bash
yarn global add @storybook/cli@next
getstorybook
```

It will automatically detect project type (react), installs all required packages and create basic configuration folder.

#### Typescript

Still, as we use typescript, we have to install typings for those packages, loader for wepback and needed peerDependencies:

```bash
yarn add -DW @types/storybook__react @types/storybook__addon-actions @types/storybook__addon-links react-dom webpack awesome-typescript-loader
```

Storybook inits application as it is javascript based, as we have typescript everywhere, we have to change path resolution for stories in `storybook/config.js` file:

```typescript
const req = require.context('../packages', true, /.story.tsx?$/);
```

Last but not least part is `webpack.config.js` inside `storybook` folder, just create it with next content:

```javascript
module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('awesome-typescript-loader'),
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
```

and associated configuration part in `tsconfig.json` for `awesome-typescript-loader`:

```json
{
  "awesomeTypescriptLoaderOptions": {
    "useBabel": true,
    "babelCore": "@babel/core"
  }
}
```

Configuration part is ready, we could start storybook with `yarn storybook` command.

#### Tslint

As soon as we add `storybook` to our devDependencies and run `yarn lint:ts` we will get an error from `tslint`:

```
ERROR: Module '@storybook/react' is not listed as dependency in package.json
```

The reason is obvious, we use package which is installed as devDependency in our source code (in the story file). Unfortunately there is no options like override for specific path or files. It could be done by splitting `lint-ts` command into two separated for production code (which will be shipped as packages) and for test code (storybook, tests, etc).

Let's create config for `tslint` for production phase, called `tslint.prod.json`:

```json
{
  "extends": ["./tslint.json"],
  "rules": {
    "no-implicit-dependencies": true
  }
}
```

Another config for the test phase called `tslint.test.json`:

```json
{
  "extends": ["./tslint.json"],
  "rules": {
    "no-implicit-dependencies": [false, "dev"]
  }
}
```

`"no-implicit-dependencies": false` into `tslint.json` to disable this rule by default. This one is need to fix issues with IDEs as by default they use `tslint.json` for all files, whether it test or production code.

Last, but not least, scripts in the root `package.json` have to be adjusted:

```json
{
  "scripts": {
    "fix": "run-p -c lint:ts-* --fix",
    "lint:ts": "run-p -c lint:ts-*",
    "lint:ts-prod": "tslint --config tslint.prod.json 'packages/**/*.ts{,x}' --exclude '**/*.{test,story}.ts{,x}'",
    "lint:ts-test": "tslint --config tslint.test.json 'packages/**/*.{test,story}.ts{,x}'"
  }
}
```

#### Addons

Storybook allows to pass any props to the react component without rebuilding stories, just through UI interface. To do it, we have to add one more addons - [`@storybook/addon-knobs`](https://github.com/storybooks/storybook/tree/master/addons/knobs)

```bash
yarn add -DW @storybook/addon-knobs@next @types/storybook__addon-knobs moment
```

**NOTE**: moment has to be installed because of wrong peerDependencies management on `storybook` and `react-datetime` level.

Next step is to add `import '@storybook/addon-knobs/register';` to the `storybook/addons.js` and modify `storybook/config.js` to have global decorator for each story:

```javascript
import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

const req = require.context('../packages', true, /.story.tsx?$/);
function loadStories() {
  addDecorator(withKnobs);
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
```

Now `knobs` could be used in the stories.

### Final build

As we already have build command as well as code formatting and static code analyzing tools in place, it's time to use them all together in the build process:

```json
{
  "scripts": {
    "prebuild": "run-p tsc lint test",
    "build": "lerna exec --parallel 'BABEL_ENV=build babel src --root-mode upward --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments'",
    "lint:css": "stylelint 'packages/**/*.ts{,x}'",
    "lint:ts": "run-p -c lint:ts-*",
    "lint:ts-prod": "tslint --config tslint.prod.json 'packages/**/*.ts{,x}' --exclude '**/*.{test,story}.ts{,x}'",
    "lint:ts-test": "tslint --config tslint.test.json 'packages/**/*.{test,story}.ts{,x}'",
    "lint": "run-p -c lint:*",
    "test": "jest",
    "tsc": "tsc"
  }
}
```

As soon as we run `yarn build` command, `yarn` automatically will run `tsc` for type checks, `tslint` for code quality analyzing and `test` on each of packages in the monorepo.

If they succeed, `build` will proceed and prepare all packages for publishing.

### Package publishing



## First package

Let's init first simple package which will be just Input with optional label for it:

```
$ mkdir packages/input && cd packages/input
$ yarn init
yarn init v1.7.0
question name (input): @taxi/input
question version (1.0.0): 0.0.0
question description: Input component
question entry point (index.js): /dist/index.ts
question repository url:
question author: chef
question license (MIT):
question private: true
success Saved package.json
Done in 85.84s.
```

and add `react` and `styled-components` as peerDependencies:

```bash
yarn workspace @taxi/input add -P react styled-components
```

### Development

Let's create simple input with optional label:

```typescript
import * as React from 'react';
import styled from 'styled-components';

export interface LabelProps {
  labelWidth?: number;
}

export interface InputWithLabelProps extends LabelProps {
  id?: string;
  label?: string;
}

export interface InputWithoutLabelProps extends LabelProps {
  id: string;
  label: string;
}

export type InputLabelProps = InputWithLabelProps | InputWithoutLabelProps;

export interface InputProps {
  name?: string;
  type?: string;
}

const Wrapper = styled.div`
  display: flex;
  margin: 10px;
`;

const Label = styled<LabelProps, 'label'>('label')`
  margin-right: 10px;
  font-weight: bold;
  width: ${({ labelWidth = 100 }) => labelWidth}px;
`;

const NativeInput = styled.input`
  width: 100%;
`;

export const Input: React.SFC<InputProps & InputLabelProps> = ({
  label,
  id,
  labelWidth,
  ...rest
}) => (
  <Wrapper>
    {label && (
      <Label labelWidth={labelWidth} htmlFor={id}>
        {label}:
      </Label>
    )}
    <NativeInput id={id} {...rest} />
  </Wrapper>
);

Input.defaultProps = {
  type: 'text',
};
```

### Storybook

`storybook` is configured, so it's time to create first story and test first package as well as `storybook` and `typescript` integration. Just create `Input.story.tsx` inside `input` package.

```typescript
import { text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import * as React from 'react';

import { Input } from './Input';

storiesOf('Input', module)
  .add('default', () => <Input />)
  .add('with label', () => (
    <Input id="test" label={text('Label', 'Username')} />
  ))
  .add('with label and type', () => (
    <Input
      id="test"
      label={text('Label', 'Username')}
      type={text('Type', 'text')}
    />
  ));
```

and run `yarn storybook`. When the build process is finished, storybook will be accessible under http://localhost:6006

### Testing

`jest` is configured and ready to be used. Let's create simple snapshot tests for our package:

```typescript
import { mount } from 'enzyme';
import * as React from 'react';

import { Input } from './Input';

describe('Input', () => {
  test('should match snapshot and styles for default props', () => {
    expect(mount(<Input />)).toMatchSnapshot();
  });

  test('should match snapshot with label', () => {
    expect(mount(<Input id="test" label="Name" />)).toMatchSnapshot();
  });
});
```

All tests could be run with simple command:

```bash
yarn test
```

Now we have a chance to check how our integration of `jest` and `jest-styled-components` works. Just open created snapshot and check that classnames are replaced with `c0`, `c1`, etc:

```
exports[`Input should match snapshot and styles for default props 1`] = `
.c0 {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  margin: 10px;
}

.c1 {
  width: 100%;
}
```

### Build

It's time to build our package. Simply run

```bash
yarn build
```

and we should have `packages/input/dist` folder with all compiled files. The most important one is `packages/input/dist/Input.js` which has:

```javascript
const Input = ({ label, id, labelWidth, ...rest }) =>
  React.createElement(
    Wrapper,
    null,
    label &&
      React.createElement(
        Label,
        {
          labelWidth: labelWidth,
          htmlFor: id,
        },
        label,
        ':',
      ),
    React.createElement(
      NativeInput,
      _extends(
        {
          id: id,
        },
        rest,
      ),
    ),
  );
```
