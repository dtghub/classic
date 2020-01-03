// Functioning as 'Main loop'
function process() {
  'use strict';

  // Form references: - once the code gets fleshed out, consider if maybe these references should be move to the init function for efficiency...
  var game = document.getElementById('game');
  var commandBox = document.getElementById('commandBox');
  var submit = document.getElementById('submit');
  //var locationID;

  var enteredCommand = commandBox.value;
  commandBox.value = '';
console.log('zeroeth');
  if (locationID === undefined) {
    var locationID = 1;
  }

  //Kludge the room and status descritiption for now
  //try {
    //locationID;
    //var isDeclared = true;
  //} catch(e) {
    //var isDeclared = false;
  //}
  //console.log(isDeclared === false);
console.log('first');
  if (isDeclared === false) {
    locationID = 1;
    console.log('here we are');
  }
console.log('second');
console.log(isDeclared);
console.log(locationID);
  switch (locationID) {
    case 1:
      game.innerText = "You are in test room number one."
      break;
    case 2:
      game.innerText = "This is test room number two."
      break;
    default:
    }
console.log('third');


  // return false to prevent submission for now:
  return false;
}

function init() {
  'use strict';
  document.getElementById('theForm').onsubmit = process;
}

window.onload = init;
