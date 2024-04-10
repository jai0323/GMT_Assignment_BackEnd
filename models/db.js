const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const conn = await mongoose.connect('mongodb+srv://clayjensen320:Hanna143@cluster0.86fs4et.mongodb.net/users');
        console.log('DB connected successfully');
    }catch (error){
        console.log(error);
    }
}

module.exports = connectDB();