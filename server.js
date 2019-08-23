var express = require('express'); // Express
var fs = require('fs'); // FileSystem
var path = require('path'); // File/directory path parsing
var bodyParser = require('body-parser'); // Data conversion, JSON parsing

// Set up Express
var api  = express();

api.use(express.static("./"));
api.use(express.json());

var data = fs.readFileSync('./default_news.json');

// Get information for room with roomId
api.get("/room/:roomId", function(req, res) {
    var data = data;

    if (req.params.roomId in data.rooms) {
        res.send(data.rooms[req.params.roomId]);
    } else {
        res.status(404).send();
    }
});

// Gets information for user with userId
api.get("/user/:userId", function(req, res) {
    var data = data;

    if (req.params.userId in data.users) {
        res.send(data.users[req.params.userId]);
    } else {
        res.status(404).send();
    }
});

// News route, digest received post JSON
api.post("/writenews", function(req, res) {
    handlePost(req, res);
});

// Start listening
api.listen(2019, function (){
    console.log("Listening on port 2019");
});

// Read and return current posts
function handleGetPosts(req, res)
{
    var data = fs.readFileSync('./default_news.json');
    var json = JSON.parse(data);
    res.send(json);
}

function saveData() {
    fs.writeFile('./default_news.json', JSON.stringify(json), (err) => {
        if (err)
        {
            throw err;
        }
        console.log("Saved JSON");
    });
}
