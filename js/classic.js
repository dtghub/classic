// Functioning as 'Main loop'
function process() {
  'use strict';

  // Form references: - once the code gets fleshed out, consider if maybe these references should be move to the init function for efficiency...
  var game = document.getElementById('game');
  var commandBox = document.getElementById('commandBox');
  var submit = document.getElementById('submit');

  var enteredCommand = commandBox.value;
  commandBox.value = '';
console.log('zeroeth');
  //Kludge the room and status descritiption for now
  try {
    locationID;
    var declared = true;
  } catch(e) {
    var declared = false;
  }
console.log('first');
  if (!declared) {
    var locationID = 1;
  }
console.log(second);
/*  switch (locationID) {
    case 1:
      game.value = "You are in test room number one."
      break;
    case 2:
      game.value = "This is test room number two."
      break;
    default:
    }
console.log(third);
*/

  // return false to prevent submission for now:
  return false;
}

function init() {
  'use strict';
  document.getElementById('theForm').onsubmit = process;
}

window.onload = init;
