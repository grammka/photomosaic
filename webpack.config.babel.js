const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')


const basePath = path.join(path.resolve(__dirname) + '/')

const config = {
  env: process.env.NODE_ENV || 'development',

  paths: {
    base: basePath,
    publicPath: '/',
    src: path.join(basePath, 'src'),
    build: path.join(basePath, 'lib')
  }
}


const webpackConfig = {
  devtool: 'cheap-source-map',

  entry: {
    index: path.join(config.paths.src, 'index.js')
  },

  output: {
    filename: '[name].js',
    chunkFilename: '[id].[hash:6].js',
    path: config.paths.build,
    publicPath: config.paths.publicPath
  },

  resolve: {
    root: config.paths.src,
    modulesDirectories: [ 'node_modules' ],
    extensions: [ '', '.js' ]
  },

  plugins: [
    new CleanWebpackPlugin([ 'lib' ], {
      root: __dirname,
      verbose: true,
      dry: false
    }),
    new webpack.EnvironmentPlugin(Object.keys(process.env)),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin()
  ],

  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true
        }
      }
    ]
  }
}

if (config.env == 'production') {
  delete webpackConfig.devtool

  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      mangle: true,
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
        screw_ie8: true,
        drop_console: true
      }
    })
  )
}

module.exports = webpackConfig
