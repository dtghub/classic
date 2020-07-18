(function(){
  'use strict';

  var classicGameStatus = {
    locationID: 1, //the current room Initialised to room 1 just now - this needs to be looked at to allow for saved games - I don't think this is needed - just do the initialisation from the init function!

    //Form references
    gameStatus: document.getElementById('game'),
    commandBox: document.getElementById('commandBox'),

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
    classicItemID: -1,
    clRoomNumberIndex: -1,
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
        classicTurnPart2(); //Complete the classicTurn loop when ready.
      }
    };
    xobj.send(null);
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
    xobj.send(null);
  }






  function classicUpdateDescription() {
    'use strict';


    classicGameStatus.gameStatus.value += "\n\n> " + classicGameStatus.classicTurnCommand + "\n" + classicGameStatus.classicMessages.messages;
    //classicGameStatus.classicMessages.messages = "";
    classicGameStatus.classicMessageList = "";

    classicGameStatus.gameStatus.setAttribute('disabled', false);




    //This makes sure that the bottom line of text in the gameStatus box is visible after an update.
    classicGameStatus.gameStatus.scrollTop = classicGameStatus.gameStatus.scrollHeight;


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
  function classicProcessInstruction(classicInstruction) {
    'use strict';

    //var clExp = "";

    //A very clumsy initial implementation - definitely needs a better solution

    var classicItemID = classicGameStatus.classicItemID; //Initialise with -1 as 0 is used to address the player
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
//    var clRoomNumberIndex;

    console.log(classicInstruction);
    classicCommandParts = classicInstruction.match(/[A-Z][\-]?[0-9]+/g);
    console.log(classicCommandParts);


    //make a note of the current room
    classicRoomsArrayLength = classicGameStatus.classicTablesJson.rooms.length;
    classicItemsArrayLength = classicGameStatus.classicTablesJson.items.length;

    //ID 0 in the items table records the player properties
    for (var i = 0; i < classicItemsArrayLength; i += 1) {
      if (classicGameStatus.classicTablesJson.items[i].ID === 0) {
        classicPlayerItemsArrayIndex = i;
      }
    }
    classicCurrentRoom = classicGameStatus.classicTablesJson.items[classicPlayerItemsArrayIndex].location;
    classicGameStatus.locationID = classicCurrentRoom;

    for (var i = 0; i < classicRoomsArrayLength; i += 1) {
      if (classicGameStatus.classicTablesJson.rooms[i].roomNumber === classicCurrentRoom) {
        classicGameStatus.clRoomNumberIndex = i;
      }
    }

    console.log(classicCurrentRoom);
    console.log(classicGameStatus.clRoomNumberIndex);


    classicCommandPartsArrayLength = classicCommandParts.length;
    classicItemsArrayLength = classicGameStatus.classicTablesJson.items.length;
    //classicSnippetsArrayLength = classicGameStatus.classicTablesJson.snippets.length;
    //classicListsArrayLength = classicGameStatus.classicTablesJson.lists.length;

    for (var i = 0; i < classicCommandPartsArrayLength; i += 1) {
      var item = classicCommandParts[i];
      classicParsedValue = parseInt(item.slice(1),10);

      switch (item.charAt(0)) {
        //The "B" instruction is the inverse of the "C" Conditional test - if true then we skip the next instruction.
        //B100 - is the item in the players inventory
        case "B":
          console.log(item);
          //****UNDER CONSTRUCTION****
          if (classicParsedValue < 100) {
            if (classicGameStatus.classicTablesJson.rooms[classicGameStatus.clRoomNumberIndex][classicParsedValue] !== 1) {
              //if the flag number is not set, skip the next command
              i += 1;
            }
          } else {
            if (classicParsedValue = 100 && classicGameStatus.classicTablesJson.items[classicItemID].location !== 0) {
               i += 1;
            }
          }
        break;
        //The "C" instruction is a Conditional test - if false then we skip the next instruction. - see related "B" and "S"
        //In practice this means that a lot of the time the next instruction will be an 'X'
        //At the moment this has only been implemented for the rooms table.
        //classicParsedValue range of 1 to 99 is reserved for flags attached to the item objects
        //C100 - is the item in the players inventory
        case "C":
          console.log(item);
          //****UNDER CONSTRUCTION****
          if (classicParsedValue < 100) {
            if (classicGameStatus.classicTablesJson.rooms[classicGameStatus.clRoomNumberIndex][classicParsedValue] === 1) {
              //if the flag number is not set, skip the next command
              i += 1;
            }
          } else {
            if (classicParsedValue = 100 && classicGameStatus.classicTablesJson.items[classicItemID].location === 0) {
               i += 1;
            }
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
              classicGameStatus.classicItemID = j;
              console.log("classicItemID" + classicItemID);
            }
          }
        break;
        //The "L" instruction sets the location of the acitive item
        //location 0 is your own inventory
        //location -1 is the current location
        case "L":
          console.log(item);
          debugger;
          if (classicParsedValue === -1) {
            classicParsedValue = classicCurrentRoom;
          }
          classicGameStatus.classicTablesJson.items[classicItemID].location = classicParsedValue;
          if (classicGameStatus.classicTablesJson.items[classicItemID].ID === 0) {
            classicGameStatus.classicTablesJson.items[classicItemID].location = classicParsedValue;
            classicGameStatus.locationID = classicParsedValue;
            classicCurrentRoom = classicParsedValue;
            for (var j = 0; j < classicRoomsArrayLength; j += 1) {
              if (classicGameStatus.classicTablesJson.rooms[j].roomNumber === classicCurrentRoom) {
                classicGameStatus.clRoomNumberIndex = j;
              }
            }
          }
        break;
        //The "N" instruction changes the active "number" to which subsequent incstructions refer
        //This may replace the "I" instruction
        case "N":
          console.log(item);
          if (classicParsedValue === -1) {
            classicGameStatus.classicActiveNumber = classicCurrentRoom;
          } else {
            classicGameStatus.classicActiveNumber = classicParsedValue;
          }
        break;

        //The "P" instruction executes sPecial cases
        //Probably the goal is to develop the interpreter to the point where P is never needed
        //P1 adds the names of items located at the location matching classicGameStatus.classicActiveNumber to the display queue.
        case "P":
          console.log(item);
          if (classicParsedValue === 1) {
            for (var j = 0; j < classicItemsArrayLength; j += 1) {
              if ((classicGameStatus.classicTablesJson.items[j].location === classicGameStatus.classicActiveNumber) && (classicGameStatus.classicTablesJson.items[j].ID !== 0)) {
                console.log("/nMatched " + i);
                classicProcessInstruction(classicGameStatus.classicTablesJson.items[j].name);
              }
            }
          }
        break;
        //The "R" instruction unsets the flag used for the "C" and "B" conditional tests. ("S" Sets it)
        case "R":
          console.log(item);
          //****UNDER CONSTRUCTION****
          classicGameStatus.classicTablesJson.rooms[classicGameStatus.clRoomNumberIndex][classicParsedValue] = 0;
        break;
        //The "S" instruction Sets the flag used for the "C" and "B" conditional tests. ("R" unsets it)
        case "S":
          console.log(item);
          //****UNDER CONSTRUCTION****
          debugger;
          classicGameStatus.classicTablesJson.rooms[classicGameStatus.clRoomNumberIndex][classicParsedValue] = 1;
        break;
        //The "U" instruction pUshes the active value into the lists table entry if it is not already there.
        //Not actually needed at the moment
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
        //The "X" instruction looks up the instruction code from the snippets table and executes the instructions by calling classicProcessInstruction recursively.
        case "X":
          console.log(item);
          classicProcessInstruction(classicGameStatus.classicTablesJson.snippets[classicParsedValue]);
//          for (var j = 0; j < classicSnippetsArrayLength; j =+ 1 ) {
//            if (classicGameStatus.classicTablesJson.snippets[j].ID === classicParsedValue) {
//              classicProcessInstruction(classicGameStatus.classicTablesJson.snippets[j]);
//            }
//          }
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
    var classicPlayerItemsArrayIndex;

    classicGameStatus.classicCommandNotRecognised = false;
    classicGameStatus.roomDescriptionRequired = false;
    classicGameStatus.roomLongDescriptionRequired = false;

    classicItemsArrayLength = classicGameStatus.classicTablesJson.items.length;

    //echo the entered command to the main window
    //classicGameStatus.gameStatus.value += '\n\n> ' + classicGameStatus.classicTurnCommand;

    //ID 0 in the items table records the player properties
    for (var i = 0; i < classicItemsArrayLength; i += 1) {
      if (classicGameStatus.classicTablesJson.items[i].ID === 0) {
        classicPlayerItemsArrayIndex = i;
        console.log(classicPlayerItemsArrayIndex);
      }
    }
console.log(classicPlayerItemsArrayIndex);

    if (classicGameStatus.classicMovementVerb === "" && classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun === "") {
      //classicGameStatus.gameStatus.value += "\nI'm sorry, I didn't understand that!";
      //Temporary kludge
      classicProcessInstruction("D3"); //Adds the above message to the message queue.
    }

    //Needs improvement;
    //As written, this allows the user to confirm the existance of any object name
    //To be re-implemented - this will be done by loking at the nouns  table -the command associated with the noverb entry will be executed.
    if (classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun !== "") {
      //classicGameStatus.gameStatus.value += "\nHmmm, I don't follow; Please clarify what you would like me to do with the " + classicGameStatus.classicNoun + "?";
      //Temporary kludge
      classicProcessInstruction("D3"); //Adds a message to the message queue. Message can be expanded
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
          } else {
            classicInstruction = "D9";
          }
        }
      }




    } else if (classicGameStatus.classicVerb !== "") {
      //verb only processing -
      //Look for the verb in the items entry for the player
      classicInstruction = classicGameStatus.classicTablesJson.items[classicPlayerItemsArrayIndex][classicGameStatus.classicVerb] || "";
    }

    if (classicGameStatus.classicMovementVerb !== "") {

      classicRoomsArrayLength = classicGameStatus.classicTablesJson.rooms.length;

      for (var i = 0; i < classicRoomsArrayLength; i += 1) {
        if (classicGameStatus.classicTablesJson.rooms[i].roomNumber === classicGameStatus.locationID) {
          clRoomNumberIndex = i;
        }
      }

      console.log(clRoomNumberIndex);
      console.log(classicGameStatus.locationID);

      if (classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicGameStatus.classicMovementVerb]) {
        classicInstruction = classicGameStatus.classicTablesJson.rooms[clRoomNumberIndex][classicGameStatus.classicMovementVerb];
      } else {
        //Temporary kludge - I'm sorry you can't go that way
        classicInstruction = "D4"; //Adds the above message to the message queue.
      }
    }


    if (classicInstruction !== "") {
      classicProcessInstruction(classicInstruction);
    }
  }






  // Functioning as 'Main loop' for now...
  function classicTurnPart1() {
    'use strict';

    classicGameStatus.gameStatus.setAttribute('disabled', true);

    classicParseEnteredCommand();

    classicProcessParsedCommand();

    classicGetMessages(function(classicGetMessages) {
      classicGameStatus.classicMessages = classicGetMessages;
    });
    //When the messages have been displayed the flow continues in classicTurnPart2()

    // return false to prevent form submission
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

    //fetch the data tables from the server
    //as the messages table could become large, it is queried from the database at the end and only the required messages are retrieved and displayed
    //description tbd

    classicGameStatus.gameStatus.setAttribute('disabled', true);

    classicLoadTablesJson(function(classicLoadTablesJson) {
      classicGameStatus.classicTablesJson = classicLoadTablesJson;
    });

    document.getElementById('theForm').onsubmit = classicTurnPart1;
  }

  window.onload = init;

})();
