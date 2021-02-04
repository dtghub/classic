(function(){
  'use strict';

  var classicGameStatus = {

    //Form references
    gameStatus: document.getElementById('game'),
    commandBox: document.getElementById('commandBox'),

    //generic place to put tables imported from the database
    classicTablesJson: {uninitialised: true},

    //The following are used for command parsing
    classicTurnCommand: "", //the text the user has entered in the current turn


    classicMessageList: "",
    classicMessages: "",
    classicActiveNumber: 0,
    classicItemID: -1,

  };

  var classicCommands = {};

  //these references can only be properly assigned once their targets exist!
  //So the references are set up in function classicSetupTables()
  var clTabs = {};
  var clItems = {};
  var clRooms = {};
  var clTemplates = {};
  var clCommands = {};

























  
  function classicLoadTablesJson(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("text/application");
    xobj.open('GET', 'http://localhost/cgi-bin/fetchtables.pl', true);

    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));

        classicSetupTables();
        classicSetupCommands();
        classicProcessHighLevelInstruction("init(newGame);");
        classicGetMessages(function(classicGetMessages) {
          classicGameStatus.classicMessages = classicGetMessages;
        });
        //When the messages have been displayed the flow continues in classicTurnPart2()
      }
    };
    xobj.send(null);
  }







  function classicGetMessages(callback) {
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

    //Add some common functions to the tables, such as returning the index number of an array element using the ID number

    //also short reference some common ones
    clTabs = classicGameStatus.classicTablesJson;
    clItems = classicGameStatus.classicTablesJson.items;
    clRooms = classicGameStatus.classicTablesJson.rooms;
    clTemplates = classicGameStatus.classicTablesJson.templates;
    clCommands = classicGameStatus.classicTablesJson.commands;


    clItems.itemsArrayIndex = function (itemsID) {
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].ID === itemsID) {
          return i;
        }
      }
    }


    clItems.defaultArrayIndex = function () {
    //-1 is the ID for the list of default values in the items array
    return clItems.itemsArrayIndex(-1);
    }


    clItems.playerArrayIndex = function () {
    //0 is the player ID in the items array
    return clItems.itemsArrayIndex(0);
    }


    clItems.currentRoomNumber = function () {
      var playerArrayIndex = clItems.playerArrayIndex();
      return clItems[playerArrayIndex].location;
    }


    clItems.setCurrentRoomNumber = function (roomNumber) {
      var playerArrayIndex = clItems.playerArrayIndex();
      clItems[playerArrayIndex].location = roomNumber;
    }


    clItems.playerArrayIndexFromName = function (clItemName) {
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].word === clItemName) {
          return i;
        }
      }
    }



    clItems.testForItemsAtLocation = function (clLocation) {
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].location === clLocation && clItems[i].ID !== 0) {
          return true;
        }
      }
      return false;
    }




    clItems.testForNamedItemAtALocation = function (itemName, clLocation) {
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if (clItems[i].location === clLocation && clItems[i].word === itemName) {
          return clItems[i].ID;
        }
      }
      return false;
    }


    clItems.namedItemIsInPlayerScope = function (itemName) {
      return (clItems.testForNamedItemAtALocation(itemName, 0) || clItems.testForNamedItemAtALocation(itemName, clItems.currentRoomNumber()));
    }


    clItems.getInstructionMatchingVerbNoun = function (clVerb, clNoun) {
      var clInstruction = "systemResponse(8);";
      var clItemID = clItems.namedItemIsInPlayerScope(clNoun);
      if (clItemID) {
        clInstruction = clItems[clItems.itemsArrayIndex(clItemID)][clVerb] || clItems[clItems.defaultArrayIndex()][clVerb];
      }
      return clInstruction;
    }


    
    clItems.getWordIfNounInScope = function (clNoun) {
      var clItemID = clItems.namedItemIsInPlayerScope(clNoun);
      return clItems[clItems.itemsArrayIndex(clItemID)].word;
    }




    clItems.printListOfItemsAtLocation = function (roomNumber) {
      var classicItemsArrayLength = clItems.length;
      for (var i = 0; i < classicItemsArrayLength; i += 1) {
        if ((clItems[i].location === roomNumber) && (clItems[i].ID !== 0)) {
          classicProcessHighLevelInstruction(clItems[i].name);
        }
      }
    }








    clRooms.roomsArrayIndex = function(roomsID) {
      var classicRoomsArrayLength = clRooms.length;
      for (var i = 0; i < classicRoomsArrayLength; i += 1) {
        if (clRooms[i].roomNumber === roomsID) {
          return i;
        }
      }
    }


    clRooms.defaultRoomIndex = function() {
      return clRooms.roomsArrayIndex(-1);
    }


    clRooms.currentRoomIndex = function() {
      var currentRoomNumber = clItems.currentRoomNumber();
      return clRooms.roomsArrayIndex(currentRoomNumber);
    }






    clCommands.templateLookup = function(clTemplateCommand, classicParsedValue) {
      var clCommand = clTemplates[clTemplateCommand];
      return clCommand.replace(/\?/g, classicParsedValue);
    }
  }


























  function classicSetupCommands() {
    //
    //"Low level" commands
    //
    //The "B" instruction is the inverse of the "C" Conditional test - if true then we skip the next instruction.
    //B100 - is the item in the players inventory
    //B101 - are any items in the location number defined in classicGameStatus.classicActiveNumber
    classicCommands.B = function (classicParsedValue,i) {
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
      classicGameStatus.classicMessageList += classicParsedValue.toString() + "~";
      return i;
    };
    //The "I" instruction changes the active "item" to which subsequent incstructions refer
    //See also the related "N" instruction
    classicCommands.I = function (classicParsedValue,i) {
      classicGameStatus.classicItemID = clItems.itemsArrayIndex(classicParsedValue);
      return i;
    };
    //The "L" instruction sets the location of the acitive item
    //location 0 is your own inventory
    //location -1 is the current location
    classicCommands.L = function (classicParsedValue,i) {
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
      if (classicParsedValue === 1) {
        clItems.printListOfItemsAtLocation(classicGameStatus.classicActiveNumber);
      }
      return i;
    };
    //The "R" instruction unsets the flag used for the "C" and "B" conditional tests. ("S" Sets it)
    classicCommands.R = function (classicParsedValue,i) {
      clRooms[clRooms.currentRoomIndex()][classicParsedValue] = 0;
      return i;
    };
    //The "S" instruction Sets the flag used for the "C" and "B" conditional tests. ("R" unsets it)
    classicCommands.S = function (classicParsedValue,i) {
      clRooms[clRooms.currentRoomIndex()][classicParsedValue] = 1;
      return i;
    };
    //The "X" instruction looks up the instruction code from the snippets table and executes the instructions by calling classicProcessLowLevelInstruction recursively.
    classicCommands.X = function (classicParsedValue,i) {
      classicProcessLowLevelInstruction(clTabs.snippets[classicParsedValue]);
      return i;
    };
    //
    //"High level" commands
    //
    //The "drop" command executes the low level command sequence to add the item to your inventory
    classicCommands.drop = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("drop", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };
    //The "exec" command passes the parameter string straight to the classicProcessLowLevelInstruction function for execution.
    classicCommands.exec = function (classicParsedValue,i) {
      classicProcessLowLevelInstruction(classicParsedValue);
      return i;
    };
    //The "get" command executes the low level command sequence to add the item to your inventory
    classicCommands.get = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("get", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };
    //The "init" command calls game initialisation commands
    classicCommands.init = function (classicParsedValue,i) {
      if (classicParsedValue = "newGame") {
        classicProcessLowLevelInstruction(clTemplates.newGame);
      }
      return i;
    };
    //The "inventory" command displays a list of items.
    classicCommands.inventory = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("inventory", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };   
    //The "look" command displays the messagenumber "10?02" where "?" is the item number.
    classicCommands.look = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("look", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };   
    //The "lookAround" command displays the long description of the room and lists the items in that room 
    classicCommands.lookAround = function (classicParsedValue,i) {
       if (classicParsedValue === "-1") {
        classicParsedValue = clItems.currentRoomNumber();
      } 
      var clCommand = clCommands.templateLookup("lookAround", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };
    //The "message" command executes the low level command to display the given message number
    classicCommands.message = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("message", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };
    //The "move" command executes the standard change room low level command sequence - moving the player to the room number specified as the parameter.
    classicCommands.move = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("move", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };
    //The "printItemName" command displays the messagenumber "10?00" where "?" is the item number.
    classicCommands.printItemName = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("printItemName", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };  
    //The "read" command displays the messagenumber "10?02" where "?" is the item number.
    classicCommands.read = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("read", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };   
    //The "systemResponse" command is intended to be called from the code and executes the specified code snippet number.
    classicCommands.systemResponse = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("systemResponse", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };       
    //The "swapInPlayer" command executes the low level command sequence to add the item to your inventory
    classicCommands.swapInPlayer = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("swapInPlayer", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };
    //The "swapInRoom" command executes the low level command sequence to add the item to your inventory
    classicCommands.swapInRoom = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("swapInRoom", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };
    //The "swapOut" command executes the low level command sequence to add the item to your inventory
    classicCommands.swapOut = function (classicParsedValue,i) {
      var clCommand = clCommands.templateLookup("swapOut", classicParsedValue);
      classicProcessLowLevelInstruction(clCommand);
      return i;
    };        
  }





















  function classicUpdateDescription() {
    classicGameStatus.gameStatus.value += "\n\n> " + classicGameStatus.classicTurnCommand + "\n" + classicGameStatus.classicMessages.messages;
    classicGameStatus.classicMessageList = "";

    //This makes sure that the bottom line of text in the gameStatus box is visible after an update.
    classicGameStatus.gameStatus.scrollTop = classicGameStatus.gameStatus.scrollHeight;
  }

























  function classicParseEnteredCommand() {
    var classicVerb = "";
    var classicNoun = "";

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
    // - the first character of the value defines the type of command; either V or N (verb or noun).
    // -- the rest of the value is the token; e.g. the user typing either 'ne' or 'northeast' will both be tokenised to 'northeast' - stored as 'Mnortheast' so classed as a  verb

    //if the first command is an N we assign the token to classicNoun and ignore any second word
    //if the first command is a V we assign the token to classicVerb and we then check if the second word is an N; if so we assign the second token to classicNoun


    if (firstStartPosition < classicGameStatus.classicTurnCommand.length) {
      if (clCommands[firstCommand].charAt(0) === 'N') {
        classicNoun = clCommands[firstCommand].slice(1);
      } else if (clCommands[firstCommand].charAt(0) === 'V') {
        classicVerb = clCommands[firstCommand].slice(1);
        if (secondStartPosition < classicGameStatus.classicTurnCommand.length) {
          if (clCommands[secondCommand].charAt(0) === 'N') {
            classicNoun = clCommands[secondCommand].slice(1);
          }
        }
      }
    }

    console.log(classicVerb);
    console.log(classicNoun);

    var classicUserCommands = [classicVerb, classicNoun]
    return classicUserCommands;
  }














  function classicProcessParsedCommand(classicUserCommands) {
    var classicInstruction = "systemResponse(0);"; //If unrecognised command then execute code snippet '0'
    var classicVerb = classicUserCommands[0];
    var classicNoun = classicUserCommands[1];

    if (classicVerb !== "" && classicNoun !== "") {
      //verb+noun processing.
      //First identify the item matching the noun - scope is to check those in the inventory first else in the current room
      //Then, from that item, extract the instruction string associated with the verb
      classicInstruction = clItems.getInstructionMatchingVerbNoun(classicVerb, classicNoun);
    } else if (classicVerb !== "") {
      //verb only processing -
      if (clRooms[clRooms.defaultRoomIndex()][classicVerb]) {
        //Look for the verb in the rooms entry for the current room that the player is in.
        classicInstruction = clRooms[clRooms.currentRoomIndex()][classicVerb] || clRooms[clRooms.defaultRoomIndex()][classicVerb];
      } else {
        //Look for the verb in the items entry for the player
        if (clItems[clItems.defaultArrayIndex()][classicVerb]) {
          classicInstruction = clItems[clItems.playerArrayIndex()][classicVerb] || clItems[clItems.defaultArrayIndex()][classicVerb];
        }
      }
    }
    return classicInstruction;
  }





















  //UNDER CONSTRUCTION
  function classicProcessHighLevelInstruction(classicInstruction) {
    var classicParsedValue = 0;
    var classicCommandParts = [];
    var classicCommandPartsArrayLength = 0;

    console.log(classicInstruction);
    classicCommandParts = classicInstruction.split(";");
    
    console.log(classicCommandParts);
    classicCommandPartsArrayLength = classicCommandParts.length;
    //This is a kludge until high level commands are fully implemented - there are still low level commands in the code at the moment, so this executes them if they are encountered
    if (classicCommandPartsArrayLength === 1) {
      classicProcessLowLevelInstruction(classicInstruction);
      return;      
    }
    for (var i = 0; i < classicCommandPartsArrayLength; i += 1) {
      if (classicCommandParts[i]) {
        var clCommand = classicCommandParts[i].trim();
        var clKeyword = clCommand.slice(0, clCommand.indexOf("("));
        classicParsedValue = clCommand.slice(clCommand.indexOf("(") + 1, clCommand.indexOf(")"));
        i = classicCommands[clKeyword](classicParsedValue,  i);
      }
    }  
  }










 
  //This splits the string of low level commands (in the form e.g. "D999I0L1C1D1000B1D1001N1X7") into an array, with one instruction in each element of the array
  //The for loop then steps through the array, calling the function associated with each instruction e.g "D9999" will execute a function call within the for loop 'classicCommands.D(9999);'
  //See function classicSetupCommands() for the details of the low level commands.
  function classicProcessLowLevelInstruction(classicInstruction) {
    var classicParsedValue = 0;
    var classicCommandParts = [];
    var classicCommandPartsArrayLength = 0;

    console.log(classicInstruction);
    classicCommandParts = classicInstruction.match(/[A-Z][\-]?[0-9]+/g);
    console.log(classicCommandParts);
    classicCommandPartsArrayLength = classicCommandParts.length;

    for (var i = 0; i < classicCommandPartsArrayLength; i += 1) {
      var clValue = classicCommandParts[i];
      classicParsedValue = parseInt(clValue.slice(1),10);
      i = classicCommands[clValue.charAt(0)](classicParsedValue,i); //The function is able to manipulate the 'i' index - (skip next command = i++)
    }
  }





























  function classicTurnPart1() {
    classicGameStatus.commandBox.disabled = true;

    var classicUserCommands = {};
    var classicInstruction = "";

    classicUserCommands = classicParseEnteredCommand();
    classicInstruction = classicProcessParsedCommand(classicUserCommands);
    classicProcessHighLevelInstruction(classicInstruction);

    classicGetMessages(function(classicGetMessages) {
      classicGameStatus.classicMessages = classicGetMessages;
    });
    //When the messages have been displayed the flow continues in classicTurnPart2()

    // return false to prevent form submission
    return false;
  }


  function classicTurnPart2() {
    classicUpdateDescription();
    console.log(classicGameStatus);
    console.log(classicCommands);
    classicGameStatus.commandBox.disabled = false;
    classicGameStatus.commandBox.value = '';
    classicGameStatus.commandBox.focus();
   }
























  function init() {
    // We will call an init funtion here to set the initial parameters, and either load a saved game or initialise new game

    //fetch the data tables from the server
    //as the messages table could become large, it is queried from the database at the end and only the required messages are retrieved and displayed
    //description tbd

    classicGameStatus.gameStatus.setAttribute('disabled', true);
    classicGameStatus.commandBox.disabled = true;
    
    classicLoadTablesJson(function(classicLoadTablesJson) {
      classicGameStatus.classicTablesJson = classicLoadTablesJson;
    });

    document.getElementById('theForm').onsubmit = classicTurnPart1;
  }

  window.onload = init;

})();
