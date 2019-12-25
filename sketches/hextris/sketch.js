let lastTime;
let grid;
const clearLine = [];

let gameStates;
let currentGameState;

function setup() {
    createCanvas(800, 720);

    const size = 32;
    const w = 13;
    const xOff = width / 2 - size * 1.5 * (w - 1) / 2;
    grid = new HexGrid(w, 15, {
        size,
        xOff,
        yOff: -24,
    });

    const mid = Math.floor(w / 2) - 1;
    for (let x = 0; x < mid; x++) {
        clearLine.push(axial2cube({ q: 1 + x, r: 0 }));
    }
    for (let x = 0; x <= mid; x++) {
        const c = { q: 1 + mid + x, r: -x };
        clearLine.push(axial2cube(c));
    }

    for (const p of clearLine) {
        const off = cube2offset(p);
        if (off.c == 1)
            continue;
        off.r += 8;
        grid.get(off.c, off.r).filled = true;
        grid.get(off.c, off.r).fillColor = [200, 0, 0];
        off.r += 2;
        grid.get(off.c, off.r).filled = true;
        grid.get(off.c, off.r).fillColor = [200, 0, 0];
    }

    gameStates = {
        'play': new PlayState(grid),
        'linesCleared': new LinesClearedState(grid),
        'gameOver': new GameOverState(grid),
    };
    switchGameState('play', { spawnNewPiece: true });

    lastTime = millis();
}

function switchGameState(targetState, data) {
    currentGameState = gameStates[targetState];
    currentGameState.enter(data);
}

function draw() {
    const time = millis();
    const dt = (time - lastTime) * 0.001;
    lastTime = time;

    currentGameState.update(dt);

    currentGameState.draw();
}

function keyPressed() {
    currentGameState.keyPressed(key);
}

// TODO: move functions
function getShiftOffsets(linesCleared) {
    let offsets = new Array(linesCleared[0] + 1);
    let clearPositions = new Array(linesCleared[0] + 1).fill(false);

    for (const line of linesCleared) {
        clearPositions[line] = true;
    }
    clearPositions = clearPositions.reverse();

    let offset = 1;
    for (let i = 0; i < clearPositions.length; i++) {
        // look at target cell and increase offset until not cleared line
        while ((i + offset) < clearPositions.length && clearPositions[i + offset]) {
            offset++;
        }
        offsets[i] = offset;
    }
    return offsets;
}

// linesCleared sorted from lowest line (bottom) to highest (top)
function shiftClearedLines(linesCleared) {
    let offsets = getShiftOffsets(linesCleared);
    const lowestLine = linesCleared[0];

    for (const cl of clearLine) {
        let p = cube2offset(cl);
        //for (p.r += lowestLine; p.r > 0; p.r--) {
        for (let i = 0; i < lowestLine; i++) {
            const index = lowestLine - i;
            if (index - offsets[i] <= 0)
                break;

            let cell = grid.get(p.c, p.r + index);
            let top = grid.get(p.c, p.r + index - offsets[i]);
            if (cell.active && !top.active) {
                cell.filled = false;
            } else if (!cell.active && !top.active) {
                break;
            }
            cell.filled = top.filled;
            cell.fillColor = top.fillColor;
        }
    }
}
