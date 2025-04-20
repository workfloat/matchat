const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const commonConfig = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'matchat.css' })
  ]
};

module.exports = [
  {
    ...commonConfig,
    plugins: [
      new CleanWebpackPlugin(),
      ...commonConfig.plugins
    ]
  },
  // UMD Build
  {
    ...commonConfig,
    output: {
      filename: 'matchat.umd.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: 'MatChat',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this',
      umdNamedDefine: true
    },
    plugins: [
      ...commonConfig.plugins,
      new webpack.DefinePlugin({
        __UMD_BUILD__: JSON.stringify(true)
      })
    ]
  },
  // ESM Build
  {
    ...commonConfig,
    experiments: { outputModule: true },
    output: {
      filename: 'matchat.esm.js',
      path: path.resolve(__dirname, 'dist'),
      library: { type: 'module' }
    }
  },
  // CJS Build
  {
    ...commonConfig,
    output: {
      filename: 'matchat.cjs.js',
      path: path.resolve(__dirname, 'dist'),
      library: { type: 'commonjs2' }
    }
  }
];