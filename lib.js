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

    equals(v) {
        if (v == null)
            return false;

        return this.x === v.x
            && this.y === v.y;
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
        if (n.x)
            return this.map(n, (a, b) => a * b);

        return this.map(a => a * n);
    }

    div(n) {
        if (n.x)
            return this.map(n, (a, b) => a / b);

        return this.map(a => a / n);
    }

    inRect(pos, size) {
        return this.x >= pos.x
            && this.y >= pos.y
            && this.x <= pos.x + size.x
            && this.y <= pos.y + size.y;
    }

    clamp(v, w) {
        this.x = Math.max(v.x, Math.min(this.x, w.x));
        this.y = Math.max(v.y, Math.min(this.y, w.y));
        return this;
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
    }

    get size() {
        return new Vec((this.arr[0] || []).length, this.arr.length);
    }

    get(p) {
        if (!p.inRect(this.offset, this.size))
            return null;

        p = Vec.sub(p, this.offset)
        return this.arr[p.y][p.x];
    }

    set(p, n) {
        if (this.size.x === 0 && this.size.y === 0) {
            this.offset = p;
            this.arr = [[n]];

            return this;
        }

        p = Vec.sub(p, this.offset);

        // Unshift if oob negative coordinate
        if (p.x < 0) {
            this.unshiftCol(-p.x);
            p.x = 0;
        }

        if (p.y < 0) {
            this.unshiftLine(-p.y);
            p.y = 0;
        }

        // Else push if oob positive coordinate
        if (p.x >= this.size.x)
            this.pushCol(p.x - this.size.x + 1);

        if (p.y >= this.size.y)
            this.pushLine(p.y - this.size.y + 1);

        // Set cell
        this.arr[p.y][p.x] = n;
        return this;
    }

    delete(p) {
        if (!p.inRect(this.offset, this.size.sub(new Vec(1))))
            return;

        p = Vec.sub(p, this.offset);

        if (this.arr[p.y])
            this.arr[p.y][p.x] = null;

        // Remove empty columns
        while (this.size.x > 0 && this.emptyCol(0))
            this.shiftCol();

        while (this.size.x > 0 && this.emptyCol(this.size.x - 1))
            this.popCol();

        // Remove empty lines
        while (this.size.y > 0 && this.emptyLine(0))
            this.shiftLine();

        while (this.size.y > 0 && this.emptyLine(this.size.y - 1))
            this.popLine();
    }

    emptyLine(y) {
        for (let x = 0; x < this.size.x; x++)
            if (this.arr[y][x] != null)
                return false;
        return true;
    }

    emptyCol(x) {
        for (let y = 0; y < this.size.y; y++)
            if (this.arr[y][x] != null)
                return false;
        return true
    }

    // Utility functions
    forEach(fun, useOffset = true) {
        for (let y = 0; y < this.size.y; y++)
            for (let x = 0; x < this.size.x; x++) {
                let c = this.get(new Vec(x, y).add(this.offset));
                if (c != null)
                    fun(c, x + (useOffset ? this.offset.x : 0), y + (useOffset ? this.offset.y : 0));
            }
    }

    newLine() {
        return new Array(this.size.x);
    }

    unshiftLine(n = 1) {
        this.offset.y -= n;
        for (; n > 0; n--)
            this.arr.unshift(this.newLine());
    }

    shiftLine() {
        this.offset.y++;
        this.arr.shift();
    }

    pushLine(n = 1) {
        for (; n > 0; n--)
            this.arr.push(this.newLine());
    }

    popLine() {
        this.arr.pop();
    }

    unshiftCol(n = 1) {
        this.offset.x -= n;
        this.arr.forEach(l => l.unshift(...new Array(n).fill(null)));
    }

    shiftCol() {
        this.offset.x++;
        this.arr.forEach(l => l.shift());
    }

    pushCol(n = 1) {
        this.arr.forEach(l => l.push(...new Array(n).fill(null)));
    }

    popCol() {
        this.arr.forEach(l => l.pop());
    }

    toString() {
        return "[" + this.arr.map(a => a.join(", ")).join("]\n[") + "]";
    }
}

// Canvas functions
CanvasRenderingContext2D.prototype.line = function(x1, y1, x2, y2) {
    let off = (ctx.lineWidth % 2) * 0.5;
    [x1, y1, x2, y2] = [x1, y1, x2, y2].map(x => Math.round(x) + off);
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
}