
var BOSS_DIV = document.getElementById("boss-div");
var PLAYER_DIV = document.getElementById("player-div");





function init_bar_display(div, max, curr) {
	let bar_frame = document.createElement("img");
	let bar_shade = document.createElement("img");
	set_multiple_attribute(bar_frame, {
		"class": "health-bar-frame",
		"src": "../assets/healthbar_frame.png"
	})
	set_multiple_attribute(bar_shade, {
		"class": "health-bar-shade",
		"src": "../assets/healthbar_shade.png"
	})
	div.appendChild(bar_frame);
	div.appendChild(bar_shade);
	update_health_display(div, max, curr);
}

function init_heart_display(max, curr) {

}

function init_health_display(type, max, curr, div, color="ff0000") {
	let health_element = null;

}

function update_health_display(div, max, curr) {

}

function set_multiple_attribute(dom, attributes) {
	for(let attr in attributes) {
		dom.setAttribute(attr, attributes[attr]);
	}
}
