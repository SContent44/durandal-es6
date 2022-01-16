const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: path.join(__dirname, "src", "main.js"),
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "[name].[chunkhash:8].js",
        environment: {
            // The environment supports arrow functions ('() => { ... }').
            arrowFunction: false,
            // The environment supports BigInt as literal (123n).
            bigIntLiteral: false,
            // The environment supports const and let for variable declarations.
            const: false,
            // The environment supports destructuring ('{ a, b } = obj').
            destructuring: false,
            // The environment supports an async import() function to import EcmaScript modules.
            dynamicImport: false,
            // The environment supports 'for of' iteration ('for (const x of array) { ... }').
            forOf: false,
            // The environment supports ECMAScript Module syntax to import ECMAScript modules (import ... from '...').
            module: false,
            // The environment supports optional chaining ('obj?.a' or 'obj?.()').
            optionalChaining: false,
            // The environment supports template literals.
            templateLiteral: false,
        },
    },
    module: {
        rules: [
            /* {
                enforce: "pre",
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: "eslint-loader",
            }, */
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, "src"), path.resolve(__dirname, "..", "durandal-es6")],
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    useBuiltIns: "entry",
                                    corejs: 3,
                                    targets: [
                                        "Chrome >= 66",
                                        "Firefox >= 52",
                                        "Explorer >= 10",
                                        "Safari >= 10",
                                        "Edge >= 16",
                                        "iOS >= 10",
                                        "ChromeAndroid  >= 66",
                                    ],
                                },
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                options: {
                    esModule: true,
                    minimize: { removeComments: false },
                },
            },
            /* {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            }, */
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: "global",
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: "asset/resource",
            },
            {
                test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
                type: "asset/resource",
            },
        ],
    },
    // Custom plugins
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
        }),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            favicon: "./src/img/favicon.ico",
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
    ],
    resolve: {
        extensions: [".js"],
        modules: [path.resolve(__dirname, "node_modules"), "src"],
        alias: {
            durandal: path.resolve(__dirname, "../durandal-es6"),
        },
    },
    devServer: {
        hot: false,
        historyApiFallback: true,
        port: 19003,
    },
};
