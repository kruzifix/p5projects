const tileSize = 64

let boardOffset = vec(tileSize / 2)

// accepts (vec2) and (int, int)
function tilePos(x, y) {
	let tx = x
	let ty = y
	if (x instanceof vec2 && y == undefined) {
		tx = x.x
		ty = x.y
	}
	return boardOffset.add(vec(tx * tileSize, ty * tileSize))
}

let boardSize
let castles
let currentState

let history = []

let boardData = {}
function preload() {
	boardData = loadJSON('board_9.json')
}

let dragging = null
let dragTargets = null

function setup() {
	boardSize = boardData.size
	let size = (boardSize + 1) * tileSize
	createCanvas(size + 100, size + 40)
	castles = boardData.castles.map(c => vec(c[0], c[1]))

	teams = {}
	for (const [name, team] of Object.entries(boardData.teams)) {
		const col = color(...team.color)
		teams[name] = { col: col, captures: 0 }
	}
	currentState = new state(boardSize, teams)
	for (const [name, team] of Object.entries(boardData.teams)) {
		for (let fig of team.figures) {
			const dat = { pos: vec(fig.x, fig.y), team: name }
			if (fig.king) {
				dat.king = true
			}
			currentState.map[fig.y][fig.x] = dat
		}
	}
}

function draw() {
	background(151)

	stroke(0)
	fill(255)
	for (let x = 0; x < boardSize; x++) {
		for (let y = 0; y < boardSize; y++) {
			let pos = tilePos(x, y)
			rect(pos.x, pos.y, tileSize, tileSize)
		}
	}

	noStroke()
	fill(201)
	for (let c of castles) {
		let pos = tilePos(c)
		rect(pos.x+1, pos.y+1, tileSize-1, tileSize-1)
	}

	let mpos = mousePos()
	if (mpos) {
		noStroke()
		fill(0, 40)
		let pos = tilePos(mpos)
		rect(pos.x, pos.y, tileSize, tileSize)
	}

	noStroke()
	fill(191)
	{
		const left = boardOffset.x + boardSize * tileSize + 10;
		const top = boardOffset.y;

		rect(left, top, 110, boardSize * tileSize)

		fill(221)
		for (let i = 0; i < history.length; i++) {
			rect(left + 4, top + 4 + i * 60, 102, 50)
		}
	}

	//drawState(currentState)

	noStroke()
	fill(151, 214, 130, 100)
	for (let i in dragTargets) {
		let pos = tilePos(dragTargets[i])
		rect(pos.x+1, pos.y+1, tileSize-1, tileSize-1)
	}

	if (dragging) {
		stroke(100)
		fill(currentState.teams[dragging.team].col)
		let pos = vec(mouseX, mouseY)
		ellipse(pos.x, pos.y, tileSize-5, tileSize-5)
		if (dragging.king) {
			fill(0)
			rect(pos.x-3, pos.y -tileSize/2 + 7, 6, tileSize-14)
			rect(pos.x - tileSize/2 + 7, pos.y-3, tileSize-14, 6)
		}

		if (mpos && dragTargets.some(t => t.x == mpos.x && t.y == mpos.y)) {
			// draw arrow!
			let startPos = tilePos(dragging.pos)
			let targetPos = tilePos(mpos)
			let o = tileSize / 2

			let dx = Math.sign(mpos.x - dragging.pos.x)
			let dy = Math.sign(mpos.y - dragging.pos.y)

			targetPos.x -= dx * o
			targetPos.y -= dy * o

			noFill()
			stroke(currentState.teams[dragging.team].col)
			strokeWeight(8)
			line(startPos.x+o, startPos.y+o, targetPos.x+o, targetPos.y+o)
			strokeWeight(1)
		}
	}
}

function mousePressed() {
	let mpos = mousePos()
	if (!mpos)
		return
	console.log('pressed: ' + mpos.x + ',' + mpos.y)
	let fig = currentState.map[mpos.y][mpos.x]
	if (!fig)
		return
	dragging = fig
	// figure out squares fig can move to
	dragTargets = []
	// move into directions until hit edge or other ifg
	for (let x = fig.pos.x + 1; x < boardSize; x++) {
		if (currentState.map[fig.pos.y][x])
			break
		if (!fig.king && castles.some(c => c.x == x && c.y == fig.pos.y))
			break
		dragTargets.push(vec(x, fig.pos.y))
	}
	for (let x = fig.pos.x - 1; x >= 0; x--) {
		if (currentState.map[fig.pos.y][x])
			break
		if (!fig.king && castles.some(c => c.x == x && c.y == fig.pos.y))
			break
		dragTargets.push(vec(x, fig.pos.y))
	}
	for (let y = fig.pos.y + 1; y < boardSize; y++) {
		if (currentState.map[y][fig.pos.x])
			break
		if (!fig.king && castles.some(c => c.x == fig.pos.x && c.y == y))
			break
		dragTargets.push(vec(fig.pos.x, y))
	}
	for (let y = fig.pos.y - 1; y >= 0; y--) {
		if (currentState.map[y][fig.pos.x])
			break
		if (!fig.king && castles.some(c => c.x == fig.pos.x && c.y == y))
			break
		dragTargets.push(vec(fig.pos.x, y))
	}
}

function mouseDragged() {

}

function mouseReleased() {
	let mpos = mousePos()
	
	if (mpos) {
		if (dragTargets && dragTargets.some(t => t.x == mpos.x && t.y == mpos.y)) {
			console.log('move ('+dragging.pos.x+','+dragging.pos.y+') -> (' + mpos.x + ',' + mpos.y + ')')
			
			history.push(currentState)
			console.log(history)

			currentState = copyState(currentState)

			const map = currentState.map
			const teams = currentState.teams

			map[dragging.pos.y][dragging.pos.x] = null
			dragging.pos = mpos
			map[dragging.pos.y][dragging.pos.x] = dragging

			// check capture!
			if (mpos.x >= 2) { // left
				let next = map[mpos.y][mpos.x - 1]
				if (next && !next.king && next.team != dragging.team) {
					let next2 = map[mpos.y][mpos.x - 2]
					if (next2 && next2.team == dragging.team) {
						// CAPTURED!
						console.log('left capture')
						map[mpos.y][mpos.x - 1] = null
						teams[dragging.team].captures++
					}
				}
			}
			if (mpos.x < boardSize - 2) { // right
				let next = map[mpos.y][mpos.x + 1]
				if (next && !next.king && next.team != dragging.team) {
					let next2 = map[mpos.y][mpos.x + 2]
					if (next2 && next2.team == dragging.team) {
						// CAPTURED!
						console.log('right capture')
						map[mpos.y][mpos.x + 1] = null
						teams[dragging.team].captures++
					}
				}
			}
			if (mpos.y >= 2) { // top
				let next = map[mpos.y - 1][mpos.x]
				if (next && !next.king && next.team != dragging.team) {
					let next2 = map[mpos.y - 2][mpos.x]
					if (next2 && next2.team == dragging.team) {
						// CAPTURED!
						console.log('top capture')
						map[mpos.y - 1][mpos.x] = null
						teams[dragging.team].captures++
					}
				}
			}
			if (mpos.y < boardSize - 2) { // bottom
				let next = map[mpos.y + 1][mpos.x]
				if (next && !next.king && next.team != dragging.team) {
					let next2 = map[mpos.y + 2][mpos.x]
					if (next2 && next2.team == dragging.team) {
						// CAPTURED!
						console.log('bot capture')
						map[mpos.y + 1][mpos.x] = null
						teams[dragging.team].captures++
					}
				}
			}
		}
	}

	dragging = null
	dragTargets = null
}

function drawState(state) {
	noStroke()
	for (let x = 0; x < boardSize; x++) {
		for (let y = 0; y < boardSize; y++) {
			let fig = state.map[y][x]
			if (fig == null || fig == dragging)
				continue
			let pos = tilePos(x, y)
			if (mpos && x == mpos.x && y == mpos.y) {
				stroke(100)
			} else {
				noStroke()
			}
			fill(state.teams[fig.team].col)
			ellipse(pos.x + tileSize/2, pos.y + tileSize/2, tileSize-5, tileSize-5)
			if (fig.king) {
				fill(0)
				rect(pos.x + tileSize/2-3, pos.y + 7, 6, tileSize-14)
				rect(pos.x + 7, pos.y + tileSize/2-3, tileSize-14, 6)
			}
		}
	}

	stroke(100)
	fill(state.teams['def'].col)
	const radius = tileSize * 0.8
	const top = boardOffset.y + (boardSize) * tileSize + radius*0.8
	for (let i = 0; i < state.teams['atk'].captures; i++) {
		ellipse(boardOffset.x + (i + 1.3) * radius * 0.5, top, radius, radius)
	}

	fill(state.teams['atk'].col)
	const right = boardOffset.x + (boardSize) * tileSize
	for (let i = 0; i < state.teams['def'].captures; i++) {
		ellipse(right - (i + 1.3) * radius * 0.5, top, radius, radius)
	}
}

function mousePos() {
	let mx = ((mouseX - boardOffset.x) / tileSize)
	let my = ((mouseY - boardOffset.y) / tileSize)
	if (mx < 0 || my < 0 || mx >= boardSize || my >= boardSize) {
		return undefined
	}
	return vec(int(mx), int(my))
}