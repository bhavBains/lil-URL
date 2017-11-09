// Requiring necessary packages for the app
const express = require("express");
const app = express();
const bodyParser = require("body-parser"); 
const cookieParser = require('cookie-parser');

var PORT = process.env.PORT || 8080; // default port 8080

// Generating random alphanumeric string of length 6
function generateRandomString() {
    const length = 6;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    var result = '';
    for (let i = length; i > 0; --i) {
    	result += chars[Math.floor(Math.random() * chars.length)];
    } 
    return result;
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); // To parse the form data 

app.set("view engine", "ejs"); // to use the ejs templates in app

// Database for URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



// Home Page @ 127.0.0.1/
// Add a rendered Home page (better looking obviously) later
app.get("/", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


// URLs page--> takes to urls_index page: to view list of urls
// And a click button to shorten the url
app.get("/urls", (req, res) => {
	let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars)
});

// Registraion Page- GET and POST
app.get("/urls/register", (req, res) =>{
  let templateVars = { username : req.cookies["username"]};
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req,res)=>{
  res.redirect("/urls/register")
});

//new page NEW and renders the urls_new page
app.get("/urls/new", (req, res) => {
  let templateVars = { username : req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// Takes to new page when we clicked the button from /urls page
app.get("/urls/:id", (req, res) => {
	let shortURL = req.params.id;
	let templateVars = { username: req.cookies["username"], shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars)
});

app.post("/urls/:id/delete", (req,res) =>{
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req,res) =>{
  let id = req.params.id;
  let longURL = req.body.update;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) =>{
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});