let grid;

let originalPieces;
let pieceOrigin;

let piece;
let piecePos;
let pieceColor;

let reqPiece;
let reqPiecePos;

let heartBeatTimer = 0;
let heartBeatPeriod = 1.5;

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

    originalPieces = [
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
    pieceOrigin = offset2cube({ c: 6, r: 2 });
    newPiece();
}

function draw() {
    // const dt = millis() * 0.001;
    // heartBeatTimer += dt;
    // if (heartBeatTimer >= heartBeatPeriod) {
    //     heartBeatTimer -= heartBeatPeriod;

    //     moveDown();
    // }

    background(0);

    grid.draw();

    let i = 0;
    for (const p of piece) {
        const [r, g, b] = pieceColor;
        const pos = cube2offset(addCube(piecePos, p));
        stroke(0);
        fill(r * 0.7, g * 0.7, b * 0.7);
        grid.drawHex(pos.c, pos.r, 1.0);
        noStroke();
        fill(r, g, b);
        grid.drawHex(pos.c, pos.r, i == 0 ? 0.6 : 0.8);
        // if (i == 0) {
        //     fill(r * 0.6, g * 0.6, b * 0.6);
        //     grid.drawHex(pos.c, pos.r, 0.6);
        // }
        i++;
    }
}

function keyPressed() {
    if (key == 'j') {
        requestRotate(false);
    }
    if (key == 'k') {
        requestRotate(true);
    }
    if (key == 's') {
        moveDown();
    }
    if (key == 'd') {
        // TODO: move diagonal down-right
        let offsetPos = cube2offset(piecePos);
        offsetPos.c += 1;
        requestMove(offset2cube(offsetPos));
    }
    if (key == 'a') {
        // TODO: move diagonal down-left
        let offsetPos = cube2offset(piecePos);
        offsetPos.c -= 1;
        requestMove(offset2cube(offsetPos));
    }
}

function newPiece() {
    piecePos = Object.assign({}, pieceOrigin);
    const index = Math.floor(random() * originalPieces.length);
    piece = originalPieces[index].piece;
    pieceColor = originalPieces[index].color;

    // TODO: check for game over
}

function moveDown() {
    let reqPos = Object.assign({}, piecePos);
    reqPos.y -= 1;
    reqPos.z += 1;

    if (!requestMove(reqPos)) {
        // touch down!
        for (let p of piece) {
            const cell = grid.getCube(addCube(piecePos, p));
            cell.filled = true;
            cell.fillColor = pieceColor;
        }

        // TODO: check clears, points!
        newPiece();

        heartBeatTimer = 0;
    }
}

// toPos: cube
function requestMove(toPos) {
    for (const p of piece) {
        const cell = grid.getCube(addCube(toPos, p));
        if (!cell.active || cell.filled) {
            return false;
        }
    }
    piecePos = Object.assign({}, toPos);
    return true;
}

function requestRotate(right) {
    const newPiece = right ? rotateRight(piece) : rotateLeft(piece);
    for (const p of newPiece) {
        const cell = grid.getCube(addCube(piecePos, p));
        if (!cell.active || cell.filled) {
            return false;
        }
    }
    piece = newPiece;
    return true;
}

function rotateRight(piece) {
    return rotatePiece(piece, (x, y, z) => ({
        x: -z,
        y: -x,
        z: -y,
    }));
}

function rotateLeft(piece) {
    return rotatePiece(piece, (x, y, z) => ({
        x: -y,
        y: -z,
        z: -x,
    }));
}

function rotatePiece(piece, rotFunc) {
    let res = [];

    for (const p of piece) {
        res.push(rotFunc(p.x, p.y, p.z));
    }

    return res;
}
