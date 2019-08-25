var app = angular.module("app", []);

var sampleUser = {
    "name": "Greg (You)",
    "id": "4559246",
    "imageUrl": "https://i.imgur.com/pqC2hBL.png"
};

app.controller("body",
    [
        "$scope",
        "$sce",
        "$filter",
        "$interval",
        function($scope, $sce, $filter, $interval)
        {
            $scope.room = {
                "id": "00a9ff",
                "name": "Tom, Dick, and Harry's Funtime Extravaganza",
                "host": "1095632",
                "currentSpeaker": "4294712",
                "nextTurn": new Date().getTime() + 10000,
                "participants": [
                    "1095632",
                    "4294712",
                    "7728621"
                ]
            };

            $scope.users = [
                {
                    "name": "Tom",
                    "id": "1095632",
                    "imageUrl": "https://photos.laineygossip.com/articles/tom-cruise-mummy-30may17-17.jpg"
                },
                {
                    "name": "Dick",
                    "id": "4294712",
                    "imageUrl": "http://afflictor.com/wp-content/uploads/2010/02/Dick_Cheney.jpg.jpeg"
                },
                {
                    "name": "Harry",
                    "id": "7728621",
                    "imageUrl": "https://www.allthetests.com/quiz31/picture/pic_1404655017_1.jpg"
                }
            ];

            $scope.connected = false;
            $scope.connectClick = function()
            {
                $scope.connected = !$scope.connected;
                if ($scope.connected)
                {
                    // Freshly-connected
                    console.log("Connecting...");

                    // Add the sample user to the user list
                    $scope.users.push(sampleUser);

                    // Add the sample user to the participant list
                    $scope.room.participants.push(sampleUser.id);

                    console.log($scope.room);
                    console.log($scope.users);
                }
                else
                {
                    // Disconnecting
                    console.log("Disconnecting...");

                    // Move to the next participant if we're currently speaking
                    if ($scope.room.currentSpeaker == sampleUser.id) $scope.cycleParticipants();

                    // Remove the sample user from the participant list
                    $scope.room.participants.splice($scope.users.findIndex(user => user.id == sampleUser.id), 1);

                    // Remove the sample user from the user list
                    $scope.users.splice($scope.users.findIndex(user => user.id == sampleUser.id), 1);

                    console.log($scope.room);
                    console.log($scope.users);
                }
            }

            $scope.currentParticipantIndex = function()
            {
                if (!$scope.room) throw "Room is not defined or is empty";

                var currentSpeakerIndex = $scope.room.participants.indexOf($scope.room.currentSpeaker);
                if (currentSpeakerIndex < 0) throw "The current speaker isn't in the participants list";

                return currentSpeakerIndex;
            }

            $scope.getParticipantRelative = function(offset)
            {
                var targetIndex = $scope.currentParticipantIndex() + offset;


                // Wrap around
                while (targetIndex < 0) targetIndex += $scope.room.participants.length;
                while (targetIndex >= $scope.room.participants.length) targetIndex -= $scope.room.participants.length

                // Get the participant's ID
                var participantID = $scope.room.participants[targetIndex];

                // Make sure they exist in the user list
                var user = $scope.users.find(user => user.id == participantID);
                if (!user) throw "The participant with id '" + participantID + "' does not exist in the user list";

                // Return the user data
                return user;
            }

            $scope.getParticipantByID = function(id)
            {
                var user = $scope.users.find(user => user.id == id);
                if (!user) throw "The user with id '" + id + "' does not exist in the user list";

                return user;
            }

            $scope.timeUntilNextTurn = () => Math.max(new Date($scope.room.nextTurn) - new Date(), 0);
            $scope.formattedTimeUntilNextTurn = () => Math.max(($scope.timeUntilNextTurn()/1000), 0).toFixed(2); // Just manually format the damn thing

            $scope.turnTimeRemaining = $scope.formattedTimeUntilNextTurn();
            $scope.updateTurnTimeRemaining = function()
            {
                $scope.turnTimeRemaining = $scope.formattedTimeUntilNextTurn();

                // Temporary for demonstration
                if ($scope.timeUntilNextTurn() <= 0)
                {
                    $scope.cycleParticipants();
                    $scope.room.nextTurn = new Date().getTime() + 10000;
                }
            }

            $interval($scope.updateTurnTimeRemaining, 41);

            $scope.cycleParticipants = function()
            {
                var newParticipantIndex = $scope.currentParticipantIndex() + 1;
                if (newParticipantIndex >= $scope.room.participants.length) newParticipantIndex = 0;
                $scope.room.currentSpeaker = $scope.room.participants[newParticipantIndex];
                $scope.room.nextTurn = new Date().getTime() + 10000;
            }
        }
    ]
);
