function init_game( cb_init, send_update, node_type, init_data ) {
	var NODE_SERVER = 0,
		NODE_CLIENT = 1,
		NODE_VR = 2;

	var SERVER = ( node_type == NODE_SERVER );
	var CLIENT = ( node_type == NODE_CLIENT );
	var VR = ( node_type == NODE_VR );

	var SCALE = 3;
	if( VR ) SCALE = 2;

	var IMG_FOREST = new Image();

	var MAX_HEALTH = 400,
		TIME_RESPAWN = 100;

	var BASE_SERPENT_ACCELERATION = 0.0036 * SCALE,
		BASE_SERPENT_VELOCITY = 1.2506 * SCALE,
		EXP_SERPENT_ACCELERATION = -0.882,
		EXP_SERPENT_VELOCITY = -0.278;

	var BULLET_VELOCITY = 0.7 * SCALE;

	var TERMINAL_VELOCITY = 0.5 * SCALE,
		GRAVITY = 0.0013 * SCALE;

	var TERMINAL_RUNNING = 0.175 * SCALE,
		RUNNING = 0.0009 * SCALE,
		FRICTION = 0.0006 * SCALE,
		JUMP = -.48 * SCALE,
		KNOCKBACK = 0.25 * SCALE;

	var KEY_A = 65,
		KEY_D = 68,
		KEY_Q = 81,
		KEY_S = 83,
		KEY_SPACE = 32,
		KEY_ENTER = 13;

	var POWER_ICE = 0,
		POWER_EARTH = 1,
		POWER_FIRE = 2,
		POWER_AIR = 3;

	var TWIDTH_MAP = 240,
		THEIGHT_MAP = 96;

	var WIDTH_TILE = 8 * SCALE,
		HEIGHT_TILE = 8 * SCALE;

	var WIDTH_MAP = TWIDTH_MAP * WIDTH_TILE,
		HEIGHT_MAP = THEIGHT_MAP * WIDTH_TILE;

	var WIDTH_VIEW = 80 * WIDTH_TILE,
		HEIGHT_VIEW = WIDTH_VIEW * window.screen.height / window.screen.width,
		HWIDTH_VIEW = WIDTH_VIEW / 2,
		HHEIGHT_VIEW = HEIGHT_VIEW / 2;

	//var WIDTH_IMG_FOREST = 800,
	//	HEIGHT_IMG_FOREST = 448;

	var WIDTH_IMG_FOREST = 800,
		HEIGHT_IMG_FOREST = 320;

	var WIDTH_IMG_BULLET = 24 * SCALE,
		HEIGHT_IMG_BULLET = 1 * SCALE;

	var WIDTH_IMG_SERPENT = 32 * SCALE,
		HEIGHT_IMG_SERPENT = 32 * SCALE,
		HWIDTH_IMG_SERPENT = 16 * SCALE,
		HHEIGHT_IMG_SERPENT = 16 * SCALE;;

	var WIDTH_HEAD = 23 * SCALE,
		HEIGHT_HEAD = 12 * SCALE,
		HWIDTH_HEAD = WIDTH_HEAD / 2,
		HHEIGHT_HEAD = 6 * SCALE;

	var WIDTH_BODY = 32 * SCALE,
		HEIGHT_BODY = 12 * SCALE,
		HWIDTH_BODY = 16 * SCALE,
		HHEIGHT_BODY = 6 * SCALE;

	var OFFSET_TAIL_X = -11 * SCALE;

	var WIDTH_TAIL = 21 * SCALE,
		HEIGHT_TAIL = 12 * SCALE,
		HWIDTH_TAIL = WIDTH_TAIL / 2,
		HHEIGHT_TAIL = 6 * SCALE;

	var WIDTH_PLAYER = 7 * SCALE,
		HEIGHT_PLAYER = 17 * SCALE,
		HWIDTH_PLAYER = WIDTH_PLAYER / 2,
		HHEIGHT_PLAYER = HEIGHT_PLAYER / 2;

	var ANGLES = [];

	function init_angles() {
		for( var i = 0; i < 360; ++i ) {
			ANGLES.push( [ i / 180 * Math.PI ] );
			ANGLES[ i ].push( Math.cos( ANGLES[ i ][ 0 ] ) );
			ANGLES[ i ].push( Math.sin( ANGLES[ i ][ 0 ] ) );
		}
	}

	init_angles();

	var game_state = {};

	var hud = document.getElementById( "hud" ),
		recolor = null;

	var canvas_view = document.getElementById( "game-canvas" ),
		ctx_view = null,
		x_view = 0,
		y_view = 0;

	canvas_view.width = WIDTH_VIEW;
	canvas_view.height = HEIGHT_VIEW;
	ctx_view = canvas_view.getContext( "2d" );

	var tiles = [],
		sprites = null,
		canvas_tile = document.createElement( "canvas" ),
		ctx_tile = null,
		canvas_ent = document.createElement( "canvas" ),
		ctx_ent = null;

	canvas_tile.width = WIDTH_MAP;
	canvas_tile.height = HEIGHT_MAP;
	ctx_tile = canvas_tile.getContext( "2d" );

	canvas_ent.width = WIDTH_MAP;
	canvas_ent.height = HEIGHT_MAP;
	ctx_ent = canvas_ent.getContext( "2d" );

	function Animation( l, r, lx, ly, w, h, f, d ) {
		this.sprites = [ l, r ];
		this.width = w * SCALE;
		this.height = h * SCALE;
		this.frames = f;
		this.offset_x = lx * SCALE;
		this.offset_y = ly * SCALE;
		this.last_update = -1;
		this.frame = 0;
		this.delay = d;
	}

	function EntityState() {
		this.x = 0;
		this.y = 0;
		this.dx = 0;
		this.dy = 0;
		this.angle = 0;
		this.active = false;
		this.last_update = -1;
	}

	function SerpentHead( idx, split, power, ai, length ) {
		this.idx = idx;
		this.is_head = true;
		this.state = new EntityState();
		this.alive = false;
		this.power = power;
		this.can_split = split;
		this.ai = ai;
		this.target = -1;
		this.length = length;
		this.health = 100;
		this.max = 100;
		this.defense = 1;
		this.damage = 20;
		this.despawning = false;
	}

	function SerpentBody( idx, idx_head, split, power, ai ) {
		this.idx = idx;
		this.idx_head = idx_head;
		this.is_head = false;
		this.is_tail = false;
		this.state = new EntityState();
		this.alive = false;
		this.power = power;
		this.can_split = split;
		this.ai = ai;
		this.defense = 1;
		this.damage = 10;
		this.health = 1;
		this.despawning = false;
	}

	function Bullet( idx, owner ) {
		this.idx = idx;
		this.owner = owner;
		this.power = POWER_FIRE;
		this.state = new EntityState();
		this.hit = false;
		this.damage = 5;
	}

	function Player( idx ) {
		this.idx = idx;
		this.state = new EntityState();
		this.alive = false;
		if( SERVER ) {
			this.anim_idle = null;
			this.anim_run = null;
		} else {
			this.anim_idle = null;
			this.anim_run = null;
			animate_player( this );
		}
		this.anim = this.anim_idle;
		this.last_anim = null;
		this.left = true;
		this.running = 0;
		this.health = MAX_HEALTH;
		this.ready = false;
		this.jumped = true;
		this.jumping = false;
		this.down = false;
		this.dropped = false;
		this.space = false;
		this.hit = false;
		this.ready = false;
		this.max = MAX_HEALTH;
		this.color = "FFFFFF";
		this.time_respawn = 0;
		//this.time_jump = 100;
	}

	function Me( idx, color ) {
		this.idx = idx;
		this.player = players[ idx ];
		this.keys = {};
		this.last_update = -1;
		this.down_left = false;
		this.down_right = false;
		this.down_mid = false;
		this.x_mouse = 0;
		this.y_mouse = 0;
		this.x_tile = 0;
		this.y_tile = 0;
		this.last_fired = -1;
		this.readied = 0;
		this.building = true;
		this.switched = false;
		this.invulnerable = 0;
		this.update_x_tile = -1;
		this.update_y_tile = -1;
		this.update_idx_bullet = -1;
		this.player.color = color;
		this.head = null;
	}

	function parse_state( scale, my_state, state ) {
		my_state.x = state.x * SCALE / scale;
		my_state.y = state.y * SCALE / scale;
		my_state.dx = state.dx * SCALE / scale;
		my_state.dy = state.dy * SCALE / scale;
		my_state.angle = state.angle;
		my_state.active = state.active;
	}

	function parse_segment( scale, segment ) {
		var my_segment = segments[ segment.idx ];
		parse_state( scale, my_segment.state, segment.state );
		my_segment.health = segment.health;
		my_segment.despawning = segment.despawning;
	}

	function parse_player( scale, player ) {
		var my_player = players[ player.idx ];
		parse_state( scale, my_player.state, player.state );
		my_player.alive = player.alive;
		my_player.left = player.left;
		my_player.running = player.running;
		my_player.health = player.health;
		my_player.ready = player.ready;
		my_player.jumped = player.jumped;
		my_player.jumping = player.jumping;
		my_player.down = player.down;
		my_player.dropped = player.dropped;
		my_player.space = player.space;
		my_player.hit = player.hit;
		my_player.ready  = player.ready;
		my_player.time_respawn = player.time_respawn;
		if( my_player.color != player.color ) {
			my_player.color = player.color;
			if( !SERVER ) animate_player( my_player );
		}
	}

	function parse_bullet( scale, bullet ) {
		var my_bullet = bullets[ bullet.owner ][ bullet.idx ];
		parse_state( scale, my_bullet.state, bullet.state );
		my_bullet.power = bullet.power;
		my_bullet.state.last_update = -1;
		my_bullet.damage = bullet.damage;
	}

	function key_down( key ) {
		return me.keys.hasOwnProperty( key ) && me.keys[ key ];
	}

	var players = [];
	var segments = [];
	var heads = [];
	var bullets = [];
	var spawned = false;
	var me = null;

	function animate_player( player ) {
		player.anim_idle = new Animation( new sprites.Sprite( recolor( sprites.PLAYER_IDLE_L.img, player.color ), "", false ), new sprites.Sprite( recolor( sprites.PLAYER_IDLE_R.img, player.color ), "", false ), 9, 7, 24, 24, 4, 120 );
		player.anim_run = new Animation( new sprites.Sprite( recolor( sprites.PLAYER_RUN_L.img, player.color ), "", false ), new sprites.Sprite( recolor( sprites.PLAYER_RUN_R.img, player.color ), "", false ), 9, 7, 24, 24, 6, 120 );
	}

	function add_player() {
		players.push( new Player( players.length ) );
		bullets.push( [] );
	}

	function add_bullet( owner ) {
		bullets[ owner ].push( new Bullet( bullets[ owner ].length, owner ) );
	}

	function activate_player() {
		var player,
			append_player = true,
			idx;
		idx = players.length;
		for( var i = 0; i < players.length; ++i ) {
			player = players[ i ];
			if( !player.state.active ) {
				idx = i;
				append_player = false;
				break;
			}
		}
		if( append_player ) {
			add_player();
			player = players[ idx ];
		}
		player.state.active = true;
		player.alive = false;
		return idx;
	}

	function activate_bullet( pid ) {
		var player_bullets = bullets[ pid ],
			append_bullet = true,
			bullet,
			idx;
		idx = player_bullets.length;
		for( var i = 0; i < player_bullets.length; ++i ) {
			bullet = player_bullets[ i ];
			if( !bullet.state.active ) {
				idx = i;
				append_bullet = false;
				break;
			}
		}
		if( append_bullet ) {
			add_bullet( pid );
			bullet = player_bullets[ idx ];
		} else {
			bullet.state.last_update = -1;
		}
		bullet.state.active = true;
		return idx;
	}

	function activate_boss() {
		if( spawned ) return;
		console.log( "respawned" );
		spawned = true;
		var segment;
		for( var i = 0; i < segments.length; ++i ) {
			segment = segments[ i ];
			if( segment.is_head ) {
				if( segment.state.y > HEIGHT_MAP ) segment.state.y %= HEIGHT_MAP;
				segment.state.dx = 0;
				segment.state.dy = 0;
				segment.health = segment.max;
			} else {
				segment.state.x = 0;
				segment.state.y = 0;
				segment.state.dx = 0;
				segment.state.dy = 0;
			}
			segment.state.active = true;
			segment.alive = true;
		}
	}

	function init_segments( serpents ) {
		var j,
			serpent,
			split,
			power,
			ai,
			num_segs,
			head_idx,
			idx;
		for( var i = 0; i < serpents.length; ++i ) {
			serpent = serpents[ i ];
			split = ( ( serpent & 0x1 ) == 1 );
			power = ( ( serpent >> 1 ) & 0x3 );
			ai = ( ( serpent >> 3 ) & 0x1FFF );
			num_segs = ( serpent >> 16 );
			for( j = 0; j < num_segs; ++j ) {
				idx = segments.length;
				if( j == 0 ) {
					head_idx = idx;
					heads.push( head_idx );
					segments.push( new SerpentHead( idx, split, power, ai, num_segs ) );
					segments[ idx ].state.x = Math.random() * WIDTH_MAP;
					segments[ idx ].state.y = Math.random() * HEIGHT_MAP;
				} else {
					segments.push( new SerpentBody( idx, head_idx, split, power, ai ) );
					if( j == num_segs - 1 ) {
						segments[ idx ].is_tail = true;
					}
				}
			}
		}
	}

	function create_serpent( split, power, ai, length ) {
		var serpent = 0;
		if( split ) serpent |= 0x1;
		serpent |= ( power << 1 );
		serpent |= ( ai << 3 );
		serpent |= ( length << 16 );
		return serpent;
	}

	function contains_bullet( segment, bullet ) {
		var dots = get_dots( segment );
		var hdot = dots[ 0 ][ 0 ] * bullet.state.x + dots[ 0 ][ 1 ] * bullet.state.y;
		var vdot = dots[ 1 ][ 0 ] * bullet.state.x + dots[ 1 ][ 1 ] * bullet.state.y;
		return between( hdot, dots[ 2 ], dots[ 3 ] ) && between( vdot, dots[ 4 ], dots[ 5 ] );
	}

	function overlaps_player( segment, player ) {
		var dots = get_dots( segment );
		var hdot, vdot;
		x_tl = player.state.x;
		y_tl = player.state.y;
		x_tr = player.state.x + WIDTH_PLAYER;
		y_tr = player.state.y;
		x_br = player.state.x + WIDTH_PLAYER;
		y_br = player.state.y + HEIGHT_PLAYER;
		x_bl = player.state.x;
		y_bl = player.state.y + HEIGHT_PLAYER;
		hdot = dots[ 0 ][ 0 ] * x_tl + dots[ 0 ][ 1 ] * y_tl;
		vdot = dots[ 1 ][ 0 ] * x_tl + dots[ 1 ][ 1 ] * y_tl;
		if( between( hdot, dots[ 2 ], dots[ 3 ] ) && between( vdot, dots[ 4 ], dots[ 5 ] ) ) return true;
		hdot = dots[ 0 ][ 0 ] * x_tr + dots[ 0 ][ 1 ] * y_tr;
		vdot = dots[ 1 ][ 0 ] * x_tr + dots[ 1 ][ 1 ] * y_tr;
		if( between( hdot, dots[ 2 ], dots[ 3 ] ) && between( vdot, dots[ 4 ], dots[ 5 ] ) ) return true;
		hdot = dots[ 0 ][ 0 ] * x_br + dots[ 0 ][ 1 ] * y_br;
		vdot = dots[ 1 ][ 0 ] * x_br + dots[ 1 ][ 1 ] * y_br;
		if( between( hdot, dots[ 2 ], dots[ 3 ] ) && between( vdot, dots[ 4 ], dots[ 5 ] ) ) return true;
		hdot = dots[ 0 ][ 0 ] * x_bl + dots[ 0 ][ 1 ] * y_bl;
		vdot = dots[ 1 ][ 0 ] * x_bl + dots[ 1 ][ 1 ] * y_bl;
		if( between( hdot, dots[ 2 ], dots[ 3 ] ) && between( vdot, dots[ 4 ], dots[ 5 ] ) ) return true;
		return false;
	}

	function update_me( ts ) {
		if( me == null ) return;
		if( me.last_update == -1 ) me.last_update = ts;
		me.update_x_tile = -1;
		me.update_y_tile = -1;
		me.update_idx_bullet = -1;
		if( me.player.alive ) {
			var ticks = ts - me.last_update;
			if( me.invulnerable > 0 ) me.invulnerable -= ticks;
			var down_a = key_down( KEY_A ),
				down_d = key_down( KEY_D ),
				down_q = key_down( KEY_Q ),
				down_enter = key_down( KEY_ENTER );
			me.player.space = key_down( KEY_SPACE );
			me.player.down = key_down( KEY_S );
			if( down_a && !down_d ) {
				me.player.running = -1;
			} else if( down_d && !down_a ) {
				me.player.running = 1;
			} else {
				me.player.running = 0;
			}
			if( !spawned ) {
				if( me.readied == 0 && down_enter ) {
					me.player.ready = !me.player.ready;
					me.readied = 1;
					console.log( "boss" );
				} else if( me.readied == 1 && !down_enter ) {
					me.readied = 0;
				}
			} else if( me.invulnerable <= 0 ){
				var segment,
				hit = null;
				for( var i = 0; i < segments.length; ++i ) {
					segment = segments[ i ];
					if( segment.state.active && segment.alive ) {
						if( overlaps_player( segment, me.player ) ) {
							hit = segment;
							break;
						}
					}
				}
				if( hit ) {
					var angle_kb = get_angle_kb( hit, me.player );
					me.player.state.dx = ANGLES[ angle_kb ][ 1 ] * KNOCKBACK;
					me.player.state.dy = ANGLES[ angle_kb ][ 2 ] * KNOCKBACK;
					me.player.hit = true;
					me.invulnerable = 600;
					me.player.health -= hit.damage;
				}
			}
			if( ( !me.switched ) && down_q ) {
				me.switched = true;
				me.building = !me.building;
			} else if( me.switched && ( !down_q ) ) {
				me.switched = false;
			}
			me.x_tile = ( ( x_view + me.x_mouse ) / WIDTH_TILE ) | 0;
			me.y_tile = ( ( y_view + me.y_mouse ) / HEIGHT_TILE ) | 0;
			var mx = me.x_mouse - HWIDTH_VIEW;
			var my = me.y_mouse - HHEIGHT_VIEW;
			var a = Math.atan2( my, mx );
			while( a < 0 ) a += Math.PI * 2;
			a = ( ( a / Math.PI * 180 ) | 0 ) % 360;
			me.player.left = ( a >= 90 ) && ( a <= 270 );
			if( me.down_left ) {
				if( me.building ) {
					var tile = get_tile( me.x_tile, me.y_tile );
					if( tile == 0 ) {
						tiles[ me.y_tile ][ me.x_tile ] = 1;
						draw_tile( me.x_tile - 1, me.y_tile );
						draw_tile( me.x_tile, me.y_tile );
						draw_tile( me.x_tile + 1, me.y_tile );
						me.update_x_tile = me.x_tile;
						me.update_y_tile = me.y_tile;
					}
				} else {
					if( me.last_fired == -1 ) me.last_fired = ts - 200;
					if( ts - me.last_fired >= 100 ) {
						var bullet_idx = activate_bullet( me.idx );
						var bullet = bullets[ me.idx ][ bullet_idx ];
						bullet.state.x = me.player.state.x + HWIDTH_PLAYER;
						bullet.state.y = me.player.state.y + HHEIGHT_PLAYER;
						bullet.state.angle = a;
						bullet.state.dx = BULLET_VELOCITY * ANGLES[ a ][ 1 ];
						bullet.state.dy = BULLET_VELOCITY * ANGLES[ a ][ 2 ];
						me.last_fired = ts;
						me.update_idx_bullet = bullet_idx;
					}
				}
			} else if( me.down_right ) {
				if( me.building ) {
					if( get_tile( me.x_tile, me.y_tile ) == 1 ) {
						tiles[ me.y_tile ][ me.x_tile ] = 0;
						draw_tile( me.x_tile - 1, me.y_tile );
						draw_tile( me.x_tile, me.y_tile );
						draw_tile( me.x_tile + 1, me.y_tile );
						me.update_x_tile = me.x_tile;
						me.update_y_tile = me.y_tile;
					}
				}
			}
			me.last_update = ts;
		}
	}

	function reset_jump( player ) {
		player.jumped = false;
		player.jumping = false;
		player.dropped = false;
	}

	function update_player( ts, player ) {
		if( player.state.last_update == -1 ) player.state.last_update = ts;

		var ticks = ts - player.state.last_update;

		if( player.time_respawn > 0 ) {
			player.time_respawn -= ticks;
		} else if( !player.alive ) {
			player.alive = true;
		}
		if( player.health < 0 ) {
			player.alive = false;
			player.health = MAX_HEALTH;
			player.time_respawn = TIME_RESPAWN;
		}

		if( player.alive ) {

			var x_last = player.state.x,
				y_last = player.state.y;

			var dy_last = player.state.dy;

			var dx = player.state.dx, 
				dy = player.state.dy;

			if( Math.abs( dx ) < TERMINAL_RUNNING ) {
				dx += player.running * RUNNING * ticks;
			}
			
			if( player.running == 0 && Math.abs( dx ) < 0.05 ) dx = 0;
			else if( dx < 0 ) dx += FRICTION * ticks;
			else dx -= FRICTION * ticks;

			if( player.space && !player.jumped ) {
				player.jumped = true;
				player.jumping = true;
				player.dropped = true;
				dy += JUMP;
			} else if( player.space && !player.jumping ) {

			}

			dy += GRAVITY * ticks;
			if( dy > TERMINAL_VELOCITY ) {
				dy = TERMINAL_VELOCITY;
			}

			var x_next = player.state.x + dx * ticks,
				y_next = player.state.y + dy * ticks;

			if( player.down && !player.dropped && dy_last == 0 || player.hit ) {
				player.dropped = true;
				player.hit = false;
				y_last += HEIGHT_TILE + 1;
				y_next += 1;
			}

			if( x_next < 0 ) {
				x_next = 0;
				dx = 0;
			}
			if( y_next < 0 ) {
				y_next = 0;
				dy = 0;
			}

			if( x_next + WIDTH_PLAYER >= WIDTH_MAP ) {
				x_next = WIDTH_MAP - WIDTH_PLAYER;
				dx = 0;
			}
			if( y_next + HEIGHT_PLAYER >= HEIGHT_MAP ) {
				y_next = HEIGHT_MAP - HEIGHT_PLAYER;
				dy = 0;
				reset_jump( player );
			}

			if( dy > 0 ) {
				var tx, ty, c = true;
				var left_tile = Math.floor( x_next / WIDTH_TILE );
				var right_tile = Math.floor( ( x_next + WIDTH_PLAYER - 1 ) / WIDTH_TILE );
				var start_tile_y = Math.floor( ( y_last + HEIGHT_PLAYER - 1 ) / HEIGHT_TILE ) + 1;
				var end_tile_y = Math.floor( ( y_next + HEIGHT_PLAYER ) / HEIGHT_TILE );
				for( ty = start_tile_y; ty <= end_tile_y && c; ++ty ) {
					for( tx = left_tile; tx <= right_tile; ++tx ) {
						if( get_tile( tx, ty ) > 0 ) {
							y_next = ( ty * HEIGHT_TILE - HEIGHT_PLAYER );
							c = false;
							dy = 0;
							reset_jump( player );
							break;
						}
					}
				}
			}

			player.state.dx = dx;
			player.state.dy = dy;
			player.state.x = x_next;
			player.state.y = y_next;
		}

		player.state.last_update = ts;
	}

	function update_head( ts, head ) {
		if( head.state.last_update == -1 ) head.state.last_update = ts;
		var ticks = ts - head.state.last_update;

	    var speed = BASE_SERPENT_VELOCITY * ( head.length ** EXP_SERPENT_VELOCITY );
	    var acceleration = BASE_SERPENT_ACCELERATION * ( head.length ** EXP_SERPENT_ACCELERATION ) * ticks;

	    if( head.health == 0 ) {
	    	head.alive = false;
	    	head.state.active = false;
	    }
	    if( !head.alive || !head.state.active ) {
	    	if( CLIENT && head == me.head ) me.head = null;
	    	return;
	    }

	    var target;
	    if( head.target == -1 ) target = null;
	    else target = players[ head.target ];
	    if( target == null || !target.state.active || !target.alive ) {
	    	var player,
	    		next_target = -1;
	    	for( var i = 0; i < players.length; ++i ) {
	    		player = players[ i ];
	    		if( player.state.active && player.alive ) {
	    			next_target = i;
	    			break;
	    		}
	    		player.ready = false;
	    	}
	    	if( next_target == -1 ) target = null;
	    	else target = players[ head.target = next_target ];
	    }
	    if( target == null || head.despawning ) {
            head.state.dy += 0.11;
            if( head.state.dy > speed ) head.state.dy = speed;
            if( Math.abs( head.state.dx ) + Math.abs( head.state.dy ) < speed * 0.4 ) {
                if( head.state.dx < 0.0 ) head.state.dx -= acceleration * 1.1;
                else head.state.dx += acceleration * 1.1;
            } else if( head.state.dy == speed ) {
                if( head.state.dx < diff_y ) head.state.dx += acceleration;
                else if ( head.state.dx > diff_x ) head.state.dx -= acceleration;
            } else if( head.state.dy > 4.0 ) {
                if( head.state.dx < 0.0 ) head.state.dx += acceleration * 0.9;
                else head.state.dx -= acceleration * 0.9;
            }
            head.despawning = true;
        } else {
		    var diff_x = target.state.x - head.state.x;
		    var diff_y = target.state.y - head.state.y;

		    var dist = Math.sqrt( diff_x * diff_x + diff_y * diff_y );

			// TODO: Play serpent sound
		    var dist_x = Math.abs( diff_x );
		    var dist_y = Math.abs( diff_y );
		    var new_speed = speed / dist;
		    diff_x *= new_speed;
		    diff_y *= new_speed;
		    if( head.state.dx > 0.0 && diff_x > 0.0 || 
		    	head.state.dx < 0.0 && diff_x < 0.0 || 
		    	( head.state.dy > 0.0 && diff_y > 0.0 || 
		    		head.state.dy < 0.0 && diff_y < 0.0 ) ) {
		        if( head.state.dx < diff_x ) head.state.dx += acceleration;
		        else if( head.state.dx > diff_x ) head.state.dx -= acceleration;
		        if( head.state.dy < diff_y ) head.state.dy += acceleration;
		        else if( head.state.dy > diff_y ) head.state.dy -= acceleration;
		        if( Math.abs( diff_y ) < speed * 0.2 && 
		        	( head.state.dx > 0.0 && diff_x < 0.0 || head.state.dx < 0.0 && diff_x > 0.0 ) ) {
		            if( head.state.dy > 0.0 ) head.state.dy += acceleration * 2;
		            else head.state.dy -= acceleration * 2;
		        }
		        if( Math.abs( diff_x ) < speed * 0.2 && 
		        	( head.state.dy > 0.0 && diff_y < 0.0 || head.state.dy < 0.0 && diff_y > 0.0 ) ) {
		            if( head.state.dx > 0.0 ) head.state.dx += acceleration * 2;
		            else head.state.dx -= acceleration * 2;
		        }
		    } else if( dist_x > dist_y ) {
		        if( head.state.dx < diff_x ) head.state.dx += acceleration * 1.1;
		        else if( head.state.dx > diff_x ) head.state.dx -= acceleration * 1.1;
		        if( Math.abs( head.state.dx ) + Math.abs( head.state.dy ) < speed * 0.5 ) {
		            if( head.state.dy > 0.0 ) head.state.dy += acceleration;
		            else head.state.dy -= acceleration;
		        }
		    } else {
		        if( head.state.dy < diff_y ) head.state.dy += acceleration * 1.1;
		        else if( head.state.dy > diff_y ) head.state.dy -= acceleration * 1.1;
		        if( Math.abs( head.state.dx ) + Math.abs( head.state.dy ) < speed * 0.5 ) {
		            if( head.state.dx > 0.0 ) head.state.dx += acceleration;
		            else head.state.dx -= acceleration;
		        }
		    }
		}
		if( head.despawning ) {
			var despawn = segments[ head.idx + head.length - 1 ];
			if( despawn.state.y > HEIGHT_MAP + WIDTH_BODY * 2 ) {
				head.alive = false;
				head.active = false;
				spawned = false;
				head.despawning = false;
				if( CLIENT ) me.head = null;
			}
		}
	    head.state.x += head.state.dx * ticks;
	    head.state.y += head.state.dy * ticks;
	    head.state.angle = ( Math.atan2( head.state.dy, head.state.dx ) );
	    while( head.state.angle < 0 ) head.state.angle += Math.PI * 2;
	    head.state.angle = ( ( head.state.angle / Math.PI * 180 ) | 0 ) % 360;
	    head.state.last_update = ts;
	}

	function update_body( ts, body ) {
		if( body.state.last_update == -1 ) body.state.last_update = ts;
		var ticks = ts - body.state.last_update;

		var parent = segments[ body.idx - 1 ];
		var diff_x = parent.state.x - body.state.x;
		var diff_y = parent.state.y - body.state.y;

		var head_segment = segments[ body.idx_head ];
		if( !head_segment.alive ) {
			body.state.active = false;
			body.alive = false;
		}

	    body.state.angle = ( Math.atan2( diff_y, diff_x ) );
	    while( body.state.angle < 0 ) body.state.angle += Math.PI * 2;
	    body.state.angle = ( ( body.state.angle / Math.PI * 180 ) | 0 ) % 360;

	    var length = Math.sqrt( diff_x * diff_x + diff_y * diff_y );

	    var dist;
	    if( length == 0 ) dist = 0;
	    else if( body.is_tail ) {
	    	dist = ( length - WIDTH_TAIL ) / length;
	    } else {
	    	dist = ( length - WIDTH_BODY ) / length;
	    }

	    body.state.dx = body.state.dy = 0;

	    body.state.x += diff_x * dist;
	    body.state.y += diff_y * dist;

	    body.state.last_update = ts;
	}

	function between( pt, x1, x2 ) {
		return pt >= x1 && pt <= x2 || pt >= x2 && pt <= x1;
	}

	function get_dots( segment ) {
		var axis_horiz = [ ANGLES[ segment.state.angle ][ 1 ], ANGLES[ segment.state.angle ][ 2 ] ];
		var axis_vert = [ ANGLES[ ( segment.state.angle + 90 ) % 360 ][ 1 ], ANGLES[ ( segment.state.angle + 90 ) % 360 ][ 2 ] ];
		var width = WIDTH_BODY;
		var hheight = HHEIGHT_BODY;
		if( segment.is_head ) {
			width = WIDTH_HEAD;
			hheight = HHEIGHT_HEAD;
		} else if( segment.is_tail ) {
			width = WIDTH_TAIL;
			hheight = HHEIGHT_TAIL;
		}
		var tl = [ segment.state.x + ( axis_horiz[ 1 ] * hheight ), segment.state.y - ( axis_horiz[ 0 ] * hheight ) ];
		var br = [ segment.state.x + ( axis_horiz[ 0 ] * width ) - ( axis_horiz[ 1 ] * hheight ), segment.state.y + ( axis_horiz[ 0 ] * hheight ) + ( axis_horiz[ 1 ] * width ) ];
		var hdotl = tl[ 0 ] * axis_horiz[ 0 ] + tl[ 1 ] * axis_horiz[ 1 ];
		var hdotr = br[ 0 ] * axis_horiz[ 0 ] + br[ 1 ] * axis_horiz[ 1 ];
		var vdott = tl[ 0 ] * axis_vert[ 0 ] + tl[ 1 ] * axis_vert[ 1 ];
		var vdotb = br[ 0 ] * axis_vert[ 0 ] + br[ 1 ] * axis_vert[ 1 ];
		return [ axis_horiz, axis_vert, hdotl, hdotr, vdott, vdotb ];
	}

	function get_angle_kb( segment, player ) {
		var angle_kb = ( segment.state.angle + 90 ) % 360;
		var axis_vert = [ ANGLES[ angle_kb ][ 1 ], ANGLES[ ( angle_kb ) % 360 ][ 2 ] ];
		var hwidth = HWIDTH_BODY;
		var hheight = HHEIGHT_BODY;
		if( segment.is_head ) {
			hwidth = HWIDTH_HEAD;
			hheight = HHEIGHT_HEAD;
		} else if( segment.is_tail ) {
			hwidth = HWIDTH_TAIL;
			hheight = HHEIGHT_TAIL;
		}
		var middot = segment.state.x * axis_vert[ 0 ] + segment.state.y * axis_vert[ 1 ];
		var pdot = ( player.state.x + HWIDTH_PLAYER ) * axis_vert[ 0 ] + ( player.state.y + HHEIGHT_BODY ) * axis_vert[ 1 ];
		if( pdot >= middot ) {
			return angle_kb;
		} else {
			return ( angle_kb + 180 ) % 360;
		}
	}

	function update_bullet( ts, bullet ) {
		if( bullet.state.last_update == -1 ) bullet.state.last_update = ts;

		var ticks = ts - bullet.state.last_update;

		if( bullet.state.x < 0 ) bullet.state.active = false;
		else if( bullet.state.x >= WIDTH_MAP ) bullet.state.active = false;
		if( bullet.state.y < 0 ) bullet.state.active = false;
		else if( bullet.state.y >= HEIGHT_MAP ) bullet.state.active = false;
		bullet.state.x += bullet.state.dx * ticks;
		bullet.state.y += bullet.state.dy * ticks;

		var segment;
		for( var i = 0; i < segments.length; ++i ) {
			segment = segments[ i ];
			if( contains_bullet( segment, bullet ) ) {
				bullet.state.active = false;
				if( SERVER ) {
					var head_segment;
					if( segment.is_head ) head_segment = segment;
					else head_segment = segments[ segment.idx_head ];
					var dmg = bullet.damage;
					dmg = Math.max( 1, dmg - ( segment.defense * 0.75 ) ) | 0;
					head_segment.health -= dmg;
					if( head_segment.health < 0 ) head_segment.health = 0;
					console.log(head_segment.health);
				} else if( CLIENT ) {
					var head_segment;
					if( segment.is_head ) head_segment = segment;
					else head_segment = segments[ segment.idx_head ];
					me.head = head_segment;
				}
				break;
			}
		}

		bullet.state.last_update = ts;
	}

	function update_players( ts ) {
		var player;
		for( var i = 0; i < players.length; ++i ) {
			player = players[ i ];
			if( player && player.state.active ) {
				update_player( ts, player );
			}
		}
	}

	function update_segments( ts ) {
		var segment;
		for( var i = 0; i < segments.length; ++i ) {
			segment = segments[ i ];
			if( segment && segment.state.active && segment.alive ) {
				if( segment.is_head ) {
					update_head( ts, segment );
				} else {
					update_body( ts, segment );
				}
			}
		}
	}

	function update_bullets( ts ) {
		var bullet,
			player_bullets,
			i;
		for( var j = 0; j < bullets.length; ++j ) {
			player_bullets = bullets[ j ];
			if( !player_bullets ) continue;
			for( i = 0; i < player_bullets.length; ++i ) {
				bullet = player_bullets[ i ];
				if( bullet && bullet.state.active ) {
					update_bullet( ts, bullet );
				}
			}
		}
	}

	function draw_bullets() {
		var player_bullets,
			bullet,
			img,
			i;
		for( var j = 0; j < bullets.length; ++j ) {
			player_bullets = bullets[ j ];
			for( i = 0; i < player_bullets.length; ++i ) {
				bullet = player_bullets[ i ];
				if( !bullet.state.active ) continue;
				switch( bullet.power ) {
					case POWER_ICE:
						img = sprites.BULLET_ICE.img;
						break;
					case POWER_EARTH:
						img = sprites.BULLET_EARTH.img;
						break;
					case POWER_FIRE:
						img = sprites.BULLET_FIRE.img;
						break;
					case POWER_AIR:
						img = sprites.BULLET_AIR.img;
						break;
				}
				ctx_ent.translate( bullet.state.x, bullet.state.y );
				ctx_ent.rotate( ANGLES[ ( bullet.state.angle + 180 ) % 360 ][ 0 ] );
				ctx_ent.drawImage( img, 0, 0 );
				//ctx_view.fillRect( 0, 0, 32, 32 );
				ctx_ent.setTransform( 1, 0, 0, 1, 0, 0 );
			}
		}
	}

	function draw_players( ts ) {
		var player,
			offset_x,
			offset_y,
			img;
		for( var i = 0; i < players.length; ++i ) {
			player = players[ i ];
			if( ( !player.state.active ) || ( !player.alive ) ) continue;
			if( player.running ) player.anim = player.anim_run;
			else player.anim = player.anim_idle;
			if( player.last_anim != player.anim ) {
				player.anim.frame = 0;
				player.last_anim = player.anim;
				player.anim.last_update = ts;
			}
			if( ts - player.anim.last_update >= player.anim.delay ) {
				player.anim.frame = ( player.anim.frame + 1 ) % player.anim.frames;
				player.anim.last_update = ts;
			}
			offset_y = player.anim.offset_y;
			if( player.left ) {
				img = player.anim.sprites[ 0 ].img;
				offset_x = player.anim.offset_x;
			} else {
				img = player.anim.sprites[ 1 ].img;
				offset_x = player.anim.width - player.anim.offset_x - WIDTH_PLAYER;
			}
			ctx_ent.drawImage( img, player.anim.width * player.anim.frame, 0, player.anim.width, player.anim.height, Math.round( player.state.x - offset_x ), Math.round( player.state.y - offset_y ), player.anim.width, player.anim.height );
		}
	}

	function draw_segments() {
		var i = segments.length,
			offset_x = 0,
			frame,	
			segment,
			img;
		while( i-- ) {
			segment = segments[ i ];
			if( !segment.state.active || !segment.alive ) continue;
			offset_x = 0;
			switch( segment.power ) {
				case POWER_ICE:
					img = sprites.SERPENT_ICE.img;
					break;
				case POWER_EARTH:
					img = sprites.SERPENT_EARTH.img;
					break;
				case POWER_FIRE:
					img = sprites.SERPENT_FIRE.img;
					break;
				case POWER_AIR:
					img = sprites.SERPENT_AIR.img;
					break;
			}
			if( segment.is_head ) {
				frame = 2;
			} else if( segment.is_tail ) {
				frame = 0;
				offset_x = OFFSET_TAIL_X;
			} else {
				frame = 1;
			}
			//ctx_view.fillRect( segment.state.x - 48, segment.state.y - 48, 96, 96 );
			ctx_ent.translate( segment.state.x, segment.state.y );
			ctx_ent.rotate( ANGLES[ segment.state.angle ][ 0 ] );
			ctx_ent.translate( offset_x, -HHEIGHT_IMG_SERPENT );
			ctx_ent.drawImage( img, frame * WIDTH_IMG_SERPENT, 0, WIDTH_IMG_SERPENT, HEIGHT_IMG_SERPENT, 0, 0, WIDTH_IMG_SERPENT, HEIGHT_IMG_SERPENT );
			//ctx_view.fillRect( 0, 0, 32, 32 );
			ctx_ent.setTransform( 1, 0, 0, 1, 0, 0 );
		}
	}

	function draw_viewport() {
		x_view = Math.round( me.player.state.x + HWIDTH_PLAYER - HWIDTH_VIEW );
		y_view = Math.round( me.player.state.y + HHEIGHT_PLAYER - HHEIGHT_VIEW );
		ctx_view.clearRect( 0, 0, WIDTH_VIEW, HEIGHT_VIEW );
		ctx_view.imageSmoothingEnabled = false;
		ctx_view.drawImage( IMG_FOREST, x_view / WIDTH_MAP * WIDTH_IMG_FOREST, y_view / HEIGHT_MAP * HEIGHT_IMG_FOREST, WIDTH_VIEW / WIDTH_MAP * WIDTH_IMG_FOREST, HEIGHT_VIEW / HEIGHT_MAP * HEIGHT_IMG_FOREST, 0, 0, WIDTH_VIEW, HEIGHT_VIEW );
		//ctx_view.drawImage( IMG_FOREST, x_view / HEIGHT_MAP / 2.5 * WIDTH_IMG_FOREST, y_view / HEIGHT_MAP * HEIGHT_IMG_FOREST, WIDTH_VIEW / WIDTH_MAP * HEIGHT_IMG_FOREST * 2.5, HEIGHT_VIEW / HEIGHT_MAP * HEIGHT_IMG_FOREST, 0, 0, WIDTH_VIEW, HEIGHT_VIEW );
		ctx_view.imageSmoothingEnabled = true;
		ctx_view.drawImage( canvas_tile, -x_view, -y_view );
		ctx_view.drawImage( canvas_ent, -x_view, -y_view );
	}

	function draw_me() {
		if( me == null ) return;
		if( me.building ) {
			ctx_ent.drawImage( sprites.CURSOR_VALID.img, me.x_tile * WIDTH_TILE, me.y_tile * HEIGHT_TILE );
		}
	}

	function game_loop( ts ) {
		update_me( ts );
		update_segments( ts );
		update_players( ts );
		update_bullets( ts );
		if( SERVER ) {
			if( spawned ) {
				send_update();
			} else {
				var spawn = false;
				for( var i = 0; i < players.length; ++i ) {
					if( players[ i ].state.active && players[ i ].alive && !players[ i ].ready ) break;
					spawn |= ( players[ i ].state.active && players[ i ].alive );
					if( spawn && i == players.length - 1 ) {
						activate_boss();
						send_update();
					}
				}
			}
		} else {
			ctx_ent.clearRect( 0, 0, WIDTH_MAP, HEIGHT_MAP );
			draw_bullets();
			draw_players( ts );
			draw_segments();
			if( CLIENT ) {
				draw_me();
				draw_viewport();
				send_update( me.update_x_tile, me.update_y_tile, me.update_idx_bullet, me.head );
			}
		}
		window.requestAnimationFrame( game_loop );
	}

	function get_tile( x, y ) {
		if( y >= 0 && y < THEIGHT_MAP ) {
			var row = tiles[ y ];
			if( x >= 0 && x < TWIDTH_MAP ) {
				return tiles[ y ][ x ];
			}
		}
		return -1;
	}

	function draw_tile( x, y ) {
		var tx = x * WIDTH_TILE,
			ty = y * HEIGHT_TILE;
		if( get_tile( x, y ) == -1 ) return;
		if( get_tile( x, y ) == 1 ) {
			ctx_tile.clearRect( tx, ty, WIDTH_TILE, HEIGHT_TILE );
			//ctx_tile.fillRect( tx, ty, WIDTH_TILE, HEIGHT_TILE );
			var left = get_tile( x - 1, y ) != 1,
				right = get_tile( x + 1, y ) != 1;
			if( left && right || !left && !right ) {
				ctx_tile.drawImage( sprites.PLATFORM.img, 0, 0, WIDTH_TILE, HEIGHT_TILE, tx, ty, WIDTH_TILE, HEIGHT_TILE );
			} else if( left ) {
				ctx_tile.drawImage( sprites.PLATFORM.img, WIDTH_TILE, 0, WIDTH_TILE, HEIGHT_TILE, tx, ty, WIDTH_TILE, HEIGHT_TILE );
			} else if( right ) {
				ctx_tile.drawImage( sprites.PLATFORM.img, WIDTH_TILE * 2, 0, WIDTH_TILE, HEIGHT_TILE, tx, ty, WIDTH_TILE, HEIGHT_TILE );
			}
		} else {
			//ctx_tile.fillStyle = "#FFFFFF";
			//ctx_tile.fillRect( tx, ty, WIDTH_TILE, HEIGHT_TILE );
			ctx_tile.clearRect( tx, ty, WIDTH_TILE, HEIGHT_TILE );
		}
	}

	function handle_mousemove( evt ) {
		var rect = canvas_view.getBoundingClientRect();
		me.x_mouse = ( evt.clientX - rect.left ) * WIDTH_VIEW / rect.width;
		me.y_mouse = ( evt.clientY - rect.top ) * HEIGHT_VIEW / rect.height;
	}

	function handle_mousedown( evt ) {
		switch( evt.which ) {
			case 1: // left
				me.down_left = true;
				break;
			case 2: // middle
				me.down_mid = true;
				break;
			case 3: // right
				me.down_right = true;
				break;
		}
	}

	function handle_mouseup( evt ) {
		switch( evt.which ) {
			case 1: // left
				me.down_left = false;
				break;
			case 2: // middle
				me.down_mid = false;
				break;
			case 3: // right
				me.down_right = false;
				break;
		}
	}

	function handle_contextmenu( evt ) {
		evt.preventDefault();
		return false;
	}

	function handle_keydown( evt ) {
		me.keys[ evt.keyCode ] = true;
	}

	function handle_keyup( evt ) {
		me.keys[ evt.keyCode ] = false;
	}

	function callback_forest() {
		window.requestAnimationFrame( game_loop );
	}

	function init_listeners() {
		//ctx_tile.fillRect( 0, 0, WIDTH_MAP, HEIGHT_MAP );
		if( me != null ) {
			hud.addEventListener( "mousemove", handle_mousemove );
			hud.addEventListener( "mousedown", handle_mousedown );
			hud.addEventListener( "mouseup", handle_mouseup );
			hud.addEventListener( "contextmenu", handle_contextmenu );
			document.addEventListener( "keydown", handle_keydown );
			document.addEventListener( "keyup", handle_keyup );
		}
		IMG_FOREST.addEventListener( "load", callback_forest );
		IMG_FOREST.addEventListener( "error", callback_forest );
		//IMG_FOREST.src = "assets/forest.png";
		IMG_FOREST.src = "assets/forest_2.png";
	}

	function draw_tiles() {
		var y, 
			x;
		for( y = 0; y < THEIGHT_MAP; ++y ) {
			for( x = 0; x < TWIDTH_MAP; ++x ) {
				draw_tile( x, y );
			}
		}
	}

	function init_tiles() {
		var y, x;
		for( y = 0; y < THEIGHT_MAP; ++y ) {
			tiles.push( [] );
			for( x = 0; x < TWIDTH_MAP; ++x ) {
				tiles[ y ].push( 0 );
			}
		}
	}

	function init_game_state() {
		if( SERVER ) {
			init_tiles();
			var s = [];
			var i = ( Math.random() * 4 + 1 ) | 0;
			while( i-- ) s.push( create_serpent( false, ( Math.random() * 4 ) | 0, 1, ( Math.random() * 76 + 5 ) | 0 ) )
			init_segments( s );
		} else {
			tiles = init_data.tiles;
			segments = init_data.segments;
			players = init_data.players;
			var i;
			for( i = 0; i < segments.length; ++i ) {
				if( segments.is_head ) heads.push( head_idx );
			}
			bullets = init_data.bullets;
			if( CLIENT ) {
				me = new Me( init_data.me, init_data.color.color );
				me.player.alive = true;
				console.log( me );
			}
			recolor = init_data.color.recolor;
			for( i = 0; i < players.length; ++i ) {
				animate_player( players[ i ] );
			}
			draw_tiles();
		}
		game_state[ "tiles" ] = tiles;
		game_state[ "players" ] = players;
		game_state[ "bullets" ] = bullets;
		game_state[ "segments" ] = segments;
		game_state[ "activate_player" ] = activate_player;
		game_state[ "parse_bullet" ] = parse_bullet;
		game_state[ "parse_player" ] = parse_player;
		game_state[ "add_bullet" ] = add_bullet;
		game_state[ "add_player" ] = add_player;
		game_state[ "draw_tile" ] = draw_tile;
		game_state[ "heads" ] = heads;
		game_state[ "parse_segment" ] = parse_segment;
		game_state[ "scale" ] = SCALE;
		game_state[ "spawned" ] = spawned;
		game_state[ "activate_boss" ] = activate_boss;
		cb_init( game_state );
		if( SERVER ) {

		} else if( CLIENT ) {
			init_listeners();
		}
		console.log( "st" )
		window.requestAnimationFrame( game_loop );
	}

	function callback_sprites( evt ) {
		sprites = evt;
		init_game_state();
	}

	if( SERVER ) {
		init_game_state();
	} else {
		init_sprites( callback_sprites, SCALE );
	}
}