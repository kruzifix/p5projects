let img

// const pixl_orig = []
// const tile = 1

const row_data = []
let current_y = 0
const rows_per_frame = 5

function preload() {
	img = loadImage('sunflower.jpg')
}

function setup() {
	createCanvas(img.width, img.height)

	image(img, 0, 0)

	img.loadPixels()

	noStroke()
}

function draw() {
	for (let f = 0; f < rows_per_frame; f++) {

		const yn = current_y / (float)(img.height)
		const prob = 0.333 + yn

		for (let x = 0; x < img.width; x++) {
			const i = x + current_y * img.width
			const col = color(img.pixels[i * 4 + 0],
				img.pixels[i * 4 + 1],
				img.pixels[i * 4 + 2])

			const v = brightness(col) / 255.0
			const xn = x / (float)(img.width)

			row_data[x] = {
				col: col,
				metric: v//lerp(xn, v, prob)
			}
		}

		row_data.sort((a, b) => a.metric - b.metric)

		for (let x = 0; x < img.width; x++) {
			fill(row_data[x].col)
			rect(x, current_y, 1, 1)
		}

		if (current_y == img.height - 1) {
			noLoop();
			return;
		}

		current_y++;
	}
}

// function setup_old() {
// 	createCanvas(img.width * tile, img.height * tile)
	
// 	img.loadPixels()
// 	console.log(img)

// 	for (let i = 0; i < img.pixels.length / 4; i++) {
// 		const x = i % img.width
// 		const col = color(img.pixels[i * 4 + 0],
// 			img.pixels[i * 4 + 1],
// 			img.pixels[i * 4 + 2])
			
// 		const h = hue(col) / 360.0
// 		const p = x / (float)(img.width)
// 		const y = (i / img.width) / (float)(img.height)

// 		const prob = 0.333 + y//min(y, 1 - y)

// 		pixl_orig[i] = {
// 			col: col,
// 			metric: lerp(p, h, prob) //random() < prob ? h : p
// 		}
// 	}

// 	const pixl_chunks = chunk(pixl_orig, img.width)

// 	for (let p of pixl_chunks) {
// 		p.sort((a, b) => a.metric - b.metric)
// 	}

// 	let pixl = []
// 	for (let p of pixl_chunks) {
// 		pixl = pixl.concat(p)
// 	}
// 	console.log(pixl)

// 	// const result = createImage(img.width, img.height)
// 	// result.loadPixels();
// 	// result.pixels = pixl;
// 	// result.updatePixels();
// 	// image(result, 0, 0);
	
// 	noStroke()
// 	for (let i = 0; i < pixl.length; i++) {
// 		let x = (i % img.width) * tile
// 		let y = floor(i / img.width) * tile
// 		fill(pixl[i].col)
// 		rect(x, y, tile, tile)
// 	}
// }

// function chunk(array, width) {
// 	const sets = []
// 	const chunks = array.length / width
// 	let i = 0

// 	while (i < chunks) {
// 		sets[i] = array.splice(0, width)
// 		i++
// 	}
// 	return sets
// }