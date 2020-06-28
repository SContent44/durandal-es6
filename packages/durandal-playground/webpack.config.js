const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");

const autoprefixer = require("autoprefixer");

const DEBUG = !process.argv.production;
const GLOBALS = {
    "process.env.NODE_ENV": DEBUG ? '"development"' : '"production"',
    __DEV__: DEBUG,
};

module.exports = {
    mode: "development",
    entry: path.join(__dirname, "src", "main.js"),
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "[name].[chunkhash:8].js",
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
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    useBuiltIns: "usage",
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
                },
            },
            /* {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            }, */
            {
                test: /\.(scss|css)$/,
                use: [
                    ExtractCssChunks.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: "global",
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: () => [autoprefixer()],
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            // Prefer Dart Sass
                            implementation: require("sass"),

                            // See https://github.com/webpack-contrib/sass-loader/issues/804
                            webpackImporter: false,
                            sassOptions: {
                                includePaths: ["./node_modules"],
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: "url-loader?limit=100000",
            },
            {
                test: /\.png$/,
                use: "url-loader?limit=100000",
            },
            {
                test: /\.jpg$/,
                use: "file-loader",
            },
            {
                test: /\.(woff|woff2) (\?v=\d+\.\d+\.\d+)?$/,
                use: "url-loader?limit=10000&mimetype=application/font-woff",
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: "url-loader?limit=10000&mimetype=application/octet-stream",
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: "file-loader",
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: "url-loader?limit=10000&mimetype=image/svg+xml",
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
        new webpack.DefinePlugin(GLOBALS),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new CleanWebpackPlugin(),
        new ExtractCssChunks(),
    ].concat(
        DEBUG
            ? []
            : [
                  new webpack.optimize.DedupePlugin(),
                  new webpack.optimize.UglifyJsPlugin(),
                  new webpack.optimize.AggressiveMergingPlugin(),
              ]
    ),
    resolve: {
        extensions: [".js"],
        modules: ["node_modules", "src"],
        alias: {
            durandal: path.resolve(__dirname, "../durandal-es6"),
        },
    },
    optimization: {
        chunkIds: "named",
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial",
                    minChunks: 2,
                },
                vendor: {
                    test: /node_modules/,
                    chunks: "initial",
                    name: "vendor",
                    priority: 10,
                    enforce: true,
                },
            },
        },
    },
    devServer: {
        contentBase: __dirname,
        hot: false,
        inline: true,
        historyApiFallback: true,
        stats: { colors: true },
        progress: true,
        port: 19003,
    },
};