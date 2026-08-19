(function () {
    "use strict";

    var playerScores = { subzero: 0, kano: 0 };
    var matchHighScore = getMatchHighScore();

    function getMatchHighScore() {
        try {
            return Number(localStorage.getItem("mortal_kombat_high")) || 0;
        } catch(error) {
            return 0;
        }
    }

    function updateMatchScore(fighter, damage) {
        var fighterName = fighter.getName().toLowerCase();
        var points = Math.max(0, Math.round(damage * 10));

        playerScores[fighterName] += points;
        matchHighScore = Math.max(matchHighScore, playerScores[fighterName]);
        document.getElementById("player1Score").textContent = playerScores.subzero;
        document.getElementById("player2Score").textContent = playerScores.kano;
        document.getElementById("matchHighScore").textContent = matchHighScore;

        try {
            localStorage.setItem("mortal_kombat_high", String(matchHighScore));
        } catch(error) {
            // Match scoring remains available when browser storage is unavailable.
        }
    }

    function setLife(container, life) {
        container.style.width = Math.max(0, life) + "%";
    }

    function showArena() {
        document.getElementById("loading").style.display = "none";
        document.getElementById("arena").style.visibility = "visible";
        document.getElementById("utils").style.visibility = "visible";
    }

    function startGame() {
        var options = {
            arena: {
                container: document.getElementById("arena"),
                arena: mk.arenas.types.THRONE_ROOM
            },
            fighters: [{ name: "Subzero" }, { name: "Kano" }],
            callbacks: {
                attack: function (fighter, opponent, damage) {
                    var target = opponent.getName() === "kano" ? "player2Life" : "player1Life";
                    setLife(document.getElementById(target), opponent.getLife());
                    updateMatchScore(fighter, damage);
                }
            }
        };

        mk.start(options).ready(showArena);
    }

    document.getElementById("matchHighScore").textContent = matchHighScore;

    var activePointers = new Map();
    var gameKeyCodes = new Set([16, 17, 37, 38, 39, 40, 65, 68, 70, 71, 72, 74, 80, 83, 89, 219, 220, 221]);

    function sendTouchKey(type, keyCode) {
        var keyboardEvent = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperties(keyboardEvent, {
            keyCode: { value: keyCode },
            which: { value: keyCode }
        });
        document.dispatchEvent(keyboardEvent);
    }

    function releasePointer(pointerId) {
        var active = activePointers.get(pointerId);

        if(!active) {
            return;
        }

        sendTouchKey("keyup", active.keyCode);
        active.button.classList.remove("is-pressed");
        activePointers.delete(pointerId);
    }

    function releaseAllPointers() {
        Array.from(activePointers.keys()).forEach(releasePointer);
    }

    document.getElementById("restart").addEventListener("click", function () {
        window.location.reload();
    });

    document.addEventListener("keydown", function (event) {
        if(gameKeyCodes.has(event.keyCode)) {
            event.preventDefault();
        }
    });

    document.querySelectorAll("[data-key]").forEach(function (button) {
        var keyCode = Number(button.dataset.key);

        button.addEventListener("pointerdown", function (event) {
            event.preventDefault();
            releasePointer(event.pointerId);
            activePointers.set(event.pointerId, { keyCode: keyCode, button: button });
            button.classList.add("is-pressed");
            if(button.setPointerCapture) {
                button.setPointerCapture(event.pointerId);
            }
            sendTouchKey("keydown", keyCode);
            if(navigator.vibrate) {
                navigator.vibrate(9);
            }
        });

        ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (eventName) {
            button.addEventListener(eventName, function (event) {
                releasePointer(event.pointerId);
            });
        });

        button.addEventListener("contextmenu", function (event) {
            event.preventDefault();
        });
    });

    document.querySelector(".touch-panel").addEventListener("touchmove", function (event) {
        event.preventDefault();
    }, { passive: false });

    window.addEventListener("blur", releaseAllPointers);
    document.addEventListener("visibilitychange", function () {
        if(document.hidden) {
            releaseAllPointers();
        }
    });

    startGame();
}());
