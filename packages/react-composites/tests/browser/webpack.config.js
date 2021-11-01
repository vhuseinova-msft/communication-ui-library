// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @private */
module.exports = () => ({
  entry: {
    call: path.join(__dirname, 'call/app/index.tsx'),
    chat: path.join(__dirname, 'chat/app/index.tsx'),
    meeting: path.join(__dirname, 'meeting/app/index.tsx')
  },
  devtool: process.env.CI ? undefined : 'eval-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      // Reference internal packlets' src directly for hot reloading when developing.
      // This also removes the need for CI to wait for packlets to be built before building tests.
      '@internal/react-components': path.resolve(__dirname, '../../../react-components/src'),
      '@internal/react-composites': path.resolve(__dirname, '../../../react-composites/src'),
      '@internal/chat-stateful-client': path.resolve(__dirname, '../../../chat-stateful-client/src'),
      '@internal/chat-component-bindings': path.resolve(__dirname, '../../../chat-component-bindings/src'),
      '@internal/calling-stateful-client': path.resolve(__dirname, '../../../calling-stateful-client/src'),
      '@internal/calling-component-bindings': path.resolve(__dirname, '../../../calling-component-bindings/src'),
      '@internal/acs-ui-common': path.resolve(__dirname, '../../../acs-ui-common/src')
    }
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]/app/dist/build.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        },
        exclude: /dist/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.svg/,
        type: 'asset/inline'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['call'],
      template: path.join(__dirname, 'call', 'app', 'public', 'index.html'),
      filename: 'call/app/dist/index.html'
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['chat'],
      template: path.join(__dirname, 'chat', 'app', 'public', 'index.html'),
      filename: 'chat/app/dist/index.html'
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['meeting'],
      template: path.join(__dirname, 'meeting', 'app', 'public', 'index.html'),
      filename: 'meeting/app/dist/index.html'
    })
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true
  }
});
