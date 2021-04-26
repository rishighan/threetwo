const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const outputDirectory = "dist";

module.exports = {
  entry: ["babel-polyfill", "./src/client/index.tsx"],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: "./js/[name].bundle.js",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: { loader: "worker-loader" },
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
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(scss|sass)$/,
        use: ["style-loader", "css-loader", "sass-loader"],
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
  },
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    proxy: {
      "/api/**": {
        target: "http://localhost:8050",
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    // new CleanWebpackPlugin([outputDirectory]),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "./public/favicon.ico",
      title: "express-typescript-react",
    }),
    new MiniCssExtractPlugin({
      filename: "./css/[name].css",
      chunkFilename: "./css/[id].css",
    }),
  ],
};
