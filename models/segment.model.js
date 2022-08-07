const mongoose = require("mongoose");

const segmentSchema = new mongoose.Schema({
    document_id: {
        type: mongoose.Types.ObjectId,
        ref: "Documents",
    },
    text: {
        type: String,
    },
    bold: {
        type: String,
    },
    underline: {
        type: String,
    },
    strike: {
        type: String,
    },
    italic: {
        type: String,
    },
});

const Segment = mongoose.model("Segments", segmentSchema);

module.exports = Segment;
