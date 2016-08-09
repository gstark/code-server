module.exports = {
    entry: "./public/assets/app.jsx",
    output: {
        path: 'public/dist',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel"}
        ]
    }
};
