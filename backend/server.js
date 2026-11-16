const express = require('express'); // load s the package installed 
const app = express(); // creates my server application and store it in app  also need for the server running 
// now we can use app for every req front sends to the back and use methods like get post etc fro res

// add cors 
const cors = require('cors');
app.use(cors({
    origin : 'http://localhost:5500',
      credentials: true                      // only allow cors for this origin if any origin then cors()dont write anything 
}));

// use for nothing the requests coming to server . just like a building security guard 
function logger(req,res,next){
    console.log(req.method + ' '+req.url); // notes the coming req and print it in terminal 
    next(); // after noting send the req to the prefered path 
}
app.use(logger); // do for every request 

// database connect 
const db =require('./db');
app.use(express.json()); // for express to understand incoming json 

// bcrypt 
const bcrypt = require('bcrypt');

//session id with step 7 session expiry
const session = require('express-session');
app.use(session({
   secret: 'dev-secret-change-later',
   resave: false,
   saveUninitialized: false,
   cookie: {maxAge: 1000 * 20  } // 30 min  1000 * 20 means 20 sec 
}));

// isAuthenticated step 6 
function isAuthenticated(req,res,next){
    if(req.session.userId){   // req.session.userId exists only if /login set it for this session
        return next();
    }
    res.status(401).json({error: 'Not logged in'});
}


// -------------- Routes ----------------------

app.get('/',(req,res) => {
    res.send('server is running');
});

app.get('/hello',(req,res) => {
    res.json({message: 'hello from the backend'});
});

app.get('/about',(req,res) => {
    res.json({message : 'a simple login page with session and jwt athentication'});
});

app.get('/text',(req,res) => {
    res.send('WHite test to see');
});
 
// registering a user 
app.post('/register', (req,res) => {
    const {username, email, password } = req.body ;

    //validation 
    if(!username || !email || !password){
        return res.status(400).json({error: 'All fields are required '});
    }
    if(password.length <6){
        return res.status(400).json({error: 'Password must be atleast 6 characters'});
    }

    // dublicate check 
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if(existing){
        return res.status(409).json({error: 'Email already registered'});
    }

    // insert and reply with a safely net 
      try {
        const hashed = bcrypt.hashSync(password,10);
    db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      .run(username, email, hashed);
    res.status(201).json({ message: 'User registered', wow: 'hagura shdjhbhjnhbgbhdn'}); // wow just for seeing things we can give anything in response 
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }

});

// login session 
app.post('/login', (req,res) => {
     const {email, password}=req.body;
     
     
     if(!email || !password){
        return res.status(400).json({error: 'Email and password are required '});
     }
     // chacking the hashed passsword
     const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
     const ok = user && bcrypt.compareSync(password,user.password);
     if(!ok){
        return res.status(401).json({error: 'Invalid email or password'});
     }
req.session.userId = user.id; // the session is created here 
res.json({message: 'Logged in'});
});


// isAthenticated protected route 
app.get('/profile', isAuthenticated, (req, res) => {
  const user = db
    .prepare('SELECT id, username, email, created_at FROM users WHERE id = ?')
    .get(req.session.userId);

  if (!user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  res.json({ user });
});

//logout route 
app.post('/logout', (req,res) => {
   req.session.destroy((err) => {
    if(err){
        return res.status(500).json({error: 'Could not log out'});
    }
    res.clearCookie('connect.sid');
    res.json({message: 'Logged out'});
   });
});


// 404: no route matched
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// global error handler: 4 parameters
app.use((err, req, res, next) => {
  console.log(err);                       // the real error stays in the terminal

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  res.status(500).json({ error: 'Something went wrong' });
});


// listens for traffic in port 3000 
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
 