var config = {
    'width': 950,
    'height': 500,
    'renderer': Phaser.AUTO,
    'parent': 'space-game',
    'resolution': window.devicePixelRatio,
    'state': {
    	'preload': preload,
    	'create': create,
    	'update': update
    }
};

var game = new Phaser.Game(config);

WebFontConfig = {
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Bungee']
    }
};

function preload() {
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.spritesheet('my-ship-animate', 'images/ship-pink-flames.png', 234, 148, 4);
    game.load.spritesheet('ship2-animate', 'images/ship-blue-flames.png', 234, 148, 4);
    game.load.spritesheet('ship3-animate', 'images/ship-green-flames.png', 234, 148, 4);
    game.load.spritesheet('buttons', 'images/buttons.png', 512, 164, 4);
    game.load.spritesheet('square-buttons', 'images/square-buttons.png', 110, 110, 2);
    game.load.spritesheet('replay', 'images/replay.png', 164, 164, 2);
    game.load.image('sydney', 'images/sydney.png');
    game.load.image('stage', 'images/stage.png');
    game.load.image('overlay', 'images/overlay.png');
    game.load.image('results-bg', 'images/results-bg.png');
    game.load.image('first-place', 'images/1st-place.png');
    game.load.image('second-place', 'images/2nd-place.png');
    game.load.image('third-place', 'images/3rd-place.png');
    game.load.image('title', 'images/title.png');
    game.load.image('circle', 'images/circle.png');
    game.load.image('swirl', 'images/swirl.png');
    game.load.image('about', 'images/about.jpg');
    game.load.image('pointer', 'images/pointer.png');
    game.load.audio('main-theme', 'audio/Sydneys-Space-Racer-main-theme.mp3');
    game.load.audio('countdown', 'audio/Sydneys-Space-Racer-countdown.mp3');
    game.load.audio('finish', 'audio/Sydneys-Space-Racer-finish.mp3');
    game.load.audio('touch', 'audio/Sydneys-Space-Racer-touch.mp3');
}

var stage;
var myShip;
var sydney;
var circleTip;
var readyText;
var myRank, player2rank, player3rank;
var playerScores = [];
var player1finished = false;
var player2finished = false;
var player3finished = false;
var ship2Text, ship3Text;
var overlay;
var startBg;
var startButton, aboutButton, homeButton, replayButton;
var resultsOverlay;
var myPosition = 0;
var racer2Position = 0;
var racer3Position = 0;
var firstPlace, secondPlace, thirdPlace;
var player1Ship, player2Ship, player3Ship;
var shipGrow, shipShrink;
var timer, timerText, countdownText;
var finishLine;
var finalShipGrow, finalShipShrink;
var showPointer = true;
var gameOver = false;
var gameSeconds;
var countdown = 3;
var music;
var swirl;
var aboutScreen;
var pointer;
var invisibleButton;
var touchFX;
var countdownFX;
var finishMusic;


function create() {
    //game.renderer.renderSession.roundPixels = true;

    game.world.setBounds(0, 0, 2000, 500);

	// enable physics
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.stage.backgroundColor = '#15152d';

    stage = game.add.sprite(0, 0, 'stage');
    stage.width = 2000;
    stage.height = 500;

    // create timer
    timer = game.time.create(false);
    timer.loop(Phaser.Timer.SECOND, updateCounter, this);

    playThemeMusic();

    circleTip = game.add.sprite(90, 280, 'circle');
    circleTip.inputEnabled = true;
    circleTip.width = 100;
    circleTip.height = 100;
    circleTip.anchor.setTo(0.5, 0.5);
    circleTip.alpha = 0;
    game.add.tween(circleTip).to( { alpha: 0.4 }, 500, Phaser.Easing.Linear.In, true, 0, -1, true);

    // Sydney's ship
    myShip = game.add.sprite(80, 280, 'my-ship-animate');
    myShip.width = 117;
    myShip.height = 74;
    myShip.anchor.setTo(0.5, 0.5);
    game.physics.enable(myShip, Phaser.Physics.ARCADE);

    // curosr hint if you wait too long
    pointer = game.add.sprite(110, 320, 'pointer');
    pointer.inputEnabled = true;
    pointer.width = 37;
    pointer.height = 64;
    pointer.anchor.setTo(0.5, 0.5);
    pointer.alpha = 0;
    game.add.tween(pointer.scale).to( { x: 0.6, y: 0.6 }, 200, Phaser.Easing.Linear.In, true, 3000, -1, true);
    pointer.events.onInputDown.add(removePointer, this);
    
    // blue ship
    ship2 = game.add.sprite(80, 148, 'ship2-animate');
    ship2.anchor.setTo(0.5, 0.5);
    ship2.width = 117;
    ship2.height = 74;
    game.physics.enable(ship2, Phaser.Physics.ARCADE);

    // green ship
    ship3 = game.add.sprite(80, 414, 'ship3-animate');
    ship3.anchor.setTo(0.5, 0.5);
    ship3.width = 117;
    ship3.height = 74;
    game.physics.enable(ship3, Phaser.Physics.ARCADE);

    // click animation
    // to: function ( properties, duration, ease, autoStart, delay, repeat, yoyo);
    shipGrow = game.add.tween(myShip.scale).to( { x: 0.55, y: 0.55 }, 75, Phaser.Easing.Linear.In, false, 0);
    shipShrink = game.add.tween(myShip.scale).to( { x: 0.5, y: 0.5 }, 200, Phaser.Easing.Linear.In, false, 0);
    shipGrow.chain(shipShrink);

    overlay = game.add.sprite(0, 0, 'overlay');
    overlay.width = game.world.width;
    overlay.height = game.world.height;
    overlay.alpha = 0.3;

    startScreen();

    game.camera.follow(myShip);

    // Animate AI flames
    var ship2flames = ship2.animations.add('ship2flames', [1,2,3], 8, true);
    var ship3flames = ship3.animations.add('ship3flames', [1,2,3], 8, true);
}

function removePointer() {
    showPointer = false;
    pointer.destroy();
}

function playThemeMusic() {
    // add music
    music = game.add.audio('main-theme');
    music.volume = 0.8;
    music.loop = true;
    music.play();
}

function startScreen() {
    startBg = game.add.sprite(0, 0, 'title');
    startBg.width = stage.width/2;
    startBg.height = stage.height;
    startBg.smoothed = false;
    sydney = game.add.sprite(-10, 60, 'sydney');
    sydney.width = 222;
    sydney.height = 219;
    game.add.tween(sydney).to( { y: 70 }, 300, Phaser.Easing.Linear.Out, true, 0, -1, true);

    //button = game.add.button(game.world.centerX - 95, game.world.centerY, 'button', actionOnClick, this, 'over', 'out', 'down');
    aboutButton = game.add.button(235, 189, 'buttons', aboutClick, this, 3, 2, 3);
    aboutButton.width = 256;
    aboutButton.height = 82;
    startButton = game.add.button(511, 189, 'buttons', startGame, this, 1, 0, 1);
    startButton.width = 256;
    startButton.height = 82;
}

function resultsScreen() {
    finishMusic = game.add.audio('finish');
    finishMusic.volume = 0.8;
    finishMusic.play();

    resultsOverlay = game.add.sprite(0, 0, 'results-bg');
    resultsOverlay.width = 1000;
    resultsOverlay.height = 500;
    resultsOverlay.fixedToCamera = true;
    homeButton = game.add.button(20, 20, 'square-buttons', goHome, this, 1, 0, 1);
    homeButton.width = 55;
    homeButton.height = 55;
    thirdPlace = game.add.sprite(173, 500, 'third-place');
    thirdPlace.width = 185;
    thirdPlace.height = 229;
    firstPlace = game.add.sprite(382, 500, 'first-place');
    firstPlace.width = 185;
    firstPlace.height = 319;
    secondPlace = game.add.sprite(592, 500, 'second-place');
    secondPlace.width = 185;
    secondPlace.height = 274;
    replayButton = game.add.button(890, 62, 'replay', replayGame, this, 1, 0, 1);
    replayButton.width = 82;
    replayButton.height = 82;
    replayButton.anchor.setTo(0.5, 0.5);

    // to: function ( properties, duration, ease, autoStart, delay, repeat, yoyo);
    game.add.tween(firstPlace).to( { y: 181 }, 1000, Phaser.Easing.Cubic.Out, true, 0);
    game.add.tween(secondPlace).to( { y: 226 }, 1000, Phaser.Easing.Cubic.Out, true, 300);
    game.add.tween(thirdPlace).to( { y: 271 }, 1000, Phaser.Easing.Cubic.Out, true, 600);
    

    // Player1 first, second, or 3rd place
    if (playerScores[0].name === 'Player1') {
        swirl = game.add.sprite(472, 590, 'swirl');
        player1Ship = game.add.sprite(460, 570, 'my-ship-animate');
        game.add.tween(swirl).to( { y: 120 }, 1000, Phaser.Easing.Cubic.Out, true, 0);
        game.add.tween(player1Ship).to( { y: 120 }, 1000, Phaser.Easing.Cubic.Out, true, 0);
    } else if (playerScores[1].name === 'Player1') {
        swirl = game.add.sprite(683, 590, 'swirl');
        player1Ship = game.add.sprite(673, 570, 'my-ship-animate');
        game.add.tween(swirl).to( { y: 165 }, 1000, Phaser.Easing.Cubic.Out, true, 300);
        game.add.tween(player1Ship).to( { y: 165 }, 1000, Phaser.Easing.Cubic.Out, true, 300);
    } else {
        swirl = game.add.sprite(262, 590, 'swirl');
        player1Ship = game.add.sprite(252, 570, 'my-ship-animate');
        game.add.tween(swirl).to( { y: 212 }, 1000, Phaser.Easing.Cubic.Out, true, 600);
        game.add.tween(player1Ship).to( { y: 212 }, 1000, Phaser.Easing.Cubic.Out, true, 600);
    }

    // Player2 first, second, or 3rd place
    if (playerScores[0].name === 'Player2') {
        player2Ship = game.add.sprite(460, 570, 'ship2-animate');
        game.add.tween(player2Ship).to( { y: 120 }, 1000, Phaser.Easing.Cubic.Out, true, 0);
    } else if (playerScores[1].name === 'Player2') {
        player2Ship = game.add.sprite(673, 570, 'ship2-animate');
        game.add.tween(player2Ship).to( { y: 165 }, 1000, Phaser.Easing.Cubic.Out, true, 300);
    } else {
        player2Ship = game.add.sprite(252, 570, 'ship2-animate');
        game.add.tween(player2Ship).to( { y: 212 }, 1000, Phaser.Easing.Cubic.Out, true, 600);
    }

    // Player3 first, second, or 3rd place
    if (playerScores[0].name === 'Player3') {
        player3Ship = game.add.sprite(460, 570, 'ship3-animate');
        game.add.tween(player3Ship).to( { y: 120 }, 1000, Phaser.Easing.Cubic.Out, true, 0);
    } else if (playerScores[1].name === 'Player3') {
        player3Ship = game.add.sprite(673, 570, 'ship3-animate');
        game.add.tween(player3Ship).to( { y: 165 }, 1000, Phaser.Easing.Cubic.Out, true, 300);
    } else {
        player3Ship = game.add.sprite(252, 570, 'ship3-animate');
        game.add.tween(player3Ship).to( { y: 212 }, 1000, Phaser.Easing.Cubic.Out, true, 600);
    }

    swirl.width = 190;
    swirl.height = 190;
    swirl.anchor.setTo(0.5, 0.5);

    player1Ship.width = 117;
    player1Ship.height = 74;
    player1Ship.anchor.setTo(0.5, 0.5);

    // ship bounce
    game.add.tween(player1Ship.scale).to( { x: 0.6, y: 0.6 }, 300, Phaser.Easing.Linear.In, true, 0, -1, true);

    player2Ship.width = 117;
    player2Ship.height = 74;
    player2Ship.anchor.setTo(0.5, 0.5);

    player3Ship.width = 117;
    player3Ship.height = 74;
    player3Ship.anchor.setTo(0.5, 0.5);
}

function listener () {
    circleTip.kill();
    myShip.body.velocity.x += 100;
    shipGrow.start();

    if (showPointer === true) {
        pointer.destroy();
    }

    touchFX = game.add.audio('touch');
    touchFX.volume = 0.8;
    touchFX.play();

    // theSpritesheet.animation.add('name', frames, fps, loop);
    var flames = myShip.animations.add('flames', [1,2,3], 8, true);
    myShip.animations.play('flames');
}

function startGame() {    
    // TODO: group these
    startBg.kill();
    startButton.kill();
    aboutButton.kill();
    sydney.kill();

    circleTip.reset(90, 280);
    circleTip.anchor.setTo(0.5, 0.5);

    overlay.reset(0, 0);

    readyText = game.add.text(480, game.world.centerY, '3', { font:'250px Bungee, Arial Bold, sans-serif', fill:'#fff', align: 'center' });
    readyText.anchor.set(0.5);
    readyText.fixedToCamera = true;

    countdownFX = game.add.audio('countdown');
    countdownFX.volume = 0.4;
    countdownFX.play();

    if (showPointer === true) {
        game.add.tween(pointer).to( { alpha: 1 }, 300, Phaser.Easing.Linear.In, true, 5000, 0, false);
    }

    if (timer.paused === true) {
        timer.resume();
        countdown = 3;
        readyText.setText(countdown);
    } else {
        timer.start();
    }

}

function replayGame() {
    resetGame();
    startGame();
}

function goHome() {
    resetGame();
    startScreen();
}

function goBack() {
    startButton.reset(511, 189);
    aboutButton.reset(235, 189);
    aboutScreen.kill();
    homeButton.kill();
}

function aboutClick() {    
    // TODO: group these
    startButton.kill();
    aboutButton.kill();
    aboutScreen = game.add.sprite(0, 0, 'about');
    aboutScreen.width = 950;
    aboutScreen.height = 500;
    homeButton = game.add.button(20, 20, 'square-buttons', goBack, this, 1, 0, 1);
    homeButton.width = 55;
    homeButton.height = 55;
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateCounter() {
    countdown--;

    if (countdown === 0) {
        readyText.setText('Go!');
        gameOver = false;
        
        myShip.inputEnabled = true;
        myShip.events.onInputDown.add(listener, this);
        ship2.body.velocity.x = randomNum(200, 350);
        ship3.body.velocity.x = randomNum(200, 350);
        overlay.kill();
        
    } else if (countdown === -1) {
        game.add.tween(readyText).to( { alpha: 0 }, 400, Phaser.Easing.Linear.In, true);
        
    } else if (countdown === -2) {
        timer.pause();
    }
     else {
        readyText.setText(countdown);
    }
}

function gameOverStuff() {
    myShip.animations.stop(null, true);
    myShip.frame = 0;
    myShip.body.velocity.x = 0;
    myShip.x = 80;

    ship2.animations.stop(null, true);
    ship2.frame = 0;
    ship2.body.velocity.x = 0;
    ship2.x = 80;

    ship3.animations.stop(null, true);
    ship3.frame = 0;
    ship3.body.velocity.x = 0;
    ship3.x = 80;

    music.destroy();

    resultsScreen();
}

function resetGame() {
    // remove trophy screen
    resultsOverlay.kill();
    homeButton.kill();
    replayButton.kill();
    swirl.kill();
    firstPlace.kill();
    secondPlace.kill();
    thirdPlace.kill();
    playerScores = [];
    myShip.inputEnabled = false;
    player1Ship.kill();
    player2Ship.kill();
    player3Ship.kill();
    player1finished = false;
    player2finished = false;
    player3finished = false;
    playThemeMusic();
}

function update() {
    // slow down the ship
	if (myShip.body.velocity.x > 0) {
		myShip.body.velocity.x -= 2;
	}

    // stop flame animation
    if (myShip.body.velocity.x < 30) {
        myShip.animations.stop(null, true);
        myShip.frame = 0;
    }

    if (ship2.body.velocity.x > 0) {
        ship2.animations.play('ship2flames');
    }

    if (ship3.body.velocity.x > 0) {
        ship3.animations.play('ship3flames');
    }

    // end race
    if (gameOver === false) {
        finishLine = stage.width - 25;
        gameSeconds = game.time.totalElapsedSeconds();
        
        if (player1finished === false && myShip.body.x > finishLine) {
            playerScores.push({name: 'Player1', time: gameSeconds});
            player1finished = true;
        }

        if (player2finished === false && ship2.body.x > finishLine) {
            playerScores.push({name: 'Player2', time: gameSeconds});
            player2finished = true;
        }

        if (player3finished === false && ship3.body.x > finishLine) {
            playerScores.push({name: 'Player3', time: gameSeconds});
            player3finished = true;
        }

        if (player1finished && player2finished && player3finished) {
            gameOver = true;
            gameOverStuff();
        }

    } // if not gameOver

    if (gameOver === true) {
        // spin swirl
        swirl.angle += 1;
    }
}