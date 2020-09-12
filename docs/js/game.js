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

function placeholder( evt ) {
	console.log( evt );
	console.log( "initialized" )
}

init_sprites( placeholder );