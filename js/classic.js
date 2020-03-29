(function(){
  'use strict';

  var classicGameStatus = {
    locationID: -1, //the current room Initialised to room 1 just now - this needs to be looked at to allow for saved games - I don't think this is needed - just do the initialisation from the init function!

    //Form references
    gameStatus: document.getElementById('game'),
    commandBox: document.getElementById('commandBox'),

    classicRoomJson: {uninitialised: true},

    //This is an array to record whch rooms have already been visited - as each new room is visited it is pushed into the array. We can access the rooms list using if (roomAlreadyVisited.includes(<roomnumber>))
    roomAlreadyVisited: [],
    roomDescriptionRequired: true,
    roomLongDescriptionRequired: true,


    //The following are used for command parsing
    classicTurnCommand: "", //the text the user has entered in the current turn
    // Noun and verb are produced by the classicParsing funtion, and used as the command interface - might implement adverbs later?
    classicVerb: "", // the result of the parsing logic
    classicNoun: "", // the result of the parsing logic
    classicCommandNotRecognised: false, // will set to true if no verb was identified
    //an array to store room statuses
    //an array to store object status elements
  };







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

    //Initialise location on first use
    if (classicGameStatus.locationID === -1) {
      classicGameStatus.locationID = 1;
      console.log('here we are');
    }

    classicGameStatus.gameStatus.value += '\n' + classicGameStatus.classicTurnCommand;

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

    classicGameStatus.classicTurnCommand = classicGameStatus.commandBox.value;

    //Parsing logic to go here - in the meantime...
    if (classicGameStatus.classicTurnCommand.search(/north/i) !== -1) {
      classicGameStatus.classicVerb = "north";
    } else if (classicGameStatus.classicTurnCommand.search(/south/i) !== -1) {
      classicGameStatus.classicVerb = "south";
    } else if (classicGameStatus.classicTurnCommand.search(/look/i) !== -1) {
      classicGameStatus.classicVerb = "look";
    } else {
      classicGameStatus.classicVerb = undefined;
    }

    console.log(classicGameStatus.classicVerb);
    classicGameStatus.commandBox.value = '';
  }






  function classicProcessParsedCommand() {
    'use strict';

    classicGameStatus.classicCommandNotRecognised = false;
    classicGameStatus.roomDescriptionRequired = false;
    classicGameStatus.roomLongDescriptionRequired = false;


    if (classicGameStatus.classicVerb === 'north') {
      classicGameStatus.locationID = 2;
      classicGameStatus.roomDescriptionRequired = true;
      if (!classicGameStatus.roomAlreadyVisited.includes(2)) {
        classicGameStatus.roomAlreadyVisited.push(2);
        classicGameStatus.roomLongDescriptionRequired = true;
      }
    }

    if (classicGameStatus.classicVerb === 'south') {
      classicGameStatus.locationID = 1;
      classicGameStatus.roomDescriptionRequired = true;
      if (!classicGameStatus.roomAlreadyVisited.includes(1)) {
        classicGameStatus.roomAlreadyVisited.push(1);
        classicGameStatus.roomLongDescriptionRequired = true;
      }
    }

    if (classicGameStatus.classicVerb === 'look') {
      classicGameStatus.roomDescriptionRequired = true;
      classicGameStatus.roomLongDescriptionRequired = true;
    }

    if (classicGameStatus.classicVerb !== 'north' && classicGameStatus.classicVerb !== 'south' && classicGameStatus.classicVerb !== 'look') {
      classicGameStatus.classicCommandNotRecognised = true;
    }

}






  // Functioning as 'Main loop' for now...
  function classicTurnPart1() {
    'use strict';

    classicParseEnteredCommand();

    classicProcessParsedCommand();

    classicLoadRoomJson(function(classicLoadRoomJson) {
      classicGameStatus.classicRoomJson = classicLoadRoomJson;
    }); //When the JSON is loaded the loop resumes in classicTurnPart2

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
    document.getElementById('theForm').onsubmit = classicTurnPart1;
  }

  window.onload = init;

})();
