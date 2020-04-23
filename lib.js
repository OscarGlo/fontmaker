// Useful classes
class Vec {
    constructor(x, y) {
        if (x.x != null && x.y != null) {
            y = x.y;
            x = x.x;
        }

        this.x = x;
        this.y = y;
    }

    map(v, f) {
        [this.x, this.y] = (f == null ?
            [v(this.x), v(this.y)] :
            [f(this.x, v.x), f(this.y, v.y)]);
        return this;
    }

    add(v) {
        return this.map(v, (a, b) => a + b);
    }

    sub(v) {
        return this.map(v, (a, b) => a - b);
    }

    mul(n) {
        return this.map(a => a * n);
    }

    div(n) {
        return this.map(a => a / n);
    }

    static add(u, v) {
        return new Vec(u).add(v);
    }

    static sub(u, v) {
        return new Vec(u).sub(v);
    }

    static mul(u, n) {
        return new Vec(u).mul(n);
    }

    static div(u, n) {
        return new Vec(u).div(n);
    }
}

// Canvas functions
CanvasRenderingContext2D.prototype.line = function(x1, y1, x2, y2) {
    let off = (ctx.lineWidth % 2) * 0.5;
    [x1, y1, x2, y2] = [x1, y1, x2, y2].map(x => Math.round(x) + off);
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
}