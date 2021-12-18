require('dotenv').config()
require('../db/mongoose.js');
const cookieParser = require('cookie-parser');
const express = require('express');
const userRouter = require('../routers/user.js');
const moviesRouter = require('../routers/movies.js');
const path = require('path');

const port = process.env.PORT;
const app = express();

const publicDirectoryPath = path.join(__dirname, '../public');

app.set('view engine', 'ejs');

// To remove pages from browser cache, so user cannot get the data back after successful logout
app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(express.static(publicDirectoryPath));
app.use(userRouter);
app.use(moviesRouter);

app.get('*', (req, res) => {
    res.send('<h2>Page not found</h2>');
})

app.listen(port, () => {
    console.log('Listening to port: ' + port);
})