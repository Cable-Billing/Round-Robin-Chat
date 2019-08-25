var express = require('express'); // Express
var fs = require('fs'); // FileSystem
var path = require('path'); // File/directory path parsing
var bodyParser = require('body-parser'); // Data conversion, JSON parsing
var uuid = require('uuid/v4'); // UUID generation
var cookieParser = require('cookie-parser'); // Request cookie parsing

// Set up Express
var api  = express();

api.use(express.static("./"));
api.use(cookieParser());
api.use(express.json());

var data = loadData();

// Get information for room with roomId
api.get("/api/room/:roomId", function(req, res) {
    if (req.params.roomId in data.rooms) {
        res.send(data.rooms[req.params.roomId]);
    } else {
        res.status(404).send();
    }
});

// Gets information for user with userId
api.get("/api/user/:userId", function(req, res) {
    if (req.params.userId in data.users) {
        res.send(data.users[req.params.userId]);
    } else {
        res.status(404).send();
    }
});

// Registers a new user with the name they provide
api.post("/api/register", function(req, res) {
    // Make sure we have data to work on
    if (!req.body || !req.body.name) {
        res.status(400).send();
        return;
    }

    // Check if they are already registered and have a cookie
    var cookieUserID = req.cookies["userID"];
    if (cookieUserID && cookieUserID in data.users) {
        // Send them a 304 to indicate nothing has changed
        res.status(304).send();
        return;
    }

    // Generate a new ID and add them to the user list
    var id = "U-" + uuid();
    data.users[id] = {
        "name": req.body.name,
        "id": id
    };

    // Save to disk
    saveData();

    // Add their new userID to a cookie
    res.cookie('userID', id);

    // Reply with the new user object
    res.send(data.users[id]);
});

// Start listening
api.listen(2019, function (){
    console.log("Listening on port 2019");
});

function loadData() {
    var file = fs.readFileSync('./data.json');
    var json = JSON.parse(file);
    console.log("Loaded JSON");
    return json;
}

function saveData() {
    fs.writeFile('./data.json', JSON.stringify(data, null, 4), (err) => {
        if (err)
        {
            throw err;
        }

        console.log("Saved JSON");
    });
}
