const express = require("express");
const multer = require("multer");
const port = 3001;
const app = express();
const path = require("path");
const dataModel = require("./models/Data");
const Document = require("./models/document.model");
const Segment = require("./models/segment.model");
const database = require("./config/db");
var XLSX = require("xlsx");
const fs = require("fs");
const unzipper = require("unzipper");
var xml2js = require("xml2js");

// Connect database
database();

// Set engine
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "views")));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "file/");
    },
    filename: function (req, file, cb) {
        const name = file.originalname.replace(".docx", ".zip");
        cb(null, name);
    },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.render("index");
});

const data = [];

app.post("/upload", upload.single("file"), async (req, res) => {
    await fs
        .createReadStream(`file/${req.file.filename}`)
        .pipe(
            unzipper.Extract({
                path: path.join(
                    __dirname,
                    `/output/${req.file.filename.replace(".zip", "")}`
                ),
            })
        )
        .promise();
    var parser = new xml2js.Parser();

    await fs.readFile(
        __dirname +
            `/output/${req.file.filename.replace(".zip", "")}/docProps/app.xml`,
        function (err, data) {
            parser.parseString(data, async function (err, result) {
                const filename = req.file.filename;
                const ext =
                    req.file.originalname.split(".")[
                        req.file.originalname.split(".").length - 1
                    ];
                const path = req.file.path;
                pages = result.Properties.Pages[0];
                const datas = await Document.create({
                    filename,
                    ext,
                    path,
                    pages,
                });
                // ---------------
                fs.readFile(
                    __dirname +
                        `/output/${req.file.filename.replace(
                            ".zip",
                            ""
                        )}/word/document.xml`,
                    function (err, data) {
                        parser.parseString(data, async function (err, result) {
                            result["w:document"]["w:body"][0]["w:p"].forEach(
                                (ele) => {
                                    if (ele["w:r"][0]) {
                                        const segment = new Segment({
                                            document_id: datas.id,
                                            text: r["w:r"][0]["w:t"][0],
                                            bold: r["w:r"][0]["w:rPr"][0]["w:b"]
                                                ? true
                                                : false,
                                            underline: r["w:r"][0]["w:rPr"][0][
                                                "w:u"
                                            ]
                                                ? true
                                                : false,
                                            italic: r["w:r"][0]["w:rPr"][0][
                                                "w:i"
                                            ]
                                                ? true
                                                : false,
                                            strike: r["w:r"][0]["w:rPr"][0][
                                                "w:strike"
                                            ]
                                                ? true
                                                : false,
                                        });
                                        await segment.save();
                                    }
                                }
                            );
                        });
                    }
                );
                // console.log(data);
            });
            res.status(200).send(req.file);
        }
    );
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
