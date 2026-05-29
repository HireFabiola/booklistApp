const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {type: String, required: true },
    author: {type: String, required: true },
    notes: {type: String, default: "" },
    completed: Boolean,
    favorite: Boolean,
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;