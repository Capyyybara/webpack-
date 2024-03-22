const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// nodejs核心模块，直接使用
const os = require("os");
// cpu核数
const threads = os.cpus().length;

/**
 * @type {import('webpack').Configuration}
 */
let config = {
    // 入口
    entry: './src/main.js',  // 相对路径
    // 输出
    output: {
        // 所有文件的输出路径
        // 开发模式没有输出, 所以不需要指出输出路径
        // path: path.resolve(__dirname, "dist"),   // 绝对路径
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
                // 每个文件只能被其中一个loader处理
                oneOf: [
                    {
                        test: /\.css$/, // 只检测.css文件
                        // use可以使用多个loader , loader只能使用一个loader
                        // loader:'',
                        use: [
                            // 执行顺序 , 从右到左 , 从下到上
                            MiniCssExtractPlugin.loader,     // 将js中的css通过创建style标签添加html文件中生效
                            "css-loader"        // 将css资源编译成commonjs的模块到js中
                        ]
                    },
                    {
                        test: /\.less$/,
                        use: [
                            // compiles Less to CSS
                            MiniCssExtractPlugin.loader,
                            'css-loader',
                            'less-loader',
                        ],
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: [
                            // Creates `style` nodes from JS strings
                            "style-loader",
                            // Translates CSS into CommonJS
                            "css-loader",
                            // Compiles Sass to CSS
                            "sass-loader",
                        ],
                    },
                    {
                        test: /\.styl$/,
                        use: ["style-loader",
                            // Translates CSS into CommonJS
                            "css-loader",
                            "stylus-loader"
                        ] // compiles Styl to CSS
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
                                },
                            }],
                    },
                ]
            }
        ]
    },
    // 插件
    // 路径为绝对路径
    plugins: [
        // 插件的配置
        new ESLintPlugin({
            // 检测那些文件
            context: path.resolve(__dirname, '../src'),
            exclude: 'node_modules',     // 默认值
            cache: true,
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/.eslintcache"),
            threads
        }),
        new HtmlWebpackPlugin({
            // 模版: 以public/index.html文件创建新的html文件
            // 新的html文件特点: 1. 结构和原来一直 2. 自动引入打包输出的资源
            template: path.resolve(__dirname, "../public/index.html")
        }),
    ],
    // 开发服务器: 不会输出资源, 在内存中编译打包
    devServer: {
        host: "localhost",
        port: "3000",
        open: true,
        hot: true
    },
    // 模式
    mode: "development",
    devtool: "cheap-module-source-map",
};

module.exports = config;