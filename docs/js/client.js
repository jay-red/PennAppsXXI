var rtc;

function handle_msg( msg ) {
	console.log( msg );
}

function callback_channel_open() {

}

function callback_invalid_game() {

}

function callback_init_rtc( evt ) {
	rtc = evt;
}

init_rtc( callback_init_rtc, callback_invalid_game, callback_channel_open, handle_msg, false );