(function(){
  'use strict';

  var classicGameStatus = {
    locationID:0, //the current room

    //The following are used for command parsing
    classicTurnCommand:"", //the text the user has entered in the current turn
    classicVerb:"", // the result of teh parsing logic
    classicNoun:"", // the result of teh parsing logic
    classicCommandNotRecognised:false, // set to true if no verb was identified
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
        //console.log(xobj.responseText);
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  }



  function classicUpdateDescription(gameStatus, classicTurnCommand, classicCommandNotRecognised) {
    'use strict';

    //Initialise location on first use
    if (classicGameStatus.locationID === 0) {
      classicGameStatus.locationID = 1;
      console.log('here we are');
    }

    gameStatus.value += '\n' + classicTurnCommand;

    if (classicCommandNotRecognised) {
      gameStatus.value += "\nSorry, I didn't understand that!";
    }

    //This is initial kludge to help get the code structure into place
    gameStatus.setAttribute('disabled', false);
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

    var classicTurnCommand = commandBox.value;
    var classicVerb = "";
    var classicNoun = "";

    //Parsing logic to go here - in the meantime...
    if (classicTurnCommand.search(/north/i) !== -1) {
      classicVerb = "north";
    } else if (classicTurnCommand.search(/south/i) !== -1) {
      classicVerb = "south";
    } else {
      classicVerb = undefined;
    }

    console.log(classicVerb);
    commandBox.value = '';
    return [classicTurnCommand, classicVerb, classicNoun];
  }






  function classicProcessParsedCommand(classicVerb, classicNoun) {
    'use strict';

    var classicCommandNotRecognised = false;

    if (classicVerb === 'north') {
      classicGameStatus.locationID = 2;
    }

    if (classicVerb === 'south') {
      classicGameStatus.locationID = 1;
    }

    if (classicVerb !== 'north' && classicVerb !== 'south') {
      classicCommandNotRecognised = true;
    }

    return [classicCommandNotRecognised, classicVerb, classicNoun]
  }





  // Functioning as 'Main loop' for now...
  function classicTurn() {
    'use strict';

    // Form references: - once the code gets fleshed out, consider if maybe these references should be move to the init function for efficiency...
    var gameStatus = document.getElementById('game');
    var commandBox = document.getElementById('commandBox');
    //var submit = document.getElementById('submit');

    var classicFunctionReturn = [];

    // Noun and verb are produced by the classicParsing funtion, and used as the command interface - might implement adverbs later?
    var classicNoun;
    var classicVerb;
    var classicTurnCommand;
    var classicCommandNotRecognised = false;

    classicFunctionReturn = classicParseEnteredCommand(commandBox);
    classicTurnCommand = classicFunctionReturn[0];
    classicVerb = classicFunctionReturn[1];
    classicNoun = classicFunctionReturn[2];


    console.log(classicVerb);

    classicLoadRoomJson(function(classicRoomJson) {
      console.log(classicRoomJson);// this will log out the json object
        //Take the values (or references?...) from classicRoomJson and populate them into the relevant parts of classicGameStatus
        //Do we maybe just link the object we are currently calling classicRoomJson directly into classicGameStatus in the function call??? - or is it better to have the values...
          });

    classicFunctionReturn = classicProcessParsedCommand(classicVerb, classicNoun);
    classicCommandNotRecognised = classicFunctionReturn[0];
    classicVerb = classicFunctionReturn[1];
    classicNoun = classicFunctionReturn[2];


    classicUpdateDescription(gameStatus, classicTurnCommand, classicCommandNotRecognised);

    // return false to prevent submission for now:
    return false;
  }







  function init() {
    'use strict';
    document.getElementById('theForm').onsubmit = classicTurn;
  }

  window.onload = init;

})();
