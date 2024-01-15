const express = require("express");
const readline = require("readline");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const ytdl = require("ytdl-core");

const app = express();

const port = 5000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
  const videoLink = req.body.link;
  // console.log(videoLink);
  download(videoLink, res); // Pass 'res' to the download function
});

app.listen(port, () => {
  console.log("listening to " + port);
});

async function download(videoLink, res) {
  let n = Math.floor(Math.random() * 100);
  let url = videoLink;
  let videoId = ytdl.getURLVideoID(url);
  const output = path.resolve(__dirname, "video-" + n + ".mp4");
  const video = ytdl(url);

  // get info
  ytdl.getInfo(videoId).then((info) => {
    console.log("title :", info.videoDetails.title);
  });

  video.pipe(fs.createWriteStream(output));
  let starttime = Date.now(); // Corrected variable name
  video.once("response", () => {
    starttime = Date.now(); // Corrected variable name
  });

  video.on("progress", (chunkLength, downloaded, total) => {
    const percentage = downloaded / total;
    const downloadMinutes = (Date.now() - starttime) / 1000 / 60; // Corrected variable name
    const estimatedDownloadTime =
      downloadMinutes / percentage - downloadMinutes;
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${(percentage * 100).toFixed(2)}% downloaded`);
  });

  video.on("end", () => {
    process.stdout.write("\n\n");
    console.log("Download Complete ");
    res.sendFile(path.join(__dirname, "index.html")); // Corrected file path
  });
}
