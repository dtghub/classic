(function(){
  'use strict';
  var locationID = 0;




  function loadJSON(callback) {
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



  function classicUpdateDescription(gameStatus, classicTurnCommand, classicCommandNotRecognised) {
    'use strict';

    //Initialise location on first use
    if (locationID === 0) {
      locationID = 1;
      console.log('here we are');
    }

    gameStatus.value += '\n' + classicTurnCommand;

    if (classicCommandNotRecognised) {
      gameStatus.value += "\nSorry, I didn't understand that!";
    }

    //This is initial kludge to help get the code structure into place
    gameStatus.setAttribute('disabled', false);
    switch (locationID) {
      case 1:
        gameStatus.value += "\nYou are in test room number one.";
        break;
      case 2:
        gameStatus.value += "\nThis is test room number two.";
        break;
      default:
      }


      //This makes sure that the bottom line of text in the gameStatus box is visible after an update.
      gameStatus.scrollTop = gameStatus.scrollHeight;

      gameStatus.setAttribute('disabled', true);
      console.log('third');
  }






  function classicParseEnteredCommand(commandBox, classicVerb, classicNoun) {
    'use strict';

    var classicTurnCommand = commandBox.value;

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
      locationID = 2;
    }

    if (classicVerb === 'south') {
      locationID = 1;
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

    classicFunctionReturn = classicParseEnteredCommand(commandBox, classicVerb, classicNoun);
    classicTurnCommand = classicFunctionReturn[0];
    classicVerb = classicFunctionReturn[1];
    classicNoun = classicFunctionReturn[2];


    console.log(classicVerb);

    loadJSON(function(json) {
      console.log(json); // this will log out the json object
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
