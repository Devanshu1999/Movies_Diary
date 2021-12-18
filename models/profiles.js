const mongoose = require('mongoose')

const profilesSchema = mongoose.Schema({
    profile: {
        type: String,
        required: true,
        trim: true
    },
    moviesId: [{
        type: Number,
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'       //Value should be exact same as User model name
    }
})

const Profile = mongoose.model('Profile', profilesSchema);

module.exports = Profile;