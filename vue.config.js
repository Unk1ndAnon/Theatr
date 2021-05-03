module.exports = {
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: 'src/main/main.js',
      rendererProcessFile: 'src/renderer/index.js',
      nodeIntegration: true,
      externals: ['webtorrent', 'jsdom'],
    },
  },
};
