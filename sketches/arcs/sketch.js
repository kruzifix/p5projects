const corners = []
const n = 10

let can
let gif

const colFuncs = [
	i => color(200 - i * 20, 0, 0),
	i => color(0, 200 - i * 20, 0),
	i => color(0, 0, 200 - i * 20),
	i => color(200 - i * 20)
]

function setup() {
	can = createCanvas(256, 256)
	corners.push([0, 0], [width, 0], [0, height], [width, height])
	setupGif()
}

function draw() {
	background(51)

	// if (frameCount >= 200) {
	// 	noLoop()
	// 	console.log('rendering!')
	// 	gif.render()
	// }

	//const animate = i => 1 + 0.1 * sin(frameCount * (0.1 + 0.05*cos(i*0.1)))

	for (let i = 0; i < n; i++) {
		stroke(255)
		strokeWeight(1)
		for (let j = 0; j < corners.length; j++) {
			fill(colFuncs[(j+i)%4](i))
			const s = 1.5 * width - i * (width/n*1.5)// * animate(i)

			const o = 0.1 * sin(i*0.2)
			const r = frameCount * 0.005 + 0.5 * j
			const r0 = (r - o) * TWO_PI - PI
			const r1 = (r + o) * TWO_PI
			arc(...corners[j], s, s, r0, r1)
		}
	}

	gif.addFrame(can.elt, { delay: 15, copy: true })
}

function setupGif() {
	gif = new GIF({
		workers: 2,
		quality: 80
	})

	let fin = false

	gif.on('finished', function(blob) {
		if (fin)
			return
		fin = true
		
		console.log('finished')
		const url = URL.createObjectURL(blob)
		console.log(url)
		createImg(url)
	})
}