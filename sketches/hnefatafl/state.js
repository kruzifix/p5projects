// represents board state

class state {
    constructor(size, teams) {
        this.size = size
        this.map = new Array(size)
        for (let i = 0; i < this.size; i++) {
            this.map[i] = new Array(this.size)
        }
        this.teams = Object.assign({}, teams)
    }

    // one number per team for compression, and additional position for king
}

function copyState(src) {
    let s = new state(src.size, src.teams)
    for (let x = 0; x < s.size; x++) {
        for (let y = 0; y < s.size; y++) {
            let dat = src.map[y][x]
            if (dat) {
                s.map[y][x] = Object.assign({}, dat)
            }
        }
    }
    return s
}