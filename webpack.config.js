const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const outputDirectory = "dist";
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = (env) => {
  return {
    entry: ["babel-polyfill", "./src/client/index.tsx"],
    output: {
      path: path.resolve(__dirname, outputDirectory),
      filename: "./js/[name].bundle.js",
    },
    devtool: "source-map",
    stats: {
      children: true,
    },
    module: {
      rules: [
        {
          test: /\.worker\.(js|ts)$/i,
          use: [
            {
              loader: "comlink-loader",
              options: {
                singleton: true,
              },
            },
          ],
        },
        {
          test: [/\.js?$/, /\.jsx?$/, /\.tsx?$/],
          use: ["babel-loader"],
          exclude: /node_modules/,
        },
        {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i,
          use: [
            "file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]",
            "image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false",
          ],
        },
      ],
    },
    resolve: {
      extensions: ["*", ".ts", ".tsx", ".js", ".jsx", ".json"],
      aliasFields: ["browser", "browser.esm"],
    },
    devServer: {
      port: 3050,
      open: true,
      hot: true,
      contentBase: "./dist",
      proxy: {
        "/api/**": {
          target: "http://localhost:8050",
          secure: false,
          changeOrigin: true,
        },
      },
    },
    optimization: {
      usedExports: false,
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        favicon: "./public/favicon.ico",
        title: "express-typescript-react",
      }),
      new webpack.DefinePlugin({
        "process.env.DOCKER_HOST": JSON.stringify(process.env.DOCKER_HOST),
      }),
      new MiniCssExtractPlugin({
        filename: "./css/[name].css",
        chunkFilename: "./css/[id].css",
      }),
    ],
  };
};
