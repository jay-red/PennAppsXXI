var rtc,
	c;

function handle_msg( channel, msg ) {
	c = channel;
	console.log( msg );
}

function callback_init_rtc( evt ) {
	rtc = evt;
}

init_rtc( callback_init_rtc, null, null, handle_msg, true );