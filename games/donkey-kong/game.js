(function () {
    "use strict";

    var canvas = document.getElementById("game");
    var context = canvas.getContext("2d");
    var statusText = document.getElementById("game-status");
    var startButton = document.getElementById("new-game");
    var scoreText = document.getElementById("score");
    var highScoreText = document.getElementById("high-score");
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    var platformY = [510, 430, 350, 270, 190, 110];
    var ladders = [
        { lower: 0, x: 525 },
        { lower: 1, x: 120 },
        { lower: 2, x: 510 },
        { lower: 3, x: 145 },
        { lower: 4, x: 470 }
    ];
    var keys = { left: false, right: false, up: false, down: false, jump: false };
    var player;
    var barrels;
    var spawnClock;
    var score;
    var highScore = getHighScore();
    var lives;
    var state = "ready";
    var lastTime = 0;

    function getHighScore() {
        try {
            return Number(localStorage.getItem("barrel_climb_high")) || 0;
        } catch(error) {
            return 0;
        }
    }

    function updateScoreboard(saveHighScore) {
        if(score > highScore) {
            highScore = score;
        }

        if(saveHighScore) {
            try {
                localStorage.setItem("barrel_climb_high", String(highScore));
            } catch(error) {
                // The current score still works when browser storage is unavailable.
            }
        }

        scoreText.textContent = score;
        highScoreText.textContent = highScore;
    }

    function resetPlayer() {
        player = {
            x: 42,
            y: platformY[0] - 30,
            width: 22,
            height: 30,
            level: 0,
            velocityY: 0,
            onGround: true,
            climbing: false,
            invincible: 0
        };
    }

    function startGame() {
        barrels = [];
        spawnClock = 1.1;
        score = 0;
        lives = 3;
        state = "playing";
        startButton.textContent = "Restart Game";
        statusText.textContent = "Reach Pauline at the top. Watch for barrels!";
        updateScoreboard();
        resetPlayer();
    }

    function ladderNear(x, lowerLevel) {
        return ladders.find(function (ladder) {
            return ladder.lower === lowerLevel && Math.abs((x + player.width / 2) - ladder.x) < 24;
        });
    }

    function beginClimb(direction) {
        var ladder;

        if(direction < 0 && player.level < platformY.length - 1) {
            ladder = ladderNear(player.x, player.level);
            if(ladder) {
                player.x = ladder.x - player.width / 2;
                player.climbing = true;
                player.climbTarget = player.level + 1;
            }
        } else if(direction > 0 && player.level > 0) {
            ladder = ladderNear(player.x, player.level - 1);
            if(ladder) {
                player.x = ladder.x - player.width / 2;
                player.climbing = true;
                player.climbTarget = player.level - 1;
            }
        }
    }

    function updatePlayer(delta) {
        var speed = 165;
        var ground;

        if(player.invincible > 0) {
            player.invincible -= delta;
        }

        if(player.climbing) {
            if(keys.up) {
                player.y -= 120 * delta;
            }
            if(keys.down) {
                player.y += 120 * delta;
            }

            if(player.climbTarget > player.level && player.y <= platformY[player.climbTarget] - player.height) {
                player.level = player.climbTarget;
                player.y = platformY[player.level] - player.height;
                player.climbing = false;
                player.onGround = true;
                score += 150;
            } else if(player.climbTarget < player.level && player.y >= platformY[player.climbTarget] - player.height) {
                player.level = player.climbTarget;
                player.y = platformY[player.level] - player.height;
                player.climbing = false;
                player.onGround = true;
            }
            return;
        }

        if(keys.left) {
            player.x -= speed * delta;
        }
        if(keys.right) {
            player.x += speed * delta;
        }
        player.x = Math.max(16, Math.min(WIDTH - player.width - 16, player.x));

        if(keys.up && player.onGround) {
            beginClimb(-1);
        } else if(keys.down && player.onGround) {
            beginClimb(1);
        }

        if(keys.jump && player.onGround && !player.climbing) {
            player.velocityY = -310;
            player.onGround = false;
            keys.jump = false;
        }

        if(!player.onGround) {
            player.velocityY += 820 * delta;
            player.y += player.velocityY * delta;
            ground = platformY[player.level] - player.height;
            if(player.y >= ground) {
                player.y = ground;
                player.velocityY = 0;
                player.onGround = true;
            }
        }

        if(player.level === platformY.length - 1 && player.x > 530) {
            state = "won";
            score += 1000;
            updateScoreboard(true);
            statusText.textContent = "Rescue complete! Final score: " + score;
            startButton.textContent = "Play Again";
        }
    }

    function spawnBarrel() {
        barrels.push({
            x: 112,
            y: platformY[5] - 20,
            size: 20,
            level: 5,
            direction: 1,
            angle: 0
        });
    }

    function rectanglesOverlap(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    function hitPlayer() {
        lives -= 1;
        if(lives <= 0) {
            state = "lost";
            updateScoreboard(true);
            statusText.textContent = "Game over. Final score: " + score;
            startButton.textContent = "Try Again";
            return;
        }

        statusText.textContent = "Ouch! " + lives + " lives left.";
        resetPlayer();
        player.invincible = 1.5;
        barrels = [];
        spawnClock = 1.3;
    }

    function updateBarrels(delta) {
        barrels.forEach(function (barrel) {
            barrel.x += barrel.direction * (92 + score * 0.02) * delta;
            barrel.angle += barrel.direction * 5 * delta;

            if(barrel.x > WIDTH - barrel.size - 16 || barrel.x < 16) {
                if(barrel.level === 0) {
                    barrel.remove = true;
                    return;
                }

                barrel.x = Math.max(16, Math.min(WIDTH - barrel.size - 16, barrel.x));
                barrel.level -= 1;
                barrel.direction *= -1;
                barrel.y = platformY[barrel.level] - barrel.size;
            }

            if(player.invincible <= 0 && !player.climbing && barrel.level === player.level && rectanglesOverlap(player, {
                x: barrel.x,
                y: barrel.y,
                width: barrel.size,
                height: barrel.size
            })) {
                hitPlayer();
            }
        });

        barrels = barrels.filter(function (barrel) {
            return !barrel.remove;
        });
    }

    function update(delta) {
        if(state !== "playing") {
            return;
        }

        score += Math.floor(delta * 10);
        spawnClock -= delta;
        if(spawnClock <= 0) {
            spawnBarrel();
            spawnClock = Math.max(1.25, 2.5 - score / 3000);
        }

        updatePlayer(delta);

        if(state !== "playing") {
            return;
        }

        updateBarrels(delta);
    }

    function drawPlatform(y, index) {
        context.fillStyle = index % 2 ? "#f33880" : "#e72f56";
        context.fillRect(14, y, WIDTH - 28, 12);
        context.fillStyle = "#ff91bf";
        context.fillRect(14, y, WIDTH - 28, 3);
        context.strokeStyle = "#771846";
        context.lineWidth = 3;
        for(var x = 18; x < WIDTH - 35; x += 32) {
            context.beginPath();
            context.moveTo(x, y + 12);
            context.lineTo(x + 24, y);
            context.stroke();
        }
    }

    function drawLadder(ladder) {
        var top = platformY[ladder.lower + 1];
        var bottom = platformY[ladder.lower];
        context.strokeStyle = "#39e7ff";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(ladder.x - 12, top);
        context.lineTo(ladder.x - 12, bottom);
        context.moveTo(ladder.x + 12, top);
        context.lineTo(ladder.x + 12, bottom);
        context.stroke();
        context.lineWidth = 3;
        for(var y = top + 10; y < bottom; y += 14) {
            context.beginPath();
            context.moveTo(ladder.x - 12, y);
            context.lineTo(ladder.x + 12, y);
            context.stroke();
        }
    }

    function drawKong() {
        context.fillStyle = "#8b3d22";
        context.fillRect(38, 47, 62, 55);
        context.fillRect(25, 67, 18, 30);
        context.fillRect(95, 67, 18, 30);
        context.fillStyle = "#d88a50";
        context.fillRect(52, 58, 34, 25);
        context.fillStyle = "#fff";
        context.fillRect(57, 62, 7, 7);
        context.fillRect(75, 62, 7, 7);
        context.fillStyle = "#111";
        context.fillRect(60, 64, 3, 3);
        context.fillRect(78, 64, 3, 3);
    }

    function drawPauline() {
        context.fillStyle = "#ff69b4";
        context.fillRect(566, 69, 20, 32);
        context.fillStyle = "#ffd1b3";
        context.fillRect(569, 55, 14, 15);
        context.fillStyle = "#ffe94a";
        context.fillRect(566, 52, 20, 5);
    }

    function drawPlayer() {
        if(player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) {
            return;
        }
        context.fillStyle = "#f03b31";
        context.fillRect(player.x + 2, player.y, 18, 7);
        context.fillStyle = "#ffd1a8";
        context.fillRect(player.x + 6, player.y + 7, 12, 8);
        context.fillStyle = "#46a6ff";
        context.fillRect(player.x + 3, player.y + 15, 17, 10);
        context.fillStyle = "#f4e157";
        context.fillRect(player.x + 2, player.y + 25, 8, 5);
        context.fillRect(player.x + 13, player.y + 25, 8, 5);
    }

    function drawBarrel(barrel) {
        context.save();
        context.translate(barrel.x + barrel.size / 2, barrel.y + barrel.size / 2);
        context.rotate(barrel.angle);
        context.fillStyle = "#d86b23";
        context.beginPath();
        context.arc(0, 0, barrel.size / 2, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#ffe04a";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(-7, -5);
        context.lineTo(7, 5);
        context.moveTo(-7, 5);
        context.lineTo(7, -5);
        context.stroke();
        context.restore();
    }

    function drawOverlay(title, message) {
        context.fillStyle = "rgba(0, 0, 12, 0.78)";
        context.fillRect(75, 205, WIDTH - 150, 135);
        context.strokeStyle = "#39e7ff";
        context.lineWidth = 4;
        context.strokeRect(75, 205, WIDTH - 150, 135);
        context.fillStyle = "#ffe94a";
        context.font = "bold 30px monospace";
        context.textAlign = "center";
        context.fillText(title, WIDTH / 2, 258);
        context.fillStyle = "#fff";
        context.font = "bold 16px monospace";
        context.fillText(message, WIDTH / 2, 299);
        context.textAlign = "left";
    }

    function draw() {
        var gradient = context.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, "#11052f");
        gradient.addColorStop(1, "#02020a");
        context.fillStyle = gradient;
        context.fillRect(0, 0, WIDTH, HEIGHT);

        context.fillStyle = "rgba(92, 211, 255, 0.35)";
        for(var i = 0; i < 34; i += 1) {
            context.fillRect((i * 83) % WIDTH, (i * 47) % HEIGHT, 2, 2);
        }

        ladders.forEach(drawLadder);
        platformY.forEach(drawPlatform);
        drawKong();
        drawPauline();
        barrels.forEach(drawBarrel);
        drawPlayer();

        context.fillStyle = "#fff";
        context.font = "bold 17px monospace";
        context.fillText("SCORE " + String(score).padStart(5, "0"), 18, 27);
        context.fillText("LIVES " + lives, WIDTH - 105, 27);
        updateScoreboard();

        if(state === "ready") {
            drawOverlay("BARREL CLIMB", "Press Start Game");
        } else if(state === "won") {
            drawOverlay("RESCUED!", "Score " + score);
        } else if(state === "lost") {
            drawOverlay("GAME OVER", "Press Try Again");
        }
    }

    function loop(time) {
        var delta = Math.min((time - lastTime) / 1000, 0.034) || 0;
        lastTime = time;
        update(delta);
        draw();
        window.requestAnimationFrame(loop);
    }

    function setAction(action, active) {
        keys[action] = active;
    }

    var keyActions = {
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        " ": "jump"
    };

    document.addEventListener("keydown", function (event) {
        var action = keyActions[event.key.toLowerCase()];
        if(action) {
            event.preventDefault();
            setAction(action, true);
        }
    });

    document.addEventListener("keyup", function (event) {
        var action = keyActions[event.key.toLowerCase()];
        if(action) {
            event.preventDefault();
            setAction(action, false);
        }
    });

    document.querySelectorAll("[data-action]").forEach(function (button) {
        var action = button.dataset.action;
        button.addEventListener("pointerdown", function (event) {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            setAction(action, true);
        });
        ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (eventName) {
            button.addEventListener(eventName, function () {
                setAction(action, false);
            });
        });
    });

    startButton.addEventListener("click", startGame);
    resetPlayer();
    barrels = [];
    score = 0;
    lives = 3;
    updateScoreboard();
    window.requestAnimationFrame(loop);
}());
