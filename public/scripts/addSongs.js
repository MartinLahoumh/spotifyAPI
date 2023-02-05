let songList = []; //This array will hold all song names so that we can give in our post request when getting the songs the user added 

function addSong(){
    let songName = document.getElementById("search-box").value;
    songList.push(songName); 
    //create a new div that will hold the song name 
    let displayName = document.createElement("div");
    displayName.appendChild(document.createTextNode(songName)) 
    //Add it onto the song-list div by appending it
    document.getElementById("song-list").appendChild(displayName);
    console.log(songName);
}

//Export the songlist so that it is avaliable to use in /create
exports.songList = songList;

const form = document.querySelector("form");
form.addEventListener("submit", e =>{
    fetch("http://localhost:8080/callback/create", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(songList)
    })
})