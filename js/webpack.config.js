const path = require('path');

module.exports = {
  entry: './index.ts',
  mode: 'production',
  target: 'node',
  devtool: false, 

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2',
    }
  },

  externals: {
    'kubernetes-types': 'commonjs kubernetes-types'
  },

  target: 'node', // If you are targeting Node.js environment
};
