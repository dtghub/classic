(function(){
  'use strict';
  var locationID = 0;






  function classicUpdateDescription(gameStatus, classicTurnCommand) {
    'use strict';

    //Initialise location on first use
    if (locationID === 0) {
      locationID = 1;
      console.log('here we are');
    }

    gameStatus.value += '\n' + classicTurnCommand;

    //This is initial kludge to get the code structure into place
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
      gameStatus.setAttribute('disabled', true);
      console.log('third');
  }






  function classicParseEnteredCommand(commandBox, classicVerb, classicNoun) {
    'use strict';

    var classicTurnCommand = commandBox.value;

    if (classicTurnCommand.search(/north/i) !== -1) {
      classicVerb = "north";
    }

    if (classicTurnCommand.search(/south/i) !== -1) {
      classicVerb = "south";
    }

    console.log(classicVerb);
    commandBox.value = '';
    return [classicTurnCommand, classicVerb, classicNoun];
  }






  function classicProcessCommand(classicVerb, classicNoun) {
    'use strict';

    if (classicVerb === 'north') {
      locationID = 2;
    }

    if (classicVerb === 'south') {
      locationID = 1;
    }

  }





  // Functioning as 'Main loop' for now...
  function classicTurn() {
    'use strict';

    // Form references: - once the code gets fleshed out, consider if maybe these references should be move to the init function for efficiency...
    var gameStatus = document.getElementById('game');
    var commandBox = document.getElementById('commandBox');
//    var submit = document.getElementById('submit');

    var classicFunctionReturn = [];

    // Noun and verb are produced by the classicParsing funtion, and used as the command interface - might implement adverbs later?
    var classicNoun;
    var classicVerb;
    var classicTurnCommand;

    classicFunctionReturn = classicParseEnteredCommand(commandBox, classicVerb, classicNoun);
    classicTurnCommand = classicFunctionReturn[0];
    classicVerb = classicFunctionReturn[1];
    classicNoun = classicFunctionReturn[2];


    console.log(classicVerb);

    classicProcessCommand(classicVerb, classicNoun);

    classicUpdateDescription(gameStatus, classicTurnCommand);

    // return false to prevent submission for now:
    return false;
  }







  function init() {
    'use strict';
    document.getElementById('theForm').onsubmit = classicTurn;
  }

  window.onload = init;

})();
