(function(){
  'use strict';

  var classicGameStatus = {
    locationID: 1, //the current room Initialised to room 1 just now - this needs to be looked at to allow for saved games - I don't think this is needed - just do the initialisation from the init function!

    //Form references
    gameStatus: document.getElementById('game'),
    commandBox: document.getElementById('commandBox'),

    //These are places to load the game data to - the 'rooms' 'commands' 'objects' etc
    classicRoomJson: {uninitialised: true},

    //generic place to put tables imported from the database
    classicTablesJson: {uninitialised: true},

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

    classicMessageList: "",
    classicMessages: {messages: ""},
    classicActiveNumber: 0,
    //an array to store room statuses
    //an array to store object status elements
  };






  function classicLoadTablesJson(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("text/application");
    xobj.open('GET', 'http://localhost/cgi-bin/fetchtables.pl', true);

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







  function classicGetMessages(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("text/application");
    xobj.open('GET', 'http://localhost/cgi-bin/fetchmessages.pl?value=' + classicGameStatus.classicMessageList, true);

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
        classicTurnPart2(); //Complete the classicTurn loop when ready.
      }
    };
    xobj.send(classicGameStatus.classicMessageList);
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

      classicItemsArrayLength = classicGameStatus.classicTablesJson.items.length;

      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if ((classicGameStatus.classicTablesJson.items[i].location === classicGameStatus.locationID) && classicGameStatus.classicTablesJson.items[i].ID !== 0) {
          console.log("/nMatched " + i);
          classicItemList += "\n" + classicGameStatus.classicTablesJson.items[i].name;
        }
      }

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

    for (var index in classicGameStatus.classicTablesJson.commands) {
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
      if (classicGameStatus.classicTablesJson.commands[firstCommand].charAt(0) === 'M') {
        classicGameStatus.classicMovementVerb = classicGameStatus.classicTablesJson.commands[firstCommand].slice(1);
      } else if (classicGameStatus.classicTablesJson.commands[firstCommand].charAt(0) === 'N') {
        classicGameStatus.classicNoun = classicGameStatus.classicTablesJson.commands[firstCommand].slice(1);
      } else if (classicGameStatus.classicTablesJson.commands[firstCommand].charAt(0) === 'V') {
        classicGameStatus.classicVerb = classicGameStatus.classicTablesJson.commands[firstCommand].slice(1);
        if (secondStartPosition < classicGameStatus.classicTurnCommand.length) {
          if (classicGameStatus.classicTablesJson.commands[secondCommand].charAt(0) === 'N') {
            classicGameStatus.classicNoun = classicGameStatus.classicTablesJson.commands[secondCommand].slice(1);
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
    var classicCommandPartsArrayLength;
    var classicItemsArrayLength;
    var classicSnippetsArrayLength;
    var classicListsArrayLength;
    var classicRoomsArrayLength;
    var classicCurrentRoom;
    var classicCurrentRoomArrayIndex;
    var classicPlayerItemsArrayIndex;
    var clRoomNumberIndex;

    console.log(classicInstruction);
    classicCommandParts = classicInstruction.match(/[A-Z][\-]?[0-9]+/g);
    console.log(classicCommandParts);


    //make a note of the current room
    classicRoomsArrayLength = classicGameStatus.classicTablesJson.rooms.length;
    classicItemsArrayLength = classicGameStatus.classicTablesJson.items.length;

    //ID 0 in the items table rcords the player properties
    for (var i = 0; i < classicItemsArrayLength; i += 1) {
      if (classicGameStatus.classicTablesJson.items[i].ID == 0) {
        classicPlayerItemsArrayIndex = i;
      }
    }
    classicCurrentRoom = classicGameStatus.classicTablesJson.items[classicPlayerItemsArrayIndex].location;

    for (var i = 0; i < classicRoomsArrayLength; i += 1) {
      if (classicGameStatus.classicTablesJson.rooms[i].roomNumber == classicCurrentRoom) {
        clRoomNumberIndex = i;
      }
    }

    console.log(classicCurrentRoom);
    console.log(clRoomNumberIndex);


    classicCommandPartsArrayLength = classicCommandParts.length;
    classicItemsArrayLength = classicGameStatus.classicTablesJson.items.length;
    classicSnippetsArrayLength = classicGameStatus.classicTablesJson.snippets.length;
    classicListsArrayLength = classicGameStatus.classicTablesJson.lists.length;

    for (var i = 0; i < classicCommandPartsArrayLength; i += 1) {
      var item = classicCommandParts[i];
      classicParsedValue = parseInt(item.slice(1),10);

      switch (item.charAt(0)) {
        //The "B" instruction is the inverse of the "C" Conditional test - if true then we skip the next instruction.
        case "B":
          console.log(item);
          //****UNDER CONSTRUCTION****
          if (classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicParsedValue] !== 1) {
            //if the flag number is set, skip the next command
            i += 1;
          }
        break;
        //The "C" instruction is a Conditional test - if false then we skip the next instruction. - see related "B" and "S"
        //In practice this means that a lot of the time the next instruction will be an 'X'
        //At the moment this has only been implemented for the rooms table.
        //
        case "C":
          console.log(item);
          //****UNDER CONSTRUCTION****
          if (classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicParsedValue] === 1) {
            //if the flag number is not set, skip the next command
            i += 1;
          }
        break;
        //The "D" instruction adds a message number for Display to the classicMessageList string
        //The messages are retrieved and displayd after all instructions have been processed
        case "D":
          console.log(item);
          classicGameStatus.classicMessageList += classicParsedValue.toString() + "~";
        break;
        //The "I" instruction changes the active "item" to which subsequent incstructions refer
        //This may be replaced by the "N" instruction
        case "I":
          console.log(item);
          for (var j = 0; j < classicItemsArrayLength; j += 1) {
            if (classicGameStatus.classicTablesJson.items[j].ID === classicParsedValue) {
              classicItemID = j;
            }
          }
        break;
        //The "L" instruction sets the location of the acitive item
        //location 0 is your own inventory
        //location -1 is the current location
        case "L":
          console.log(item);
          if (classicParsedValue === -1) {
            classicParsedValue = classicCurrentRoom;
          }
          classicGameStatus.classicTablesJson.items[classicItemID].location = classicParsedValue;
          //Temporary kludge - to be removed;
          classicGameStatus.locationID = classicParsedValue;
        break;
        //The "N" instruction changes the active "number" to which subsequent incstructions refer
        //This may replace the "I" instruction
        case "N":
          console.log(item);
          classicGameStatus.classicActiveNumber = classicParsedValue;
        break;

        //The "P" instruction executes sPecial cases
        //Probable the goal is to develop the interpreter to the point where S is never needed
        //S1 adds the names of items located at the location matching classicGameStatus.classicActiveNumber to the display queue.
        case "P":
          console.log(item);
          if (classicParsedValue === 1) {
            for (var j = 0; j < classicItemsArrayLength; j += 1) {
              if ((classicGameStatus.classicTablesJson.items[j].location === classicGameStatus.classicActiveNumber) && classicGameStatus.classicTablesJson.items[j].ID !== 0) {
                console.log("/nMatched " + i);
                classicGameStatus.classicMessageList  += "\n" + classicGameStatus.classicTablesJson.items[i].name;
              }
            }
            classicGameStatus.classicMessageList += ",";
          }
        break;
        //The "R" instruction unsets the flag used for the "C" and "B" conditional tests. ("S" Sets it)
        case "R":
          console.log(item);
          //****UNDER CONSTRUCTION****
          classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicParsedValue] = 0;
        break;
        //The "S" instruction Sets the flag used for the "C" and "B" conditional tests. ("R" unsets it)
        case "S":
          console.log(item);
          //****UNDER CONSTRUCTION****
          classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicParsedValue] = 1;
        break;
        //The "U" instruction pUshes the active value into the lists table entry if it is not already there.
        case "U":
          console.log(item);
          for (var j = 0; j < classicListsArrayLength; j += 1) {
            if (classicGameStatus.classicTablesJson.lists[j].ID === classicParsedValue) {
              if (!classicGameStatus.classicTablesJson.lists[j].list.includes(classicGameStatus.classicActiveNumber)) {
                classicGameStatus.classicTablesJson.lists[j].list.push(classicGameStatus.classicActiveNumber);
              }
            }
          }
        break;
        //The "X" instruction looks up the instruction code from the snippets table and executes the instructions by calling classsicProcessInstruction recursively.
        case "X":
          console.log(item);
          for (var j = 0; j < classicSnippetsArrayLength; j =+ 1 ) {
            if (classicGameStatus.classicTablesJson.snippets[j].ID === classicParsedValue) {
              classsicProcessInstruction(classicGameStatus.classicTablesJson.snippets[j]);
            }
          }
        break;
        default:
          console.log("\nUnrecognised command; " + item);
      }
    }
  }



  function classicProcessParsedCommand() {
    'use strict';

    //This variable holds the instruction line derived from the commands entered
    var classicInstruction = "";
    var classicItemsArrayLength;
    var classicRoomsArrayLength;
    var clRoomNumberIndex;


    classicGameStatus.classicCommandNotRecognised = false;
    classicGameStatus.roomDescriptionRequired = false;
    classicGameStatus.roomLongDescriptionRequired = false;

    //echo the entered command to the main window
    classicGameStatus.gameStatus.value += '\n\n> ' + classicGameStatus.classicTurnCommand;


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
      classicItemsArrayLength = classicGameStatus.classicTablesJson.items.length;

      for (var i = 0; i < classicItemsArrayLength; i += 1) {

        if (classicGameStatus.classicTablesJson.items[i].word === classicGameStatus.classicNoun) {
          if (classicGameStatus.classicTablesJson.items[i].location === 0) {
            classicInstruction = classicGameStatus.classicTablesJson.items[i][classicGameStatus.classicVerb] || "";
            console.log(classicInstruction + " inventory");
          } else if (classicGameStatus.classicTablesJson.items[i].location === classicGameStatus.locationID) {
            classicInstruction = classicGameStatus.classicTablesJson.items[i][classicGameStatus.classicVerb] || "";
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

      classicRoomsArrayLength = classicGameStatus.classicTablesJson.rooms.length;

      for (var i = 0; i < classicRoomsArrayLength; i += 1) {
        if (classicGameStatus.classicTablesJson.rooms[i].roomNumber == classicGameStatus.locationID) {
          clRoomNumberIndex = i;
        }
      }

      console.log(clRoomNumberIndex);
      console.log(classicGameStatus.locationID);

      if (classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicGameStatus.classicMovementVerb] !== 0) {
        classicInstruction = classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicGameStatus.classicMovementVerb];
      } else {
        classicInstruction = "D4";
      }
    }

/*
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
*/

    if (classicInstruction !== "") {
      classsicProcessInstruction(classicInstruction);
    }
  }






  // Functioning as 'Main loop' for now...
  function classicTurnPart1() {
    'use strict';

    classicParseEnteredCommand();

    classicProcessParsedCommand();

    //classicLoadRoomJson(function(classicLoadRoomJson) {
      //classicGameStatus.classicRoomJson = classicLoadRoomJson;
    //}); //When the JSON is loaded the loop resumes in classicTurnPart2()



    classicGetMessages(function(classicGetMessages) {
      classicGameStatus.classicMessages = classicGetMessages;
    });


    // return false to prevent submission for now:
    return false;
  }







  function classicTurnPart2() {
    'use strict';

    //classicUpdateDescription();
    classicGameStatus.gameStatus.value += "\n\nMessages from queue;\n" + classicGameStatus.classicMessageList;
    classicGameStatus.classicMessageList = "";
    classicGameStatus.gameStatus.value += classicGameStatus.classicMessages.messages;
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

    classicLoadTablesJson(function(classicLoadTablesJson) {
      classicGameStatus.classicTablesJson = classicLoadTablesJson;
    });

    document.getElementById('theForm').onsubmit = classicTurnPart1;
  }

  window.onload = init;

})();
