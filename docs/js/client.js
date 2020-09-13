var OP_JOIN = 0x0,
	OP_SYNC_TILES = 0x1,
	OP_SYNC_PLAYERS = 0x2,
	OP_SYNC_SEGMENTS = 0x3,
	OP_SYNC_BULLETS = 0x4,
	OP_UPDATE_SERVER = 0x5,
	OP_UPDATE_CLIENT = 0x6,
	OP_UPDATE_VR = 0x7;

var rtc,
	game_state,
	num_syncs = 4,
	num_tiles = 96,
	num_players = -1,
	num_segments = -1,
	num_bullets = -1,
	received_tiles = 0,
	received_players = 0,
	received_segments = 0,
	received_bullets = 0,
	completed_syncs = 0,
	synced = false,
	me = -1,
	init_game_data = {};

function callback_init_game( evt ) {
	game_state = evt;
}

function update( tx, ty, idx_bullet ) {
	var update_data = {};
	update_data[ "player" ] = game_state.players[ me ];
	update_data[ "bullet" ] = null;
	update_data[ "tile" ] = null;
	update_data[ "scale" ] = game_state.scale;
	if( tx >= 0 && ty >= 0 ) update_data[ "tile" ] = { x : tx, y : ty, t : game_state.tiles[ ty ][ tx ] };
	if( idx_bullet >= 0 ) update_data[ "bullet" ] = game_state.bullets[ me ][ idx_bullet ];
	send_msg( OP_UPDATE_CLIENT, update_data );
}

function start_game() {
	init_game( callback_init_game, update, 1, init_game_data );
	synced = true;
}

function synced_tiles() {
	console.log( "synced tiles" );
	if( ++completed_syncs == num_syncs ) {
		start_game();
	}
}

function synced_players() {
	console.log( "synced players" );
	if( ++completed_syncs == num_syncs ) {
		start_game();
	}
}

function synced_segments() {
	console.log( "synced segments" );
	if( ++completed_syncs == num_syncs ) {
		start_game();
	}
}

function synced_bullets() {
	console.log( "synced bullets" );
	if( ++completed_syncs == num_syncs ) {
		start_game();
	}
}

function handle_msg( msg ) {
	var msg = JSON.parse( msg ),
		data = msg.data;;
	switch( msg.op ) {
		case OP_JOIN:
			if( msg.direct ) {
				me = data.id;
				init_game_data.me = me;
				//num_tiles = data.tiles;
			}
			break;
		case OP_SYNC_TILES:
			if( data.last ) {
				//num_tiles = data.id + 1;
			}
			init_game_data.tiles[ data.id ] = data.row;
			if( ++received_tiles == num_tiles ) {
				synced_tiles();
			}
			break;
		case OP_SYNC_PLAYERS:
			if( data.last ) {
				num_players = data.id + 1;
			}
			while( init_game_data.players.length <= data.id ) init_game_data.players.push( null );
			init_game_data.players[ data.id ] = data.player;
			if( ++received_players == num_players ) {
				synced_players();
			}
			break;
		case OP_SYNC_SEGMENTS:
			if( data.last ) {
				num_segments = data.id + 1;
			}
			while( init_game_data.segments.length <= data.id ) init_game_data.segments.push( null );
			init_game_data.segments[ data.id ] = data.segment;
			if( ++received_segments == num_segments ) {
				synced_segments();
			}
			break;
		case OP_SYNC_BULLETS:
			if( data.last ) {
				num_bullets = data.id + 1;
			}
			while( init_game_data.bullets.length <= data.id ) init_game_data.bullets.push( null );
			init_game_data.bullets[ data.id ] = data.row;
			if( ++received_bullets == num_bullets ) {
				synced_bullets();
			}
			break;
		case OP_UPDATE_CLIENT:
			if( data.player.idx == me || !synced ) return;
			while( game_state.players.length <= data.player.idx ) game_state.add_player();
			if( data.tile ) {
				game_state.tiles[ data.tile.y ][ data.tile.x ] = data.tile.t;
				game_state.draw_tile( data.tile.x - 1, data.tile.y );
				game_state.draw_tile( data.tile.x, data.tile.y );
				game_state.draw_tile( data.tile.x + 1, data.tile.y );
			}
			if( data.bullet ) {
				while( game_state.bullets[ data.player.idx ].length <= data.bullet.idx ) game_state.add_bullet( data.player.idx );
				game_state.parse_bullet( data.bullet );
			}
			game_state.parse_player( data.player );
			break;
	}
}

function send_msg( op, data ) {
	var msg = {};
	msg.op = op;
	msg.data = data;
	rtc.send( JSON.stringify( msg ) );
}

function callback_channel_open() {
	init_game_data[ "tiles" ] = [];
	init_game_data[ "segments" ] = [];
	init_game_data[ "players" ] = [];
	init_game_data[ "bullets" ] = [];
	init_game_data[ "me" ] = -1;
	for( var i = 0; i < num_tiles; ++i ) {
		init_game_data.tiles.push( null );
	}
	send_msg( OP_JOIN, "is yes" );
}

function callback_invalid_game() {

}

function callback_init_rtc( evt ) {
	rtc = evt;
}

init_rtc( callback_init_rtc, callback_invalid_game, callback_channel_open, handle_msg, false );