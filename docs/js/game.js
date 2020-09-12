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
}

function SerpentHead() {
	this.state = new EntityState();
}

function SerpentBody() {
	this.state = new EntityState();
}

function SerpentTail() {
	this.state = new EntityState();
}

function Bullet() {
	this.state = new EntityState();
}

function Player() {
	this.state = new EntityState();
}

function get_tile( x, y ) {
	if( y >= 0 && y < THEIGHT_MAP ) {
		var row = tiles[ y ];
		if( x >= 0 && x < TWIDTH_MAP ) {

		}
	}
	return -1;
}

function draw_tile( x, y ) {
	var tx = x * WIDTH_TILE,
		ty = y * HEIGHT_TILE;
	ctx_tile.clearRect( tx * SCALE, ty * SCALE, WIDTH_TILE * SCALE, HEIGHT_TILE * SCALE );
	if( get_tile( x, y ) ) {}
	ctx_tile.clearRect( tx * SCALE, ty * SCALE, WIDTH_TILE * SCALE, HEIGHT_TILE * SCALE );
}

function init_tiles() {

}

function callback_sprites( evt ) {
	sprites = evt;
}

init_sprites( callback_sprites, SCALE );