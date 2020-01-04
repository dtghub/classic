(function(){
  'use strict';
  var locationID = 0;


  function classicUpdateDescription(gameStatus) {
    'use strict';

    if (locationID === 0) {
      locationID = 1;
      console.log('here we are');
    }

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

  function classicEnteredCommand(commandBox) {
    'use strict';
    commandBox.value = '';
  }

  // Functioning as 'Main loop' for now...
  function classicTurn() {
    'use strict';

    // Form references: - once the code gets fleshed out, consider if maybe these references should be move to the init function for efficiency...
    var gameStatus = document.getElementById('game');
    var commandBox = document.getElementById('commandBox');
//    var submit = document.getElementById('submit');

    classicEnteredCommand(commandBox);
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
