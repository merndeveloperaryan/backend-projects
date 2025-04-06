const express = require("express");
const path = require("path");
const fs = require("fs");
const server = express();

server.set("view engine", "ejs");
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/", (req, res) => {
  fs.readdir("./files", (err, files) => {
    if (err) return res.status(500).send(err);
    res.render("index", { files });
  });
});

server.get("/create", (req, res) => {
  res.render("create");
});

server.get("/edit/:filename", (req, res) => {
  const filename = req.params.filename;
  fs.readFile(`./files/${filename}`, "utf-8", (err, data) => {
    if (err) return res.status(500).send(err);
    res.render("edit", { data, filename });
  });
});

server.get("/read/:filename", (req, res) => {
  const filename = req.params.filename;
  fs.readFile(`./files/${filename}`, "utf-8", (err, data) => {
    if (err) return res.status(500).send(err);
    res.render("read", { data, filename });
  });
});

server.post("/create-file", (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const filedata = req.body.filedata;

  const folder = "./files";
  const baseName = `${day}-${month}-${year}`;
  let filename = `${baseName}.txt`;
  let counter = 1;

  // Function to check and create unique file
  function createUniqueFile(name) {
    const fullPath = path.join(folder, name);

    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        // File doesn't exist — create it
        fs.writeFile(fullPath, filedata, (err) => {
          if (err) return res.status(500).send(err);
          res.redirect("/");
        });
      } else {
        // File exists — try with counter
        filename = `${baseName}_${counter}.txt`;
        counter++;
        createUniqueFile(filename);
      }
    });
  }

  createUniqueFile(filename);
});


server.post("/update/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);
  const filedata = req.body.filedata;

  fs.writeFile(`./files/${filename}`, filedata, (err) => {
    if (err) return res.status(500).send(err);
    res.redirect("/");
  });
});

server.get("/delete/:filename", (req, res) => {
  const filename = req.params.filename;
  fs.unlink(`./files/${filename}`, (err) => {
    if (err) return res.status(500).send(err);
    res.redirect("/");
  });
});

server.listen(3000);
