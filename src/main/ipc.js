const { ipcMain } = require("electron");

import { scrapeIDs } from "../renderer/api/fanart";
import { get_video_info } from "../renderer/api/youtube";

/**
 * Scrape FanArtTV data (bypassing CORS)
 */
ipcMain.on("scrape-fanarttv", (e, ...args) => {
  const id = args[0];
  const title = args[1];
  const year = args[2];
  const section = args[3];
  console.log("Scraping FanArt", id, title, year, section);

  scrapeIDs(title, section)
    .then((r) => {
      e.reply(`fanarttv-scrape-${id}`, r.data);
    })
    .catch((e) => {
      console.log("Error scraping fanart");
    });
});

/**
 * ffmpeg
 */
ipcMain.on("", (e, ...args) => {});

/**
 * YouTube
 */
ipcMain.on("yt-get-video-info", (e, ...args) => {
  const key = args[0];
  console.log("Scraping", key);

  /*get_video_info(key)
    .then((r) => {
      e.reply(`yt-get-video-info-${key}`, r.data);
    })
    .catch((e) => {
      console.log("Error scraping Youtube");
      console.error(e);
    });*/
    
});

ipcMain.on("onVideoPlay", (e, ...args) => {
  const powerSaveBlocker = require("./power-save-blocker");
  powerSaveBlocker.enable();
});

ipcMain.on("onVideoEnd", (e, ...args) => {
  const powerSaveBlocker = require("./power-save-blocker");
  powerSaveBlocker.disable();
})
