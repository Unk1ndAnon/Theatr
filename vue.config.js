module.exports = {
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: "src/main/main.js",
      rendererProcessFile: "src/renderer/index.js",
      nodeIntegration: true,
    },
  },
  chainWebpack: (config) => {
    //config.module.rules.delete("svg");
  },
  configureWebpack: {
    /*module: {
      rules: [
        {
          test: /\.svg$/,
          use: ["vue-loader", "vue-svg-loader"],
        },
      ],
    },*/
  },
};
