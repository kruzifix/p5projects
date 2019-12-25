class HexGrid
{
    // drawOpts: size, xOff, yOff
    constructor(w, h, drawOpts) {
        this.w = w;
        this.h = h;

        drawOpts.sc = Math.floor(drawOpts.size * 1.5);
        drawOpts.sr = Math.floor(drawOpts.size * sqrt(3));
        drawOpts.hw = Math.floor(drawOpts.size * 0.5);
        drawOpts.hh = Math.floor(drawOpts.sr * 0.5);

        this.drawOpts = drawOpts;

        const bottomCenter = axial2cube(offset2axial({ c: Math.floor(w / 2), r: h - 2 }));

        this.cells = new Array(h);
        for (let r = 0; r < h; r++) {
            this.cells[r] = new Array(w);
            for (let c = 0; c < w; c++) {
                let active = true;
                if (c == 0 || c == w - 1) {
                    active = false;
                } else if (r == 0 || r == h - 1) {
                    active = false;
                }
                const off = { c, r };
                const cube = axial2cube(offset2axial(off));

                if (cube.y < bottomCenter.y || cube.z > bottomCenter.z) {
                    active = false;
                }

                this.cells[r][c] = {
                    active,
                    filled: false,
                    fillColor: [0, 0, 0]
                };
            }
        }
    }

    clear() {
        for (let r = 0; r < this.h; r++) {
            for (let c = 0; c < this.w; c++) {
                this.get(c, r).filled = false;
            }
        }
    }

    // offset
    get(c, r) {
        return this.cells[r][c];
    }

    getCube(cube) {
        const off = cube2offset(cube);
        return this.get(off.c, off.r);
    }

    drawHex(c, r, percent) {
        const px = Math.floor(this.drawOpts.xOff + this.drawOpts.sc * c);
        const py = Math.floor(this.drawOpts.yOff + this.drawOpts.sr * (r + 0.5 * (c & 1)));
        fillHex(px, py, this.drawOpts.hw * percent, this.drawOpts.hh * percent);
    }

    draw() {
        stroke(0);
        fill(200, 0, 0);
        textAlign(CENTER, CENTER);
        for (let c = 0; c < this.w; c++) {
            for (let r = 0; r < this.h; r++) {
                const cell = this.get(c, r);

                if (!cell.active)
                    continue;

                if (cell.filled)
                    fill(...cell.fillColor);
                else
                    //fill(r % 2 == 0 ? 166 : 222);
                    fill(222);

                this.drawHex(c, r, 1);
            }
        }
    }
}

function fillHex(cx, cy, rw, rh) {
    push();
    translate(cx, cy);
    beginShape();
    vertex(-rw, -rh);
    vertex(rw, -rh);
    vertex(2 * rw, 0);
    vertex(rw, rh);
    vertex(-rw, rh);
    vertex(-2 * rw, 0);
    endShape(CLOSE);
    pop();
}

function axial2offset(axial) {
    return {
        c: axial.q,
        r: axial.r + (axial.q - (axial.q & 1)) / 2,
    };
}

function axial2cube(axial) {
    return {
        x: axial.q,
        y: -axial.q - axial.r,
        z: axial.r,
    };
}

function offset2axial(offset) {
    return {
        q: offset.c,
        r: offset.r - (offset.c - (offset.c & 1)) / 2,
    };
}

function offset2cube(offset) {
    return axial2cube(offset2axial(offset));
}

function cube2offset(cube) {
    return axial2offset({ q: cube.x, r: cube.z });
}

function addCube(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    };
}