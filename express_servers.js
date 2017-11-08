// Requiring necessary packages for the app
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true})); // To parse the form data 

app.set("view engine", "ejs"); // to use the ejs templates in app

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Home Page @ 127.0.0.1/
// Add a rendered Home page (better looking obviously) later

// Will add a form eventually to home page to look up fo rurl and shorten it
app.get("/", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


// URLs page--> takes to urls_index page: to view list of urls
// And a click button to shorten the url
app.get("/urls", (req, res) => {
	let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

// Takes to new page when we clicked the button from /urls page
app.get("/urls/:id", (req, res) => {
	let shortURL = req.params.id;
	let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars)
});


//new page NEW and renders the urls_new page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});