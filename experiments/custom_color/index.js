

function init_custom_pallete(color_num) {
	var CANVAS = document.getElementById("sprite-canvas");
	var CTX = CANVAS.getContext("2d");
	var PALLETE = document.getElementById("color-pallete");
	var REFRESH_BUTTON = document.getElementById("refresh-icon");
	var SPRITE = {
		asset: new Image(),
		frame_count: 4,
		frame_idx: 0,
		w: 24,
		h: 24,
		x: 10,
		y: 10,
		color: [212, 212, 212]
	};
	var start;

	function handle_color_refresh() {
		let colors = document.getElementsByClassName("pallete-item")
		let pallete = randomize_pallete(colors.length);
		for(let i = 0; i < colors.length; i++) {
			colors[i].style.backgroundColor = '#' + pallete[i];
		}
	}

	function handle_color_click() {
		let new_color = parse_rgb_str(this.style.backgroundColor);
		console.log(new_color);
		console.log(this.style.backgroundColor);
		change_sprite_color(new_color);

	}

	function handle_sprite_load() {
		// window.requestAnimationFrame(step);
		render_sprite();
	}

	function handle_window_resize() {
		CANVAS.width = CANVAS.height * (CANVAS.clientWidth 
			/ CANVAS.clientHeight);
	}

	function set_handlers() {
		REFRESH_BUTTON.addEventListener('click', handle_color_refresh);
		SPRITE.asset.addEventListener('load', handle_sprite_load);
		window.addEventListener('resize', handle_window_resize);
	}

	function populate_pallete(num) {
		let pallete = randomize_pallete(num);
		for(let i = 0; i < num; i++) {
			let tmp = document.createElement("DIV")
			tmp.style.backgroundColor = '#' + pallete[i];
			tmp.setAttribute("class", "pallete-item");
			tmp.addEventListener('click', handle_color_click);
			PALLETE.appendChild(tmp);
		}
		PALLETE.style.gridTemplateRows = "repeat(${num}, 1fr)";
	}

	function render_sprite() {
		CTX.clearRect(SPRITE.x, SPRITE.y, SPRITE.w, SPRITE.h);
		CTX.drawImage(SPRITE.asset, SPRITE.w * SPRITE.frame_idx, 0, SPRITE.w, 
			SPRITE.h, SPRITE.x, SPRITE.y, SPRITE.w, SPRITE.h);
		SPRITE.frame_idx = (SPRITE.frame_idx + 1) % SPRITE.frame_count;
	}

	function step(timestamp) {
		if (start === undefined) {
			start = timestamp;
		}
		const elapsed = timestamp - start;
		if (elapsed > 100) {
			render_sprite();
			start = timestamp;
		}
		window.requestAnimationFrame(step);
	}

	function load_sprite() {
		SPRITE.asset.src = "../assets/player_idle.png";
		console.log(CANVAS.width, CANVAS.height);
	}

	function change_sprite_color(new_color) {
		let px_data = CTX.getImageData(SPRITE.x, SPRITE.y, SPRITE.w, SPRITE.h);
		let px_arr = px_data.data;
		let px_rep_count = 0;
		// console.log(px_arr.length);
		for(let i = 0; i < px_arr.length; i += 4) {
			if (px_arr[i + 3] == 0) continue;
			let curr_px = px_arr.slice(i, i + 3).toString();
			let sprite_px = SPRITE.color.toString();
			// console.log(curr_px + " | " + sprite_px);
			for(let j = 0; j < 3; j++) {
				let d_color = px_arr[i + j] - SPRITE.color[j];
				px_arr[i + j] = new_color[j] + d_color;
			}
			px_rep_count++;
		}
		SPRITE.color = new_color;
		px_data.data = px_arr;
		CTX.putImageData(px_data, SPRITE.x, SPRITE.y);
		console.log("replaced " + px_rep_count);
	}

	function set_canvas_aspect() {
		CANVAS.width = CANVAS.height * (CANVAS.clientWidth 
			/ CANVAS.clientHeight);
	}

	set_handlers();
	set_canvas_aspect();
	load_sprite();
	populate_pallete(color_num);

}

function randomize_color() {
	let color = "";
	for(let i = 0; i < 3; i++) {
		let val =  Math.floor(Math.random() * 256);
		let str_val = val.toString(16);
		if (val < 0x10) {
			str_val = '0' + str_val;
		}
		color += str_val;
	}
	console.log(color);
	return color;
}

function randomize_pallete(num) {
	let pallete = [];
	for(let i = 0; i < num; i++) {
		pallete.push(randomize_color());
	}
	return pallete;
}

function parse_rgb_str(rgb_str) {
	rgb_str = rgb_str.slice(4, -1);
	let rgb_val = rgb_str.split(',');
	for(let i = 0; i < rgb_val.length; i++) {
		rgb_val[i] = parseInt(rgb_val[i]);
	}
	return rgb_val;
}







window.addEventListener('load', function() {
	init_custom_pallete(8);
});