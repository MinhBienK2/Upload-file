const mongoose = require("mongoose");
const { Schema } = mongoose;

const dataSchema = new Schema({
    fileName: {
        type: [String],
    },
});

const Data = mongoose.model("Data", dataSchema);
module.exports = Data;