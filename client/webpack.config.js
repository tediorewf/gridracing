const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const config = {
    entry: './src/index.js',
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
        new CopyPlugin({
            patterns: [
                {
                  from: path.resolve(__dirname, 'assets/**/*'),
                  to: path.resolve(__dirname, 'dist')
                },
                {
                    from: path.resolve(__dirname, 'public/**/*'),
                    to: path.resolve(__dirname, 'dist')
                },
            ],
        }),
    ],
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
