function init_anims( callback_init ) {
	var IMG_SERPENT_ICE = new Image(),
		IMG_SERPENT_EARTH = new Image(),
		IMG_SERPENT_FIRE = new Image(),
		IMG_SERPENT_AIR = new Image(),
		IMG_BULLET_ICE = new Image(),
		IMG_BULLET_EARTH = new Image(),
		IMG_BULLET_FIRE = new Image(),
		IMG_BULLET_AIR = new Image(),
		IMG_PLAYER_RUN = new Image(),
		IMG_PLAYER_IDLE = new Image(),
		IMG_PLAYER_GLIDE = new Image(),
		IMG_PLAYER_FLAP = new Image();

	var evt = {},
		sprites = [],
		len_sprites = 0,
		num_img_error = 0,
		num_img_load = 0;

	function callback_loaded() {
		callback_init( evt );
	}

	function callback_img_load() {
		++num_img_load;
		if( num_img_load + num_img_error == len_images ) {
			callback_loaded();
		}
	}

	function callback_img_error() {
		++num_img_error;
		if( num_img_load + num_img_error == len_images ) {
			callback_loaded();
		}
	}

	function Sprite( img, src ) {		
		++len_sprites;
		this.img = img;
		this.src = src;
		sprites.push( this );
	}

	function load_sprite( sprite ) {
		sprite.img.addEventListener( "load", callback_img_load );
		sprite.img.addEventListener( "error", callback_img_error );
		sprite.img.src = sprite.src;
	}

	function load_sprites() {
		var sprite;
		for( var i = 0; i < len_sprites; ++i ) {
			sprite = sprites[ i ];
			load_sprite( sprite );
		}
	}

	evt[ "SERPENT_ICE" ] = new Sprite( IMG_SERPENT_ICE, "assets/serpent_ice.png" );
	evt[ "SERPENT_EARTH" ] = new Sprite( IMG_SERPENT_EARTH, "assets/serpent_earth.png" );
	evt[ "SERPENT_FIRE" ] = new Sprite( IMG_SERPENT_FIRE, "assets/serpent_fire.png" );
	evt[ "SERPENT_AIR" ] = new Sprite( IMG_SERPENT_AIR, "assets/serpent_air.png" );
	evt[ "BULLET_ICE" ] = new Sprite( IMG_BULLET_ICE, "assets/bullet_ice.png" );
	evt[ "BULLET_EARTH" ] = new Sprite( IMG_BULLET_EARTH, "assets/bullet_earth.png" );
	evt[ "BULLET_FIRE" ] = new Sprite( IMG_BULLET_FIRE, "assets/bullet_fire.png" );
	evt[ "BULLET_AIR" ] = new Sprite( IMG_BULLET_AIR, "assets/bullet_air.png" );
	evt[ "PLAYER_RUN" ] = new Sprite( IMG_PLAYER_RUN, "assets/player_run.png" );
	evt[ "PLAYER_IDLE" ] = new Sprite( IMG_PLAYER_IDLE, "assets/player_idle.png" );
	evt[ "PLAYER_GLIDE" ] = new Sprite( IMG_PLAYER_GLIDE, "assets/player_glide.png" );
	evt[ "PLAYER_FLAP" ] = new Sprite( IMG_PLAYER_FLAP, "assets/player_flap.png" );

	load_sprites();
}