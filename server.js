require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const passport_setup = require('./passport-setup')
const cookieSession = require('cookie-session')
const NewUrl = require('./models/newUrl')



const app = express()

//Connection to database
mongoose.connect('mongodb://localhost/teenyurl',{
    useNewUrlParser: true, useUnifiedTopology:true
})

//initialize cookiesession
app.use(cookieSession({
    name: 'tuto-session',
    keys:['key1,key2']
}))

//setting view engine
app.set('view engine','ejs')

app.use(express.urlencoded({extended: false}))

//initializes passport and passport sessions
app.use(passport.initialize())
app.use(passport.session())

// Auth middleware that checks if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

//reduce the cookie size and returns the id to the callback function 'done'.
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

//routes
app.get('/',(req, res)=>{
    res.render('index')
})
app.get('/failed',(req,res)=>res.send('you failed to login!'))

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',passport.authenticate('google',{failureRedirect:'/failed'}),function(req,res){
    //if success
    res.render('dashboard',{
        name:req.user.displayName,
        newUrls : null
    })
})
app.get('/stats',async (req,res)=>{
    const newUrls = await NewUrl.find()
    res.render('stats', {
        newUrls: newUrls
    })
})


app.get('/dashboard',isLoggedIn,async (req,res)=>{
    const newUrls = await NewUrl.find()
    res.render('dashboard',{
        name:req.user.displayName,
        newUrls: newUrls
    })
})

app.post('/newUrls',async (req,res)=>{
    await NewUrl.create({original: req.body.originalUrl}) 
    res.redirect('/dashboard')
})

app.get('/logout',(req,res)=>{
    req.session = null
    req.logOut()
    res.render('index')
})

app.get('/:newUrl',async(req,res)=>{
    const newUrl = await NewUrl.findOne({new: req.params.newUrl})

    if(newUrl == null) return res.sendStatus(404)

    newUrl.clicks++
    newUrl.save()

    res.redirect(newUrl.original)
})
//setting port
app.listen(process.env.PORT || 5000)

