const data = {
	stations: [
		{
			x: 200,
			y: 300
		},
		{
			x: 700,
			y: 500
		},
		{
			x: 600,
			y: 200
		}
	],
	lines: [
		{
			color: [244, 95, 66],
			connections: [
				0, 1
			]
		},
		{
			color: [95, 244, 66],
			connections: [
				1, 2
			]
		},
		{
			color: [66, 146, 244],
			connections: [
				0, 2
			]
		}
	]
}

function setup() {
	createCanvas(windowWidth, windowHeight)

	console.log(data)
}

function draw() {
	background(244, 241, 236)

	// draw lines
	noFill()
	strokeWeight(16)
	for (let lin of data.lines) {
		stroke(...lin.color)
		const cons = lin.connections
		for (let i = 0; i < cons.length - 1; i++) {
			const s0 = data.stations[cons[i]]
			const s1 = data.stations[cons[i + 1]]
			line(s0.x, s0.y, s1.x, s1.y)
		}
	}

	if (mouseState.startedOnStation) {
		const cons = mouseState.stations;
		stroke(0)
		const s0 = data.stations[cons[cons.length - 1]]
		line(s0.x, s0.y, mouseX, mouseY)

		for (let i = 0; i < cons.length - 1; i++) {
			const s0 = data.stations[cons[i]]
			const s1 = data.stations[cons[i + 1]]
			line(s0.x, s0.y, s1.x, s1.y)
		}
	}

	// draw stations
	for (let s of data.stations) {
		stroke(0)
		strokeWeight(8)
		fill(255)

		let r = 64
		if (onStation(s, 64)) {
			r = 86
			strokeWeight(10)
		}

		ellipse(s.x, s.y, r, r)
	}
}

function doubleClicked() {
	data.stations.push({
		x: mouseX,
		y: mouseY
	})
}

const mouseState = {
	down: false,
	startedOnStation: false,
	stations: []
}

function mousePressed() {
	mouseState.down = true
	mouseState.stations = []
	for (let i = 0; i < data.stations.length; i++) {
		if (onStation(data.stations[i], 64)) {
			mouseState.startedOnStation = true
			mouseState.stations.push(i)
			return
		}
	}
}

function mouseReleased() {
	mouseState.down = false
	mouseState.startedOnStation = false
	if (mouseState.stations.length >= 2) {
		data.lines.push({
			color: [66, 95, 244],
			connections: mouseState.stations
		})
	}
}

function mouseDragged() {
	for (let i = 0; i < data.stations.length; i++) {
		if (onStation(data.stations[i], 64)) {
			if (mouseState.stations.indexOf(i) == -1) {
				mouseState.stations.push(i)
				return
			}
		}
	}
}

function onStation(station, radius) {
	const dx = station.x - mouseX
	const dy = station.y - mouseY
	return dx * dx + dy * dy < radius * radius
}