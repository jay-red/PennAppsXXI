var SCALE = 3;

var POWER_ICE = 0,
	POWER_EARTH = 1,
	POWER_FIRE = 2,
	POWER_AIR = 3;

var TWIDTH_MAP = 240,
	THEIGHT_MAP = 96;

var WIDTH_TILE = 8 * SCALE,
	HEIGHT_TILE = 8 * SCALE;

var WIDTH_MAP = TWIDTH_MAP * WIDTH_TILE,
	HEIGHT_MAP = TWIDTH_MAP * WIDTH_TILE;

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

var ANGLES = [];

function init_angles() {
	for( var i = 0; i < 360; ++i ) {
		ANGLES.push( [ i / 180 * Math.PI ] );
		ANGLES[ i ].push( Math.cos( ANGLES[ i * 3 ] ) );
		ANGLES[ i ].push( Math.sin( ANGLES[ i * 3 ] ) );
	}
}

init_angles();

var canvas_view = document.getElementById( "game-canvas" ),
	ctx_view = null;

canvas_view.width = WIDTH_MAP;
canvas_view.height = HEIGHT_MAP;
ctx_view = canvas_view.getContext( "2d" );

var tiles = [],
	sprites = null,
	canvas_tile = document.createElement( "canvas" ),
	ctx_tile = null,
	x_mouse = 0,
	y_mouse = 0;

function EntityState() {
	this.x = 0;
	this.y = 0;
	this.dx = 0;
	this.dy = 0;
	this.angle = 0;
	this.active = false;
	this.last_update = -1;
}

function SerpentHead( idx, split, power, ai ) {
	this.idx = idx;
	this.is_head = true;
	this.state = new EntityState();
	this.alive = false;
	this.power = power;
	this.can_split = split;
	this.ai = ai;
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
}

function Bullet( idx ) {
	this.idx = idx;
	this.state = new EntityState();
}

function Player( idx ) {
	this.idx = idx;
	this.state = new EntityState();
	this.alive = false;
}

function Me( idx ) {
	this.idx = idx;
}

var players = [ new Player( 0 ), new Player( 1 ), new Player( 2 ), new Player( 3 ) ];
var segments = [];
var bullets = [ [], [], [], [] ];

function activate_player() {
	var player;
	for( var i = 0; i < players.length; ++i ) {
		player = players[ i ];
		if( !player.state.active ) {
			player.state.active = true;
			return i;
		}
	}
	return -1;
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
		player_bullets.push( new Bullet( idx ) );
		bullet = player_bullets[ idx ];
	}
	bullet.state.active = true;
	return idx;
}

function active_boss() {

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
				segments.push( new SerpentHead( idx, split, power, ai ) );
				segments[ idx ].state.x = Math.random() * WIDTH_MAP;
				segments[ idx ].state.y = Math.random() * HEIGHT_MAP;
			} else {
				segments.push( new SerpentBody( idx, head_idx, split, power, ai ) );
				if( idx == num_segs - 1 ) {
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

function update_player( ts, player ) {

}

function update_head( ts, head ) {
	if( head.state.last_update == -1 ) head.state.last_update = ts;
	var ticks = ts - head.state.last_update;

    var speed = 2;
    var acceleration = 0.0008 * ticks;

    var diff_x = x_mouse - head.state.x;
    var diff_y = y_mouse - head.state.y;

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

function update_bullet( ts, bullet ) {

}

function update_players( ts ) {
	var player;
	for( var i = 0; i < players.length; ++i ) {
		player = players[ i ];
		if( player.active ) {
			update_player( ts, player );
		}
	}
}

function update_segments( ts ) {
	var segment;
	for( var i = 0; i < segments.length; ++i ) {
		segment = segments[ i ];
		if( segment.active ) {
			if( segment.is_head ) {
				update_head( ts, segment );
			} else {
				update_body( ts, segment );
			}
		}
	}
}

function update_bullets( ts ) {
	var bullet;
	for( var i = 0; i < bullets.length; ++i ) {
		bullet = bullets[ i ];
		if( bullet.active )		 {
			update_bullet( ts, bullet );
		}
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
		ctx_view.translate( segment.state.x, segment.state.y );
		ctx_view.rotate( ANGLES[ segment.state.angle ][ 0 ] );
		ctx_view.translate( offset_x, -HHEIGHT_IMG_SERPENT );
		ctx_view.drawImage( img, frame * WIDTH_IMG_SERPENT, 0, WIDTH_IMG_SERPENT, HEIGHT_IMG_SERPENT, 0, 0, WIDTH_IMG_SERPENT, HEIGHT_IMG_SERPENT );
		//ctx_view.fillRect( 0, 0, 32, 32 );
		ctx_view.setTransform( 1, 0, 0, 1, 0, 0 );
	}
}

function game_loop( ts ) {
	ctx_view.clearRect( 0, 0, WIDTH_MAP, HEIGHT_MAP );
	update_segments( ts );
	update_players( ts );
	update_bullet( ts );
	//draw_bullets();
	//draw_players();
	draw_segments();
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
	if( get_tile( x, y ) > 1 ) {
		ctx_tile.clearRect( tx, ty, WIDTH_TILE, HEIGHT_TILE );
	}
}

function handle_mousemove( evt ) {
	var rect = canvas_view.getBoundingClientRect();
	x_mouse = evt.clientX - rect.left;
	y_mouse = evt.clientY - rect.top;
}

function init_listeners() {
	canvas_view.addEventListener( "mousemove", handle_mousemove );
	init_segments( [ create_serpent( false, 0, 1, 20 ) ] );
	window.requestAnimationFrame( game_loop );
}

function draw_tiles() {
	var y, 
		x;
	for( y = 0; y < THEIGHT_MAP; ++y ) {
		for( x = 0; x < TWIDTH_MAP; ++x ) {
			draw_tile( x, y );
		}
	}
	init_listeners();
}

function init_tiles() {
	// TODO: Add server-based tile population for client
	var y, x;
	for( y = 0; y < THEIGHT_MAP; ++y ) {
		tiles.push( [] );
		for( x = 0; x < TWIDTH_MAP; ++x ) {
			tiles[ y ].push( 0 );
		}
	}
	draw_tiles();
}

function callback_sprites( evt ) {
	init_tiles();
	sprites = evt;
}

init_sprites( callback_sprites, SCALE );