const mongoose=require('mongoose')

let userSchema = new mongoose.Schema({
    userName:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    
})

let user = mongoose.model('users', userSchema)

module.exports = user;