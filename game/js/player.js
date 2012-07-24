pspeed = 1;

Crafty.c("Player", {
	hp: {
		current: 3,
		max: 3
	},
	sword: {
		type: "basic"
	},
	questItems: {
		ball: false,
		ball2: false,
		sac: false
	},
	magic: {
		current: 10,
		max: 10
	},
	otherItems: {
		addLater: false,
		moreLater: false
	},
	attack: false,
	shoot: false,
	blink: false,
	jumpDist: 60,
	facing: "down",
	hurt: false,
	init: function() {
		this.requires("2D, DOM, Collision, Fourway, Keyboard, SpriteAnimation, player")
		.attr({x: 16, y:200,z:3})
		.collision(new Crafty.polygon([0,0],[0,11],
									  [11,11],[11,0]))
		.fourway(1)
        .animate("walk_left", 6, 3, 8)
        .animate("walk_right", 9, 3, 11)
        .animate("walk_up", 3, 3, 5)
        .animate("walk_down", 0, 3, 2)
		.onHit('Enemy', function() {
			Crafty.trigger('Hurt');
		})
		.bind("KeyDown", function(e) {
			if(e.keyCode === Crafty.keys['Z'] && this.attack === false){
				this.attack = true;
				this.swingAttack();
				this.timeout(function() {
					this.attack = false;
				}, 300);
			}
			else if(e.keyCode === Crafty.keys['X'] && this.shoot === false &&
					this.magic.current >= 1 && this.questItems.ball === true) {
				this.shoot = true;
				this.magic.current -= 1;
				mbars[this.magic.current].destroy();  // TODO: Add fade animation!
				this.magicBolt();
				this.timeout(function() {
					this.shoot = false;
				}, 400);
				
			} else if(e.keyCode === Crafty.keys['C'] && this.blink === false &&
					this.magic.current >= 1 && this.questItems.ball2 === true) {
				this.blink = true;
				this.magic.current -= 1;
				mbars[this.magic.current].destroy();  // TODO: Add fade animation!
				this.magicJump();
				this.timeout(function() {
					this.blink = false;
					this.jumpDist = 40;
				}, 700);
				
			} else if(e.keyCode === Crafty.keys['P']) {
				Crafty.trigger("mspawner");
				Crafty.trigger("bspawner");
				this.questItems.ball = true;
				this.questItems.ball2 = true;
			}
		})
        .bind("NewDirection", function(direction) {
            if (direction.x < 0) {
            	if (!this.isPlaying("walk_left")) {
               		this.stop().animate("walk_left", 10, -1);
					this.facing = "left";
				}
        	}
        	if (direction.x > 0) {
            	if (!this.isPlaying("walk_right")) {
              		this.stop().animate("walk_right", 10, -1);
					this.facing = "right";
				}
        	}
        	if (direction.y < 0) {
            	if (!this.isPlaying("walk_up")) {
               		this.stop().animate("walk_up", 10, -1);
					this.facing = "up";
				}
        	}
        	if (direction.y > 0) {
            	if (!this.isPlaying("walk_down")) {
               		this.stop().animate("walk_down", 10, -1);
					this.facing = "down";
				}
        	}
        	if(!direction.x && !direction.y) {
            	this.stop();
        	}
        })
		.bind("Hurt", function() {
			if(this.hurt === false) {
				this.hurt = true;
				this.hp.current -= 1;
				hearts[this.hp.current]
				.animate("flicker", 0, 0, 1).animate("flicker", 3, 10);
				this.timeout(function() {
					this.hurt = false;
				}, 1000);
			}
			if(this.hp.current === 0){
				Crafty.trigger("Die");
			}
		})
		.bind("Die", function() {
			//add dying animation
			this.timeout(function() {
				Crafty.scene("GameOver");
			}, 1000);
		})
        .bind("Moved", function(from) {
    		if(this.hit('solid')){
        		this.attr({x: from.x, y:from.y});
    		}
    		if((from.y + Crafty.viewport.y) >= 320){
    			Crafty.trigger("nexttile", "d");
    		} else if((from.x + Crafty.viewport.x) >= 480) {
				Crafty.trigger("nexttile", "r");
			} else if((from.y + Crafty.viewport.y) <= 0) {
				Crafty.trigger("nexttile", "u");
			} else if((from.x + Crafty.viewport.x) <= 0) {
				Crafty.trigger("nexttile", "l");
			}
    	});

    	return this;
    },
	
	magicJump: function() {
		//this.stop().animate("blink", 10, -1);
		
		if(this.facing === "up") {
			theJump = this.y + Crafty.viewport.y - 18;
			if(theJump <= this.jumpDist){
				this.y -= theJump;
			} else {
				this.y -= this.jumpDist;
			}
		} else if (this.facing === "down") {
			theJump = Crafty.viewport.y + this.y + 18;
			if(theJump <= this.jumpDist){
				this.y += theJump;
			} else {
				this.y += this.jumpDist;
			}
		} else if (this.facing === "right") {
			theJump = Crafty.viewport.x + this.x + 18;
			if(theJump <= this.jumpDist){
				this.x += theJump;
			} else {
				this.x += this.jumpDist;
			}
		} else {
			theJump = this.x + Crafty.viewport.x - 18;
			if(theJump <= this.jumpDist){
				this.x -= theJump;
			} else {
				this.x -= this.jumpDist;
			}
		}

		//this.timeout(function() {
		//	this.stop().animate("blinkin", 10, -1)
		//}, 100);
	},
	// move speeds and z to the weapon.js
	magicBolt: function(){
		if(this.facing === "up") {
			Crafty.e("Magic", "MagicAttack")
			.attr({
				x:this.x, y:this.y - 7, z:1,
				xspeed: 0, yspeed: -pspeed-2, face: "up"
				})
				.animate("mattack", 4, 5, 10)
				.animate("mattack", 7, -1);
		} else if (this.facing === "down") {
			Crafty.e("Magic", "MagicAttack")
			.attr({
				x:this.x, y:this.y + 7, z:1,
				xspeed: 0, yspeed: pspeed+2, face: "down"
				})
				.animate("mattack", 4, 5, 10)
				.animate("mattack", 7, -1);
		} else if (this.facing === "right") {
			Crafty.e("Magic", "MagicAttack")
			.attr({
				x:this.x + 7, y:this.y, z:1,
				xspeed: pspeed+2, yspeed: 0, face: "right"
				})
				.animate("mattack", 4, 5, 10)
				.animate("mattack", 7, -1);
		} else {
			Crafty.e("Magic", "MagicAttack")
			.attr({
				x:this.x - 7, y:this.y, z:1,
				xspeed: -pspeed-2, yspeed: 0, face: "left"
				})
				.animate("mattack", 4, 5, 10)
				.animate("mattack", 7, -1);
		}
	},
	
	swingAttack: function(){
				
		if(this.facing === "up") {
			Crafty.e(this.sword.type, "SwordAttack")
			.attr({
				x:this.x, y:this.y - 7, z:1,
				xspeed: 0, yspeed: -pspeed
				})
			.animate("uattack", 4, 2, 10)
			.animate("uattack", 7, 1);
		} else if (this.facing === "down") {
			Crafty.e(this.sword.type, "SwordAttack")
			.attr({
				x:this.x, y:this.y + 7, z:1,
				xspeed: 0, yspeed: pspeed
				})
			.animate("dattack", 4, 4, 10)
			.animate("dattack", 7, 1);
		} else if (this.facing === "right") {
			Crafty.e(this.sword.type, "SwordAttack")
			.attr({
				x:this.x + 7, y:this.y, z:1,
				xspeed: pspeed, yspeed: 0
				})
			.animate("rattack", 4, 0, 10)
			.animate("rattack", 7, 1);
		} else {
			Crafty.e(this.sword.type, "SwordAttack")
			.attr({
				x:this.x - 7, y:this.y, z:1,
				xspeed: -pspeed, yspeed: 0
				})
			.animate("lattack", 10, 0, 4)
			.animate("lattack", 7, 1);
		}
	
	}
	
});
