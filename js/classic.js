(function(){
  'use strict';
  var locationID = 0;


  function classicUpdateDescription(gameStatus) {
    'use strict';

    if (locationID === 0) {
      locationID = 1;
      console.log('here we are');
    }

    //This is initial kludge to get the code structure into place
    gameStatus.setAttribute('disabled', false);
    switch (locationID) {
      case 1:
        gameStatus.value = "You are in test room number one."
        break;
      case 2:
        gameStatus.value = "This is test room number two."
        break;
      default:
      }
      gameStatus.setAttribute('disabled', true);
      console.log('third');
  }

  function classicEnteredCommand(commandBox, classicVerb, classicNoun) {
    'use strict';

    if (commandBox.value.search(/north/i) !== -1) {
      classicVerb = "north";
    }

    if (commandBox.value.search(/south/i) !== -1) {
      classicVerb = "south";
    }

    console.log(classicVerb);
    commandBox.value = '';
  }

  // Functioning as 'Main loop' for now...
  function classicTurn() {
    'use strict';

    // Form references: - once the code gets fleshed out, consider if maybe these references should be move to the init function for efficiency...
    var gameStatus = document.getElementById('game');
    var commandBox = document.getElementById('commandBox');
//    var submit = document.getElementById('submit');

    var classicFuntionReturn = [];

    // Noun and verb are produced by the classicParsing funtion, and used as the command interface - might implement adverbs later?
    var classicNoun;
    var classicVerb;




    classicFuntionReturn = classicEnteredCommand(commandBox, classicVerb, classicNoun);
    commandBox = classicFuntionReturn[0];
    classicVerb = classicFuntionReturn[1];
    classicNoun = classicFuntionReturn[2];

    console.log(classicVerb);
    classicUpdateDescription(gameStatus);

    // return false to prevent submission for now:
    return false;
  }

  function init() {
    'use strict';
    document.getElementById('theForm').onsubmit = classicTurn;
  }

  window.onload = init;

})();
