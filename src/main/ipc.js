import { scrapeIDs } from "../renderer/api/fanart";
const { ipcMain } = require("electron");

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
