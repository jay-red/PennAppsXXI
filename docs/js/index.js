


function init_landing() {
	var ROOM_CODE_INPUT = document.getElementById("room-code-input");
	var GAME_BUTTONS = document.getElementsByClassName("game-button");

	function handle_button_redirect() {
		window.location.assign(`${this.getAttribute("href")}?game=${ROOM_CODE_INPUT.value}`);
		// console.log(`${this.getAttribute("href")}?${ROOM_CODE_INPUT.value}`);
	}

	for(let i = 0; i < GAME_BUTTONS.length; i++) {
		GAME_BUTTONS[i].addEventListener('click', handle_button_redirect);
	}
}





window.addEventListener('load', function() {
	init_landing()
});
