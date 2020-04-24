// Useful classes
class Vec {
    constructor(x, y) {
        if (y == null) {
            if (x == null) {
                x = y = 0;
            } else {
                if (x.x != null && x.y != null) {
                    y = x.y;
                    x = x.x;
                } else {
                    y = x;
                }
            }
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

    inRect(pos, size) {
        return this.x >= pos.x
            && this.y >= pos.y
            && this.x <= pos.x + size.x
            && this.y <= pos.y + size.y;
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

class Dynamic2DArray {
    constructor() {
        this.arr = [];
        this.offset = new Vec(0);
        this.size = new Vec(0);
    }

    get(p) {
        p = Vec.sub(p, this.offset)

        if (p.x >= 0 && p.x < this.size.x && p.y >= 0 && p.y < this.size.y)
            return this.arr[p.y][p.x];
        return null;
    }

    set(p, n) {
        if (this.width === 0 && this.height === 0) {
            this.offset.x = x;
            this.offset.y = y;
            this.arr = [[n]];

            return this;
        }

        p = Vec.sub(p, this.offset)

        // Unshift and increment offset if oob negative coordinate
        if (x < 0) {
            this.offset.x += x;
            this.unshiftCol(-x);
            p.x = 0;
        }

        if (y < 0) {
            this.offset.y += y;
            this.unshiftLine(-y);
            p.y = 0;
        }

        // Else push if oob coordinate
        if (x >= this.size.x)
            this.pushCol(x - this.size.x + 1);

        if (y >= this.size.y)
            this.pushLine(y - this.size.y + 1);

        // Set cell
        this.arr[y][x] = n;

        return this;
    }

    newLine() {
        return new Array(this.size.x).fill(0);
    }

    unshiftLine(n = 1) {
        for (; n > 0; n--)
            this.arr.unshift(this.newLine());
    }

    pushLine(n = 1) {
        for (; n > 0; n--)
            this.arr.push(this.newLine());
    }

    unshiftCol(n = 1) {
        this.arr.forEach(l => l.unshift(...new Array(n).fill(0)));
    }

    pushCol(n = 1) {
        this.arr.forEach(l => l.push(...new Array(n).fill(0)));
    }
}

// Canvas functions
CanvasRenderingContext2D.prototype.line = function(x1, y1, x2, y2) {
    let off = (ctx.lineWidth % 2) * 0.5;
    [x1, y1, x2, y2] = [x1, y1, x2, y2].map(x => Math.round(x) + off);
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
}