const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/BookModel");
const methodOverride = require("method-override");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;
const DEMO_USERNAME = process.env.DEMO_USERNAME;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || "booklist-demo-secret";

mongoose
    .connect(process.env.DATABASE_URI)
    .catch((err) => console.log(err.message + " is mongo not running?"));

const db = mongoose.connection;

db.on("error", (err) => console.log(err.message + " is mongo not running?"));
db.on("connected", () => console.log("mongo connected"));
db.on("disconnected", () => console.log("mongo disconnected"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 2,
        },
    })
);

app.use((req, res, next) => {
    res.locals.isLoggedIn = Boolean(req.session.isLoggedIn);
    next();
});

const requireLogin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }

    res.redirect("/?loginRequired=true");
};

const convertCheckboxes = (bookData) => {
    bookData.favorite =
        bookData.favorite === "true" || bookData.favorite === "on";
    bookData.completed =
        bookData.completed === "true" || bookData.completed === "on";
};

app.get("/", (req, res) => {
    res.render("home.ejs", {
        loginError: req.query.loginError === "true",
        loginRequired: req.query.loginRequired === "true",
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        req.session.isLoggedIn = true;
        return res.redirect("/books");
    }

    res.redirect("/?loginError=true");
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.get("/books", requireLogin, async (req, res) => {
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

app.get("/books/booklist", requireLogin, async (req, res) => {
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
            totalPages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

app.get("/books/new", requireLogin, (req, res) => {
    res.render("new.ejs");
});

app.delete("/books/:id", requireLogin, async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.redirect("/books/booklist");
    } catch (error) {
        console.error(error);
        res.status(500).send("There was an issue deleting the book.");
    }
});

app.get("/books/:id/edit", requireLogin, async (req, res) => {
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

app.post("/books", requireLogin, async (req, res) => {
    try {
        convertCheckboxes(req.body);

        await Book.create(req.body);

        res.redirect("/books/booklist");
    } catch (error) {
        console.error("Error Creating Book!", error);
        res.status(500).send("ISSUE CREATING BOOK!");
    }
});

app.put("/books/:id", requireLogin, async (req, res) => {
    try {
        convertCheckboxes(req.body);

        await Book.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: "after",
        });

        const filter = req.query.filter || "all";
        const page = req.query.page || 1;

        res.redirect(`/books/booklist?filter=${filter}&page=${page}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("There was an issue updating the book.");
    }
});

app.get("/books/:id", requireLogin, async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
});
