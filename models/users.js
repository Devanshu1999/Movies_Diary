const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minLength: 5,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 5
    },
    token: {
        type: String
    }
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = async function() {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET);

    user.token = token;

    await user.save();

    return token;
}

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({username});

    if(!user){
        throw new Error('Unable to login. User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error('Unable to login. User not found');
    }

    return user;
}

userSchema.statics.findDuplicate = async (username) => {
    const user = await User.findOne({username});

    return user;
}

userSchema.pre('save', async function(next) {
    const user = this;
    
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;