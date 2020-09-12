

function init_custom_pallete(color_num) {
	var CANVAS = document.getElementById("sprite-canvas");
	var CTX = CANVAS.getContext("2d");
	var PALLETE = document.getElementById("color-pallete");
	var REFRESH_BUTTON = document.getElementById("refresh-icon");
	var NEXT_BUTTON = document.getElementById("color-next-button");
	var COLOR_INPUT = document.getElementById('color-input');
	var SPRITE = {
		asset_src: {
			idle: {
				src: ["../assets/player_idle.png"],
				frame_count: 4
			},
			run: {
				src: ["../assets/player_run.png"],
				frame_count: 6
			}
		},
		curr_state: "idle",
		asset: new Image(),
		frame_count: 4,
		frame_idx: 0,
		w: 24,
		h: 24,
		x: 0,
		y: 0,
		color: [[212, 212, 212]]
	};
	var start;

	// input: img: Image Object, new_color: [r, g, b]
	// output: canvas of img width and height w/ img placed at (0, 0)
	function recolor_img(img, new_color) {
		var buffer = document.createElement("canvas");
		var buff_ctx = buffer.getContext('2d');
		buffer.width = img.width;
		buffer.height = img.height;
		buff_ctx.drawImage(img, 0, 0);
		let buff_data = buff_ctx.getImageData(0, 0, img.width, img.height);
		change_sprite_color(buff_data, new_color, buff_ctx);
		console.log("w: " + buffer.width + " | h: " + buffer.height);
		return buffer;
	}

	function handle_color_refresh() {
		let colors = document.getElementsByClassName("pallete-item")
		let pallete = randomize_pallete(colors.length);
		for(let i = 0; i < colors.length; i++) {
			colors[i].style.backgroundColor = '#' + pallete[i];
		}
	}

	// function handle_buffer_load() {
	// 	SPRITE.asset = this;
	// 	console.log(this);
	// }

	function handle_color_click() {
		NEXT_BUTTON.style.backgroundColor = this.style.backgroundColor;
		let new_color = parse_rgb_str(this.style.backgroundColor);
		console.log(new_color);
		console.log(this.style.backgroundColor);
		// let px_data = CTX.getImageData(SPRITE.x, SPRITE.y, SPRITE.w, SPRITE.h);
		// change_sprite_color(px_data, new_color, CTX);

		// get_buffer_asset_output(new_color);
		// let curr_src = SPRITE.asset_src[SPRITE.curr_state].src;
		// console.log(curr_src);
		// var buff_img = new Image();
		// buff_img.src = curr_src[curr_src.length - 1];
		// buff_img.addEventListener('load', handle_buffer_load);

		SPRITE.asset = recolor_img(SPRITE.asset, new_color);
		// render_sprite();
	}

	function handle_input_change(e) {
		
	}

	function handle_sprite_load() {
		window.requestAnimationFrame(step);
		// render_sprite();
		SPRITE.asset.removeEventListener('load', handle_sprite_load);
	}

	function handle_window_resize() {
		CANVAS.width = CANVAS.height * (CANVAS.clientWidth 
			/ CANVAS.clientHeight);
	}

	function set_listeners() {
		REFRESH_BUTTON.addEventListener('click', handle_color_refresh);
		COLOR_INPUT.addEventListener('focus', handle_input_change);
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

	function change_sprite_color(px_data, new_color, ctx) {
		let px_arr = px_data.data;
		let px_rep_count = 0;
		let back_idx = SPRITE.color.length - 1;
		for(let i = 0; i < px_arr.length; i += 4) {
			if (px_arr[i + 3] == 0) continue;
			for(let j = 0; j < 3; j++) {
				let d_color = px_arr[i + j] - SPRITE.color[back_idx][j];
				px_arr[i + j] = (new_color[j] + d_color) % 255;
			}
			px_rep_count++;
		}
		SPRITE.color.push(new_color);
		px_data.data = px_arr;
		ctx.putImageData(px_data, SPRITE.x, SPRITE.y);
		console.log("replaced " + px_rep_count);
	}

	function set_canvas_aspect() {
		CANVAS.width = CANVAS.height * (CANVAS.clientWidth 
			/ CANVAS.clientHeight);
	}

	// function init_buffer(state) {
	// 	BUFFER.width = SPRITE.w * SPRITE.frame_count;
	// 	BUFFER.height = SPRITE.h;
	// 	BUFF_CTX.clearRect(0, 0, BUFFER.width, BUFFER.height);
	// 	let back_idx = SPRITE.asset_src[state].src.length - 1;
	// 	var buff_img = new Image();
	// 	buff_img.src = SPRITE.asset_src[state].src[back_idx];
	// 	buff_img.addEventListener('load', render_buffer_asset);
	// }

	// function render_buffer_asset() {
	// 	var buff_img = this;
	// 	BUFF_CTX.drawImage(buff_img, 0, 0);
	// }

	// function get_buffer_asset_output(new_color) {
	// 	let states = Object.keys(SPRITE.asset_src);
	// 	for(let i = 0; i < states.length; i++) {
	// 		init_buffer(states[i]);
	// 		let px_data = BUFF_CTX.getImageData(0, 0, BUFFER.width, BUFFER.height);
	// 		change_sprite_color(px_data, new_color, BUFF_CTX);
	// 		SPRITE.asset_src[states[i]].src.push(BUFFER.toDataURL());
	// 	}
	// }

	set_listeners();
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