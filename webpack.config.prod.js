const webpack = require("webpack");
const path = require("path");
const ObservableI18nPlugin = require("@alumis/observables-i18n");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

let minAgents = {

    // https://caniuse.com/#search=flex

    edge: "12",
    firefox: "28",
    chrome: "29",
    safari: "9",
    opera: "17",
    ios: "9"
};

let targetPaths = [{

    path: "wwwroot", targets: minAgents
}];

let versions = {};
let builtIns = require("@babel/preset-env/data/corejs2-built-ins.json");

for (let bi in builtIns) {

    let agents = builtIns[bi];

    for (let a in agents) {

        let agentVersions = versions[a];

        if (!agentVersions)
            versions[a] = agentVersions = [];

        agentVersions.push(agents[a]);
    }
}

function compareVersions(a, b) {

    let A = a.split(".");
    let B = b.split(".");

    let result = parseInt(A[0]) - parseInt(B[0]);

    if (result !== 0)
        return 0 < result ? 1 : -1;

    result = (2 <= A.length ? parseInt(A[1]) : 0) - (2 <= B.length ? parseInt(B[1]) : 0);

    if (result !== 0)
        return 0 < result ? 1 : -1;

    result = (3 <= A.length ? parseInt(A[2]) : 0) - (3 <= B.length ? parseInt(B[2]) : 0);

    if (result !== 0)
        return 0 < result ? 1 : -1;
}

for (let a in versions) {

    let agentVersions = versions[a];
    let min = minAgents[a];

    if (min)
        agentVersions = agentVersions.concat([min]);

    (versions[a] = [...new Set(agentVersions.map(v => {

        let i = v.indexOf("-");

        if (i == -1)
            return v;

        return v.substr(0, i);

    }))]).sort(compareVersions);
}

for (let a in minAgents) {

    let agentVersions = versions[a];
    let minVersion = minAgents[a];

    for (let i = 0; i < agentVersions.length; ++i) {

        let version = agentVersions[i];

        if (version === minVersion) {

            for (; i < agentVersions.length; ++i) {

                let targets = {};

                targets[a] = version = agentVersions[i];;
                targetPaths.push({ path: "wwwroot/" + a + "/" + version, targets: targets });
            }

            break;
        }
    }
}

function removeFileExtension(fileName) {
    
    let i = fileName.indexOf("?"), query;

    if (i !== -1)
        query = fileName.substr(i), fileName = fileName.substr(0, i);
    
    fileName = fileName.substr(0, fileName.lastIndexOf("."));

    if (query)
        fileName += query;

    return fileName;
}

console.log("Hent en kaffe!");

module.exports = targetPaths.map(function (tp) {

    return {

        entry: "./ClientApp/src/index.tsx",
        output: {
            path: path.resolve(__dirname, tp.path)
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".scss"],
            modules: [
                "node_modules",
                "src",
            ]
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts|tsx)$/,
                    loader: "babel-loader",
                    options: {
                        presets: [["@babel/env", { targets: tp.targets, useBuiltIns: "usage", corejs: 2 }], "@babel/typescript"],
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
                IS_DEV: JSON.stringify(false),
                IS_PROD: JSON.stringify(true),
                VER: JSON.stringify(require("./package.json").version)
            }),
            new ObservableI18nPlugin({
                defaultLanguageCode: "no",
                languageCodes: ["no", "en"]
            }),
            new HtmlWebpackPlugin({
                title: "Alumis App",
                template: "./ClientApp/public/index.html",
                filename: "index.html",
                hash: true,
                favicon: "./ClientApp/public/favicon.ico",
                minify: {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true
                }
            }),
            new MiniCssExtractPlugin()
        ],
        optimization: {
            minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        }
    };
});