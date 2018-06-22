let img
const pixl_orig = []
const tile = 2

function preload() {
	img = loadImage('holzbiene_16.jpg')
}

function setup() {
	createCanvas(img.width * tile, img.height * tile)
	
	img.loadPixels()
	console.log(img)

	for (let i = 0; i < img.pixels.length / 4; i++) {
		const x = i % img.width
		const col = color(img.pixels[i * 4 + 0],
						img.pixels[i * 4 + 1],
						img.pixels[i * 4 + 2])
						pixl_orig[i] = {
			col: col,
			metric: x > img.width / 2 ? -hue(col) : hue(col)
		}
	}

	const pixl_chunks = chunk(pixl_orig, img.width / 2)

	for (let p of pixl_chunks) {
		p.sort((a, b) => a.metric - b.metric)
	}

	let pixl = []
	for (let p of pixl_chunks) {
		pixl = pixl.concat(p)
	}
	console.log(pixl)
	
	noStroke()
	for (let i = 0; i < pixl.length; i++) {
		let x = (i % img.width) * tile
		let y = floor(i / img.width) * tile
		fill(pixl[i].col)
		rect(x, y, tile, tile)
	}
}

function chunk(array, width) {
	const sets = []
	const chunks = array.length / width
	let i = 0

	while (i < chunks) {
		sets[i] = array.splice(0, width)
		i++
	}
	return sets
}