const particles = []

function setup() {
	createCanvas(windowWidth, windowHeight)
	background(51)
	angleMode(DEGREES)

	for (let i = 0; i < 40; i++) {
		particles.push(new Particle(width / 2, height / 2))
	}
}

function draw() {
	background(16, 150, 30, 30)

	for (let p of particles) {
		p.move()
		p.show()
	}
}

class Particle {
	constructor(x, y) {
		this.x = x
		this.y = y
		this.angle = 45 * floor(random(8))
		this.speed = 4 * (1 + floor(random(2)))
		this.size = 8
		this.trail = []
		this.delay = 1
		this.col = random(1) < 0.5 ? 200 : 51
	}

	get vel() {
		return {
			x: cos(this.angle) * this.speed, 
			y: sin(this.angle) * this.speed
		}
	}

	line(x0, y0, x1, y1) {
		const dx = x1 - x0
		const dy = y1 - y0
		const dist = dx * dx + dy * dy
		if (dist < width * width / 4) {
			line(x0, y0, x1, y1)
		}
	}

	show() {
		if (this.trail.length < 2)
			return
		stroke(this.col)
		noFill()
		for (let i = 1; i < this.trail.length; i++) {
			strokeWeight(map(i, 1, this.trail.length - 1, 1, 4))
			const t0 = this.trail[i - 1]
			const t1 = this.trail[i]
			this.line(t0.x, t0.y, t1.x, t1.y)
		}

		const t0 = this.trail[this.trail.length - 1]
		this.line(t0.x, t0.y, this.x, this.y)

		noStroke()
		fill(this.col)
		for (let i = 0; i < this.trail.length; i++) {
			const x = map(i, 0, this.trail.length - 1, 0, 1)
			const r = map(x * x * x, 0, 1, 8, 16)
			const t = this.trail[i]
			ellipse(t.x, t.y, r, r)
		}
		while (this.trail.length > 10) {
			this.trail.splice(0, 1)
		}
	}

	move() {
		if (this.delay > 0) {
			this.delay--
			if (!this.delay) {
				const d = floor(random(3) - 1)
				this.angle += 45 * d

				this.delay = 10
				this.trail.push({x: this.x, y: this.y});
			}
		}

		const v = this.vel

		let nx = this.x + v.x
		let ny = this.y + v.y

		if (nx > width) {
			nx = 0
		}
		if (nx < 0) {
			nx = width
		}
		if (ny > height) {
			ny = 0
		}
		if (ny < 0) {
			ny = height
		}
		this.x = nx
		this.y = ny
	}
}