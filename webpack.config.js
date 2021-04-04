// Generated using webpack-cli http://github.com/webpack-cli
// Load the path library
const path = require('path');
// HTML webpack plugin?
const HtmlWebpackPlugin = require('html-webpack-plugin');

// entry point here
module.exports = {
    mode: 'development',
    entry: {
        main: './src/index.js',
        uploadData: './src/uploadData.js'
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        open: true,
        host: 'localhost',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),

        // Add your plugins here
        // Learn more obout plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [{
                test: /\\.(js|jsx)$/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};
