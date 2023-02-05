let api = {
    baseURL: 'http://api.spotify.com/v1/users/', 
    clientID: '7ef91332c7434350807b58ebf8d6e212',
    clientSecrect: '3c04b110779c416d8827dee6e789c73f',
    redirect_uri: 'http://localhost:8080/callback'
}
const { json, request } = require('express');
//Building the server using express 
const express = require('express');
const app = express();
const requestFunc = require('request');
const path = require('path');


//Set the view engine
app.set('view engine', 'ejs'); //set a variable named 'view engine' using the engine 'ejs'

//REGULAR FUNCTIONS
//Function that geerates a random string of desrired 'length'
function generateRandomString(length){
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for(i = 0; i < length; i++){
        let randomIndex = Math.floor(Math.random() * ((characters.length-1) - 1));
        result = result + characters[randomIndex];
    }
    return result;
}

//BASE PAGE
app.get('/', (req, res) => {
    res.render('homePage.ejs');
    app.post('/', (req,res) =>{
      res.redirect('http://localhost:8080/login');
  })
})

//LOGIN (Gaining access from user)
app.get('/login', (req, res) => {
    //To protect the information, we will use a state
    const state = generateRandomString(16);
    //Since we are creating a playlist, the scopes that we will use are the following
    const scope = 'user-read-private user-read-email playlist-modify-private playlist-modify-public user-library-modify';
    //We redirect the user to spotify's login endpoint
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${api.clientID}&scope=${scope}&redirect_uri=${api.redirect_uri}&state=${state}`);
})


//ROUTERS
const callbackRouter = require('./routs/callback');
app.use('/callback', callbackRouter)

app.use(express.static(path.join(__dirname, 'public')))
app.listen(8080);