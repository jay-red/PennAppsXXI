
var BOSS_DIV = document.getElementById("boss-div");
var PLAYER_DIV = document.getElementById("player-div");





function init_bar_display(div, max, curr, color) {
	let hp = document.createElement("div");
	let gauge = document.createElement("div");
	let shade = document.createElement("img");
	let frame = document.createElement("img");

	hp.setAttribute("class", "health-bar-hp");
	gauge.setAttribute("class", "health-bar-gauge");
	set_multiple_attribute(shade, {
		"class": "health-bar-shade",
		"src": "../assets/healthbar_shade.png"
	})
	set_multiple_attribute(frame, {
		"class": "health-bar-frame",
		"src": "../assets/healthbar_frame.png"
	})

	gauge.appendChild(hp);
	div.appendChild(gauge);
	div.appendChild(shade);
	div.appendChild(frame);
	update_bar_display(hp, max, curr, {"color": color});
}

function init_heart_display(div, max, curr, color) {

}

// input: type: "bar" | "heart"
function init_health_display(type, max, curr, div, color="ff0000") {
	let health_div = document.createElement("div");
	health_div.setAttribute("class", "pixelate health-" + type);
	let init_health_pointer = undefined;
	if (type == "heart") {
		init_health_pointer = init_heart_display;
	}
	else {
		init_health_pointer = init_bar_display;
	}
	init_health_pointer(health_div, max, curr, color);
	div.appendChild(health_div);
	return health_div;
}

function update_bar_display(bar, max, curr, extr=null) {
	bar.style.width = Math.floor(curr / max * 100) + "%";
	if (extr) {
		set_multiple_attribute(bar, extr);
	}
}

function update_health_display(div, max, curr) {

}

function set_multiple_attribute(dom, attributes) {
	for(const attr in attributes) {
		dom.setAttribute(attr, attributes[attr]);
	}
}


window.onload = function() {
	init_health_display("bar", 100, 55, BOSS_DIV);
}

