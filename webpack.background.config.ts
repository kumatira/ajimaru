const path = require('path');
module.exports = {
    mode: 'production',
    entry: './src/background/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'background.js',
    },
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        configFile: 'tsconfig.background.json',
                    }
                },
            },
        ],
    },
    resolve: {
        extensions: [
            '.ts', '.js',
        ],
    },
}

export {}