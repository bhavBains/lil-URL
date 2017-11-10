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

// Database for USERS
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function emailTaken(email){
  // Check to see if email is taken
  for(let key in users){
    if(users[key].email === email)
      return true;
  }
  return false;
}

function findUser(email){
  // To find user-id from database
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
}

// Home Page @ 127.0.0.1/
// Add a rendered Home page (better looking obviously) later
app.get("/", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


// URLs page--> takes to urls_index page: to view list of urls
// And a click button to shorten the url
app.get("/urls", (req, res) => {
	const user = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars)
});

// Registraion Page- GET and POST
app.get("/urls/register", (req, res) =>{
  const user = users[req.cookies["user_id"]];
  let templateVars = { urls: users, user: user };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  if (!(email && password) && !password && !email) {
    res.status(400).render('urls_register', {error: 'Email or Password Missing'});
  } else if(emailTaken(email)){
    res.status(400).render('urls_register', {error: 'Email Taken'});
  } else {
    const user_id = generateRandomString();
    let user = {
      "id": user_id,
      "email": email,
      "password": password
    };
    users[user_id] = user;
    res.cookie("user_id", user_id);
    res.redirect("/urls/");
  }
});

// LOGIN Page GET and POST
app.get("/urls/login", (req, res) =>{
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUser(email);
  if (user) {
    if (user.password == password){
      
      res.cookie("user_id", user.id); // Set up the cookie here
      res.redirect("/urls");
    } else{
      res.status(403).render("urls_login", {error: 'Incorrect Password'});
    }
  } else {
    res.status(403).render("urls_login", {error: 'Incorrect email'});
  }
});

app.post("/logout", (req, res) =>{
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//new page NEW and renders the urls_new page
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user: user};
  res.render("urls_new", templateVars);
});

// Takes to new page when we clicked the button from /urls page
app.get("/urls/:id", (req, res) => {
	const user = users[req.cookies["user_id"]];
  let shortURL = req.params.id;
	let templateVars = { user: user, shortURL: shortURL, longURL: urlDatabase[shortURL] };
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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.listen(PORT, () => {
  console.log(`lISTENING on port ${PORT}!`);
});