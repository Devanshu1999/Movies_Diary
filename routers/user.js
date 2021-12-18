const express = require('express');
const User = require('../models/users.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
})

router.get('/register' , async (req, res) => {
    res.render('register', {error: undefined});
})

router.get('/login' , async (req, res) => {
    res.render('login', {error: undefined});
})

router.post('/register', async (req, res) => {
    const user = new User(req.body);
    if(user.username.includes(' ') || user.password.includes(' ')) {
        return res.render('register',{error: "Spaces are not allowed"});
    }
    try{
        const isPresent = await User.findDuplicate(user.username);
        if(isPresent){
            return res.render('register',{error: "User already exists."});
        }
        await user.save();
        const token = await user.generateAuthToken();
        res.cookie('auth_token', token);
        res.redirect('/welcome');
    }
    catch(e){
        res.render('register', {error: "Username and password size should be > 5"});
    }
})

router.post('/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.username, req.body.password);
        const token = await user.generateAuthToken();

        res.cookie('auth_token', token);

        res.redirect('/welcome');
    }
    catch (e) {
        res.render('login', {error: "User not found"});
    }
})

router.post('/logout', auth, async (req, res) => {
    try{
        res.clearCookie('auth_token');
        req.user.token = '';
        req.user.save();
        res.redirect('/');
    }
    catch(e) {
        res.send(e);
    }
})

module.exports = router;