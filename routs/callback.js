
//Create the router
const { application } = require('express');
const express = require('express');
const router = express.Router();
const requestFunc = require('request');
router.use(require("express").json());

router.use(express.urlencoded({extended: false}));
//Base Info & Variables
let api = {
    baseURL: 'http://api.spotify.com/v1/users/', 
    clientID: '7ef91332c7434350807b58ebf8d6e212',
    clientSecrect: '3c04b110779c416d8827dee6e789c73f',
    redirect_uri: 'http://localhost:8080/callback'
}
let accessToken;
let userID;
let playlistID;
let uriList = []; //Where we will store the songs added to the playlist
//MIDLEWARE
const getAccessToken = (req,res,next) => {
    //This will be all the information for our post request
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: req.query.code,
            redirect_uri: 'http://localhost:8080/callback',
            grant_type: 'authorization_code'
        },
        headers:{
            'Authorization': 'Basic ' + (new Buffer.from(api.clientID + ':' + api.clientSecrect).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        json: true
    }
    //Post request
    requestFunc.post(authOptions, function(error, response, body){
        accessToken  = body.access_token;
        //If here that means we have the value of the accessToken, so we can move on
        next();
    })
}

const getUserID = (req, res, next) => {
    //Get the user's ID (Neccesary for create Playlist Get)
    const userOptions = {
        url: 'https://api.spotify.com/v1/me', //Endpoint for userInfo
        headers: { 
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + accessToken
        },
        json: true
    }
    requestFunc.get(userOptions, function(error, response, body){
        userID = body.id;
        next();
    })
}

const createPlaylist = (req, res, next) => {
    //use the CreatePlaylist API to create the playlist with the details user gave
    console.log(userID);
    const createOptions = {
        url: `https://api.spotify.com/v1/users/${userID}/playlists`,
        body: {
            name: req.body.name,
            description: req.body.disc,
            public: true
        },
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + accessToken
        },
        json: true
    }
    //Creates the Playlist 
    requestFunc.post(createOptions, function(error, response, body){
        if (error) {
            return console.error('Get failed:', error);
        }
        else{
            playlistID = body.id;
            res.redirect(`http://localhost:8080/callback/create`);
            next();
        }
    })
}

router.get('/', getAccessToken, getUserID, (req,res) =>{
    res.render('musicCenterRender'); //render the html for the callback page
    //get the value of the querystring code and state. If you cant get anything, then set them to null
    const state = req.query.state || null;
    if(state === null){
        //In the case there is no state, redirect to errorpage
        res.redirect('/errorPage?error=state_mismatch');
    }
    else{
        router.post("/", createPlaylist, (req,res,next) =>{})
    }
});

const getSongURI = (req,res,next) =>{
    let indexNum = 0;
    while(true){
        if(req.body[indexNum] != null){
            console.log("true");
            let searchOptions = {
                url: `https://api.spotify.com/v1/search?q=${req.body[indexNum]}&type=track&market=US&limit=2`,
                headers: {
                    'Accept' : 'application/json',
                    'Content-Type' : 'application/json',
                    'Authorization' : 'Bearer ' + accessToken
                },
                json: true
            }
            requestFunc.get(searchOptions, function(error, response, body){
                uriList.push(body.tracks.items[0].uri);
                console.log(body.tracks.items[0].uri);
                if(uriList.length == indexNum){
                    next();
                }
            })
            indexNum++;
        }
        else{
            console.log("not real");
            console.log(indexNum);
            break;
        }
    }
}

const addSongsToPlaylist = (req,res,next) =>{
    console.log(uriList);
    console.log("playListID:" + playlistID);
    const addOptions = {  
        url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks?uris=${uriList}`, 
        headers:{
            'Accept' : 'application/json',
            'Content-Type' : 'application/json',
            'Authorization' : 'Bearer ' + accessToken
        },
        json: true
    }
    requestFunc.post(addOptions, function(error, response, body){
        console.log(body);
        res.redirect('http://localhost:8080/callback/userPlaylist');
        next();
    })
}

router.get('/create', (req, res) =>{
    res.sendFile('C:\\Users\\marti\\OneDrive\\Desktop\\Web_Practice\\musicCenter\\views\\createPage.html'); //renders the html
    router.post("/create", getSongURI, addSongsToPlaylist, (req, res, next) =>{})
});


router.get('/userPlaylist', (req,res) =>{
    res.send("CREATED");
})

module.exports = router;



