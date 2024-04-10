const express = require('express');
const cors = require('cors');
const app = express(); 
app.use(cors());
const User = require('./models/user.model');
const DB = require('./models/db');
const nodemailer = require('nodemailer');
const   bcrypt = require('bcrypt');
const OTP = require('./models/otp');


const PORT = process.env.PORT ||  3000 ;
app.use(express.json());


app.post("/signup", (req,res) => {
    console.log(req.body);
    const {userName, email, password}=req.body;
    if(!userName || !email ||!password)
        return   res.status(422).json({error:"Please add all the fields"});
    else{
        User.findOne({email: req.body.email})
        .then(saveduser => {
            if(!saveduser){
                bcrypt.hash(password,12)
                .then((hashedPassword)=>{

                let newuser = new User();
                newuser.userName = userName;
                newuser.email = email;
                newuser.password = hashedPassword;

                newuser.save()
                    .then(response => { 
                         return res.status(200).json({msg:"User Create Successfully"});
                    });
                });
            }
            else{
                return res.status(422).json({msg:"Email Already Exist"});
            }
        });
    }
    
})



app.post("/login",(req,res)=>{
    console.log("hiiii jiiii")
    const {email,password}=req.body;
    if(!email || !password){
      return res.status(422).json({error:"Please fill all the fields"})
    }
    else{
      User.findOne({email:email})
      .then(savedUser=>{
          if(!savedUser)
          return res.status(422).json({error:"Invaild Email"})
          else{
              bcrypt.compare(password,savedUser.password)
              .then(doMatch=>{
                  if(doMatch){
                    return res.status(200).json({user:savedUser, msg:"Login Successful"})
                  }
                  else{
                      return res.status(422).json({error:"Inavild Password"})
                  }
              })
          }
      })
    }
});



app.post("/googleSignin",(req,res)=>{
    console.log("Google")
    const {email,userName}=req.body;
    if(!email || !userName){
      return res.status(422).json({error:"Error invalid user"})
    }
    else{
      User.findOne({email:email})
      .then(savedUser=>{
          if(!savedUser)
          {
            let newuser = new User();
            newuser.userName = userName;
            newuser.email = email;

            newuser.save()
                .then(response => { 
                    return res.status(200).json({msg:"User Create Successfully"});
                });
          }
          else{
            return res.status(200).json({user:savedUser, msg:"Login Successful"})
          }
      })
    }
});




app.post("/forgetPassword", (req,res) => {

    const { email }=req.body;
    if(!email)
        return   res.status(422).json({error:"Please add all the fields"});
    else{
        User.findOne({email: email})
        .then(saveduser =>  {
            if(saveduser){

                let newOTP = Math.floor(Math.random() * 9000) + 1000;
                // Create a transporter object using SMTP transport
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'getmetherapy9@gmail.com', // Your email address
                        pass: 'stksmcnsjrhqllax' // Your password
                    }
                });

                // Setup email data with unicode symbols
                let mailOptions = {
                    from: 'getmetherapy9@gmail.com', // Sender address
                    to: `${saveduser.email}`, // List of receivers
                    subject: 'Forget password', // Subject line
                    text: `For chaning your password OTP is ${newOTP}`, // Plain text body
                    
                };

                // Send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log("Your Error",error);
                    }
                    if(info.messageId){
                        
                        // saving Otp in DB 
                        let db_otp = new OTP();
                        db_otp.user_id =  saveduser['_id'];
                        db_otp.otp = newOTP;

                        db_otp.save()
                            .then(response => { 
                                return res.status(200).json({msg:"Otp Successfully", id: response['_id']});
                            });

                    }
                    else{
                        return res.status(422).json({msg:"Something went wrong"});
                    }
                });

            }
            else{
                return res.status(422).json({msg:"User does not exist!"});
            }
        });
    }
    
});



app.post("/verifyOTP",(req, res) => {
    const { id, myOtp } = req.body;
    OTP.findOne({ _id : id})
        .then(savedOtp => {
            if(savedOtp && myOtp == savedOtp.otp){
                return res.status(200).json({id:savedOtp.user_id, msg:"Verified"})
            }
            else{
                return res.status(422).json({ msg:"Not Verified"})
            }
        })

}),



app.put("/newPassword",(req, res) => {
    const { id, password } = req.body;
    User.findOne({ _id : id})
        .then(saveuser => {
            if(saveuser){
                bcrypt.hash(password,12)
                .then((hashedPassword)=>{             
                saveuser.password = hashedPassword;

                saveuser.save()
                    .then(response => { 
                         return res.status(200).json({msg:"Successful"});
                    });
                });
                
            }
            else{
                return res.status(422).json({ msg:"Error"})
            }
        })

}),



app.listen(PORT,() => {
    console.log(`Server is running at ${PORT}`);
})