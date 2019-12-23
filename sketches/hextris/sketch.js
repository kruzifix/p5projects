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
