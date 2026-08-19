const ui = {
    arcadeCabinet: document.getElementById("arcade-cabinet"),
    arcadeOverlay: document.getElementById("arcade-overlay"),
    attempts: document.getElementById("attempts"),
    cabinetGame: document.getElementById("cabinet-game"),
    cabinetGameFrame: document.getElementById("cabinet-game-frame"),
    cabinetGameTitle: document.getElementById("cabinet-game-title"),
    clue: document.getElementById("clue"),
    closeArcadeButton: document.getElementById("close-arcade"),
    closeCabinetGameButton: document.getElementById("close-cabinet-game"),
    closeGameListButton: document.getElementById("close-game-list"),
    coinButton: document.getElementById("coin-btn"),
    flawlessSound: document.getElementById("flawless"),
    fullscreenButton: document.getElementById("fullscreen-game"),
    gameFallbackLink: document.getElementById("game-fallback-link"),
    gameList: document.getElementById("game-list"),
    gameListDialog: document.getElementById("game-list-dialog"),
    gameLoading: document.getElementById("game-loading"),
    gameStatus: document.getElementById("game-load-status"),
    guessButton: document.getElementById("guess-btn"),
    guessInput: document.getElementById("guess"),
    quiz: document.getElementById("quiz"),
    result: document.getElementById("result"),
    retry: document.getElementById("retry"),
    score: document.getElementById("score"),
    showGameListButton: document.getElementById("show-game-list"),
    soundButton: document.getElementById("sound-toggle"),
    timer: document.getElementById("timer"),
    vaultButton: document.getElementById("vault-btn"),
    vaultPanel: document.querySelector("div.vault-overlay-panel")
};

ui.vaultButton.onclick = enterVault;
ui.coinButton.onclick = insertCoin;
ui.closeArcadeButton.onclick = closeArcade;
ui.closeCabinetGameButton.onclick = closeCabinetGame;
ui.soundButton.onclick = toggleSound;
ui.fullscreenButton.onclick = toggleGameFullscreen;
ui.cabinetGameFrame.addEventListener("load", handleGameLoaded);
document.addEventListener("fullscreenchange", updateFullscreenButton);

document.querySelectorAll("a.game-launch").forEach(function(gameLink) {
    gameLink.addEventListener("click", openCabinetGame);
});

ui.arcadeOverlay.onclick = function(event) {
    if(event.target === event.currentTarget) {
        closeArcade();
    }
};

document.addEventListener("keydown", handleArcadeKeys);

ui.guessInput.onkeydown = function(event) {
    if(event.key === "Enter") {
        checkGuess();
    }
};

ui.guessInput.onfocus = startTimer;
ui.guessButton.onclick = checkGuess;
ui.showGameListButton.onclick = openGameList;
ui.closeGameListButton.onclick = closeGameList;

// Trivia facts were checked against each game's English Wikipedia article:
// https://en.wikipedia.org/wiki/Category:Video_games_by_genre
const games = [
    {
        name: "Donkey Kong",
        answers: ["Donkey Kong", "DK"],
        clue: "Guide Mario up a construction site, jumping barrels and other hazards to rescue Pauline from Donkey Kong."
    },
    {
        name: "Mortal Kombat",
        answers: ["Mortal Kombat", "MK"],
        clue: "Choose from seven fighters and enter Shang Tsung's tournament, using special moves and finishing attacks."
    },
    {
        name: "Pac-Man",
        answers: ["Pac-Man", "Pacman"],
        clue: "Clear every dot from a maze while avoiding ghosts; power pellets briefly let you turn and chase them."
    },
    {
        name: "Space Invaders",
        answers: ["Space Invaders"],
        clue: "Move a laser cannon across the bottom of the screen and destroy descending alien rows before they land."
    },
    {
        name: "Tetris",
        answers: ["Tetris"],
        clue: "Rotate and arrange seven kinds of falling blocks to complete lines before the playfield fills."
    },
    {
        name: "Super Mario Bros.",
        answers: ["Super Mario Bros", "Super Mario Brothers", "Mario"],
        clue: "Run through the Mushroom Kingdom, break blocks, enter pipes, and rescue Princess Toadstool from Bowser."
    },
    {
        name: "The Legend of Zelda",
        answers: ["The Legend of Zelda", "Legend of Zelda", "Zelda"],
        clue: "Explore Hyrule as Link, search dangerous dungeons, and recover the eight pieces of the Triforce of Wisdom."
    },
    {
        name: "Sonic the Hedgehog",
        answers: ["Sonic the Hedgehog", "Sonic"],
        clue: "Build momentum through fast platforming zones, collect rings, free trapped animals, and defeat Dr. Robotnik."
    },
    {
        name: "Street Fighter",
        answers: ["Street Fighter", "SF1", "Street Fighter 1", "Street Fighter I"],
        clue: "Control Ryu in a worldwide martial-arts tournament—or Ken in two-player mode—and fight with six attack buttons."
    },
    {
        name: "Galaxian",
        answers: ["Galaxian"],
        clue: "Pilot the Galaxip against alien formations whose enemies break away and dive toward your ship."
    },
    {
        name: "Asteroids",
        answers: ["Asteroids"],
        clue: "Rotate and thrust a small ship through open space, breaking large drifting rocks into dangerous smaller pieces."
    },
    {
        name: "Frogger",
        answers: ["Frogger"],
        clue: "Guide a frog through moving traffic, then ride logs and turtles across a river to reach home."
    },
    {
        name: "Centipede",
        answers: ["Centipede"],
        clue: "Use a trackball to move the Bug Blaster through a mushroom field while a segmented centipede descends."
    },
    {
        name: "R.C. Pro-Am",
        answers: ["R.C. Pro-Am", "RC Pro Am", "RC ProAm"],
        clue: "Race a radio-controlled car from an overhead view across 32 tracks while collecting upgrades and weapons."
    },
    {
        name: "Q*bert",
        answers: ["Q*bert", "Qbert", "Q Bert"],
        clue: "Hop across a pyramid to change every cube's color while dodging Coily and other unusual enemies."
    },
    {
        name: "Dig Dug",
        answers: ["Dig Dug"],
        clue: "Dig your own underground paths and defeat Pookas and Fygars with an air pump or falling rocks."
    },
    {
        name: "Pong",
        answers: ["Pong"],
        clue: "Move a vertical paddle and return a bouncing square ball past your opponent to score points."
    },
    {
        name: "Duck Hunt",
        answers: ["Duck Hunt"],
        clue: "Use the NES Zapper to hit enough ducks in each round while a hunting dog retrieves kills and laughs at misses."
    },
    {
        name: "Double Dragon",
        answers: ["Double Dragon"],
        clue: "Fight through the Black Warriors as martial artists Billy and Jimmy Lee, using hand-to-hand attacks and weapons."
    },
    {
        name: "R-Type",
        answers: ["R-Type", "R Type", "RType"],
        clue: "Pilot the R-9A Arrowhead and attach or launch a powerful Force pod while battling the Bydo Empire."
    },
    {
        name: "Metroid",
        answers: ["Metroid"],
        clue: "Explore the connected caverns of planet Zebes as Samus Aran, finding upgrades that open new paths."
    },
    {
        name: "Castlevania",
        answers: ["Castlevania"],
        clue: "Guide Simon Belmont through Dracula's castle with a whip, holy water, axes, and other sub-weapons."
    },
    {
        name: "Final Fantasy",
        answers: ["Final Fantasy", "Final Fantasy 1", "Final Fantasy I", "FF1"],
        clue: "Create a party of four Warriors of Light, restore the elemental crystals, and battle in turn-based combat."
    },
    {
        name: "Contra",
        answers: ["Contra"],
        clue: "Run and fire through enemy bases alone or with a second player while collecting stronger weapon upgrades."
    },
    {
        name: "Rod Land",
        answers: ["Rod Land", "RodLand"],
        clue: "Climb ladders and use a magic wand to catch enemies, then slam them overhead to clear each single-screen stage."
    },
    {
        name: "Pokémon Red and Blue",
        answers: ["Pokemon Red and Blue", "Pokemon Red Blue", "Pokemon Red", "Pokemon Blue", "Pokemon"],
        clue: "Explore Kanto as a Pokémon Trainer, complete the Pokédex, earn eight Gym Badges, and challenge the Elite Four."
    },
    {
        name: "Chrono Trigger",
        answers: ["Chrono Trigger"],
        clue: "Travel between different eras with Crono's party and use combination techniques to stop the creature Lavos."
    },
    {
        name: "Doom",
        answers: ["Doom"],
        clue: "Explore maze-like bases from a first-person view, find keycards, and fight demons with an expanding arsenal."
    },
    {
        name: "GoldenEye 007",
        answers: ["GoldenEye 007", "Goldeneye", "Golden Eye 007", "Golden Eye"],
        clue: "Guide James Bond through objective-based missions that add extra goals at higher difficulties, or play split-screen multiplayer."
    },
    {
        name: "Hammerin' Harry",
        answers: ["Hammerin' Harry", "Hammerin Harry", "Hammering Harry"],
        clue: "Swing a giant hammer at enemies and obstacles while a heroic carpenter fights through construction-themed stages."
    }
];

let currentGame;
let timer = null;
let powerOnTimer = null;
let screenFlickerTimer = null;
let screenFlickerEndTimer = null;
let gameLoadTimer = null;
let lastFocusedElement = null;
let cabinetGameLastFocus = null;
let soundsEnabled = true;
let score = 0;
let attemptsLeft;
let timeLeft;
let correctStreak = 0;
let answerBankUsed = false;

function openGameList() {
    answerBankUsed = true;
    ui.showGameListButton.textContent = "Answer Bank Used (Round Worth 1 Point)";

    if(ui.gameList.children.length === 0) {
        games.forEach(function(game) {
            const gameListItem = document.createElement("li");

            gameListItem.textContent = game.name;
            ui.gameList.appendChild(gameListItem);
        });
    }

    if(typeof ui.gameListDialog.showModal === "function") {
        ui.gameListDialog.showModal();
        ui.closeGameListButton.focus();
    } else {
        ui.gameListDialog.setAttribute("open", "");
    }
}

function closeGameList() {
    if(ui.gameListDialog.open && typeof ui.gameListDialog.close === "function") {
        ui.gameListDialog.close();
    } else {
        ui.gameListDialog.removeAttribute("open");
    }

    ui.showGameListButton.focus({ preventScroll: true });
}

function enterVault(event) {
    const destination = document.querySelector(event.currentTarget.getAttribute("href"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    event.preventDefault();
    playSound("vault-sound");

    if(destination) {
        destination.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
}

function openCabinetGame(event) {
    const gameLink = event.currentTarget;

    event.preventDefault();
    cabinetGameLastFocus = gameLink;
    clearInterval(timer);
    timer = null;
    clearTimeout(screenFlickerTimer);
    clearTimeout(screenFlickerEndTimer);
    ui.quiz.classList.remove("screen-flicker");
    ui.quiz.hidden = true;
    ui.cabinetGameTitle.textContent = gameLink.dataset.gameTitle;
    ui.cabinetGameFrame.title = gameLink.dataset.gameTitle + " game";
    ui.gameFallbackLink.href = gameLink.href;
    ui.gameStatus.textContent = "Loading";
    ui.gameLoading.hidden = false;
    ui.cabinetGameFrame.src = gameLink.href;
    ui.cabinetGame.hidden = false;
    ui.arcadeCabinet.classList.add("playing-game");
    ui.vaultPanel.classList.add("game-active");
    ui.closeCabinetGameButton.focus({ preventScroll: true });

    clearTimeout(gameLoadTimer);
    gameLoadTimer = window.setTimeout(function() {
        if(!ui.cabinetGame.hidden && !ui.gameLoading.hidden) {
            ui.gameStatus.textContent = "Still loading";
            ui.gameLoading.querySelector("p").textContent = "This game is taking longer than expected.";
        }
    }, 6000);
}

function handleGameLoaded() {
    if(ui.cabinetGame.hidden) {
        return;
    }

    clearTimeout(gameLoadTimer);
    ui.gameLoading.hidden = true;
    ui.gameLoading.querySelector("p").textContent = "Loading game...";
    ui.gameStatus.textContent = "Ready";
}

function closeCabinetGame(restoreFocus = true) {
    if(ui.cabinetGame.hidden) {
        return;
    }

    ui.cabinetGame.hidden = true;
    clearTimeout(gameLoadTimer);

    if(document.fullscreenElement === ui.cabinetGame) {
        document.exitFullscreen().catch(function() {});
    }

    ui.cabinetGameFrame.src = "about:blank";
    ui.arcadeCabinet.classList.remove("playing-game");
    ui.vaultPanel.classList.remove("game-active");
    ui.quiz.hidden = false;

    if(!ui.arcadeOverlay.hidden) {
        scheduleScreenFlicker();
    }

    if(restoreFocus && cabinetGameLastFocus instanceof HTMLElement) {
        cabinetGameLastFocus.focus({ preventScroll: true });
    }
}

function toggleSound() {
    soundsEnabled = !soundsEnabled;
    ui.soundButton.setAttribute("aria-pressed", String(soundsEnabled));
    ui.soundButton.textContent = soundsEnabled ? "Sound: On" : "Sound: Off";

    document.querySelectorAll("audio").forEach(function(sound) {
        sound.muted = !soundsEnabled;
    });
}

function toggleGameFullscreen() {
    if(document.fullscreenElement) {
        document.exitFullscreen().catch(function() {});
        return;
    }

    if(ui.cabinetGame.requestFullscreen) {
        ui.cabinetGame.requestFullscreen().catch(function() {
            ui.gameStatus.textContent = "Full screen unavailable";
        });
    }
}

function updateFullscreenButton() {
    ui.fullscreenButton.textContent = document.fullscreenElement ? "Exit Full Screen" : "Full Screen";
}

function insertCoin() {
    if(!ui.arcadeOverlay.hidden) {
        return;
    }

    playSound("coin-sound");
    ui.coinButton.setAttribute("aria-expanded", "true");
    powerOnArcade();
}

function powerOnArcade() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    lastFocusedElement = document.activeElement;
    ui.arcadeCabinet.classList.remove("powering-on", "powered-on");
    ui.arcadeOverlay.hidden = false;
    ui.vaultPanel.scrollTop = 0;
    document.body.classList.add("arcade-open");
    ui.closeArcadeButton.focus({ preventScroll: true });

    if(reduceMotion) {
        ui.arcadeCabinet.classList.add("powered-on");
        return;
    }

    ui.arcadeCabinet.classList.add("powering-on");

    clearTimeout(powerOnTimer);
    powerOnTimer = window.setTimeout(function() {
        ui.arcadeCabinet.classList.remove("powering-on");
        ui.arcadeCabinet.classList.add("powered-on");
        scheduleScreenFlicker();
    }, 900);
}

function closeArcade() {
    if(ui.arcadeOverlay.hidden) {
        return;
    }

    ui.arcadeOverlay.hidden = true;
    closeCabinetGame(false);
    ui.arcadeCabinet.classList.remove("powering-on", "powered-on");
    ui.quiz.classList.remove("screen-flicker");
    document.body.classList.remove("arcade-open");
    ui.coinButton.setAttribute("aria-expanded", "false");
    clearTimeout(powerOnTimer);
    clearTimeout(screenFlickerTimer);
    clearTimeout(screenFlickerEndTimer);
    clearInterval(timer);
    timer = null;

    if(lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({ preventScroll: true });
    }
}

function handleArcadeKeys(event) {
    if(ui.arcadeOverlay.hidden) {
        return;
    }

    if(ui.gameListDialog.open) {
        if(event.key === "Escape") {
            event.preventDefault();
            closeGameList();
        }

        return;
    }

    if(event.key === "Escape") {
        if(!ui.cabinetGame.hidden) {
            closeCabinetGame();
        } else {
            closeArcade();
        }
        return;
    }

    if(event.key !== "Tab") {
        return;
    }

    const focusableControls = Array.from(
        ui.arcadeOverlay.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), iframe")
    ).filter(function(control) {
        return !control.closest("[hidden]") && control.getClientRects().length > 0;
    });
    const firstControl = focusableControls[0];
    const lastControl = focusableControls[focusableControls.length - 1];

    if(event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
    } else if(!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
    }
}

function scheduleScreenFlicker() {
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const delay = 3500 + Math.random() * 4000;

    clearTimeout(screenFlickerTimer);
    screenFlickerTimer = window.setTimeout(triggerScreenFlicker, delay);
}

function triggerScreenFlicker() {
    if(ui.arcadeOverlay.hidden || ui.quiz.hidden) {
        return;
    }

    ui.quiz.classList.add("screen-flicker");

    clearTimeout(screenFlickerEndTimer);
    screenFlickerEndTimer = window.setTimeout(function() {
        ui.quiz.classList.remove("screen-flicker");

        if(!ui.arcadeOverlay.hidden) {
            scheduleScreenFlicker();
        }
    }, 160);
}

function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .replace(/[\s.\-'’*]/g, "");
}

function updateScore() {
    ui.score.textContent = "Score: " + score;
    ui.attempts.textContent = "Attempts Left: " + attemptsLeft;
    ui.timer.textContent = "Time Left: " + timeLeft + " seconds";
}

function checkForFlawlessWin() {
    if(correctStreak === 4) {
        ui.flawlessSound.addEventListener(
            "ended",
            resetGame,
            { once: true }
        );

        playSound("flawless");
        ui.result.textContent = "Flawless! Four correct answers in a row!";
        return true;
    }

    return false;
}

function startTimer() {
    if(timer !== null) {
        return;
    }

    updateScore();

    timer = setInterval(function() {
        timeLeft -= 1;
        updateScore();

        if(timeLeft <= 0) {
            endGame("Time is up! The answer was " + currentGame.name + ".");
        }
    }, 1000);
}

function startRound() {
    currentGame = games[Math.floor(Math.random() * games.length)];
    attemptsLeft = 3;
    timeLeft = 30;
    answerBankUsed = false;
    ui.showGameListButton.textContent = "Need a Hint? View Possible Answers (-1 Point)";

    ui.clue.textContent = currentGame.clue;
    ui.guessInput.value = "";
    ui.guessInput.disabled = false;
    ui.guessButton.disabled = false;
    ui.retry.innerHTML = "";
    ui.result.textContent = "";

    updateScore();
    ui.timer.textContent = "";
    clearInterval(timer);
    timer = null;
}

function checkGuess() {
    const playerGuess = normalizeAnswer(ui.guessInput.value);

    if(playerGuess === "") {
        ui.result.textContent = "Please enter a game name.";
        return;
    }

    // Capitalization, spacing, and common title punctuation do not matter.
    // The guess must still match one of the limited aliases in `answers`.
    const isCorrect = currentGame.answers.some(function(answer) {
        return normalizeAnswer(answer) === playerGuess;
    });

    if(isCorrect) {
        clearInterval(timer);
        timer = null;
        score += answerBankUsed ? 1 : 2;
        correctStreak = answerBankUsed ? 0 : correctStreak + 1;
        updateScore();

        ui.result.textContent = answerBankUsed
            ? "Correct! Hint used: 1 point. New clue coming up."
            : "Correct! 2 points. New clue coming up.";
        ui.guessInput.disabled = true;
        ui.guessButton.disabled = true;

        if(checkForFlawlessWin()) {
            return;
        }

        setTimeout(startRound, 1000);
        return;
    }

    correctStreak = 0;
    attemptsLeft -= 1;
    updateScore();

    if(attemptsLeft === 0) {
        endGame("Game over! The answer was " + currentGame.name + ".");
        return;
    }

    ui.result.textContent = "Incorrect! Try again.";
    ui.guessInput.value = "";
    ui.guessInput.focus();
}

function endGame(message) {
    const tryAgainButton = document.createElement("button");

    clearInterval(timer);
    timer = null;
    ui.result.textContent = message;
    ui.guessInput.disabled = true;
    ui.guessButton.disabled = true;

    tryAgainButton.id = "retry-btn";
    tryAgainButton.textContent = "Try Again";
    tryAgainButton.onclick = resetGame;
    ui.retry.appendChild(tryAgainButton);
}

function resetGame() {
    score = 0;
    correctStreak = 0;
    startRound();
}

function playSound(soundId) {
    const sound = document.getElementById(soundId);

    if(!sound || !soundsEnabled) {
        return;
    }

    sound.currentTime = 0;
    sound.play().catch(function() {
        // Browsers may block audio until the visitor has interacted with the page.
    });
}

startRound();
