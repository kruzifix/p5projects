// always keep center position at first index, as it is specially highlighted.
const originalPieces = [
    {
        piece: [
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 1, z: -1 },
            { x: 0, y: -1, z: 1 },
        ],
        color: [30, 168, 199],
    },
    {
        piece: [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: -1 },
            { x: 0, y: -1, z: 1 },
        ],
        color: [199, 145, 30],
    },
    {
        piece: [
            { x: 0, y: 0, z: 0 },
            { x: -1, y: 1, z: 0 },
            { x: 0, y: -1, z: 1 },
        ],
        color: [191, 30, 199],
    },
    {
        piece: [
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 1, z: -1 },
            { x: 1, y: 0, z: -1 },
        ],
        color: [75, 199, 30],
    },
];
const pieceOrigin = offset2cube({ c: 6, r: 2 });

class PlayState {
    constructor(grid) {
        this.grid = grid;
        this.heartBeatTimer = 0;
        this.heartBeatPeriod = 0.8;

        this.newPiece();
    }

    enter(data) {
        this.heartBeatTimer = 0;
        if (data.spawnNewPiece) {
            this.newPiece();
        }
    }

    newPiece() {
        this.piecePos = Object.assign({}, pieceOrigin);
        const index = Math.floor(random() * originalPieces.length);
        this.piece = originalPieces[index].piece;
        this.pieceColor = originalPieces[index].color;

        for (const p of this.piece) {
            const cell = grid.getCube(addCube(this.piecePos, p));
            if (cell.active && cell.filled) {
                // game over
                switchGameState('gameOver');
                return;
            }
        }
    }

    update(dt) {
        this.heartBeatTimer += dt;

        // 83 = s
        const period = this.heartBeatPeriod * (keyIsDown(83) ? 0.25 : 1.0);
        if (this.heartBeatTimer >= period) {
            this.heartBeatTimer = 0;
            this.moveDown();
        }
    }

    keyPressed(key) {
        if (key == 'j') {
            this.requestRotate(false);
        }
        if (key == 'k') {
            this.requestRotate(true);
        }
        if (key == 'd') {
            // let offsetPos = cube2offset(this.piecePos);
            // offsetPos.c += 1;
            // this.requestMove(offset2cube(offsetPos));
            this.requestMove(addCube(this.piecePos, { x: 1, y: -1, z: 0 }));
        }
        if (key == 'a') {
            // let offsetPos = cube2offset(this.piecePos);
            // offsetPos.c -= 1;
            // this.requestMove(offset2cube(offsetPos));
            this.requestMove(addCube(this.piecePos, { x: -1, y: 0, z: 1 }));
        }
    }

    moveDown() {
        let reqPos = Object.assign({}, this.piecePos);
        reqPos.y -= 1;
        reqPos.z += 1;

        if (!this.requestMove(reqPos)) {
            // touch down!
            for (let p of this.piece) {
                const cell = this.grid.getCube(addCube(this.piecePos, p));
                cell.filled = true;
                cell.fillColor = this.pieceColor;
            }

            let linesCleared = [];
            for (let i = this.grid.h - 5; i >= 1; i--) {
                let lineFilled = true;
                for (const p of clearLine) {
                    const c = cube2offset(p);
                    const cell = this.grid.get(c.c, c.r + i);
                    if (cell.active && !cell.filled) {
                        lineFilled = false;
                    }
                }
                if (lineFilled) {
                    linesCleared.push(i);
                }
            }

            if (linesCleared.length > 0) {
                console.log(`clearing ${linesCleared.length} lines.`);
                switchGameState('linesCleared', { linesCleared })
            } else {
                this.newPiece();
                this.heartBeatTimer = 0;
            }
        }
    }

    requestMove(cubePos) {
        for (const p of this.piece) {
            const cell = grid.getCube(addCube(cubePos, p));
            if (!cell.active || cell.filled) {
                return false;
            }
        }
        this.piecePos = Object.assign({}, cubePos);
        return true;
    }

    requestRotate(right) {
        const newPiece = right ?
            rotatePiece(this.piece, (x, y, z) => ({
                x: -z,
                y: -x,
                z: -y,
            })) :
            rotatePiece(this.piece, (x, y, z) => ({
                x: -y,
                y: -z,
                z: -x,
            }));
        for (const p of newPiece) {
            const cell = grid.getCube(addCube(this.piecePos, p));
            if (!cell.active || cell.filled) {
                return false;
            }
        }
        this.piece = newPiece;
        return true;
    }

    draw() {
        background(0);

        this.grid.draw();

        let i = 0;
        for (const p of this.piece) {
            const [r, g, b] = this.pieceColor;
            const pos = cube2offset(addCube(this.piecePos, p));
            stroke(0);
            fill(r * 0.7, g * 0.7, b * 0.7);
            this.grid.drawHex(pos.c, pos.r, 1.0);
            noStroke();
            fill(r, g, b);
            this.grid.drawHex(pos.c, pos.r, i == 0 ? 0.6 : 0.8);
            // if (i == 0) {
            //     fill(r * 0.6, g * 0.6, b * 0.6);
            //     grid.drawHex(pos.c, pos.r, 0.6);
            // }
            i++;
        }
    }
}

function rotatePiece(piece, rotFunc) {
    let res = [];
    for (const p of piece) {
        res.push(rotFunc(p.x, p.y, p.z));
    }
    return res;
}

class LinesClearedState {
    constructor(grid) {
        this.grid = grid;
    }

    enter(data) {
        this.linesCleared = data.linesCleared;
        this.switchTime = 1.0;
        this.blinkPeriod = 0.2;
    }

    update(dt) {
        this.switchTime -= dt;
        if (this.switchTime <= 0) {
            shiftClearedLines(this.linesCleared);
            // TODO: points
            switchGameState('play', { spawnNewPiece: true });
        }
    }

    keyPressed(key) {
    }

    draw() {
        background(0);

        this.grid.draw();

        noStroke();
        if (this.switchTime / this.blinkPeriod % 1 > 0.5) {
            fill(0);
        } else {
            fill(255);
        }
        for (const p of clearLine) {
            const off = cube2offset(p);
            for (const l of this.linesCleared) {
                this.grid.drawHex(off.c, off.r + l, 1.05);
            }
        }
    }
}

class GameOverState {
    constructor(grid) {
        this.grid = grid;
    }

    enter(data) {
        this.animTime = 1.0;
        this.animProgress = 0.0;
        this.animFinished = false;
    }

    update(dt) {
        if (!this.animFinished) {
            this.animProgress += dt / this.animTime;
            if (this.animProgress >= 1) {
                this.animProgress = 1.0;
                this.animFinished = true;
            }
        }
    }

    keyPressed(key) {
        if (this.animFinished && key == 'Enter') {
            this.grid.clear();
            switchGameState('play', { spawnNewPiece: true });
        }
    }

    draw() {
        background(200 * (0.5 + 0.5 * Math.sin(this.animProgress * 3.1415 * 3)), 0, 0);

        this.grid.draw();

        background(0, 0, 0, 150 * this.animProgress * this.animProgress);
        if (this.animFinished) {

            stroke(0);
            strokeWeight(1);
            fill(255);
            textAlign(CENTER, CENTER);
            textSize(64);
            text('GAME OVER', width / 2, height * 0.3 - 50);
            textSize(48);
            text('Press ENTER to play again', width / 2, height * 0.3 + 50);
            strokeWeight(1);
        }
    }
}