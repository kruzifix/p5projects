let data

function preload() {
	data = loadJSON('colorData.json')
}

function setup() {
	const labels = {}

	for (let i = 0; i < data.entries.length; i++) {
		const c = data.entries[i]
		const l = c.label
		c.col = color(c.r, c.g, c.b)
		c.metric = hue(c.col)

		if (!labels[l]) {
			labels[l] = []
		}
		labels[l].push(c)
	}

	const amount = min(Object.values(labels).map(l => l.length))
	console.log(amount)

	const wid = 8
	const tilesX = 16
	const hei = 8

	createCanvas(9 * wid * tilesX, floor(amount / tilesX) * hei)
	background(255)

	noStroke()
	let lx = 0
	for (let k of Object.keys(labels)) {
		const cols = labels[k]
		cols.sort((a, b) => {
			return a.metric - b.metric
		})
		let x = 0
		let y = 0
		for (let i = 0; i < amount; i++) {
			const c = cols[i]
			fill(c.col)
			rect((lx * tilesX + x) * wid, y * hei, wid, hei)

			x++
			if (x >= tilesX) {
				y++
				x = 0
			}
		}
		lx++
	}
}