const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'none',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('staging'),
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new Dotenv(),
  ],
  entry: {
    'mtx-poll-three-js': './src/lib/mtx-poll-three-js.ts',
    'mtx-poll-a-frame': './src/lib/mtx-poll-a-frame.ts',
    'mtx-poll-babylon-js': './src/lib/mtx-poll-babylon-js.ts',
    'mtx-poll-play-canvas': './src/lib/mtx-poll-play-canvas.ts',
    'mtx-poll-decentraland': './src/lib/mtx-poll-decentraland.ts',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
  },
  cache: false,
  optimization: {
    minimize: true,
  },
  devtool: 'source-map',
  devServer: {
    hot: true,
    port: 9000,
  },
  output: {
    library: {
      name: 'MetalitixLogger',
      type: 'umd',
      export: 'default',
    },
    filename: '[name].js',
  },
};
