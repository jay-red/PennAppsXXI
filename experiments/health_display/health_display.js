// health_display.js
// use init_health_display() to initializa a health display
// and return the display
// you can then update that any health display by passing
// the display into update_health_display()

function init_bar_display(div, max, curr, color) {
	let hp = document.createElement("div");
	let gauge = document.createElement("div");
	let shade = document.createElement("img");
	let frame = document.createElement("img");

	hp.setAttribute("class", "health-bar-hp");
	gauge.setAttribute("class", "health-bar-gauge");
	set_multiple_attributes(shade, {
		"class": "health-bar-shade",
		"src": "../assets/healthbar_shade.png"
	})
	set_multiple_attributes(frame, {
		"class": "health-bar-frame",
		"src": "../assets/healthbar_frame.png"
	})

	gauge.appendChild(hp);
	div.appendChild(gauge);
	div.appendChild(shade);
	div.appendChild(frame);
	update_bar_display(div, max, curr);
}

function init_heart_display(div, max, curr, incr) {
	let count = Math.ceil(max / incr);
	for(let i = 0; i < count; i++) {
		let heart = document.createElement("img");
		set_multiple_attributes(heart, {
			"class": "health-heart-asset",
			"src": "../assets/health_heart.png"
		});
		div.appendChild(heart);
	}
	update_heart_display(div, incr, curr);
}

// input: type: "bar" | "heart", max: max hp, curr: current hp out of max
//  	div: div element with set width to contain health display
//  	color(optional): hex string for the color of hp
// output: heath display div element
function init_health_display(type, div, max, curr=undefined, incr=20, color="ff0000") {
	if (curr === undefined) curr = max;
	let health_div = document.createElement("div");
	health_div.setAttribute("class", "pixelate health-" + type);
	if (type == "heart") {
		init_heart_display(health_div, max, curr, incr);
	}
	else if (type == "bar") {
		init_bar_display(health_div, max, curr, color);
	}
	div.appendChild(health_div);
	return health_div;
}

function update_bar_display(bar, max, curr, extr=undefined) {
	let arr = bar.children;
	let hp = undefined;
	for(let i = 0; i < arr.length; i++) {
		if (arr[i].matches(".health-bar-gauge")) {
			hp = arr[i];
			break;
		}
	}
	if (!hp) return;
	hp = hp.children[0];
	hp.style.width = Math.floor(curr / max * 100) + "%";
	if (extr) set_multiple_styles(hp, extr);
}

function update_heart_display(heart_container, incr, curr, extr=undefined) {
	let heart_lst = heart_container.children;
	let count = heart_lst.length;
	let full_count = Math.floor(curr / incr);
	let partial_opacity = curr % incr / incr;
	for(let i = 0; i < count; i++) {
		let new_opac = 0;
		if (i < full_count) new_opac = 1;
		else if (i == full_count) new_opac = partial_opacity;
		else new_opac = 0;
		heart_lst[i].style.opacity = new_opac;
		if (extr) set_multiple_styles(heart_lst[i], extr);
	}
	console.log(heart_lst[0]);
}

// input: div: health display div to be updated
//  	max: if bar, max hp total | if heart,  max hp of each heart
//  	curr: current hp out of max
function update_health_display(div, max, curr, extr=undefined) {
	if (curr < 0) curr = 0;
	let update_pointer = null;
	if (div.matches(".health-heart")) {
		update_pointer = update_heart_display;
	}
	else if (div.matches(".health-bar")) {
		update_pointer = update_bar_display;
	}
	update_pointer(div, max, curr, extr);
}

function set_multiple_attributes(dom, attributes) {
	for(const attr in attributes) {
		dom.setAttribute(attr, attributes[attr]);
	}
}

function set_multiple_styles(dom, styles) {
	console.log(styles);
	for(const sty in styles) {
		dom.style[sty] = styles[sty];
	}
}

///////////testing/////////////
var BOSS_DIV = document.getElementById("boss-div");
var PLAYER_DIV = document.getElementById("player-div");
window.onload = function() {
	var boss_max = 300;
	var boss_hp = 255;
	var player_max = 200;
	var player_hp = 155;
	var boss = init_health_display("bar", BOSS_DIV, boss_max, boss_hp);
	var player = init_health_display("heart", PLAYER_DIV, player_hp, player_hp);
	document.addEventListener('click', function() {
		boss_hp -= 10;
		player_hp -= 10;
		update_health_display(boss, boss_max, boss_hp);
		update_health_display(player, 20, player_hp);
		console.log(`boss now at ${boss_hp}/${boss_max}`);
		console.log(`player now at ${player_hp}/${player_max}`);
	})
}

