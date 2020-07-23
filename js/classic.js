(function(){
  'use strict';

  var classicGameStatus = {
    //locationID: 1, //the current room Initialised to room 1 just now - this needs to be looked at to allow for saved games - I don't think this is needed - just do the initialisation from the init function!

    //Form references
    gameStatus: document.getElementById('game'),
    commandBox: document.getElementById('commandBox'),

    //generic place to put tables imported from the database
    classicTablesJson: {uninitialised: true},

    //The following are used for command parsing
    classicTurnCommand: "", //the text the user has entered in the current turn
    // Noun and verb are produced by the classicParsing funtion, and used as the command interface - might implement adverbs later?
    classicMovementVerb: "", //Has the user requested to move?
    classicVerb: "", // the result of the parsing logic
    classicNoun: "", // the result of the parsing logic
    //classicCommandNotRecognised: false, // will set to true if no verb was identified

    classicMessageList: "",
    classicMessages: {messages: ""},
    classicActiveNumber: 0,
    classicItemID: -1,
    //classicFlag: false,
    //an array to store room statuses
    //an array to store object status elements
  };

  var classicCommands = {};

  //these references can only be properly assigned once their targets exist!
  //So the references are set up in function classicSetupTables()
  var clTabs = {};
  var clItems = {};
  var clRooms = {};
  var clCommands = {};




  function classicLoadTablesJson(callback) {
    'use strict';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("text/application");
    xobj.open('GET', 'http://localhost/cgi-bin/fetchtables.pl', true);

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));

        classicSetupTables();
        classicSetupCommands();
        classicProcessInstruction("X1");
        classicGetMessages(function(classicGetMessages) {
          classicGameStatus.classicMessages = classicGetMessages;
        });
        //When the messages have been displayed the flow continues in classicTurnPart2()
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









  function classicSetupTables() {
    'use strict';

    //Add some common functions to the tables, such as returning the index number of an array element using the ID number

    //also short reference some common ones
    clTabs = classicGameStatus.classicTablesJson;
    clItems = classicGameStatus.classicTablesJson.items;
    clRooms = classicGameStatus.classicTablesJson.rooms;
    clCommands = classicGameStatus.classicTablesJson.commands;


    clItems.itemsArrayIndex = function (itemsID) {
      'use strict';
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].ID === itemsID) {
          return i;
        }
      }
    }


    clItems.playerArrayIndex = function () {
    'use strict';
    //0 is the player ID in the items array
    return clItems.itemsArrayIndex(0);
    }


    clItems.currentRoomNumber = function () {
    'use strict';
      var playerArrayIndex = clItems.playerArrayIndex();
      return clItems[playerArrayIndex].location;
    }


    clItems.setCurrentRoomNumber = function (roomNumber) {
      'use strict';
      var playerArrayIndex = clItems.playerArrayIndex();
      clItems[playerArrayIndex].location = roomNumber;
    }


    clItems.playerArrayIndexFromName = function (clItemName) {
      'use strict';
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].word === clItemName) {
          return i;
        }
      }
    }



    clItems.testForItemsAtLocation = function (clLocation) {
      'use strict';
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].location === clLocation && clItems[i].ID !== 0) {
          return true;
        }
      }
      return false;
    }




    clItems.testForNamedItemAtALocation = function (itemName, clLocation) {
      'use strict';
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].location === clLocation && clItems[i].word === itemName) {
          return clItems[i].ID;
        }
      }
      return false;
    }


    clItems.namedItemIsInPlayerScope = function (itemName) {
      'use strict';
      return (clItems.testForNamedItemAtALocation(itemName, 0) || clItems.testForNamedItemAtALocation(itemName, clItems.currentRoomNumber()));
    }


    clItems.getInstructionMatchingVerbNoun = function (clVerb, clNoun) {
      'use strict';
      var clInstruction = "";
      var clItemID = clItems.namedItemIsInPlayerScope(clNoun);
      if (clItemID) {
        clInstruction = clItems[clItems.itemsArrayIndex(clItemID)][clVerb];
      }
      return clInstruction;
    }


    clItems.getWordIfNounInScope = function (clNoun) {
      'use strict';
      var clItemID = clItems.namedItemIsInPlayerScope(clNoun);
      return clItems[clItems.itemsArrayIndex(clItemID)].word;
    }




    clItems.printListOfItemsAtLocation = function (roomNumber) {
      'use strict';
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if ((clItems[i].location === roomNumber) && (clItems[i].ID !== 0)) {
          classicProcessInstruction(clItems[i].name);
        }
      }
    }













    clRooms.roomsArrayIndex = function(roomsID) {
      'use strict';
      var classicRoomsArrayLength = clRooms.length;
      for (var i = 0; i < classicRoomsArrayLength; i += 1) {
        if (clRooms[i].roomNumber === roomsID) {
          return i;
        }
      }
    }


    clRooms.currentRoomIndex = function() {
      'use strict';
      var currentRoomNumber = clItems.currentRoomNumber();
      return clRooms.roomsArrayIndex(currentRoomNumber);
    }
  }

  function classicSetupCommands() {
    'use strict';
    //The "B" instruction is the inverse of the "C" Conditional test - if true then we skip the next instruction.
    //B100 - is the item in the players inventory
    //B101 - are any items in the location number defined in classicGameStatus.classicActiveNumber
    classicCommands.B = function (classicParsedValue,i) {
      'use strict';
      if (classicParsedValue < 100) {
        if (clRooms[clRooms.currentRoomIndex()][classicParsedValue] !== 1) {
          return i += 1;
        }
      } else {
        if (classicParsedValue === 100 && clItems[classicGameStatus.classicItemID].location !== 0) {
          return i += 1;
        }
        if (classicParsedValue === 101 && clItems.testForItemsAtLocation(classicGameStatus.classicActiveNumber)) {
          return i += 1;
        }
      }
      return i;
    };
    //The "C" instruction is a Conditional test - if false then we skip the next instruction. - see related "B" and "S"
    //In practice this means that a lot of the time the next instruction will be an 'X'
    //At the moment this has only been implemented for the rooms table.
    //classicParsedValue range of 1 to 99 is reserved for flags attached to the item objects
    //C100 - is the item in the players inventory
    //C101 - are any items in the location number defined in classicGameStatus.classicActiveNumber
    classicCommands.C = function (classicParsedValue,i) {
      'use strict';
      if (classicParsedValue < 100) {
        if (clRooms[clRooms.currentRoomIndex()][classicParsedValue] === 1) {
          return i += 1;
        }
      } else {
        if (classicParsedValue === 100 && clItems[classicGameStatus.classicItemID].location === 0) {
          return i += 1;
        }
        if (classicParsedValue === 101 && !clItems.testForItemsAtLocation(classicGameStatus.classicActiveNumber)) {
          return i += 1;
        }
      }
      return i;
    };
    //The "D" instruction adds a message number for Display to the classicMessageList string
    //The messages are retrieved and displayd after all instructions have been processed
    classicCommands.D = function (classicParsedValue,i) {
      'use strict';
      classicGameStatus.classicMessageList += classicParsedValue.toString() + "~";
      return i;
    };
    //The "I" instruction changes the active "item" to which subsequent incstructions refer
    //See also the related "N" instruction
    classicCommands.I = function (classicParsedValue,i) {
      'use strict';
      classicGameStatus.classicItemID = clItems.itemsArrayIndex(classicParsedValue);
      return i;
    };
    //The "L" instruction sets the location of the acitive item
    //location 0 is your own inventory
    //location -1 is the current location
    classicCommands.L = function (classicParsedValue,i) {
      'use strict';
      if (classicParsedValue === -1) {
        classicParsedValue = clItems.currentRoomNumber();
      }
      clItems[classicGameStatus.classicItemID].location = classicParsedValue;
      if (clItems[classicGameStatus.classicItemID].ID === 0) {
        clItems.setCurrentRoomNumber(classicParsedValue);
      }
      return i;
    };
    //The "N" instruction changes the active "number" to which subsequent incstructions refer
    //See the related "I" instruction
    classicCommands.N = function (classicParsedValue,i) {
      'use strict';
      if (classicParsedValue === -1) {
        classicGameStatus.classicActiveNumber = clItems.currentRoomNumber();
      } else {
        classicGameStatus.classicActiveNumber = classicParsedValue;
      }
      return i;
    };
    //The "P" instruction executes sPecial cases
    //Probably the goal is to develop the interpreter to the point where P is never needed
    //P1 adds the names of items located at the location matching classicGameStatus.classicActiveNumber to the display queue.
    classicCommands.P = function (classicParsedValue,i) {
      'use strict';
      if (classicParsedValue === 1) {
        clItems.printListOfItemsAtLocation(classicGameStatus.classicActiveNumber);
      }
      return i;
    };
    //The "R" instruction unsets the flag used for the "C" and "B" conditional tests. ("S" Sets it)
    classicCommands.R = function (classicParsedValue,i) {
      'use strict';
      clRooms[clRooms.currentRoomIndex()][classicParsedValue] = 0;
      return i;
    };
    //The "S" instruction Sets the flag used for the "C" and "B" conditional tests. ("R" unsets it)
    classicCommands.S = function (classicParsedValue,i) {
      'use strict';
      clRooms[clRooms.currentRoomIndex()][classicParsedValue] = 1;
      return i;
    };
    //The "X" instruction looks up the instruction code from the snippets table and executes the instructions by calling classicProcessInstruction recursively.
    classicCommands.X = function (classicParsedValue,i) {
      'use strict';
      classicProcessInstruction(clTabs.snippets[classicParsedValue]);
      return i;
    };
  }














  function classicUpdateDescription() {
    'use strict';

    classicGameStatus.gameStatus.value += "\n\n> " + classicGameStatus.classicTurnCommand + "\n" + classicGameStatus.classicMessages.messages;
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

    classicGameStatus.classicTurnCommand = classicGameStatus.commandBox.value;

    var firstCommand = "";
    var secondCommand = "";
    var firstStartPosition = classicGameStatus.classicTurnCommand.length;
    var secondStartPosition = classicGameStatus.classicTurnCommand.length;
    var wordMatch = 0;
    var clExp = "";

    //Locate the first two words from our syntax list that the user has entered into the commandBox.
    //This is done by stepping through the list of recognised words ('commands').

    for (var index in clCommands) {
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
      if (clCommands[firstCommand].charAt(0) === 'M') {
        classicGameStatus.classicMovementVerb = clCommands[firstCommand].slice(1);
      } else if (clCommands[firstCommand].charAt(0) === 'N') {
        classicGameStatus.classicNoun = clCommands[firstCommand].slice(1);
      } else if (clCommands[firstCommand].charAt(0) === 'V') {
        classicGameStatus.classicVerb = clCommands[firstCommand].slice(1);
        if (secondStartPosition < classicGameStatus.classicTurnCommand.length) {
          if (clCommands[secondCommand].charAt(0) === 'N') {
            classicGameStatus.classicNoun = clCommands[secondCommand].slice(1);
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

    var itemID = -1;
    var classicParsedValue = 0;
    var classicCommandParts = [];
    var classicCommandPartsArrayLength = 0;

    console.log(classicInstruction);
    classicCommandParts = classicInstruction.match(/[A-Z][\-]?[0-9]+/g);
    console.log(classicCommandParts);
    classicCommandPartsArrayLength = classicCommandParts.length;

    for (var i = 0; i < classicCommandPartsArrayLength; i += 1) {
      var item = classicCommandParts[i];
      classicParsedValue = parseInt(item.slice(1),10);
      i = classicCommands[item.charAt(0)](classicParsedValue,i);
    }
  }





  function classicProcessParsedCommand() {
    'use strict';
    //This variable holds the instruction line derived from the commands entered
    var classicInstruction = "";

    if (classicGameStatus.classicMovementVerb === "" && classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun === "") {
      //classicGameStatus.gameStatus.value += "\nI'm sorry, I didn't understand that!";
      classicProcessInstruction("D3"); //Adds the above message to the message queue.
    }


    if (classicGameStatus.classicVerb === "" && classicGameStatus.classicNoun !== "") {
      //classicGameStatus.gameStatus.value += "\nHmmm, I don't follow; Please clarify what you would like me to do with the " + classicGameStatus.classicNoun + "?";
      if (clItems.namedItemIsInPlayerScope(classicGameStatus.classicNoun )) {
        classicProcessInstruction("D5" + clItems.getInstructionMatchingVerbNoun("name", classicGameStatus.classicNoun)); //Adds a message to the message queue, only if the item is in the inventory or current room.
      } else {
        //classicGameStatus.gameStatus.value += "\nI'm sorry, I didn't understand that!";
        classicProcessInstruction("D3"); //Adds the above message to the message queue if the item is not in the inventory or current room.
      }
    }


    // verb-only and verb+noun processing under construction...
    //UNDER CONSTRUCTION

    if (classicGameStatus.classicVerb !== "" && classicGameStatus.classicNoun !== "") {
      //verb+noun processing to go here.

      //First identify the item matching the noun - scope is to check those in the inventory first else in the current room
      //Then, from that item, extract the instruction string associated with the verb

      classicInstruction = clItems.getInstructionMatchingVerbNoun(classicGameStatus.classicVerb, classicGameStatus.classicNoun);
      if (classicInstruction === "") {
        classicInstruction = "D9";
      }



    } else if (classicGameStatus.classicVerb !== "") {
      //verb only processing -
      //Look for the verb in the items entry for the player
        classicInstruction = clItems[clItems.playerArrayIndex()][classicGameStatus.classicVerb] || "D3";
    }

    if (classicGameStatus.classicMovementVerb !== "") {
      if (clRooms[clRooms.currentRoomIndex()][classicGameStatus.classicMovementVerb]) {
        classicInstruction = clRooms[clRooms.currentRoomIndex()][classicGameStatus.classicMovementVerb];
      } else {
        classicInstruction = "D4"; //I'm sorry you can't go that way
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
    console.log(classicCommands);
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
