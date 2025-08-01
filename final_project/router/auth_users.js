const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  return true; //for now, we will return true
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  if (!isValid(username)) {
    return res.status(400).send("Invalid username");
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, "access", { expiresIn: '1h' });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User logged in successfully");
  } else {
    return res.status(401).send("Invalid login credentials");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).send("Book not found");
  }

  if (!review) {
    return res.status(400).send("Review cannot be empty");
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added successfully", book: books[isbn] });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
