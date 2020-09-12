function init_sprites( callback_init ) {
	var IMG_SERPENT_ICE = new Image(),
		IMG_SERPENT_EARTH = new Image(),
		IMG_SERPENT_FIRE = new Image(),
		IMG_SERPENT_AIR = new Image(),
		IMG_BULLET_ICE = new Image(),
		IMG_BULLET_EARTH = new Image(),
		IMG_BULLET_FIRE = new Image(),
		IMG_BULLET_AIR = new Image(),
		IMG_PLAYER_RUN_L = new Image(),
		IMG_PLAYER_IDLE_L = new Image(),
		IMG_PLAYER_GLIDE_L = new Image(),
		IMG_PLAYER_FLAP_L = new Image(),
		IMG_PLAYER_RUN_R = new Image(),
		IMG_PLAYER_IDLE_R = new Image(),
		IMG_PLAYER_GLIDE_R = new Image(),
		IMG_PLAYER_FLAP_R = new Image();;

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
		if( num_img_load + num_img_error == len_sprites ) {
			callback_loaded();
		}
	}

	function callback_img_error() {
		++num_img_error;
		if( num_img_load + num_img_error == len_sprites ) {
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

	evt[ "SERPENT_ICE" ] = new Sprite( IMG_SERPENT_ICE, "assets/serpentina_b.png" );
	evt[ "SERPENT_EARTH" ] = new Sprite( IMG_SERPENT_EARTH, "assets/serpentina_g.png" );
	evt[ "SERPENT_FIRE" ] = new Sprite( IMG_SERPENT_FIRE, "assets/serpentina_r.png" );
	evt[ "SERPENT_AIR" ] = new Sprite( IMG_SERPENT_AIR, "assets/serpentina_w.png" );

	evt[ "BULLET_ICE" ] = new Sprite( IMG_BULLET_ICE, "assets/bullet_b.png" );
	evt[ "BULLET_EARTH" ] = new Sprite( IMG_BULLET_EARTH, "assets/bullet_g.png" );
	evt[ "BULLET_FIRE" ] = new Sprite( IMG_BULLET_FIRE, "assets/bullet_r.png" );
	evt[ "BULLET_AIR" ] = new Sprite( IMG_BULLET_AIR, "assets/bullet_w.png" );

	evt[ "PLAYER_RUN_L" ] = new Sprite( IMG_PLAYER_RUN_L, "assets/player_run_l.png" );
	evt[ "PLAYER_IDLE_L" ] = new Sprite( IMG_PLAYER_IDLE_L, "assets/player_idle_l.png" );
	evt[ "PLAYER_GLIDE_L" ] = new Sprite( IMG_PLAYER_GLIDE_L, "assets/player_glide_l.png" );
	evt[ "PLAYER_FLAP_L" ] = new Sprite( IMG_PLAYER_FLAP_L, "assets/player_flap_l.png" );

	evt[ "PLAYER_RUN_R" ] = new Sprite( IMG_PLAYER_RUN_R, "assets/player_run_r.png" );
	evt[ "PLAYER_IDLE_R" ] = new Sprite( IMG_PLAYER_IDLE_R, "assets/player_idle_r.png" );
	evt[ "PLAYER_GLIDE_R" ] = new Sprite( IMG_PLAYER_GLIDE_R, "assets/player_glide_r.png" );
	evt[ "PLAYER_FLAP_R" ] = new Sprite( IMG_PLAYER_FLAP_R, "assets/player_flap_r.png" );

	load_sprites();
}