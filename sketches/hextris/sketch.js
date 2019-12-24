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
    createCanvas(800, 700);

    const size = 40;
    const w = 11;
    const xOff = width / 2 - size * 1.5 * (w - 1) / 2;
    grid = new HexGrid(w, 11, {
        size,
        xOff,
        yOff: -20,
    });

    originalPieces = [
        {
            piece: [
                { x: 0, y: 1, z: -1 },
                { x: 0, y: 0, z: 0 },
                { x: 0, y: -1, z: 1 },
            ],
            color: [30, 168, 199],
        },
        {
            piece: [
                { x: 1, y: 0, z: -1 },
                { x: 0, y: 0, z: 0 },
                { x: 0, y: -1, z: 1 },
            ],
            color: [199, 145, 30],
        },
    ];
    pieceOrigin = offset2cube({ c: 5, r: 3 });
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

    for (const p of piece) {
        const pos = cube2offset(addCube(piecePos, p));
        stroke(0);
        fill(...pieceColor);
        grid.drawHex(pos.c, pos.r);
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
        let offsetPos = cube2offset(piecePos);
        offsetPos.c += 1;
        requestMove(offset2cube(offsetPos));
    }
    if (key == 'a') {
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
        // TODO: fill grid
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
