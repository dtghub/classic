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
    classicItemsJson: {uninitialised: true},//This is only used during initialisation and then cleared to save resources?

    //objects
    classicItems: {uninitialised: true},

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





  function classicLoadItemsJson(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("text/application");
    xobj.open('GET', 'http://localhost/cgi-bin/fetchitems.pl', true);

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));


        classicLoadRoomJson(function(classicLoadRoomJson) {
          classicGameStatus.classicRoomJson = classicLoadRoomJson;
        });
      }
    };
    xobj.send(null);
  }





  function classicLoadCommandsJson(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("text/application");
    xobj.open('GET', 'http://localhost/cgi-bin/fetchcommands.pl', true);

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));


        classicLoadItemsJson(function(classicLoadItemsJson) {
          classicGameStatus.classicItemsJson = classicLoadItemsJson;
        });

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

    var classicItemList = "";
    var classicItemsArrayLength;


    if (classicGameStatus.classicCommandNotRecognised) {
      classicGameStatus.gameStatus.value += "\nSorry, I didn't understand that!";
    }


    //gameStatus.setAttribute('disabled', false);
    if (classicGameStatus.roomDescriptionRequired) {
      if (classicGameStatus.roomLongDescriptionRequired)  {
        classicGameStatus.gameStatus.value += "\n" + classicGameStatus.classicRoomJson.longDescription;
      } else {
        classicGameStatus.gameStatus.value += "\n" + classicGameStatus.classicRoomJson.shortDescription;
      }

      //List the items in the room - this will probably get replaced as the command parsing is implemented as it probably belongs up at that level
      //"Cheating" and using ES6!!!!

      classicItemsArrayLength = classicGameStatus.classicItemsJson.items.length;

      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (classicGameStatus.classicItemsJson.items[i].location === classicGameStatus.locationID) {
          console.log("/nMatched " + i);
          classicItemList += "\n" + classicGameStatus.classicItemsJson.items[i].name;
        }
      }






/*
      Object.keys(classicGameStatus.classicItemsJson.items).forEach(function (item) {
        if (classicGameStatus.classicItemsJson.items[item].location === classicGameStatus.locationID) {
          classicItemList += "\n" + classicGameStatus.classicItemsJson.items[item].name;
        }
      });
*/
      if (classicItemList !== "") {
        classicGameStatus.gameStatus.value += "\nYou can see the following;" + classicItemList;
      }
    }


    //This makes sure that the bottom line of text in the gameStatus box is visible after an update.
    classicGameStatus.gameStatus.scrollTop = classicGameStatus.gameStatus.scrollHeight;

    classicGameStatus.gameStatus.setAttribute('disabled', true);
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



  //UNDER CONSTRUCTION
  function classsicProcessInstruction(classicInstruction) {
    'use strict';

    //var clExp = "";

    //A very clumsy initial implementation - definitely needs a better solution

    var classicItemID = -1; //Initialise with -1 as 0 is used to address the player
    var itemID = -1;
    var classicParsedValue = 0;
    var classicCommandParts = [];
    //var i;
    var classicCommandPartsArrayLength;
    var classicItemsArrayLength;

    console.log(classicInstruction);
    classicCommandParts = classicInstruction.match(/[A-Z][\-]?[0-9]+/g);
    console.log(classicCommandParts);

    //Need to re-implement this a a flat loop as callbacks aren't appropriate in this situation (need the code to be synchonous)

    classicCommandPartsArrayLength = classicCommandParts.length;
    classicItemsArrayLength = classicGameStatus.classicItemsJson.items.length;

    for (var i = 0; i < classicCommandPartsArrayLength; i += 1) {
      var item = classicCommandParts[i];

      if (item.charAt(0) === 'I') {
        console.log(item);
        itemID = parseInt(item.slice(1),10);

        for (var j = 0; j < classicItemsArrayLength; j += 1) {
          if (classicGameStatus.classicItemsJson.items[j].ID === itemID) {
            classicItemID = j;
          }
        }
      }

      if (item.charAt(0) === 'L') {
        console.log(item);
        classicParsedValue = parseInt(item.slice(1),10);
        if (classicParsedValue === -1) {
          classicParsedValue = classicGameStatus.locationID;
        }
        classicGameStatus.classicItemsJson.items[classicItemID].location = classicParsedValue;
      }

    }

/*
    classicCommandParts.forEach((item) => {
      //'I' is the item ID number from the items database table
      if (item.charAt(0) === 'I') {
        console.log(item);
        itemID = parseInt(item.slice(1),10);

        Object.keys(classicGameStatus.classicItemsJson.items).forEach(function (itemNum) {
          if (classicGameStatus.classicItemsJson.items[itemNum].ID === itemID) {
            classicItemID = itemNum;
          }
        });
      }

      if (item.charAt(0) === 'L') {
        console.log(item);
        classicParsedValue = parseInt(item.slice(1),10);
        if (classicParsedValue === -1) {
          classicParsedValue = classicGameStatus.locationID;
        }
        classicGameStatus.classicItemsJson.items[classicItemID].location = classicParsedValue;
      }
    });
*/

  }



  function classicProcessParsedCommand() {
    'use strict';

    //This variable holds the instruction line derived from the commands entered
    var classicInstruction = "";
    var classicItemsArrayLength;


    classicGameStatus.classicCommandNotRecognised = false;
    classicGameStatus.roomDescriptionRequired = false;
    classicGameStatus.roomLongDescriptionRequired = false;

    //echo the entered command to the main window
    classicGameStatus.gameStatus.value += '\n' + classicGameStatus.classicTurnCommand;


    if (classicGameStatus.classicMovementVerb === "" && classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun === "") {
      classicGameStatus.gameStatus.value += "\nI'm sorry, I didn't understand that!";
    }

    //Needs improvement;
    //As written, this allows the user to confirm the existance of any object name
    //To be re-implemented - this will be done by loking at the nouns  table -the command associated with the noverb entry will be executed.
    if (classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun !== "") {
      classicGameStatus.gameStatus.value += "\nHmmm, I don't follow; Please clarify what you would like me to do with the " + classicGameStatus.classicNoun + "?";
    }


    // verb-only and verb+noun processing under construction...
    //UNDER CONSTRUCTION

    if (classicGameStatus.classicVerb !== "" && classicGameStatus.classicNoun !== "") {
      //verb+noun processing to go here.

      //First identify the item matching the noun - scope is to check those in the inventory first then in the current room - frst to match wins
      //Then, from that item, extract the instruction string associated with the verb
      classicItemsArrayLength = classicGameStatus.classicItemsJson.items.length;

      for (var i = 0; i < classicItemsArrayLength; i += 1) {

        if (classicGameStatus.classicItemsJson.items[i].word === classicGameStatus.classicNoun) {
          if (classicGameStatus.classicItemsJson.items[i].location === 0) {
            classicInstruction = classicGameStatus.classicItemsJson.items[i][classicGameStatus.classicVerb] || "";
            console.log(classicInstruction + " inventory");
          } else if (classicGameStatus.classicItemsJson.items[i].location === classicGameStatus.locationID) {
            classicInstruction = classicGameStatus.classicItemsJson.items[i][classicGameStatus.classicVerb] || "";
            console.log(classicInstruction + " location");
          }
        }
      }




    } else {
      //verb only processing - to be re-implemented - this will be done by loking at the current room's table - if the verb exists there, then the command is executed.
      if (classicGameStatus.classicVerb === "look") {
        classicGameStatus.roomDescriptionRequired = true;
        classicGameStatus.roomLongDescriptionRequired = true;
      }
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

    if (classicInstruction !== "") {
      classsicProcessInstruction(classicInstruction);
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
    //Since this needs callbacks to fetch the data,
    //I've implemented this as a chain of callbacks to ensure that we can't start the game until the data is ready
    //We start by calling classicLoadCommandsJson which calls the next function  when it's ready
    //The successful callback for classicLoadCommandsJson calls classicLoadItemsJson
    //The successful callback for classicLoadItemsJson calls a routine to create the item objects (underconstruction)
    //description tbd
    classicLoadCommandsJson(function(classicLoadCommandsJson) {
      classicGameStatus.classicCommandsJson = classicLoadCommandsJson;
    });



    document.getElementById('theForm').onsubmit = classicTurnPart1;
  }

  window.onload = init;

})();
