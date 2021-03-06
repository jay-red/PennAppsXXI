var OP_JOIN = 0x0,
	OP_SYNC_TILES = 0x1,
	OP_SYNC_PLAYERS = 0x2,
	OP_SYNC_SEGMENTS = 0x3,
	OP_SYNC_BULLETS = 0x4,
	OP_UPDATE_SERVER = 0x5,
	OP_UPDATE_CLIENT = 0x6,
	OP_UPDATE_VR = 0x7,
	OP_JOIN_VR = 0x8;

var rtc,
	game_state;

function send_msg( op, data, channel ) {
	var msg = {};
	msg.op = op;
	msg.data = data;
	if( typeof channel == "undefined" || channel == null ) {
		msg.direct = false;
		rtc.send( JSON.stringify( msg ) );
	} else {
		msg.direct = true;
		channel.send( JSON.stringify( msg ) );
	}
}

function handle_msg( channel, msg ) {
	var msg = JSON.parse( msg ),
		data = msg.data;
	switch( msg.op ) {
		case OP_JOIN:
			var pid = game_state.activate_player();
			console.log( pid );
			send_msg( OP_JOIN, { id : pid }, channel );
			var sync_data;
			for( var i = 0; i < game_state.tiles.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "row" ] = game_state.tiles[ i ];
				sync_data[ "last" ] = i == game_state.tiles.length - 1;
				send_msg( OP_SYNC_TILES, sync_data, channel );
			}
			for( i = 0; i < game_state.players.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "player" ] = game_state.players[ i ];
				sync_data[ "last" ] = i == game_state.players.length - 1;
				send_msg( OP_SYNC_PLAYERS, sync_data, channel );
			}
			for( i = 0; i < game_state.bullets.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "row" ] = game_state.bullets[ i ];
				sync_data[ "last" ] = i == game_state.bullets.length - 1;
				send_msg( OP_SYNC_BULLETS, sync_data, channel );
			}
			for( i = 0; i < game_state.segments.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "segment" ] = game_state.segments[ i ];
				sync_data[ "last" ] = i == game_state.segments.length - 1;
				send_msg( OP_SYNC_SEGMENTS, sync_data, channel );
			}
			break;
		case OP_UPDATE_CLIENT:
			send_msg( OP_UPDATE_CLIENT, data );
			if( data.tile ) {
				game_state.tiles[ data.tile.y ][ data.tile.x ] = data.tile.t;
			}
			if( data.bullet ) {
				while( game_state.bullets[ data.player.idx ].length <= data.bullet.idx ) game_state.add_bullet( data.player.idx );
				game_state.parse_bullet( data.scale, data.bullet );
			}
			game_state.parse_player( data.scale, data.player );
			break;
		case OP_JOIN_VR:
			send_msg( OP_JOIN_VR, null, channel );
			var sync_data;
			for( var i = 0; i < game_state.tiles.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "row" ] = game_state.tiles[ i ];
				sync_data[ "last" ] = i == game_state.tiles.length - 1;
				send_msg( OP_SYNC_TILES, sync_data, channel );
			}
			for( i = 0; i < game_state.players.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "player" ] = game_state.players[ i ];
				sync_data[ "last" ] = i == game_state.players.length - 1;
				send_msg( OP_SYNC_PLAYERS, sync_data, channel );
			}
			for( i = 0; i < game_state.bullets.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "row" ] = game_state.bullets[ i ];
				sync_data[ "last" ] = i == game_state.bullets.length - 1;
				send_msg( OP_SYNC_BULLETS, sync_data, channel );
			}
			for( i = 0; i < game_state.segments.length; ++i ) {
				sync_data = {};
				sync_data[ "id" ] = i;
				sync_data[ "segment" ] = game_state.segments[ i ];
				sync_data[ "last" ] = i == game_state.segments.length - 1;
				send_msg( OP_SYNC_SEGMENTS, sync_data, channel );
			}
			break;
		case OP_UPDATE_VR:
			game_state.target( data.scale, data.x, data.y );
			break;
	}
}

function update() {
	var update_data = {};
	update_data[ "heads" ] = [];
	update_data[ "scale" ] = game_state.scale
	for( var i = 0; i < game_state.heads.length; ++i ) {
		update_data[ "heads" ].push( game_state.segments[ game_state.heads[ i ] ] );
	}
	send_msg( OP_UPDATE_SERVER, update_data );
}

function callback_init_game( evt ) {
	game_state = evt;
}

function callback_init_rtc( evt ) {
	rtc = evt;
	init_game( callback_init_game, update, 0, null );
}

init_rtc( callback_init_rtc, null, null, handle_msg, true );