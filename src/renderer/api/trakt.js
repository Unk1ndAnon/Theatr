const Trakt = require("trakt.tv");
const open = require("open");
const http = require("http");

let options = {
  client_id: "abd8388ef21f4471d28de0c6b7006499815a4c0916232ee094d55b388c0ae640",
  client_secret:
    "a2ce6a4e52fa3287f31dabdfe62a6038a402e7df3f05f2fe5e41cdd64ea75a64",
  redirect_uri: "http://localhost:8437/trakt/authorize", // defaults to 'urn:ietf:wg:oauth:2.0:oob'
  pagination: true, // defaults to false, global pagination (see below)
};

const trakt = new Trakt(options);
const traktAuthUrl = trakt.get_url(); // Generate Auth URL

open(traktAuthUrl);

const requestListener = (req, res) => {
  console.log(req.url);

  const code = req.url.match(/authorize\?code=(\w+)/)[1];

  trakt.exchange_code(code).then((r) => {
    // contains tokens & session information
    // API can now be used with authorized requests
    console.log(r);

    trakt.sync.history.get().then((r) => {
      console.log(r);
    });
  });
};

const server = http.createServer(requestListener);
server.listen(8437);

console.log("Trakt OAuth listener on " + 8437);

export default trakt;
