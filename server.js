// DEPENDENCIES
const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/BookModel");
const methodOverride = require("method-override");
const path = require("path");

// DATABASE
mongoose.connect(process.env.DATABASE_URI);

const db = mongoose.connection;

db.on("error", (err) => console.log(err.message + " is mongo not running?"));
db.on("connected", () => console.log("mongo connected"));
db.on("disconnected", () => console.log("mongo disconnected"));

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// ROUTES
// INDUCES

// HOME
app.get("/", (req, res) => {
    res.render("home.ejs");
});

// INDEX - regular book list
app.get("/books", async (req, res) => {
    try {
        const allBooks = await Book.find({});
        res.render("index.ejs", {
            books: allBooks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

// INDEX - bookshelf/pile view
app.get("/books/booklist", async (req, res) => {
    try {
        const filter = req.query.filter || "all";
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        let query = {};

        if (filter === "finished") {
            query = { completed: true };
        } else if (filter === "favorites") {
            query = { favorite: true };
        } else if (filter === "favoriteFinished") {
            query = { favorite: true, completed: true };
        }

        const totalBooks = await Book.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(totalBooks / limit));
      

        const books = await Book.find(query)
            .skip((page - 1) * limit)
            .limit(limit);

        res.render("booklist.ejs", {
            books,
            filter,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

// NEW
app.get("/books/new", (req, res) => {
    res.render("new.ejs");
});

// DELETE
app.delete("/books/:id", async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.redirect("/books/booklist");
    } catch (error) {
        console.error(error);
        res.status(500).send("There was an issue deleting the book.");
    }
});

// UPDATE FORM / EDIT
app.get("/books/:id/edit", async (req, res) => {
    try {
        const foundBook = await Book.findById(req.params.id);
        res.render("edit.ejs", {
            book: foundBook,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("There was an issue finding the book.");
    }
});


// CREATE
app.post("/books", async (req, res) => {
    try {
        req.body.favorite = req.body.favorite === "true" || req.body.favorite === "on";
        req.body.completed = req.body.completed === "true" || req.body.completed === "on";

        await Book.create(req.body);

        res.redirect("/books/booklist");
    } catch (error) {
        console.error("Error Creating Book!", error);
        res.status(500).send("ISSUE CREATING BOOK!");
    }
});

// CREATE
// app.post("/books", async (req, res) => {
//     try {
//         console.log("Raw form data:", req.body);
//         req.body.completed = req.body.completed === "on";
//         req.body.favorite = req.body.favorite === "on";

//         await Book.create(req.body);

//         console.log("Book has successfully been created!");
//         console.log("After conversion:", req.body);

//         res.redirect("/books/booklist");
//     } catch (error) {
//         console.error("Error creating book!", error);
//         res.status(500).send("ISSUE CREATING BOOK!");
//     }
// });

// UPDATE
app.put("/books/:id", async (req, res) => {
    try {
        req.body.favorite =
            req.body.favorite === "true" ||
            req.body.favorite === "on";

        req.body.completed =
            req.body.completed === "true" ||
            req.body.completed === "on";

        await Book.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: "after",
        });

        const filter = req.query.filter || "all";
        const page = req.query.page || 1;

        res.redirect(
            `/books/booklist?filter=${filter}&page=${page}`
        );

    } catch (error) {
        console.error(error);
        res.status(500).send(
            "There was an issue updating the book."
        );
    }
});
// UPDATE
// app.put("/books/:id", async (req, res) => {
//     try {
//         req.body.completed = req.body.completed === "on";
//         req.body.favorite = req.body.favorite === "on";

//         await Book.findByIdAndUpdate(req.params.id, req.body, {
//             returnDocument: "after",
//         });

//         res.redirect("/books/booklist");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("There was an issue updating the book.");
//     }
// });

// SHOW
app.get("/books/:id", async (req, res) => {
    try {
        const foundBook = await Book.findById(req.params.id);
        res.render("show.ejs", {
            book: foundBook,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("There was an issue showing the book.");
    }
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
});