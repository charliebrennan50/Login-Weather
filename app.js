var express = require('express');
var app = express();
const pool = require("./db");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override')
require('dotenv').config();
const PORT = process.env.PORT || 8000

app.set('view-engine', 'ejs');
app.use(express.json());

app.use(express.urlencoded({
    extended: false
}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.json());


const initializePassport = require('./passport-config');
initializePassport(
    passport,
    async (email) => {
        try {
            const userData = await pool.query(`SELECT * FROM users WHERE email='${email}'`);
            return userData.rows[0];
        } catch (error) {
            console.log(error.message);
        }
    },
    async (id) => {
        try {
            const userDataID = await pool.query(`SELECT * FROM users WHERE id='${id}'`);
            return userDataID.rows[0];
        } catch (error) {
            console.log(error.message);
        }
    },
)

// app.get('/', function (req, res) {
//    res.sendFile(__dirname + "/index.html");
// });

let currentUser;
app.get('/', checkAuthenticated, async (req, res) => {
  currentUser = await req.user;
  res.render('index.ejs', {
      name: currentUser.username
  });
})

app.get('/list', function (req, res) {
  res.render('list.ejs');
});

//get all items for current user

app.get("/api", async (req, res)=> {
  try {
      const allInputs = await pool.query(`SELECT * FROM weather WHERE user_id=${currentUser.id}`);
      res.json(allInputs.rows);
      //console.log(allInputs.rows)
  } catch (err) {
      console.error(err.message);        
  }
});

app.post('/api', async (request, response) => {
  let lt = request.body.lat;
  let ln = request.body.long;
  let cds = request.body.conditions;
  let tmp = request.body.temperature;
  let hum = request.body.humidity;
  let loc = request.body.location;
  let timestamp = new Date().toLocaleString();
  request.body.timestamp = timestamp;
  let notes = request.body.notes;
  let userID = currentUser.id;

  try {
      const newInput = await pool.query(
        `INSERT INTO weather(Latitude, Longitude, Conditions, Temperature, Humidity, Location, TimeStamp, Notes, user_ID) VALUES('${lt}', '${ln}', '${cds}', '${tmp}', '${hum}', '${loc}','${timestamp}','${notes}','${userID}')`);
  } catch (error) {
      console.log(error.message);
  }
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login', 
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs', );
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let newName = req.body.name;
      let newEmail = req.body.email;
      let newPassword = hashedPassword;
      try {
          const newInput = await pool.query(
            `INSERT INTO users(username, email, password) VALUES('${newName}', '${newEmail}', '${newPassword}')`);
      } catch (error) {
          console.log(`${error.message} unable to insert into database`);
      }
      res.redirect('/login');
  } catch (error) {
      res.redirect('/register');
  }
  // console.log(users);
});

app.delete('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
})

// if user authenticated, allow further access otherwise redirect to login page 
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/login');
}

// if logged-in user tries to log in or register, redirect to home page
function checkNotAuthenticated(req, res, next) {
  if ( req.isAuthenticated()) {
      return res.redirect('/');
  }
  next();
}

var server = app.listen(PORT, function () {

  console.log(`Express app listening at ${PORT}`);

});