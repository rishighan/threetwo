# Client side boilerplate with ReactJS library and Typescript

## Introduction

In the client side boilerplate, Typescript has been used to achieve a more structured and maintainable source code. ReactJS library which is one of the most important libraries for UI development alongside the other big names in the market, has been picked over to build the presentation layer of the application. Also for CSS, Less has been used to make CSS more functional.

### Less

[Less](http://lesscss.org/) is a backwards-compatible language extension for CSS. Less helps to write CSS in a functional way and It's really easy to read and understand.

### ESLint

[ESLint](https://eslint.org/) is a pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript and Typescript.

[.eslintrc.json file](<(https://eslint.org/docs/user-guide/configuring)>) (alternatively configurations can be written in Javascript or YAML as well) is used describe the configurations required for ESLint. Below is the .eslintrc.json file which has been used.

```javascript
{
  "extends": ["airbnb"],
  "env": {
    "browser": true,
    "node": true
  },
  "rules": {
    "no-console": "off",
    "comma-dangle": "off",
    "react/jsx-filename-extension": "off"
  }
}
```

[Airbnb's Javascript Style Guide](https://github.com/airbnb/javascript) which has been used by the majority of JavaScript and Typescript developers worldwide. Since the aim is support for both client (browser) and server side (Node.js) source code, the **env** has been set to browser and node. 
Optionally, you can override the current settings by installing `eslint` globally and running `eslint --init` to change the configurations to suit your needs. [**no-console**](https://eslint.org/docs/rules/no-console), [**comma-dangle**](https://eslint.org/docs/rules/comma-dangle) and [**react/jsx-filename-extension**](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md) rules have been turned off.

### Webpack

[Webpack](https://webpack.js.org/) is a module bundler. Its main purpose is to capable Front-end developers to experience a modular programming style and bundle JavaScript and CSS files for usage in a browser.

[webpack.config.js](https://webpack.js.org/configuration/) file has been used to describe the configurations required for webpack. Below is the webpack.config.js file which has been used.

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const outputDirectory = 'dist';

module.exports = {
  entry: ['babel-polyfill', './src/client/index.tsx'],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: './js/[name].bundle.js'
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/,
        use:[
          {
            loader: "awesome-typescript-loader"
          },
        ],
        exclude: /node_modules/
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './Less',
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              strictMath: true,
              noIeCompat: true,
            }
          },
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      },
    ]
  },
  resolve: {
    extensions: ['*', '.ts', '.tsx', '.js', '.jsx', '.json', '.less']
  },
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:8050'
    }
  },
  plugins: [
    new CleanWebpackPlugin([outputDirectory]),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      title: "Book Manager",
    }),
    new MiniCssExtractPlugin({
      filename: './css/[name].css',
      chunkFilename: './css/[id].css',
    }),
    new CopyPlugin([
      { from: './src/client/Assets', to: 'assets' },
    ])
  ],
};

```

1.  **entry:** entry: ./src/client/index.tsx is where the application starts executing and Webpack starts bundling.
    Note: babel-polyfill is added to support async/await. Read more [here](https://babeljs.io/docs/en/babel-polyfill#usage-in-node-browserify-webpack).
2.  **output path and filename:** the target directory and the filename for the bundled output.
3.  **module loaders:** Module loaders are transformations that are applied on the source code of a module. We pass all the js file through [babel-loader](https://github.com/babel/babel-loader) to transform JSX to Javascript. CSS files are passed through [css-loaders](https://github.com/webpack-contrib/css-loader) and [style-loaders](https://github.com/webpack-contrib/style-loader) to load and bundle CSS files. Fonts and images are loaded through url-loader.
4.  **Dev Server:** Configurations for the webpack-dev-server which will be described in coming section.
5.  **plugins:** [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin) is a webpack plugin to remove the build directory before building. [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) simplifies creation of HTML files to serve your webpack bundles. It loads the template (public/index.html) and injects the output bundle.

### Webpack dev server

[Webpack dev server](https://webpack.js.org/configuration/dev-server/) is used along with webpack. It provides a development server that enables live reloading for the client side code changes.

The devServer section of webpack.config.js contains the configuration required to run webpack-dev-server which is given below.

```javascript
devServer: {
    port: 3000,
    open: true,
    proxy: {
        "/api": "http://localhost:8050"
    }
}
```

[**Port**](https://webpack.js.org/configuration/dev-server/#devserver-port) specifies the Webpack dev server to listen on this particular port (3000 in this case). When [**open**](https://webpack.js.org/configuration/dev-server/#devserver-open) is set to true, it will automatically open the home page on start-up. [Proxying](https://webpack.js.org/configuration/dev-server/#devserver-proxy) URLs can be useful when you have a separate API backend development server, and you want to send API requests on the same domain.
