const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

// nodejs核心模块，直接使用
const os = require("os");
// cpu核数
const threads = os.cpus().length;


// 获取处理样式的Loaders
const getStyleLoaders = (preProcessor) => {
    return [
        MiniCssExtractPlugin.loader,
        "css-loader",
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        "postcss-preset-env", // 能解决大多数样式兼容性问题
                    ],
                },
            },
        },
        preProcessor,
    ].filter(Boolean);
};


/**
 * @type {import('webpack').Configuration}
 */
let config = {
    // 入口
    entry: './src/main.js',  // 相对路径
    // 输出
    output: {
        // 所有文件的输出路径
        path: path.resolve(__dirname, "../dist"),   // 绝对路径
        // 文件名
        filename: "static/js/main.js",
        // 自动清空上次打包的结果
        // 原理: 在打包前将path整个目录清空, 再进行打包
        clean: true
    },
    // 加载器
    module: {
        rules: [
            // locader的配置
            {
                oneOf: [
                    {
                        test: /\.css$/, // 只检测.css文件
                        // use可以使用多个loader , loader只能使用一个loader
                        // loader:'',
                        use: getStyleLoaders()
                    },
                    {
                        test: /\.less$/,
                        use: getStyleLoaders('less-loader')
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoaders("sass-loader")
                    },
                    {
                        test: /\.styl$/,
                        use: getStyleLoaders("stylus-loader")
                    },
                    {
                        test: /\.(png|jpe?g|git|webp|svg)$/,
                        type: "asset",
                        parser: {
                            dataUrlCondition: {
                                maxSize: 100 * 1024 // 4kb
                            }
                        },
                        generator: {
                            // 输出推按名称
                            // [hash:10] hash值取前10位
                            filename: 'static/images/[hash:10][ext][query]'
                        }
                    },
                    {
                        // 可以处理字体或者其他资源(例如音视频资源)
                        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
                        // 只会对文件原封不动的输出, 不会像 type: "asset" 转成base64格式
                        type: "asset/resource",
                        generator: {
                            // 输出推按名称
                            // [hash:10] hash值取前10位
                            filename: 'static/media/[hash:10][ext][query]'
                        }
                    },
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,    // 排除node_modules中的js文件
                        use: [
                            {
                                loader: "thread-loader", // 开启多进程
                                options: {
                                    workers: threads, // 数量
                                },
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    // presets: ['@babel/preset-env'],
                                    cacheDirectory: true, // 开启babel编译缓存
                                    cacheCompression: false, // 缓存文件不要压缩
                                    plugins: ["@babel/plugin-transform-runtime"],   // 减少代码体积, 避免在多个文件中注入相同的辅助代码
                                },
                            }],
                    },
                ]
            }
        ]
    },
    // 插件
    plugins: [
        // 插件的配置
        new ESLintPlugin({
            // 检测那些文件
            context: path.resolve(__dirname, '../src'),
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
            threads
        }),
        new HtmlWebpackPlugin({
            // 模版: 以public/index.html文件创建新的html文件
            // 新的html文件特点: 1. 结构和原来一直 2. 自动引入打包输出的资源
            template: path.resolve(__dirname, "../public/index.html")
        }),
        // 把css单独提取成文件
        new MiniCssExtractPlugin({
            filename: 'static/css/main.css'
        }),
        // css压缩
        // new CssMinimizerPlugin(),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            // css压缩也可以写到optimization.minimizer里面，效果一样的
            new CssMinimizerPlugin(),
            // 当生产模式会默认开启TerserPlugin，但是我们需要进行其他配置，就要重新写了
            new TerserPlugin({
                parallel: threads // 开启多进程
            }),
            // 压缩图片
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            [
                                "svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                            name: "sortAttrs",
                                            params: {
                                                xmlnsOrder: "alphabetical",
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ],
    },
    // 模式
    mode: "production",
    // 源代码映射, 可以看到源码中具体哪里错了
    devtool: "source-map",
};

module.exports = config;