const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const domGame = document.getElementById("dom-game");
const statusText = document.getElementById("status");
const title = document.getElementById("game-title");
const instructions = document.getElementById("instructions");
const selectedGame = new URLSearchParams(window.location.search).get("game") || "pong";
const keys = {};

document.addEventListener("keydown", function(event) {
    keys[event.key.toLowerCase()] = true;
    if(["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(event.key.toLowerCase())) event.preventDefault();
});
document.addEventListener("keyup", event => keys[event.key.toLowerCase()] = false);
document.getElementById("restart").onclick = () => window.location.reload();

function configure(name, help, useDom) {
    title.textContent = name;
    document.title = name + " | Pixel Vault";
    instructions.textContent = help;
    canvas.hidden = Boolean(useDom);
    domGame.hidden = !useDom;
    if(!useDom) canvas.focus();
}

function text(message) { statusText.textContent = message; }
function clear() { ctx.fillStyle = "#02040b"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
function rect(x, y, width, height, color) { ctx.fillStyle = color; ctx.fillRect(x, y, width, height); }
function circle(x, y, radius, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); }
function label(value, x, y, size = 22, color = "#fff") { ctx.fillStyle = color; ctx.font = `bold ${size}px monospace`; ctx.fillText(value, x, y); }
function wrapPosition(value, max) { return (value + max) % max; }

function pong() {
    configure("Pong", "Move with W/S or the Up/Down arrows. First to 7 wins.");
    const player = { y: 190, score: 0 };
    const cpu = { y: 190, score: 0 };
    const ball = { x: 360, y: 240, vx: 5, vy: 3 };
    function serve(direction) { ball.x = 360; ball.y = 240; ball.vx = 5 * direction; ball.vy = (Math.random() * 5) - 2.5; }
    function frame() {
        if(player.score >= 7 || cpu.score >= 7) { text(player.score >= 7 ? "You win!" : "Computer wins."); draw(); return; }
        if(keys.w || keys.arrowup) player.y -= 7;
        if(keys.s || keys.arrowdown) player.y += 7;
        player.y = Math.max(0, Math.min(380, player.y));
        cpu.y += Math.sign(ball.y - (cpu.y + 50)) * 4;
        cpu.y = Math.max(0, Math.min(380, cpu.y));
        ball.x += ball.vx; ball.y += ball.vy;
        if(ball.y < 8 || ball.y > 472) ball.vy *= -1;
        if(ball.x < 42 && ball.x > 20 && ball.y > player.y && ball.y < player.y + 100) { ball.vx = Math.abs(ball.vx) + .15; ball.vy += (ball.y - player.y - 50) / 18; }
        if(ball.x > 678 && ball.x < 700 && ball.y > cpu.y && ball.y < cpu.y + 100) { ball.vx = -Math.abs(ball.vx) - .15; ball.vy += (ball.y - cpu.y - 50) / 18; }
        if(ball.x < 0) { cpu.score += 1; serve(1); }
        if(ball.x > 720) { player.score += 1; serve(-1); }
        draw(); requestAnimationFrame(frame);
    }
    function draw() {
        clear();
        for(let y = 0; y < 480; y += 28) rect(357, y, 6, 16, "#31416f");
        rect(24, player.y, 16, 100, "#77e9ff"); rect(680, cpu.y, 16, 100, "#ff5ca8"); circle(ball.x, ball.y, 9, "#ffdd57");
        label(player.score, 300, 45, 30); label(cpu.score, 402, 45, 30);
    }
    frame();
}

function snake() {
    configure("Snake", "Use the arrow keys or WASD. Eat the gold squares and avoid the walls and your tail.");
    const size = 24, cols = 30, rows = 20;
    let body = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }], direction = { x: 1, y: 0 }, next = direction, food, score = 0, over = false;
    function placeFood() { do { food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; } while(body.some(p => p.x === food.x && p.y === food.y)); }
    function input() {
        if((keys.arrowup || keys.w) && direction.y !== 1) next = { x: 0, y: -1 };
        if((keys.arrowdown || keys.s) && direction.y !== -1) next = { x: 0, y: 1 };
        if((keys.arrowleft || keys.a) && direction.x !== 1) next = { x: -1, y: 0 };
        if((keys.arrowright || keys.d) && direction.x !== -1) next = { x: 1, y: 0 };
    }
    function tick() {
        if(over) return;
        input(); direction = next;
        const head = { x: body[0].x + direction.x, y: body[0].y + direction.y };
        if(head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || body.some(p => p.x === head.x && p.y === head.y)) { over = true; text(`Game over — score ${score}.`); draw(); return; }
        body.unshift(head);
        if(head.x === food.x && head.y === food.y) { score += 1; placeFood(); } else body.pop();
        draw(); setTimeout(tick, Math.max(55, 125 - score * 3));
    }
    function draw() {
        clear(); circle(food.x * size + 12, food.y * size + 12, 8, "#ffdd57");
        body.forEach((p, index) => rect(p.x * size + 2, p.y * size + 2, 20, 20, index ? "#3ef5a8" : "#77e9ff"));
        label(`Score ${score}`, 12, 28, 18);
    }
    placeFood(); tick();
}

function tetris() {
    configure("Falling Blocks", "Use arrows: Left/Right to move, Up to rotate, Down to drop faster.");
    const cols = 10, rows = 20, cell = 24, offsetX = 240;
    const shapes = [
        [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]],
        [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]]
    ];
    const colors = ["#77e9ff", "#ffdd57", "#b98cff", "#ff9f43", "#4d7cff", "#3ef5a8", "#ff5c72"];
    const board = Array.from({ length: rows }, () => Array(cols).fill(-1));
    let piece, score = 0, over = false, inputLock = 0;
    function spawn() { const type = Math.floor(Math.random() * shapes.length); piece = { x: 3, y: 0, type, shape: shapes[type].map(row => [...row]) }; if(collides(piece.x, piece.y, piece.shape)) { over = true; text(`Stack complete — score ${score}.`); } }
    function collides(x, y, shape) { return shape.some((row, py) => row.some((value, px) => value && (x + px < 0 || x + px >= cols || y + py >= rows || (y + py >= 0 && board[y + py][x + px] >= 0)))); }
    function move(dx, dy) { if(!collides(piece.x + dx, piece.y + dy, piece.shape)) { piece.x += dx; piece.y += dy; return true; } return false; }
    function rotate() { const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse()); if(!collides(piece.x, piece.y, rotated)) piece.shape = rotated; }
    function lock() {
        piece.shape.forEach((row, py) => row.forEach((value, px) => { if(value && piece.y + py >= 0) board[piece.y + py][piece.x + px] = piece.type; }));
        for(let y = rows - 1; y >= 0; y--) if(board[y].every(v => v >= 0)) { board.splice(y, 1); board.unshift(Array(cols).fill(-1)); score += 100; y++; }
        spawn();
    }
    function controls() {
        if(inputLock > 0) { inputLock--; return; }
        if(keys.arrowleft || keys.a) { move(-1, 0); inputLock = 5; }
        else if(keys.arrowright || keys.d) { move(1, 0); inputLock = 5; }
        else if(keys.arrowup || keys.w) { rotate(); inputLock = 8; }
    }
    let dropCounter = 0;
    function frame() {
        if(over) { draw(); return; }
        controls(); dropCounter++;
        if((keys.arrowdown || keys.s) ? dropCounter > 2 : dropCounter > 28) { if(!move(0, 1)) lock(); dropCounter = 0; }
        draw(); requestAnimationFrame(frame);
    }
    function draw() {
        clear(); rect(offsetX - 4, 0, cols * cell + 8, rows * cell, "#17203d");
        board.forEach((row, y) => row.forEach((value, x) => { if(value >= 0) rect(offsetX + x * cell + 1, y * cell + 1, cell - 2, cell - 2, colors[value]); }));
        piece.shape.forEach((row, y) => row.forEach((value, x) => { if(value) rect(offsetX + (piece.x + x) * cell + 1, (piece.y + y) * cell + 1, cell - 2, cell - 2, colors[piece.type]); }));
        label(`Score ${score}`, 20, 35, 20);
    }
    spawn(); frame();
}

function breakout() {
    configure("Breakout", "Move the paddle with Left/Right or A/D. Clear every brick with the ball.");
    let paddle = 310, score = 0, lives = 3, over = false;
    const ball = { x: 360, y: 390, vx: 4, vy: -4 };
    const bricks = [];
    for(let row = 0; row < 5; row++) for(let col = 0; col < 10; col++) bricks.push({ x: 35 + col * 66, y: 45 + row * 30, alive: true, color: ["#ff5c72", "#ff9f43", "#ffdd57", "#3ef5a8", "#77e9ff"][row] });
    function frame() {
        if(over) { draw(); return; }
        if(keys.arrowleft || keys.a) paddle -= 8;
        if(keys.arrowright || keys.d) paddle += 8;
        paddle = Math.max(0, Math.min(620, paddle)); ball.x += ball.vx; ball.y += ball.vy;
        if(ball.x < 8 || ball.x > 712) ball.vx *= -1;
        if(ball.y < 8) ball.vy = Math.abs(ball.vy);
        if(ball.y > 430 && ball.y < 455 && ball.x > paddle && ball.x < paddle + 100) { ball.vy = -Math.abs(ball.vy); ball.vx += (ball.x - paddle - 50) / 28; }
        for(const brick of bricks) if(brick.alive && ball.x > brick.x && ball.x < brick.x + 60 && ball.y > brick.y && ball.y < brick.y + 22) { brick.alive = false; ball.vy *= -1; score += 10; break; }
        if(ball.y > 490) { lives--; if(lives <= 0) { over = true; text(`Game over — score ${score}.`); } else { ball.x = 360; ball.y = 390; ball.vy = -4; } }
        if(bricks.every(brick => !brick.alive)) { over = true; text(`You cleared the wall! Score ${score}.`); }
        draw(); requestAnimationFrame(frame);
    }
    function draw() { clear(); bricks.forEach(b => { if(b.alive) rect(b.x, b.y, 60, 22, b.color); }); rect(paddle, 440, 100, 14, "#77e9ff"); circle(ball.x, ball.y, 8, "#fff"); label(`Score ${score}  Lives ${lives}`, 18, 28, 18); }
    frame();
}

function minesweeper() {
    configure("Minesweeper", "Reveal every safe tile. Right-click a tile to place or remove a flag.", true);
    const width = 10, height = 10, mineCount = 14;
    const cells = Array.from({ length: width * height }, (_, index) => ({ index, mine: false, open: false, flag: false, near: 0 }));
    for(let placed = 0; placed < mineCount;) { const cell = cells[Math.floor(Math.random() * cells.length)]; if(!cell.mine) { cell.mine = true; placed++; } }
    function neighbors(index) { const x = index % width, y = Math.floor(index / width); return cells.filter(c => { const cx = c.index % width, cy = Math.floor(c.index / width); return Math.abs(cx - x) <= 1 && Math.abs(cy - y) <= 1 && c.index !== index; }); }
    cells.forEach(cell => cell.near = neighbors(cell.index).filter(n => n.mine).length);
    domGame.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    cells.forEach(cell => { const button = document.createElement("button"); button.className = "cell"; button.setAttribute("aria-label", `Hidden tile ${cell.index + 1}`); button.onclick = () => reveal(cell); button.oncontextmenu = event => { event.preventDefault(); if(!cell.open) { cell.flag = !cell.flag; render(); } }; cell.button = button; domGame.appendChild(button); });
    function reveal(cell) { if(cell.open || cell.flag) return; cell.open = true; if(cell.mine) { cells.forEach(c => { if(c.mine) c.open = true; }); text("Mine hit! Try again."); render(); return; } if(cell.near === 0) neighbors(cell.index).forEach(reveal); if(cells.filter(c => !c.mine).every(c => c.open)) text("Minefield cleared!"); render(); }
    function render() { cells.forEach(cell => { cell.button.className = "cell" + (cell.open ? " revealed" : "") + (cell.mine && cell.open ? " mine" : "") + (cell.flag ? " marked" : ""); cell.button.textContent = cell.open ? (cell.mine ? "✹" : cell.near || "") : cell.flag ? "⚑" : ""; }); }
    render();
}

function asteroids() {
    configure("Asteroids", "Rotate with Left/Right or A/D, thrust with Up/W, and fire with Space.");
    const ship = { x: 360, y: 240, angle: -Math.PI / 2, vx: 0, vy: 0 };
    let rocks = Array.from({ length: 7 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 7;
        const distance = 175 + Math.random() * 55;
        return {
            x: 360 + Math.cos(angle) * distance,
            y: 240 + Math.sin(angle) * distance,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
            r: 22 + Math.random() * 18
        };
    });
    let bullets = [], score = 0, over = false, cooldown = 0;
    function frame() {
        if(over) { draw(); return; }
        if(keys.arrowleft || keys.a) ship.angle -= .07;
        if(keys.arrowright || keys.d) ship.angle += .07;
        if(keys.arrowup || keys.w) { ship.vx += Math.cos(ship.angle) * .12; ship.vy += Math.sin(ship.angle) * .12; }
        ship.x = wrapPosition(ship.x + ship.vx, 720); ship.y = wrapPosition(ship.y + ship.vy, 480); ship.vx *= .995; ship.vy *= .995;
        if(cooldown) cooldown--; if(keys[" "] && !cooldown) { bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.angle) * 7, vy: Math.sin(ship.angle) * 7, life: 70 }); cooldown = 12; }
        bullets.forEach(b => { b.x = wrapPosition(b.x + b.vx, 720); b.y = wrapPosition(b.y + b.vy, 480); b.life--; }); bullets = bullets.filter(b => b.life > 0);
        rocks.forEach(r => { r.x = wrapPosition(r.x + r.vx, 720); r.y = wrapPosition(r.y + r.vy, 480); });
        bullets.forEach(b => rocks.forEach(r => { if(Math.hypot(b.x - r.x, b.y - r.y) < r.r) { b.life = 0; r.hit = true; score += 10; } })); rocks = rocks.filter(r => !r.hit);
        if(rocks.some(r => Math.hypot(ship.x - r.x, ship.y - r.y) < r.r + 8)) { over = true; text(`Ship lost — score ${score}.`); }
        if(!rocks.length) { over = true; text(`Sector clear! Score ${score}.`); }
        draw(); requestAnimationFrame(frame);
    }
    function draw() { clear(); ctx.strokeStyle = "#77e9ff"; ctx.lineWidth = 4; rocks.forEach(r => { ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); }); bullets.forEach(b => circle(b.x, b.y, 4, "#ffdd57")); ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.angle); ctx.strokeStyle = "#3ef5a8"; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-11, -10); ctx.lineTo(-5, 0); ctx.lineTo(-11, 10); ctx.closePath(); ctx.stroke(); ctx.restore(); label(`Score ${score}`, 14, 28, 18, "#fff"); }
    frame();
}

function ticTacToe() {
    configure("Tic-Tac-Toe", "Select a square to place X. Get three in a row before the computer.", true);
    const board = Array(9).fill(""); let finished = false;
    domGame.style.gridTemplateColumns = "repeat(3, 1fr)";
    board.forEach((_, index) => { const button = document.createElement("button"); button.className = "cell ttt-cell"; button.onclick = () => play(index); domGame.appendChild(button); });
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    function winner(mark) { return wins.some(line => line.every(i => board[i] === mark)); }
    function play(index) { if(finished || board[index]) return; board[index] = "X"; if(end()) return; const open = board.map((v, i) => v ? -1 : i).filter(i => i >= 0); board[open[Math.floor(Math.random() * open.length)]] = "O"; end(); render(); }
    function end() { render(); if(winner("X")) { finished = true; text("You win!"); return true; } if(winner("O")) { finished = true; text("Computer wins."); return true; } if(board.every(Boolean)) { finished = true; text("Draw game."); return true; } return false; }
    function render() { [...domGame.children].forEach((button, index) => button.textContent = board[index]); }
}

function frogger() {
    configure("Road & River", "Use the arrow keys or WASD to reach all five homes. Avoid traffic and stay on floating logs.");
    const frog = { x: 342, y: 438, size: 22 };
    const homes = [70, 210, 350, 490, 630].map(x => ({ x, filled: false }));
    const lanes = [
        { y: 390, speed: 2.4, water: false }, { y: 345, speed: -3.1, water: false }, { y: 300, speed: 1.8, water: false },
        { y: 210, speed: -1.8, water: true }, { y: 165, speed: 2.2, water: true }, { y: 120, speed: -2.8, water: true }
    ];
    lanes.forEach((lane, li) => lane.items = Array.from({ length: 4 }, (_, i) => ({ x: i * 205 + (li * 37) % 90, width: lane.water ? 105 : 62 })));
    let lives = 3, lock = 0, over = false;
    function reset() { frog.x = 342; frog.y = 438; }
    function frame() {
        if(over) { draw(); return; }
        if(lock) lock--; else {
            if(keys.arrowleft || keys.a) { frog.x -= 36; lock = 8; }
            else if(keys.arrowright || keys.d) { frog.x += 36; lock = 8; }
            else if(keys.arrowup || keys.w) { frog.y -= 45; lock = 8; }
            else if(keys.arrowdown || keys.s) { frog.y += 45; lock = 8; }
        }
        let riding = false;
        lanes.forEach(lane => { lane.items.forEach(item => item.x = wrapPosition(item.x + lane.speed + 100, 820) - 100); if(Math.abs(frog.y - lane.y) < 20) { const hit = lane.items.find(item => frog.x + frog.size > item.x && frog.x < item.x + item.width); if(lane.water) { if(hit) { frog.x += lane.speed; riding = true; } } else if(hit) lose(); } });
        if(frog.y < 95 && frog.y > 55) { const home = homes.find(h => !h.filled && Math.abs(frog.x - h.x) < 34); if(home) { home.filled = true; reset(); if(homes.every(h => h.filled)) { over = true; text("All frogs are home!"); } } else lose(); }
        if(frog.y >= 100 && frog.y <= 230 && !riding) lose();
        if(frog.x < 0 || frog.x > 698 || frog.y > 470) lose();
        draw(); requestAnimationFrame(frame);
    }
    function lose() { lives--; reset(); if(lives <= 0) { over = true; text("No frogs left. Try again."); } }
    function draw() { clear(); rect(0, 90, 720, 145, "#102d5a"); rect(0, 280, 720, 135, "#272735"); homes.forEach(h => circle(h.x, 65, 24, h.filled ? "#3ef5a8" : "#173b2e")); lanes.forEach(lane => lane.items.forEach(item => rect(item.x, lane.y - 15, item.width, 30, lane.water ? "#a66a3f" : "#ff5c72"))); rect(frog.x, frog.y, frog.size, frog.size, "#3ef5a8"); label(`Lives ${lives}`, 12, 28, 18); }
    frame();
}

const games = { pong, snake, tetris, breakout, minesweeper, asteroids, "tic-tac-toe": ticTacToe, frogger };
(games[selectedGame] || pong)();
