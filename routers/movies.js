const express = require('express');
const auth = require('../middleware/auth.js');
const Profile = require('../models/profiles.js');
const fetch = require('node-fetch');

const router = express.Router();

router.get('/welcome', auth, async (req, res) => {
    const profiles = await Profile.find({owner: req.user._id});
    res.render('welcome', {user: req.user.username, profiles});
});

router.post('/welcome', auth, async (req, res) => {
    const duplicate = await Profile.findOne({ profile: req.body.profile, owner: req.user._id });

    if(duplicate){
        return res.status(204).send()
    }

    const profile = new Profile({
        profile: req.body.profile,
        owner: req.user._id
    });

    try{
        await profile.save();
        res.send();
    }
    catch(e){
        res.status(204).send();
    }
});

router.post('/deleteProfile', auth, async(req, res) => {
    try{
        const profile = await Profile.findOneAndDelete({ profile: req.body.profile, owner: req.user._id });
        res.send();
    }
    catch(e){
        res.status(204).send();
    }
})

router.post('/getData', auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({ profile: req.body.profile, owner: req.user._id });
        const movies = profile.moviesId;
        res.send(movies);
    }
    catch(e){
        res.send({error: e})
    }
});

router.get('/suggestMovies/:movieName', auth, async (req, res) => {
    try{
        const response = await fetch('https://api.themoviedb.org/3/search/movie?api_key=' + process.env.TMDB_API_KEY + '&language=en-US&query='+ req.params.movieName +'&page=1');
        const data = await response.json();
        
        let moviesList = [];
        let result;
        for(var i = 0; i<=5 && i<data.results.length; i++){
            result = data.results[i];
            moviesList.push({
                id: result.id,
                title: result.title,
                poster: result.poster_path,
                release_date: result.release_date
            });
        }
        res.send(moviesList);
    }
    catch(e){
        res.send(e);
    }
});

router.post('/saveMovie', auth, async (req, res) => {
    try{
        const profileName = req.body.profile;
        const IdMovie = req.body.movieId;
        const profile = await Profile.findOne({ profile: profileName, owner: req.user._id });
    
        if(profile.moviesId.includes(IdMovie)){
            return res.send({ error: 'Movie already in watchlist for profile - ' + profileName });
        }

        profile.moviesId.push(IdMovie);
        await profile.save();

        const response = await fetch('https://api.themoviedb.org/3/movie/' + IdMovie + '?api_key=' + process.env.TMDB_API_KEY + '&language=en-US');
        const data = await response.json();

        res.send({
            id: data.id,
            title: data.title,
            poster: data.poster_path,
            overview: data.overview,
            release_date: data.release_date,
            runtime: data.runtime,
            rating: data.vote_average
        });
    }
    catch(e){
        console.log(e)
        res.send({ error: e });
    }
});

router.get('/getMovie/:id', auth, async (req, res) => {
    try{
        const response = await fetch('https://api.themoviedb.org/3/movie/' + req.params.id + '?api_key=' + process.env.TMDB_API_KEY + '&language=en-US');
        const data = await response.json();
        res.send({
            id: data.id,
            title: data.title,
            poster: data.poster_path,
            overview: data.overview,
            release_date: data.release_date,
            runtime: data.runtime,
            rating: data.vote_average
        });
    }
    catch(e){
        res.send({error: e});
    }
});

router.post('/deleteMovie', auth, async (req, res) => {
    try{
        const movieId = req.body.movieId;
        const profile = await Profile.findOne({ profile: req.body.profile, owner: req.user._id });
        const idArray = profile.moviesId;
        for(let i = 0; i<idArray.length; i++){
            if(idArray[i] === movieId){
                idArray.splice(i,1);
            }
        }
        await profile.save();
        res.send();
    }
    catch(e){
        res.status(404).send({error: e});
    }
})

module.exports = router;