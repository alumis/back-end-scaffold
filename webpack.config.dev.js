const webpack = require("webpack");
const path = require("path");
const ObservableI18nPlugin = require("@alumis/observables-i18n");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {

    entry: "./ClientApp/src/index.tsx",
    output: {
        path: path.resolve(__dirname, "wwwroot")
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".scss"],
        modules: [
            "node_modules"
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/typescript"],
                    plugins: [
                        "@babel/proposal-class-properties",
                        ["@babel/plugin-transform-react-jsx", { "pragma": "createNode" }],
                        "@babel/plugin-syntax-dynamic-import"
                    ]
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    //{ loader: "style-loader" },
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            sourceMap: true,
                            localIdentName: "[hash:base64:5]"
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function () {
                                return [
                                    require("precss"),
                                    require("autoprefixer")
                                ];
                            }
                        }
                    },
                    { loader: "sass-loader" }
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            IS_DEV: JSON.stringify(true),
            IS_PROD: JSON.stringify(false),
            VER: JSON.stringify(require("./package.json").version)
        }),
        new ObservableI18nPlugin({
            defaultSubtags: "no",
            subtags: ["no", "en"]
        }),
        new HtmlWebpackPlugin({
            title: "Alumis App",
            template: "./ClientApp/public/index.html",
            filename: "index.html",
            hash: true,
            favicon: "./ClientApp/public/favicon.ico"
        }),
        new MiniCssExtractPlugin()
    ],
    devtool: "inline-source-map"
};


// const webpack = require("webpack");
// const path = require("path");
// const ObservableI18nPlugin = require("@alumis/observables-i18n");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// module.exports = {

//     entry: "./ClientApp/src/index.tsx",
//     output: {
//         path: path.resolve(__dirname, "wwwroot")
//     },
//     resolve: {
//         extensions: [".ts", ".tsx", ".js", ".jsx", ".scss"],
//         modules: [
//             "node_modules",
//             "src",
//         ]
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.(js|jsx|ts|tsx)$/,
//                 loader: "babel-loader",
//                 options: {
//                     presets: ["@babel/env", "@babel/typescript"],
//                     plugins: [
//                         "@babel/proposal-class-properties",
//                         ["@babel/plugin-transform-react-jsx", { "pragma": "createNode" }],
//                         "@babel/plugin-syntax-dynamic-import"
//                     ]
//                 }
//             },
//             {
//                 test: /\.scss$/,
//                 use: [
//                     {
//                         loader: MiniCssExtractPlugin.loader
//                     },
//                     {
//                         loader: "css-loader",
//                         options: {
//                             modules: true,
//                             sourceMap: true,
//                             localIdentName: "[hash:base64:5]"
//                         }
//                     },
//                     {
//                         loader: "postcss-loader",
//                         options: {
//                             plugins: function () {
//                                 return [
//                                     require("precss"),
//                                     require("autoprefixer")
//                                 ];
//                             }
//                         }
//                     },
//                     { loader: "sass-loader" }
//                 ]
//             }
//         ]
//     },
//     plugins: [
//         new webpack.DefinePlugin({
//             IS_DEV: JSON.stringify(true),
//             IS_PROD: JSON.stringify(false),
//             VER: JSON.stringify(require("./package.json").version)
//         }),
//         new ObservableI18nPlugin({
//             defaultSubtag: "no",
//             subtags: ["en", "no"]
//         }),
//         // new HtmlWebpackPlugin({
//         //     title: "Alumis App",
//         //     template: "./ClientApp/public/index.html",
//         //     filename: "index.html",
//         //     hash: true,
//         //     favicon: "./ClientApp/public/favicon.ico"
//         // }),
//         new MiniCssExtractPlugin()
//     ],
//     devtool: "inline-source-map"
// };