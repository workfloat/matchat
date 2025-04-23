const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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
    new MiniCssExtractPlugin()
  ]
};

const getBaseConfig = (options) => ({
  ...commonConfig,
  ...options
});

const getOutputConfig = (filename, outputOptions) => ({
  ...getBaseConfig({}),
  output: {
    filename,
    path: path.resolve(__dirname, 'dist'),
    ...outputOptions
  },
  optimization: {
    minimize: false
  }
});

const getESMConfig = (filename) => ({
  ...getOutputConfig(filename, {
    library: { type: 'module' }
  }),
  experiments: { outputModule: true }
});

const getUMDConfig = (filename) => ({
  ...getOutputConfig(filename, {
    library: {
      name: 'MatChat',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this',
    umdNamedDefine: true
  }),
  plugins: [
    ...commonConfig.plugins,
    new webpack.DefinePlugin({
      __UMD_BUILD__: JSON.stringify(true)
    })
  ]
});

const minifiedConfig = (baseConfig, minFilename) => ({
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: minFilename
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ]
  }
});

module.exports = [
  // Original unminified builds
  getOutputConfig('matchat.cjs.js', { library: { type: 'commonjs2' } }),
  getESMConfig('matchat.esm.js'),
  getUMDConfig('matchat.umd.js'),
  
  // Minified versions
  minifiedConfig(
    getOutputConfig('matchat.cjs.js', { library: { type: 'commonjs2' } }),
    'matchat.cjs.min.js'
  ),
  minifiedConfig(
    getESMConfig('matchat.esm.js'),
    'matchat.esm.min.js'
  ),
  minifiedConfig(
    getUMDConfig('matchat.umd.js'),
    'matchat.umd.min.js'
  ),
  
  // CSS files (both minified and unminified)
  {
    ...getBaseConfig({}),
    entry: './src/css/matchat.css',
    output: {
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'matchat.css'
      })
    ]
  },
  {
    ...getBaseConfig({}),
    entry: './src/css/matchat.css',
    output: {
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'matchat.min.css'
      })
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin()
      ]
    }
  }
];