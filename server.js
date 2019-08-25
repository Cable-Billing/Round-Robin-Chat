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

// Get information for room with roomID
api.get("/api/room/:roomID", function(req, res) {
    // Make sure we have data to work on
    if (!req.params.roomID) {
        res.status(400).send();
        return;
    }

    // Validate the roomID they've sent
    var roomID = req.params.roomID;
    var room = data.rooms.find(room => room.id == roomID);
    if (!room) {res.status(404).send(); return;};

    // Send the room data
    res.send(room);
});

// Gets information for user with userID
api.get("/api/user/:userID", function(req, res) {
    // Make sure we have data to work on
    if (!req.params.userID) {
        res.status(400).send();
        return;
    }

    // Find the user with the userID they sent
    var userID = req.params.userID;
    var user = data.users.find(user => user.id == userID);
    if (!user) {res.status(404).send(); return;};

    // Send the user data
    res.send(user);
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
    if (cookieUserID && data.users.find(user => user.id == cookieUserID)) {
        // Send them a 304 to indicate nothing has changed
        res.status(304).send();
        return;
    }

    // Generate a new ID and add them to the user list
    var id = "U-" + uuid();
    data.users.push({
        "id": id,
        "name": req.body.name
    });

    // Save to disk
    saveData();

    // Add their new userID to a cookie
    res.cookie('userID', id);

    // Reply with the new user object
    res.send(data.users.find(user => user.id == id));
});

// Get the user's user object
api.get("/api/me", function(req, res) {
    // Make sure we have data to work on
    if (!req.cookies["userID"]) {
        res.status(401).send();
        return;
    }

    // Validate the userID they've sent
    var userID = req.cookies["userID"];
    var user = data.users.find(user => user.id == userID);
    if (!user) {res.status(401).send(); return;};

    // Send their user object
    res.send(user);
});

// Get the user's current room
api.get("/api/currentroom", function(req, res) {
    // Make sure we have data to work on
    if (!req.cookies["userID"]) {
        res.status(401).send();
        return;
    }

    // Validate the userID they've sent
    var userID = req.cookies["userID"];
    var user = data.users.find(user => user.id == userID);
    if (!user) {res.status(401).send(); return;};

    // Find the room the user is currently in
    for (var room of data.rooms) {
        console.log(room);
        console.log(user);
        if (room.participants.includes(user.id)) {
            res.send(room);
            return;
        }
    }

    // Couldn't find the current room
    res.status(404).send();
});

// Adds the user to a room and sends them the info
api.get("/api/join/:roomID", function(req, res) {
    // Make sure we have data to work on
    if (!req.params.roomID) {
        res.status(400).send();
        return;
    } else if (!req.cookies["userID"]) {
        res.status(401).send();
        return;
    }

    // Validate the userID they've sent
    var userID = req.cookies["userID"];
    var user = data.users.find(user => user.id == userID);
    if (!user) {res.status(401).send(); return;};

    // Validate the roomID they've sent
    var roomID = req.params.roomID;
    var room = data.rooms.find(room => room.id == roomID);
    if (!room) {res.status(404).send(); return;};

    // Add the user to the room if they aren't in it already
    if (!(userID in room.participants)) {
        room.participants.push(userID);
        saveData();
    }

    // Send them the room data
    res.send(room);
});

// Remove the user from the room with the given roomID
api.delete("/api/currentroom", function(req, res) {
    // Make sure we have data to work on
    if (!req.cookies["userID"]) {
        res.status(401).send();
        return;
    }

    // Validate the userID they've sent
    var userID = req.cookies["userID"];
    var user = data.users.find(user => user.id == userID);
    if (!user) {res.status(401).send(); return;};

    // Get the room the user is in
    var room = data.rooms.find(room => room.participants.includes(user.id));
    if (!room) {res.status(404).send(); return;}

    // Get the userID index and remove it from the array
    var userIndex = room.participants.indexOf(user.id);
    room.participants.splice(userIndex, 1);
    saveData();

    // Send a successful empty response
    res.status(204).send();
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
