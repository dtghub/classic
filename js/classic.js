(function(){
  'use strict';

  var classicGameStatus = {
    locationID: 0, //the current room

    //The following are used for command parsing
    classicTurnCommand: "", //the text the user has entered in the current turn
    // Noun and verb are produced by the classicParsing funtion, and used as the command interface - might implement adverbs later?
    classicVerb: "", // the result of the parsing logic
    classicNoun: "", // the result of the parsing logic
    classicCommandNotRecognised: false, // set to true if no verb was identified
    //an array to store room statuses
    //an array to store object status elements
  };



  //Should expand this to load in all the JSONs in one go
  function classicLoadRoomJson(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'http://localhost/json/rooms.json', true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        console.log(xobj.responseText);
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  }



  function classicUpdateDescription(gameStatus) {
    'use strict';

    //Initialise location on first use
    if (classicGameStatus.locationID === 0) {
      classicGameStatus.locationID = 1;
      console.log('here we are');
    }

    gameStatus.value += '\n' + classicGameStatus.classicTurnCommand;

    if (classicGameStatus.classicCommandNotRecognised) {
      gameStatus.value += "\nSorry, I didn't understand that!";
    }

    //This is initial kludge to help get the code structure into place
    //gameStatus.setAttribute('disabled', false);
      if (true) {

      }
      switch (classicGameStatus.locationID) {
        case 1:
          gameStatus.value += "\nYou are in test room number one.";
          break;
        case 2:
          gameStatus.value += "\nThis is test room number two.";
          break;
        }

      //Extract and add the room description from the rooms JSON
      //gameStatus.value += "/n" +



      //This makes sure that the bottom line of text in the gameStatus box is visible after an update.
      gameStatus.scrollTop = gameStatus.scrollHeight;

      gameStatus.setAttribute('disabled', true);
      console.log('third');
  }






  function classicParseEnteredCommand(commandBox) {
    'use strict';

    classicGameStatus.classicTurnCommand = commandBox.value;

    //Parsing logic to go here - in the meantime...
    if (classicGameStatus.classicTurnCommand.search(/north/i) !== -1) {
      classicGameStatus.classicVerb = "north";
    } else if (classicGameStatus.classicTurnCommand.search(/south/i) !== -1) {
      classicGameStatus.classicVerb = "south";
    } else {
      classicGameStatus.classicVerb = undefined;
    }

    console.log(classicGameStatus.classicVerb);
    commandBox.value = '';
  }






  function classicProcessParsedCommand() {
    'use strict';

    classicGameStatus.classicCommandNotRecognised = false;

    if (classicGameStatus.classicVerb === 'north') {
      classicGameStatus.locationID = 2;
    }

    if (classicGameStatus.classicVerb === 'south') {
      classicGameStatus.locationID = 1;
    }

    if (classicGameStatus.classicVerb !== 'north' && classicGameStatus.classicVerb !== 'south') {
      classicGameStatus.classicCommandNotRecognised = true;
    }

}





  // Functioning as 'Main loop' for now...
  function classicTurn() {
    'use strict';

    // Form references: - once the code gets fleshed out, consider if maybe these references should be moved to the init function for efficiency...
    var gameStatus = document.getElementById('game');
    var commandBox = document.getElementById('commandBox');
    //var submit = document.getElementById('submit');

    var classicFunctionReturn = [];


    classicFunctionReturn = classicParseEnteredCommand(commandBox);

    classicLoadRoomJson(function(classicRoomJson) {
        //console.log(classicRoomJson);// this will log out the json object
        //Take the values (or references?...) from classicRoomJson and populate them into the relevant parts of classicGameStatus
        //Do we maybe just link the object we are currently calling classicRoomJson directly into classicGameStatus in the function call??? - or is it better to have the values...
        debugger
        console.log(classicGameStatus);
          });

    classicFunctionReturn = classicProcessParsedCommand();

    classicUpdateDescription(gameStatus);

    // return false to prevent submission for now:
    return false;
  }







  function init() {
    'use strict';
    document.getElementById('theForm').onsubmit = classicTurn;
  }

  window.onload = init;

})();
