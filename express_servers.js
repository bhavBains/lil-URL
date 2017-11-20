// Requiring necessary packages for the app
const express = require("express");
const bodyParser = require("body-parser"); 
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 8080; // default port 8080

const app = express();
app.use(bodyParser.urlencoded({extended: true})); // To parse the form data 
app.set("view engine", "ejs"); // to use the ejs templates in app

//Set up the cookie session middleware
app.use(cookieSession({
  name: 'session',
  keys: ['bhav'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Database for URLs
const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca",
              userId: "user1"
            },  
  "9sm5xK": { longURL: "http://www.google.com",
              userId: "user1"
            },  
  
};

// Database for USERS
const users = { 
  "user1": {
    id: "user1", 
    email: "abc@xyz.com", 
    password: "$2a$10$vtHvsvosFDDHJhIoBPrKbuOASmMdxZf7GtNLFOlMxao/uKAJe21qu"
    
  },
 "user2": {
    id: "user2", 
    email: "user2@example.com", 
    password: "1"
    
  }
};

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

//find the right urls for logged in user
function urlsForUser(userId) {
  const output = {};
  for (let url in urlDatabase) {
      if (userId === urlDatabase[url].userId) {
        output[url] = urlDatabase[url];
      }
  }
  return output;
}

// Home Page @ 127.0.0.1/
app.get("/", (req, res) => {
  res.redirect("/urls");
});


// URLs page--> takes to urls_index page: to view list of urls
app.get("/urls", (req, res) => {
	const user = users[req.session["user_id"]];
  let templateVars = { urls: urlsForUser(req.session["user_id"]), user: user };
  res.render("urls_index", templateVars)
});

// Registraion Page- GET and POST
app.get("/register", (req, res) =>{
  const user = users[req.session["user_id"]];
  let templateVars = { urls: users, user: user };
  res.render("urls_register", templateVars);
});

app.post("/register", (req,res)=>{
  const email = req.body.email;
  const password = req.body.password;
  if (!(email && password) && !password && !email) {
    res.status(401).render('urls_register', {error: 'Email or Password Missing'});
  } else if(emailTaken(email)){
    res.status(401).render('urls_register', {error: 'Email Taken'});
  } else {
      let hashedPassword = bcrypt.hashSync(password, 10);
      const user_id = generateRandomString();
      let user = {
        "id": user_id,
        "email": email,
        "password": hashedPassword,
      };
      users[user_id] = user;
      req.session.user_id = user_id; //Cookie
      res.redirect("/urls/");
    }
});

// LOGIN Page GET and POST
app.get("/login", (req, res) =>{
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUser(email);
  if (user) {
    if (bcrypt.compareSync(password, user.password)){
      req.session.user_id = user.id; // Set up the cookie here
      res.redirect("/urls");
    } else{
      res.status(403).render("urls_login", {error: 'Incorrect Password'});
    }
  } else {
    res.status(403).render("urls_login", {error: 'Incorrect email'});
  }
});

app.post("/logout", (req, res) =>{
  req.session = null;
  res.redirect("/urls");
});

//new page NEW and renders the urls_new page
app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    let templateVars = { user: user};
    res.render("urls_new", templateVars); 
  } else {
      res.status(401).render("urls_index", {error: 'You must be logged IN'}).redirect("/urls");
    }    
});

// Takes to new page when we clicked the button from /urls page
app.get("/urls/:id", (req, res) => {
	const user = users[req.session["user_id"]];
  if (user) {
    let shortURL = req.params.id;
    console.log(shortURL);
    let templateVars = { user: user, shortURL: shortURL, longURL: urlDatabase[shortURL].longURL };
    res.render("urls_show", templateVars)  
  } else {
      res.status(401).render("urls_index", {error: 'You must be logged IN'}).redirect("/urls");
  }
});

// Delete an ULR
app.post("/urls/:id/delete", (req,res) => {
  const userId = req.session.user_id;
  let id = req.params.id;
  let urlObject = urlDatabase[id];
  if (userId && users[userId]){
    if (userId === urlObject.userId){
      delete urlDatabase[id];
      res.redirect("/urls"); 
    } else {
      res.status(401).render("urls_index", {error: 'You are not the owner of this Url'}).redirect("/urls");
    }
  } else {
    res.status(401).render("urls_index", {error: 'You must be logged IN'}).redirect("/urls");
  }
});

// Update an existing url link
app.post("/urls/:id/update", (req,res) =>{
  const userId = req.session.user_id;
  let id = req.params.id;
  let urlObject = urlDatabase[id];
  if (userId && users[userId]) {
    if (userId === urlObject.userId){
      let longURL = req.body.update_longURL;
      urlDatabase[id].longURL = longURL;
      res.redirect("/urls");
    } else {
      res.status(400).render("urls_index", {error: 'You must be logged IN'}).redirect("/urls");
    }
  } else {
      res.status(400).render("urls_index", {error: 'You must be logged IN'}).redirect("/urls");
    }
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const value = req.body.longURL;
  const shortURL = generateRandomString();
  if (!userId) {
    res.status(401).render("urls_index", {error: 'You must be logged IN'}).redirect("/urls");
  }

  urlDatabase[shortURL] = { longURL: value,
                            shortURL: shortURL,
                            userId: userId
                          };
 res.redirect('/urls');    
});

app.listen(PORT, () => {
  console.log(`SERVER IS ON on port ${PORT}!`);
});