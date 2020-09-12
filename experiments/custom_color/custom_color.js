

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
		scale: 1,
		color: [[212, 212, 212]]
	};
	var start;

	function change_img_color(px_data, new_color, base_color, x, y, ctx) {
		let px_arr = px_data.data;
		// let px_rep_count = 0;
		for(let i = 0; i < px_arr.length; i += 4) {
			if (px_arr[i + 3] == 0) continue;
			for(let j = 0; j < 3; j++) {
				let d_color = px_arr[i + j] - base_color[j];
				px_arr[i + j] = (new_color[j] + d_color) % 255;
			}
			// px_rep_count++;
		}
		px_data.data = px_arr;
		ctx.putImageData(px_data, x, y);
		// console.log("replaced " + px_rep_count);
	}

	// input: img: Image Object, new_color: [r, g, b], base_color: [r, g, b]
	// output: canvas of img width and height w/ img placed at (0, 0)
	function recolor_img(img, new_color, base_color) {
		var buffer = document.createElement("canvas");
		var buff_ctx = buffer.getContext('2d');
		buffer.width = img.width;
		buffer.height = img.height;
		buff_ctx.drawImage(img, 0, 0);
		let buff_data = buff_ctx.getImageData(0, 0, img.width, img.height);
		change_img_color(buff_data, new_color, base_color, 0, 0, buff_ctx);
		// console.log("w: " + buffer.width + " | h: " + buffer.height);
		return buffer;
	}

	function change_sprite_color(new_color) {
		let back_idx = SPRITE.color.length - 1;
		let base_color = SPRITE.color[back_idx];
		SPRITE.asset = recolor_img(SPRITE.asset, new_color, base_color);
		SPRITE.color.push(new_color);
	}

	function handle_color_refresh() {
		let colors = document.getElementsByClassName("pallete-item")
		let pallete = randomize_pallete(colors.length);
		for(let i = 0; i < colors.length; i++) {
			colors[i].style.backgroundColor = '#' + pallete[i];
		}
	}

	function handle_color_click() {
		NEXT_BUTTON.style.backgroundColor = this.style.backgroundColor;
		let new_color = parse_rgb_str(this.style.backgroundColor);
		console.log(new_color);
		console.log(this.style.backgroundColor);
		change_sprite_color(new_color);

		// let px_data = CTX.getImageData(SPRITE.x, SPRITE.y, SPRITE.w, SPRITE.h);
		// change_sprite_color(px_data, new_color, base_color, CTX);

		// render_sprite();
	}

	function handle_input_change(e) {

	}

	function handle_input_blur() {
		if (COLOR_INPUT.value && parseInt(COLOR_INPUT.value, 16)) {
			let new_color = parse_hex_to_rgb(COLOR_INPUT.value);
			change_sprite_color(new_color);
		}
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
		COLOR_INPUT.addEventListener('input', handle_input_change);
		COLOR_INPUT.addEventListener('blur', handle_input_blur);
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
		CTX.clearRect(SPRITE.x, SPRITE.y, SPRITE.w * SPRITE.scale, 
			SPRITE.h * SPRITE.scale);
		CTX.drawImage(SPRITE.asset, SPRITE.w * SPRITE.frame_idx, 0, SPRITE.w, 
			SPRITE.h, SPRITE.x, SPRITE.y, SPRITE.w * SPRITE.scale, 
			SPRITE.h * SPRITE.scale);
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

	function set_canvas_aspect() {
		CANVAS.width = CANVAS.height * (CANVAS.clientWidth 
			/ CANVAS.clientHeight);
	}

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

function parse_hex_to_rgb(hex_str) {
	let rgb = [];
	for(let i = 0; i < 3; i += 2) {
		rgb.push(parseInt(hex_str.substring(i, i + 2), 16));
	}
	return rgb;
}





window.addEventListener('load', function() {
	init_custom_pallete(8);
});