var SCALE = 3;

var TWIDTH_MAP = 240,
	THEIGHT_MAP = 96;

var WIDTH_TILE = 8,
	HEIGHT_TILE = 8;

var WIDTH_MAP = TWIDTH_MAP * WIDTH_TILE * SCALE,
	HEIGHT_MAP = TWIDTH_MAP * WIDTH_TILE * SCALE;

var tiles = [],
	sprites = null,
	canvas_tile = document.createElement( "canvas" ),
	ctx_tile = null;

function EntityState() {
	this.x = 0;
	this.y = 0;
	this.dx = 0;
	this.dy = 0;
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
			} else {
				segments.push( new SerpentBody( idx, head_idx, split, power, ai ) );
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

}

function update_body( ts, body ) {

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
		if( segment.active )		 {
			update_segment( ts, segment );
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

function game_loop( ts ) {
	update_segments( ts );
	update_players( ts );
	update_bullet( ts );
	draw_bullets();
	draw_players();
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
		ctx_tile.clearRect( tx * SCALE, ty * SCALE, WIDTH_TILE * SCALE, HEIGHT_TILE * SCALE );
	}
}

function draw_tiles() {
	var y, 
		x;
	for( y = 0; y < THEIGHT_MAP; ++y ) {
		for( x = 0; x < TWIDTH_MAP; ++x ) {
			draw_tile( x, y );
		}
	}
	window.requestAnimationFrame( game_loop );
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