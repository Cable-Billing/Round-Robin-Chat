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

// Get the user's user object
api.get("/api/me", function(req, res) {
    // Make sure we have data to work on
    if (!req.cookies["userID"]) {
        res.status(401).send();
    }

    // Check if the user exists
    var userID = req.cookies["userID"];
    if (!(userID in data.users)) res.status(404).send();

    // Send their user object
    res.send(data.users[userID]);
});

// Adds the user to a room and sends them the info
api.get("/api/join/:roomID", function(req, res) {
    // Make sure we have data to work on
    if (!req.params.roomID) {
        res.status(400).send();
        return;
    } else if (!req.cookies["userID"]) {
        res.status(401).send();
    }

    // Validate the user and group IDs they've sent
    var userID = req.cookies["userID"];
    var roomID = req.params.roomID;
    if (!(userID in data.users)) res.status(401).send();
    if (!(roomID in data.rooms)) res.status(404).send();

    // Add the user to the room if they aren't in it already
    if (!(userID in data.rooms[roomID].participants)) {
        data.rooms[roomID].participants.push(userID);
        saveData();
    }

    // Send them the room data
    res.send(data.rooms[roomID]);
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
