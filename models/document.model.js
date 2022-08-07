const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
    },
    ext: {
        type: String,
    },
    path: {
        type: String,
    },
    pages: {
        type: Number,
    },
});

const Document = mongoose.model("Documents", documentSchema);

module.exports = Document;
