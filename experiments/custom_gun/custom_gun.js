

function init_custom_gun(callback, dim=[20, 20]) {
	var CANVAS_CONTAINER = document.getElementById("canvas-container");
	var SIZE_CONTAINER = document.getElementById("size-container");
	var CANVAS = document.getElementById("gun-canvas");
	var CTX = CANVAS.getContext("2d");
	var CANVAS_SCALE = 1;
	var ATTR_PALLETE = document.getElementById("attribute-pallete");
	var ELEM_PALLETE = document.getElementById("elemental-pallete");
	var NEXT_BUTTON = document.getElementById("gun-next-button");
	var RESET_BUTTON = document.getElementById("reset-icon");
	var CURR_COLOR = document.getElementById("curr-color");
	// [elemental color, fire rate, bullet velocity, damage, autofire]
	var COLOR_SCHEMES = {
		neutral: ["#fefefe", "#dddddd", "#bbbbbb", "#5d5d5d", "#202020"],
		fire: ["#af3d1b", "#654d4c", "#483138", "#931515", "#e5b822"],
		earth: ["#4cb15b", "#b1b49d", "#90987d", "#358256", "#49d76a"],
		water: ["#61c9db", "#d4dcde", "#84b1bd", "#4397c4", "#a0bde0"],
		air: ["#a9acde", "#d8d9da", "#9fa3a8", "#70717e", "#45453c"],
	}
	var GUN = {
		stats: {
			elemental: "neutral",
			total_attr_px: 0,
			fr_count: 0,
			bv_count: 0,
			dmg_count: 0,
			af_check: 0
		},
		dimensions: {
			w: dim[0],
			h: dim[1]
		},
		mouse_mode: undefined,
		px_info: undefined,
		px_incr: undefined,
		draw_color: undefined,
	}

	function calculate_stats() {
		let s = GUN.stats;
		let pasta = {
			// string, "neutral" | "fire" | "water" | "earth" | "air"
			elemental: s.elemental,
			// decimal, 0 <= fr <= 1
			fire_rate: s.fr_count / s.total_attr_px,
			// decimal, 0 <= bv <= 1
			bullet_velocity: s.bv_count / s.total_attr_px,
			// decimal, 0 <= dmg <= 1
			damage: s.dmg_count / s.total_attr_px,
			// integer, 0 | 1, 1 for autofire=true
			autofire: s.af_check
		};
		console.log(s);
		console.log(pasta);
		return pasta;
	}

	function increment_stats(color) {
		let idx = COLOR_SCHEMES[GUN.stats.elemental].indexOf(color);
		if (idx == 4) {
			GUN.stats.af_check = 1
		}
		else if (idx > 0) {
			GUN.stats.total_attr_px += 1;
			if (idx == 1) {
				GUN.stats.fr_count += 1;
			}
			else if (idx == 2) {
				GUN.stats.bv_count += 1;
			}
			else if (idx == 3) {
				GUN.stats.dmg_count += 1;
			}
		}
	}

	function check_draw_pos(pos) {
		let x_range = 0;
		let y_range = 0;
		let x_idx = 0;
		let y_idx = 0;
		for(let i = 0; i < GUN.dimensions.w; i++) {
			if (pos.x >= GUN.px_incr * i) {
				x_range = GUN.px_incr * i;
				x_idx = i;
			}
		}
		for(let i = 0; i < GUN.dimensions.h; i++) {
			if (pos.y >= GUN.px_incr * i) {
				y_range = GUN.px_incr * i;
				y_idx = i;
			}
		}
		CTX.fillStyle = GUN.draw_color;
		GUN.px_info[x_idx][y_idx] = GUN.draw_color;
		increment_stats(GUN.draw_color);
		CTX.fillRect(x_range, y_range, GUN.px_incr, GUN.px_incr);
		console.log(CTX.fillStyle);
		console.log(`x_range ${x_range} y_range ${y_range}`);
	}

	function get_mouse_pos(canvas, mouse_evt) {
		let rect = canvas.getBoundingClientRect();
		let pos = {
			x: (mouse_evt.clientX - rect.left) / canvas.clientWidth * canvas.width, 
			y: (mouse_evt.clientY - rect.top) / canvas.clientHeight * canvas.height
		};
		console.log(pos);
		return pos;
	}

	function handle_mouse_move(e) {
		let pos = get_mouse_pos(CANVAS, e);
		// CTX.fillRect(pos.x, pos.y, 10, 10);
		check_draw_pos(pos);
	}

	function handle_mouse_down(e) {
		GUN.mouse_mode = e.which;
		let pos = get_mouse_pos(CANVAS, e);
		// CTX.fillRect(pos.x, pos.y, 10, 10);
		check_draw_pos(pos);
		CANVAS.addEventListener('mousemove', handle_mouse_move);
	}

	function handle_mouse_up() {
		CANVAS.removeEventListener('mousemove', handle_mouse_move);
	}

	function handle_canvas_reset() {
		CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
		draw_grid_lines();
		init_px_info();
		GUN.stats = {
			elemental: "neutral",
			total_attr_px: 0,
			fr_count: 0,
			bv_count: 0,
			dmg_count: 0,
			af_check: 0
		};
	}

	function handle_next_click() {
		let evt = {
			gun: export_gun(),
			stats: calculate_stats()
		};
		callback(evt);
	}

	function handle_window_resize() {
		fix_canvas_aspect();
	}

	function set_listeners() {
		CANVAS.addEventListener('mousedown', handle_mouse_down);
		CANVAS.addEventListener('mouseup', handle_mouse_up);
		RESET_BUTTON.addEventListener('click', handle_canvas_reset);
		NEXT_BUTTON.addEventListener('click', handle_next_click);
		window.addEventListener('resize', handle_window_resize);
	}

	function set_canvas_dimensions() {
		let w = Math.floor(CANVAS_CONTAINER.clientWidth / GUN.dimensions.w) * GUN.dimensions.w;
		let h = w * GUN.dimensions.h / GUN.dimensions.w;
		SIZE_CONTAINER.style.width = w + "px";
		SIZE_CONTAINER.style.height = h + "px";
	}

	function fix_canvas_aspect() {
		CANVAS.height *= CANVAS_SCALE;
		CANVAS.width = CANVAS.height * CANVAS.clientWidth / CANVAS.clientHeight;
		GUN.px_incr = CANVAS.width / GUN.dimensions.w;
	}

	function draw_grid_lines() {
		CTX.lineWidth = 1;
		CTX.strokeStyle = "#eeeeee";
		for(let i = 1; i < GUN.dimensions.w; i++) {
			CTX.beginPath();
			CTX.moveTo(GUN.px_incr * i, 0);
			CTX.lineTo(GUN.px_incr * i, CANVAS.height);
			CTX.stroke();
		}
		for(let i = 1; i < GUN.dimensions.h; i++) {
			CTX.beginPath();
			CTX.moveTo(0, GUN.px_incr * i);
			CTX.lineTo(CANVAS.width, GUN.px_incr * i);
			CTX.stroke();
		}
	}

	function init_px_info() {
		let incr = CANVAS.width / GUN.dimensions.w;
		let px_row = [];
		for(let i = 0; i < GUN.dimensions.w; i++) {
			let px_col = [];
			for(let j = 0; j < GUN.dimensions.h; j++) {
				px_col.push(undefined);
			}
			px_row.push(px_col);
		}
		GUN.px_info = px_row;
	}

	function change_color_scheme(old_scheme, new_scheme) {
		console.log(`${old_scheme} ${new_scheme}`);
		old_scheme = COLOR_SCHEMES[old_scheme];
		new_scheme = COLOR_SCHEMES[new_scheme];
		for(let i = 0; i < GUN.px_info.length; i++) {
			for(let j = 0; j < GUN.px_info[i].length; j++) {
				if (GUN.px_info[i][j]) {
					let idx = old_scheme.indexOf(GUN.px_info[i][j]);
					GUN.px_info[i][j] = new_scheme[idx];
					CTX.fillStyle = new_scheme[idx];
					CTX.fillRect(i * GUN.px_incr, j * GUN.px_incr, GUN.px_incr, GUN.px_incr);
				}
			}
		}
	}

	function handle_color_click() {
		CURR_COLOR.style.backgroundColor = this.style.backgroundColor;
		let color_select = parse_rgb_str_to_hex_str(this.style.backgroundColor);
		GUN.draw_color = color_select;
		console.log(color_select);
		for(const elem in COLOR_SCHEMES) {
			if (COLOR_SCHEMES[elem][0] == color_select) {
				change_color_scheme(GUN.stats.elemental, elem);
				GUN.stats.elemental = elem;
				populate_pallete(ATTR_PALLETE, COLOR_SCHEMES[elem].slice(1));
			}
		}
	}

	function populate_pallete(pallete, color_arr) {
		pallete.innerHTML = "";
		for(let i = 0; i < color_arr.length; i++) {
			let color = document.createElement("div");
			color.setAttribute("class", "pallete-item");
			color.style.backgroundColor = color_arr[i];
			pallete.appendChild(color);
			color.addEventListener('click', handle_color_click);
		}
	}

	function display_palletes() {
		let elem_scheme = COLOR_SCHEMES[GUN.stats.elemental];
		GUN.draw_color = elem_scheme[1];
		populate_pallete(ATTR_PALLETE, elem_scheme.slice(1));
		let cs = COLOR_SCHEMES;
		let elem_display = [cs.fire[0], cs.air[0], cs.water[0], cs.earth[0], cs.neutral[0]];
		populate_pallete(ELEM_PALLETE, elem_display);
	}

	function export_gun() {
		let buffer = document.createElement("canvas");
		let buff_ctx = buffer.getContext("2d");
		buffer.width = GUN.dimensions.w;
		buffer.height = GUN.dimensions.h;
		for(let i = 0; i < GUN.px_info.length; i++) {
			for(let j = 0; j < GUN.px_info[i].length; j++) {
				if (GUN.px_info[i][j]) {
					buff_ctx.fillStyle = GUN.px_info[i][j];
					buff_ctx.fillRect(i, j, 1, 1);
				}
			}
		}
		return buffer;
	}

	set_listeners();
	set_canvas_dimensions();
	fix_canvas_aspect();
	draw_grid_lines();
	init_px_info();
	display_palletes();
}

function parse_rgb_str(rgb_str) {
	rgb_str = rgb_str.slice(4, -1);
	let rgb_val = rgb_str.split(',');
	for(let i = 0; i < rgb_val.length; i++) {
		rgb_val[i] = parseInt(rgb_val[i]);
	}
	return rgb_val;
}

function parse_rgb_to_hex_str(rgb_arr) {
	let hex_str = "";
	for(let i = 0; i < 3; i++) {
		let val =  rgb_arr[i];
		let str_val = val.toString(16);
		if (val < 0x10) {
			str_val = '0' + str_val;
		}
		hex_str += str_val;
	}
	return hex_str;
}

function parse_rgb_str_to_hex_str(rgb_str) {
	return ('#' + parse_rgb_to_hex_str(parse_rgb_str(rgb_str)));
}

window.addEventListener('load', function() {
	init_custom_gun(function(evt) {});
})

