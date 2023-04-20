import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import renderApp from "./dist/server/ServerApp.js";

// __dirname is not available in ES modules
// https://stackoverflow.com/questions/61742805/how-to-get-the-current-directory-name-in-an-es-module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 3000;

const html = fs
  .readFileSync(path.resolve(__dirname, "dist/client/index.html"))
  .toString();

const parts = html.split("not rendered");

const app = express();

app.use(
  "/assets",
  express.static(path.resolve(__dirname, "./dist/client/assets"))
);

app.use((req, res) => {
  res.write(parts[0]);
  // This is where we render the app to a stream
  // and pipe it to the response object
  const stream = renderApp(req.url, {
    onShellReady() {
      stream.pipe(res);
    },
    onShellError(error) {
      res.end(error.message);
    },
    onAllReady() {
      res.write(parts[1]);
      res.end();
    },
    onError(err) {
      console.log(err);
    },
  });
});

console.log(`Listening on http://localhost:${port}`);
app.listen(port);
