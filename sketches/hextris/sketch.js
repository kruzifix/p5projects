let grid;

function setup() {
	createCanvas(800, 700);

	grid = new HexGrid(11, 11);

	grid.get(1, 4).filled = true;
	grid.get(2, 3).filled = true;
	grid.get(6, 7).filled = true;
	grid.get(4, 2).filled = true;
}

function draw() {
	background(0);

	const size = 40;
	const xoff = width / 2 - size * 1.5 * (grid.w - 1) / 2;
	grid.draw(size, xoff, -20);
}

class HexGrid
{
	constructor(w, h) {
		this.w = w;
		this.h = h;

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
				};
			}
		}
	}

	// offset
	get(c, r) {
		return this.cells[r][c];
	}

	draw(size, xOff, yOff) {
		const sc = Math.floor(size * 1.5);
		const sr = Math.floor(size * sqrt(3));
		const hw = Math.floor(size * 0.5);
		const hh = Math.floor(sr * 0.5);

		stroke(0);
		fill(200, 0, 0);
		textAlign(CENTER, CENTER);
		for (let c = 0; c < this.w; c++) {
			for (let r = 0; r < this.h; r++) {
				const cell = this.get(c, r);

				//if (!cell.active)
				//	continue;

				const px = Math.floor(xOff + sc * c);
				const py = Math.floor(yOff + sr * (r + 0.5 * (c & 1)));

				if (cell.active)
				{
					if (cell.filled)
						fill(0, 200, 0);
					else
						fill(222);
				}
				else
					fill(50);

				//circle(px, py, size * 0.85);
				fillHex(px, py, hw, hh);

				// const coord = { c, r };
				// const axial = offset2axial(coord);
				// const cube = axial2cube(axial);
				// fill(200, 0, 0);
				// text(c + "|" + r, px, py - size * 0.5);
				// text(axial.q + "|" + axial.r, px, py);
				// text(cube.x + "|" + cube.y + "|" + cube.z, px, py + size * 0.5);
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