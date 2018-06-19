class Ball {
	constructor(x, y) {
		this.x = x
		this.y = y
		this.vx = random(-1, 1) * 6
		this.vy = random(2, 6)
		this.hue = random(0, 30) + floor(random(2)) * 30
		this.r = random(8, 32)
		this.life = 2
	}

	show() {
		stroke(0)
		
		const sat = map(sin(this.x * 0.01), -1, 1, 60, 80)
		const bri = map(this.y, 0, height, 80, 20) + this.r
		fill(this.hue, sat, bri)

		const r = this.r * map(this.y, 0, height, 1, 3)
		ellipse(this.x, this.y, r, r)
	}

	move() {
		this.x += this.vx
		this.y += this.vy

		if (this.y > height) {
			this.y -= height + this.r
			this.life--
		}
		if (this.x > width) {
			this.x -= width
		}
		if (this.x < 0) {
			this.x += width
		}
	}
}

const balls = []

function setup() {
	createCanvas(640, 640)
	colorMode(HSB, 100, 100, 100)

	for (let i = 0; i < 100; i++) {
		balls.push(new Ball(width / 2, 0))
	}
}

function draw() {
	//background(51)

	for (let b of balls) {
		if (b.life > 0) {
			b.move()
			b.show()
		}
	}
}