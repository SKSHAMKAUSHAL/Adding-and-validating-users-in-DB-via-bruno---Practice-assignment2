const express = require('express');
const { resolve } = require('path');
const bcrypt = require('bcrypt');
const connectToDb = require('./db')
const jwt = require('jsonwebtoken');
const { url } = require('inspector');
const User = require('./userSchema')


require('dotenv').config();
const app = express();
app.use(express.json());

const port = process.env.PORT || 9000;
const DB_url = process.env.DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});


// app.post('/register', async (req, res) => {
//   const { username, mail, password } = req.body;

//   if (!username || !mail || !password) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ mail });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists." });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user
//     const newUser = new User({
//       username,
//       mail,
//       password: hashedPassword,
//     });

//     await newUser.save();
//     res.status(201).json({ message: "User registered successfully!" });

//   } catch (err) {
//     res.status(500).json({ message: "Internal server error", error: err.message });
//   }
// });


app.post('/login', async(req, res) => {
  const { mail, password} = req.body;

  if (!mail || !password){
    return res.status(400).json({message: `Bad request`})
  }

  try{
      const user = await User.findOne({mail});

      if (!user){
        return res.status(404).json({message: `User not found`})
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({message: `Login successful`, token})
    

  }catch(err){
    res.status(500).json({message: `Internal server error`, error: err})
  } 
})

app.listen(port, async() => {
    try{
      await connectToDb(DB_url);

      console.log(`Connected to DataBase`);
      console.log(`Example app listening at http://localhost:${port}`);

    }catch(err){
      console.log(err);
    }
  
});