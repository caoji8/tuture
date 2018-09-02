const fs = require('fs');
const path = require('path');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter((x) => ['.bin'].indexOf(x) === -1)
  .forEach((mod) => {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const base = {
  mode: 'production',
  bail: true,
  context: __dirname,
  devtool: false,
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        include: path.resolve(__dirname, 'src'),
      },
    ],
  },
};

const serverConfig = merge(base, {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: './src/index.tsx',
  output: {
    filename: 'server.js',
    pathinfo: false,
  },
  plugins: [new CleanWebpackPlugin(['dist'])],
  externals: nodeModules,
});

const clientConfig = merge(base, {
  entry: './src/components/index.tsx',
  output: {
    filename: 'static/js/bundle.js',
    pathinfo: false,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.html',
      favicon: './src/public/favicon.ico',
    }),
  ],
});

module.exports = [serverConfig, clientConfig];