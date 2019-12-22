// Functioning as 'Main loop'
function process() {
  'use strict';

  // Form references: - maybe these references should be move to the init function for efficiency... 
  var game = document.getElementById('game');
  var commandBox = document.getElementById('commandBox');
  var submit = document.getElementById('submit');



  // return false to prevent submission:
  return false;
}

function init() {
  'use strict';
  document.getElementById('theForm').onsubmit = process;
}

window.onload = init;
