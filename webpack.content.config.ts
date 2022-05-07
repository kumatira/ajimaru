const path = require('path');
module.exports = {
    mode: 'production',
    entry: './src/content/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'content.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        configFile: 'tsconfig.content.json',
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