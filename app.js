const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const passport =require('passport');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');


//load config
dotenv.config({path:'./config/config.env'});

//passport config
require('./config/passport')(passport);

connectDB();

const app = express();

//body parser
app.use(express.urlencoded({extended:false}));
// app.use(express.json);

//method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }));
//logging
app.use(morgan('dev'));

//hadlebars helpers
const { formatDate, truncate, stripTags, editIcon } = require('./helpers/hbs')

//handleBars
app.engine('.hbs', exphbs.engine({helpers:{formatDate, truncate, stripTags, editIcon} 
    , defaultLayout: 'main',extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

//sessions
app.use(session({
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    secret: 'duhastmich',
    resave: false,
    saveUninitialized: false,
    
}));
//passport middleware
app.use(passport.initialize());
app.use(passport.session());
//set glopal variables 
app.use(function(req,res,next){
    res.locals.user= req.user || null
    next()
})

//static folder
app.use(express.static(path.join(__dirname,'public')));

//routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));


const PORT=process.env.PORT;

app.listen(PORT,console.log(`app is running on  http:/localhost/${PORT} `));