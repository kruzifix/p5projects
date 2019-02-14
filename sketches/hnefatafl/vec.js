class vec2 {
    constructor(x, y) {
        this.x = x
        this.y = y == undefined ? x : y
    }

    add(v) {
        return new vec2(this.x + v.x, this.y + v.y)
    }
}

function vec(x, y) {
    return new vec2(x, y)
}