var game = new Phaser.Game(1024, 576, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('monster','images/wizball.png');
    game.load.image('ship', 'images/ship.png');
    game.load.image('bullet', 'images/bullet.png');
    game.load.spritesheet('explosion', 'images/explosion.png', 80, 80);
}

// var monster;
// var player;
var initialPlayerPosition = 512;
var bulletTime=0;
var lives = 3;
var score = 0;
var highScore = 0;
var style = { font: "32px silkscreen", fill: "#666666", align: "center" };
var boldStyle = { font: "bold 32px silkscreen", fill: "#ffffff", align: "center" };

//LA CREATION DES COMPOSANTS

function create() {
    //creation joueur
    player = game.add.sprite(initialPlayerPosition, 540, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.bounce.x = 0.5;
    player.body.collideWorldBounds = true;


    //creation monster

    game.physics.startSystem(Phaser.Physics.ARCADE);
    monster = game.add.sprite(0, 0, 'monster');
    game.physics.enable(monster, Phaser.Physics.ARCADE);
    monster.body.velocity.setTo(200,200);
    monster.body.collideWorldBounds = true;
    monster.body.bounce.set(1);
    monster.body.acceleration.setTo(600,600);


    


    //creation Ball

      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.physicsBodyType = Phaser.Physics.ARCADE;
      bullets.createMultiple(5, 'bullet');
      bullets.setAll('anchor.x', 0.5);
      bullets.setAll('anchor.y', 1);
      bullets.setAll('checkWorldBounds', true);
      bullets.setAll('outOfBoundsKill', true);

      //EXPLOSION
      explosions = game.add.group();
      explosions.createMultiple(10, 'explosion');
      explosions.setAll('anchor.x', 0.5);
      explosions.setAll('anchor.y', 0.5);
      explosions.forEach(setupExplosion, this);





         //CUSEUR DE DEPLACEMENT
      cursors = game.input.keyboard.createCursorKeys();
      fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      restartButton = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);



      livesText = game.add.text(game.world.bounds.width - 16, 16, "VIE: " + lives, style);
      livesText.anchor.set(1, 0);

      scoreText = game.add.text(game.world.centerX, 16, '', style);
      scoreText.anchor.set(0.5, 0);

      highScoreText = game.add.text(16, 16, '', style);
      highScoreText.anchor.set(0, 0);


      getHighScore();

      updateScore();


}












  function getHighScore () {
  savedHighScore = Cookies.get('highScore');
  if (savedHighScore != undefined) {
    highScore = savedHighScore;
  }
}

//mise a jour de la vie du Monstre
function updateScore () {
  if (score > highScore) {
    highScore = score;
  }
  scoreText.text = pad(score, 6);
  highScoreText.text = "High Score:" + pad(highScore, 6);
   
}


function updateLivesText () {
  livesText.text = "VIE: " + lives;
}


//mouvement du joueur
function playerMovement () {
  var maxVelocity = 500;

  if (cursors.left.isDown && player.body.velocity.x > -maxVelocity) {
    // Move to the left
    player.body.velocity.x -= 20;
  }
  else if (cursors.right.isDown && player.body.velocity.x < maxVelocity) {
    // Move to the right
    player.body.velocity.x += 20;
  }
  else {
    // Slow down
    if (player.body.velocity.x > 0) {
      player.body.velocity.x -= 4;
    }
    else if (player.body.velocity.x < 0) {
      player.body.velocity.x += 4;
    }
  }
}




//Fonction tire de ball
function fireBullet () {
  if (game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);

    if (bullet) {

      bullet.reset(player.x, player.y - 16);
      bullet.body.velocity.y = -400;
      bullet.body.velocity.x = player.body.velocity.x / 4
      bulletTime = game.time.now + 200;
    }
  }
}



function bulletHitsmonster (bullet, monster) {
  explode(monster);
  score += 10;
  updateScore(); 
}

function monsterHitsPlayer (monster, player) {
  
  explode(player);
  lives -= 1;
  updateLivesText();
  if (lives > 0) {
    respawnPlayer();
  }
  else {  
    gameOver();
  }

}


function explode (entity) {
  entity.kill();
  var explosion = explosions.getFirstExists(false);
  explosion.reset(entity.body.x + (entity.width / 2), entity.body.y + (entity.height / 2));
  explosion.play('explode', 30, false, true);
}




function setupExplosion (explosion) {
  explosion.animations.add('explode');
}



function gameOver () {

  monster.kill();
  setTimeout(function() {
    gameOverText = game.add.text(game.world.centerX, game.world.centerY, "GAME OVER", boldStyle);
    gameOverText.anchor.set(0.5, 0.5);
    restartText = game.add.text(game.world.centerX, game.world.height - 16, "PRESS 'ENTRER' POUR RECOMMENCER", style);
    restartText.anchor.set(0.5, 1);

    Cookies.set('highScore', highScore, { expires: '2078-12-31' });
  }, 1000);
}

function newMonster(){

  game.physics.startSystem(Phaser.Physics.ARCADE);
  monster = game.add.sprite(0, 0, 'monster');
  game.physics.enable(monster, Phaser.Physics.ARCADE);
  monster.body.velocity.setTo(200,200);
  monster.body.collideWorldBounds = true;
  monster.body.bounce.set(1);
  monster.body.acceleration.setTo(600,600);
}
function restartGame () {
  gameOverText.destroy();
  restartText.destroy();

  lives = 3;
  score = 0;

  respawnPlayer();
  updateScore();
  updateLivesText();
  newMonster();
  
}


function respawnPlayer () 
{
  player.body.x = initialPlayerPosition;
  setTimeout(function () {

    player.revive();

  },
   1000);
}











//UPDATE
function update () {

  playerMovement();
   // Firing?
  if (fireButton.isDown && player.alive) {
    fireBullet();
  }

  if (restartButton.isDown && lives == 0) {
    restartGame();
  }

 

  game.physics.arcade.overlap(bullets, monster, bulletHitsmonster, null, this);
  game.physics.arcade.overlap(monster, player, monsterHitsPlayer,null,this);
    
}



function render () {

   

}



//fonction button de deplacement
function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

