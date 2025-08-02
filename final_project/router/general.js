const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  if (!isValid(username)) {
    return res.status(400).send("Invalid username");
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).send(`User ${username} already exists`);
  }

  users.push({ username, password });
  return res.status(200).send("User registered successfully");
});

// Get the book list available in the shop
// public_users.get('/', function (req, res) {
//   return res.status(200).json({ books: books });
// });

public_users.get('/', function (req, res) {
  // Using Promise to get book list
  const getBooks = new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });

  getBooks
    .then((bookList) => {
      return res.status(200).json({ books: bookList });
    })
    .catch((error) => {
      return res.status(500).json({ error: "Failed to retrieve books" });
    });
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//   const isbn = req.params.isbn;
//   if (books[isbn]) {
//     return res.status(200).json(books[isbn]);
//   } else {
//     return res.status(404).send("Book not found");
//   }
// });

public_users.get('/isbn/:isbn', function (req, res) {
  // Using Promise to get book details by ISBN
  const getBookByISBN = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((error) => {
      return res.status(404).send(error);
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const foundBooks = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());
  if (foundBooks.length > 0) {
    return res.status(200).json(foundBooks);
  } else {
    return res.status(404).send("No books found by this author");
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const foundBooks = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
  if (foundBooks.length > 0) {
    return res.status(200).json(foundBooks);
  } else {
    return res.status(404).send("No books found with this title");
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const reviews = books[isbn].reviews;
    if (Object.keys(reviews).length > 0) {
      return res.status(200).json(reviews);
    } else {
      return res.status(404).send("No reviews found for this book");
    }
  } else {
    return res.status(404).send("Book not found");
  }
});

module.exports.general = public_users;
