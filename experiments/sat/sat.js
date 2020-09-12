var ANGLES = [];

for( var i = 0; i < 360; ++i ) {
	ANGLES.push( i / 180 * Math.PI );
	ANGLES.push( Math.cos( ANGLES[ i * 3 ] ) );
	ANGLES.push( Math.sin( ANGLES[ i * 3 ] ) );
}

var CANVAS = document.getElementById( "game" );

CANVAS.width = 500;
CANVAS.height = 500;

function Entity() {
	this.x = 250;
	this.y = 250;
	this.height = 36;
	this.width = 69;
	this.angle = 165;
}

var ent = new Entity();

var ctx = CANVAS.getContext( "2d" );
ctx.translate( 250, 250 );
ctx.rotate( ANGLES[ ent.angle * 3 ] );
ctx.fillRect( 0, -18, 69, 36 );
ctx.setTransform( 1, 0, 0, 1, 0, 0 );

function between( pt, x1, x2 ) {
	return pt >= x1 && pt <= x2 || pt >= x2 && pt <= x1;
}

function contains_point( x, y ) {
	var axis_horiz = [ ANGLES[ ent.angle * 3 + 1 ], ANGLES[ ent.angle * 3 + 2 ] ];
	var axis_vert = [ ANGLES[ ( ent.angle + 90 ) * 3 + 1 ], ANGLES[ ( ent.angle + 90 ) * 3 + 2 ] ];
	var tl = [ ent.x + ( axis_horiz[ 1 ] * 18 ), ent.y - ( axis_horiz[ 0 ] * 18 ) ];
	//var tr = [ ent.x + ( axis_horiz[ 1 ] * 18 ) + ( axis_horiz[ 0 ] * 69 ), ent.y - ( axis_horiz[ 0 ] * 18 ) + ( axis_horiz[ 1 ] * 69 ) ];
	var br = [ ent.x + ( axis_horiz[ 0 ] * 69 ) - ( axis_horiz[ 1 ] * 18 ), ent.y + ( axis_horiz[ 0 ] * 18 ) + ( axis_horiz[ 1 ] * 69 ) ];
	//var bl = [ ent.x - ( axis_horiz[ 1 ] * 18 ), ent.y + ( axis_horiz[ 0 ] * 18 ) ];
	//tl[ 0 ] *= [];
	//br[ 0 ] *= axis_horiz[ 0 ];
	//tl[ 1 ] *= axis_horiz[ 1 ];
	//br[ 1 ] *= axis_horiz[ 1 ];
	var axis = [ x, y ];
	var sqmag = x * x + y * y;
	var hdotl = tl[ 0 ] * axis_horiz[ 0 ] + tl[ 1 ] * axis_horiz[ 1 ];
	var hdotr = br[ 0 ] * axis_horiz[ 0 ] + br[ 1 ] * axis_horiz[ 1 ];
	var hdot = axis_horiz[ 0 ] * axis[ 0 ] + axis_horiz[ 1 ] * axis[ 1 ];
	//hdot /= sqmag;
	var vdott = tl[ 0 ] * axis_vert[ 0 ] + tl[ 1 ] * axis_vert[ 1 ];
	var vdotb = br[ 0 ] * axis_vert[ 0 ] + br[ 1 ] * axis_vert[ 1 ];
	var vdot = axis_vert[ 0 ] * axis[ 0 ] + axis_vert[ 1 ] * axis[ 1 ];
	//vdot /= sqmag;
	//console.log( tl[ 0 ], tl[ 1 ] );
	//console.log( tr[ 0 ], tr[ 1 ] );
	//console.log( br[ 0 ], br[ 1 ] );
	//console.log( bl[ 0 ], bl[ 1 ] );
	if( between( hdot, hdotl, hdotr ) && between( vdot, vdott, vdotb ) ) {
		console.log( "cotni" );
	};
}

function mousemove( e ) {
	var rect = CANVAS.getBoundingClientRect();
	x = e.clientX - rect.left;
	y = e.clientY - rect.top;
	contains_point( x, y );
}

CANVAS.addEventListener( "mousemove", mousemove );