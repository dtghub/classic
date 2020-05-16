(function(){
  'use strict';

  var classicGameStatus = {
    locationID: 1, //the current room Initialised to room 1 just now - this needs to be looked at to allow for saved games - I don't think this is needed - just do the initialisation from the init function!

    //Form references
    gameStatus: document.getElementById('game'),
    commandBox: document.getElementById('commandBox'),

    //These are places to load the game data to - the 'rooms' 'commands' 'objects' etc
    classicRoomJson: {uninitialised: true},
    classicCommandsJson: {uninitialised: true},

    //This is an array to record whch rooms have already been visited - as each new room is visited it is pushed into the array. We can access the rooms list using if (roomPreviouslyVisited.includes(<roomnumber>))
    roomPreviouslyVisited: [1],
    roomDescriptionRequired: true,
    roomLongDescriptionRequired: true,


    //The following are used for command parsing
    classicTurnCommand: "", //the text the user has entered in the current turn
    // Noun and verb are produced by the classicParsing funtion, and used as the command interface - might implement adverbs later?
    classicMovementVerb: "", //Has the user requested to move?
    classicVerb: "", // the result of the parsing logic
    classicNoun: "", // the result of the parsing logic
    classicCommandNotRecognised: false, // will set to true if no verb was identified
    //an array to store room statuses
    //an array to store object status elements
  };




  function classicLoadCommandsJson(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  }




  function classicLoadRoomJson(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("text/application");
    xobj.open('GET', 'http://localhost/cgi-bin/fetchroom.pl?value=' + classicGameStatus.locationID, true);

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
        classicTurnPart2(); //Complete the classicTurn loop when ready.
      }
    };
    xobj.send(classicGameStatus.locationID);
  }






  function classicUpdateDescription() {
    'use strict';




    if (classicGameStatus.classicCommandNotRecognised) {
      classicGameStatus.gameStatus.value += "\nSorry, I didn't understand that!";
    }

    //This is initial kludge to help get the code structure into place
    //gameStatus.setAttribute('disabled', false);
      if (classicGameStatus.roomDescriptionRequired) {
        if (classicGameStatus.roomLongDescriptionRequired)  {
          classicGameStatus.gameStatus.value += "\n" + classicGameStatus.classicRoomJson.longDescription;
        } else {
          classicGameStatus.gameStatus.value += "\n" + classicGameStatus.classicRoomJson.shortDescription;
        }
      }

      //Extract and add the room description from the rooms JSON
      //gameStatus.value += "/n" +



      //This makes sure that the bottom line of text in the gameStatus box is visible after an update.
      classicGameStatus.gameStatus.scrollTop = classicGameStatus.gameStatus.scrollHeight;

      classicGameStatus.gameStatus.setAttribute('disabled', true);
      console.log('third');
  }






  function classicParseEnteredCommand() {
    'use strict';


    classicGameStatus.classicMovementVerb = "";
    classicGameStatus.classicVerb = "";
    classicGameStatus.classicNoun = "";
    classicGameStatus.classicCommandNotRecognised = false;


    classicGameStatus.classicTurnCommand = classicGameStatus.commandBox.value;

    var firstCommand = "";
    var secondCommand = "";
    var firstStartPosition = classicGameStatus.classicTurnCommand.length;
    var secondStartPosition = classicGameStatus.classicTurnCommand.length;
    var wordMatch = 0;
    var clExp = "";

    //Locate the first two words from our syntax list that the user has entered into the commandBox.
    //This is done by stepping through the list of recognised words ('commands').

    for (var index in classicGameStatus.classicCommandsJson) {
      clExp = new RegExp('\\b' + index + '\\b', 'i');
      wordMatch = classicGameStatus.classicTurnCommand.search(clExp);
      if ((wordMatch > -1) && (wordMatch < secondStartPosition)) {
        if (wordMatch < firstStartPosition) {
          secondCommand = firstCommand;
          secondStartPosition = firstStartPosition;
          firstCommand = index;
          firstStartPosition = wordMatch;
        } else {
          secondCommand = index;
          secondStartPosition = wordMatch;
        }
      }
    }

    //Now that we have checked for the first 2 words, we categorise what we have.
    //The list of commands obtained from the database are in key:value pairs
    // - the key is what the user would type.
    // - the first character of the value defines the type of command; either M, V or N (movement, verb or noun).
    // -- the rest of the value is the token; e.g. the user typing either 'ne' or 'northeast' will both be tokenised to 'northeast' - stored as 'Mnortheast' so classed as a movement verb

    //if the first command is an M we assign the token to classicGameStatus.classicMovementVerb and ignore any second word.
    //if the first command is an N we assign the token to classicGameStatus.classicNoun and ignore any second word
    //if the first command is a V we assign the token to classicGameStatus.classicVerb and we then check if the second word is an N; if so we assign the second token to classicGameStatus.classicNoun


    if (firstStartPosition < classicGameStatus.classicTurnCommand.length) {
      if (classicGameStatus.classicCommandsJson[firstCommand].charAt(0) === 'M') {
        classicGameStatus.classicMovementVerb = classicGameStatus.classicCommandsJson[firstCommand].slice(1);
      } else if (classicGameStatus.classicCommandsJson[firstCommand].charAt(0) === 'N') {
        classicGameStatus.classicNoun = classicGameStatus.classicCommandsJson[firstCommand].slice(1);
      } else if (classicGameStatus.classicCommandsJson[firstCommand].charAt(0) === 'V') {
        classicGameStatus.classicVerb = classicGameStatus.classicCommandsJson[firstCommand].slice(1);
        if (secondStartPosition < classicGameStatus.classicTurnCommand.length) {
          if (classicGameStatus.classicCommandsJson[secondCommand].charAt(0) === 'N') {
          classicGameStatus.classicNoun = classicGameStatus.classicCommandsJson[secondCommand].slice(1);
          }
        }
      }
    }

    console.log(classicGameStatus.classicMovementVerb);
    console.log(classicGameStatus.classicVerb);
    console.log(classicGameStatus.classicNoun);

    classicGameStatus.commandBox.value = '';
  }






  function classicProcessParsedCommand() {
    'use strict';

    classicGameStatus.classicCommandNotRecognised = false;
    classicGameStatus.roomDescriptionRequired = false;
    classicGameStatus.roomLongDescriptionRequired = false;

    //echo the entered command to the main window
    classicGameStatus.gameStatus.value += '\n' + classicGameStatus.classicTurnCommand;


    if (classicGameStatus.classicMovementVerb === "" && classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun === "") {
      classicGameStatus.gameStatus.value += "\nI'm sorry, I didn't understand that!";
    }

    //Needs improvement;
    //As written, this allows the user to confirm the existance of any object name.
    if (classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun !== "") {
      classicGameStatus.gameStatus.value += "\nHmmm, I don't follow; Please clarify what you would like me to do with the " + classicGameStatus.classicNoun + "?";
    }

    // verb-only and verb+noun processing to follow, but for now...
    if (classicGameStatus.classicVerb === "look") {
      classicGameStatus.roomDescriptionRequired = true;
      classicGameStatus.roomLongDescriptionRequired = true;
    }


    if (classicGameStatus.classicMovementVerb !== "") {
      var clRoomNumber = classicGameStatus.classicRoomJson[classicGameStatus.classicMovementVerb];
      if (clRoomNumber !== 0) {
        classicGameStatus.locationID = clRoomNumber;
        classicGameStatus.roomDescriptionRequired = true;
        if (!classicGameStatus.roomPreviouslyVisited.includes(clRoomNumber)) {
          classicGameStatus.roomPreviouslyVisited.push(clRoomNumber);
          classicGameStatus.roomLongDescriptionRequired = true;
        }
      } else {
        classicGameStatus.gameStatus.value += "\nYou can't go that way.";
      }
    }
  }






  // Functioning as 'Main loop' for now...
  function classicTurnPart1() {
    'use strict';

    classicParseEnteredCommand();

    classicProcessParsedCommand();

    classicLoadRoomJson(function(classicLoadRoomJson) {
      classicGameStatus.classicRoomJson = classicLoadRoomJson;
    }); //When the JSON is loaded the loop resumes in classicTurnPart2()

    // return false to prevent submission for now:
    return false;
  }







  function classicTurnPart2() {
    'use strict';

    classicUpdateDescription();
    console.log(classicGameStatus);

  }






  function init() {
    'use strict';
    // We will call an init funtion here to set the initial parameters, and either load a saved game or initialise new game

    //fetch list of game commands from the server
    classicLoadCommandsJson(function(classicLoadCommandsJson) {
      classicGameStatus.classicCommandsJson = classicLoadCommandsJson;
    });



    document.getElementById('theForm').onsubmit = classicTurnPart1;
  }

  window.onload = init;

})();
