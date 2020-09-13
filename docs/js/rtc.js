function init_rtc( cb_init, cb_fail, cb_channel, handle_msg, is_server ) {
	var RTC_CONFIG = { 
		iceServers : [ 
			{ 
				urls : "stun:stun.l.google.com:19302" 
			} 
		] 
	},
	RTC_OPTIONS = {
		optional : [ 
			{ 
				RtpDataChannels : false 
			} 
		]
	},
	RTC_MEDIA = {
		optional: [],
		mandatory: {
			OfferToReceiveAudio: false,
			OfferToReceiveVideo: false
		}
	};

	var path = "",
		evt = {},
		keys = [],
		conn_data = {},
		ref_player = null;

	function callback_empty( err ) {
		// Do nothing!
	}

	function send_signal( key, signal_type, signal_data ) {
		var data = {};
		data[ "id" ] = conn_data[ key ].signal_id++;
		data[ "key" ] = key;
		data[ "type" ] = signal_type;
		data[ "server" ] = is_server;
		data[ "data" ] = signal_data;
		firebase.database().ref( path + "/players/" + key + "/signals/" ).push().set( data, callback_empty );
	}

	function add_ice_handler( rtc, key ) {
		rtc.onicecandidate = function( evt ) {
			if( evt.candidate ) send_signal( key, "ice", JSON.stringify( evt.candidate ) );
		};
	}

	function send( msg ) {
		if( is_server ) {
			for( var i = 0; i < keys.length; ++i ) {
				if( conn_data[ keys[ i ] ].channel && conn_data[ keys[ i ] ].channel.readyState == "open" ) {
					conn_data[ keys[ i ] ].channel.send( msg );
				}
			}
		} else {
			if( conn_data[ keys[ 0 ] ].channel && conn_data[ keys[ 0 ] ].channel.readyState == "open" ) {
				conn_data[ keys[ 0 ] ].channel.send( msg );
			}
		}
	}

	function add_msg_handler( channel ) {
		channel.onmessage = function( evt ) {
			if( is_server ) {
				handle_msg( channel, evt.data );
			} else {
				handle_msg( evt.data );
			}
			//console.log( evt.data );
		}
	}

	function handle_channel_open() {
		if( !is_server ) cb_channel();
	}

	function add_channel_handlers( conn ) {
		conn.rtc.ondatachannel = function( evt ) {
			conn.channel = evt.channel;
			conn.channel.onopen = handle_channel_open;
			add_msg_handler( conn.channel );
		}
	}

	function Connection( key ) {
		this.last_read = -1;
		this.signal_id = 0;
		this.rtc = new RTCPeerConnection( RTC_CONFIG, RTC_OPTIONS );
		this.channel = null;
		this.key = key;
		if( !is_server ) {
			add_channel_handlers( this );
		}
		add_ice_handler( this.rtc, key );
	}

	function callback_signal( snapshot ) {
		var action = snapshot.val();
		if( is_server == action.server ) return;
		var conn = conn_data[ action.key ];
		if( action.id <= conn.last_read ) return;
		conn.last_read = action.id;
		//console.log( action );
		switch( action.type ) {
			case "create":
				conn.channel = conn.rtc.createDataChannel( "game" );
				add_msg_handler( conn.channel );
				conn.rtc.createOffer( { offerToReceiveAudio : 1 } ).then( function( offer ) {
					conn.rtc.setLocalDescription( offer );
					send_signal( conn.key, "offer", JSON.stringify( offer ) );
				}, function( err ) {} );
				break;
			case "offer":
				conn.rtc.setRemoteDescription( new RTCSessionDescription( JSON.parse( action.data ) ) );
				conn.rtc.createAnswer( { offerToReceiveAudio : 1 } ).then( function( answer ) {
					conn.rtc.setLocalDescription( answer );
					send_signal( conn.key, "offer", JSON.stringify( answer ) );
				}, function( err ) {} );
				break;
			case "answer":
				conn.rtc.setRemoteDescription( new RTCSessionDescription( JSON.parse( action.data ) ) );
				break;
			case "ice":
				conn.rtc.addIceCandidate( new RTCIceCandidate( JSON.parse( action.data ) ) );
				break;
		}
	}

	function callback_signals( snapshot ) {
		if( snapshot.exists() ) {
			snapshot.forEach( callback_signal );
		}
	}

	function callback_player( snapshot ) {
		var key = snapshot.key;
		if( conn_data.hasOwnProperty( key ) ) return;
		keys.push( key );
		conn_data[ key ] = new Connection( key );
		firebase.database().ref( path + "/players/" + key + "/signals/" ).on( "value", callback_signals );
	}

	function callback_players( snapshot ) {
		if( snapshot.exists() ) {
			snapshot.forEach( callback_player );
		}
	}

	function callback_activate_game( err ) {
		if( err ) {
			// TODO: Make something happen
		} else {
			firebase.database().ref( path + "/players/" ).on( "value", callback_players );
		}
	}

	function callback_create_player( err ) {
		if( err ) {
			// TODO: Make something happen
		} else {
			var key = ref_player.key;
			keys.push( key );
			conn_data[ key ] = new Connection( key );
			firebase.database().ref( path + /players/ + key + "/signals/" ).on( "value", callback_signals );
			send_signal( key, "create", "is_yes" );
		}
	}

	function callback_remove() {
		firebase.database().ref( path + "/players/" ).on( "value", callback_players );
	}

	function callback_query_game( snapshot ) {
		if( snapshot.exists() ) {
			cb_init( evt );
			if( is_server ) {
				firebase.database().ref( path + "/players/" ).remove().then( callback_remove ).catch( callback_remove );
			} else {
				( ref_player = firebase.database().ref( path + "/players/" ).push() ).set( {
					active : true
				}, callback_create_player );
			}
		} else {
			if( is_server ) {
				cb_init( evt );
				firebase.database().ref( path ).set( {
					active : true
				}, callback_activate_game );
			} else {
				cb_fail();
			}
		}
	}

	function callback_permissions() {
		path = window.location.href.toLowerCase().split( "?game=" );
		if( path.length == 1 ) path = path[ 0 ].split( "&game=" );
		path = path[ 1 ].split( "&" )[ 0 ];
		path = "/game/" + path;

		evt.send = send;

		firebase.database().ref( path ).once( "value" ).then( callback_query_game );
	}

	navigator.mediaDevices.getUserMedia( { audio: true, video: true } ).then( callback_permissions );
}