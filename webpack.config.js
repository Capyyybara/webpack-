const path = require('path');

/**
 * @type {import('webpack').Configuration}
 */
let config = {
    // 入口
    entry: './src/main.js',  // 相对路径
    // 输出
    output: {
        // 文件的输出路径
        path: path.resolve(__dirname, "dist"),   // 绝对路径
        // 文件名
        filename: "main.js",
    },
    // 加载器
    module: {
        rules: [
            // locader的配置
            {
                test: /\.css$/, // 只检测.css文件
                // use可以使用多个loader , loader只能使用一个loader
                // loader:'',
                use: [
                    // 执行顺序 , 从右到左 , 从下到上
                    "style-loader",     // 将js中的css通过创建style标签添加html文件中生效
                    "css-loader"        // 将css资源编译成commonjs的模块到js中
                ]
            },
            {
                test: /\.less$/,
                use: [
                    // compiles Less to CSS
                    'style-loader',
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
                }
            }
        ]
    },
    // 插件
    plugins: [
        // 插件的配置
    ],
    // 模式
    mode: "development"
};

module.exports = config;