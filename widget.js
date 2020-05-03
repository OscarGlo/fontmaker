let handleSize = 16;
let dark = "rgb(60, 70, 90)", light = "rgb(150, 160, 180)";

class Widget {
    constructor(pos, size, name) {
        this.pos = pos;
        this.tmpPos = null;
        this.size = size;
        this.name = name;
    }

    inHandle(p) {
        return new Vec(p).inRect(this.pos, new Vec(this.size.x, handleSize));
    }

    inWidget(p) {
        return new Vec(p).inRect(this.pos, Vec.add(this.size, new Vec(0, handleSize)));
    }

    draw(ctx) {
        // Draw main
        ctx.fillStyle = light;
        ctx.strokeStyle = dark;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y + handleSize);
        ctx.fill();
        ctx.stroke();

        // Draw handle
        ctx.fillStyle = dark;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, handleSize);

        // Draw widget name
        ctx.fillStyle = light;
        ctx.textBaseline = "top";
        ctx.fillText(this.name, this.pos.x + 2, this.pos.y + 2)

        this.drawContent(ctx);
    }

    updateScreenPos(screenSize) {
        this.pos.clamp(new Vec(), Vec.sub(screenSize, this.size).sub(new Vec(0, handleSize)));
    }

    drawContent(ctx) {}
    onClick(evt) {}
    onDrag(evt) {}
    onMouseUp(evt) {}
}

class Slider {
    constructor(parent, pos, width, name, min, max, value, updateValue) {
        this.parent = parent;
        this.pos = pos;
        this.width = width;
        this.name = name;
        this.min = min;
        this.max = max;
        this.value = value;
        this.updateValue = updateValue;
        this.selected = false;
    }

    get actualPos() {
        return Vec.add(this.pos, this.parent.pos).add(new Vec(0, handleSize));
    }

    get dispValue() {
        return this.width * (this.value - this.min) / (this.max - this.min);
    }

    draw(ctx) {
        // Title
        ctx.textBaseline = "top";
        ctx.fillStyle = dark;
        ctx.fillText(this.name + " " + this.value, this.actualPos.x, this.actualPos.y)

        // Slider
        ctx.fillRect(this.actualPos.x, this.actualPos.y + 18.5, this.width, 3)

        // Slider head
        ctx.fillStyle = light;
        ctx.strokeStyle = dark;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(this.actualPos.x + this.dispValue, this.actualPos.y + 20,
            6, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    onClick(evt) {
        if (new Vec(evt).inRect(Vec.add(this.actualPos, new Vec(this.dispValue - 4, 16)), new Vec(8, 8)))
            this.selected = true;
    }

    onDrag(evt) {
        if (this.selected) {
            this.value = Math.round((this.max - this.min) * (evt.x - this.pos.x - this.parent.pos.x) / this.width + this.min);
            this.value = Math.max(this.min, Math.min(this.value, this.max));

            this.updateValue(this.value);
        }
    }
}

class Checkbox {
    constructor(parent, pos, name, value, updateValue) {
        this.parent = parent;
        this.pos = pos;
        this.name = name;
        this.value = value;
        this.updateValue = updateValue;
    }

    get actualPos() {
        return Vec.add(this.pos, this.parent.pos).add(new Vec(0, handleSize));
    }

    draw(ctx) {
        ctx.strokeStyle = dark;
        ctx.fillStyle = dark;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(this.actualPos.x, this.actualPos.y, 10, 10);
        if (!this.value)
            ctx.fill();
        ctx.stroke();

        // Title
        ctx.textBaseline = "top";
        ctx.fillStyle = dark;
        ctx.fillText(this.name, this.actualPos.x + 20, this.actualPos.y)
    }

    onClick(evt) {
        if (new Vec(evt).inRect(this.actualPos, new Vec(10))) {
            this.value = !this.value;
            this.updateValue(this.value);
        }
    }
}

Tool = {
    pencil: 0,
    eyedropper: 1,
    move: 2
};
let nbTools = Object.keys(Tool).length;

class ToolsWidget extends Widget {
    constructor(pos, setTool) {
        super(pos, new Vec(40, 5 + 35 * nbTools), "Tools");
        this.icons = [];
        Object.keys(Tool).forEach((name, i) => {
            let ic = this.icons[i] = new Image();
            ic.loaded = false;
            ic.src = `resources/img/${name}.png`;
            ic.onload = () => ic.loaded = true;
        });

        this.setTool = t => {
            this.tool = t;
            setTool(t);
        }
        this.setTool(Tool.pencil);
    }

    drawContent(ctx) {
        ctx.fillStyle = dark;
        for (let i = 0; i < nbTools; i++) {
            let dPos = Vec.add(this.pos, new Vec(5, 5 + handleSize + 35 * i));
            if (this.tool === i)
                ctx.fillRect(dPos.x, dPos.y,30, 30)
            if (this.icons[i].loaded)
                ctx.drawImage(this.icons[i], dPos.x + 4, dPos.y + 4)
        }
    }

    onClick(evt, canvas) {
        let p = new Vec(evt).sub(this.pos).sub(new Vec(5, 5 + handleSize));

        for (let i = 0; i < nbTools; i++) {
            if (p.inRect(new Vec(0, 35 * i), new Vec(30, 30))) {
                this.setTool(i);
                break;
            }
        }
    }
}

class PreviewWidget extends Widget {
    constructor(pos, drawing) {
        super(pos, new Vec(100, 100), "Preview");
        this.drawing = drawing;
    }

    drawContent(ctx) {
        // Draw preview
        let s = new Vec(this.drawing.size);
        let prevArea = new Vec(90, 64);

        let ratio = Vec.div(prevArea, s);
        let r = Math.min(ratio.x, ratio.y, 10);
        let start = Vec.add(this.pos, new Vec(50, 37 + handleSize)).sub(Vec.mul(s, r / 2));

        this.drawing.forEach((c, x, y) => {
            ctx.fillStyle = c;
            ctx.fillRect(start.x + r * x, start.y + r * y, r + 0.5, r + 0.5);
        }, false);

        // Divider
        ctx.fillStyle = dark;
        ctx.fillRect(this.pos.x, this.pos.y + handleSize + 76, this.size.x, 2)

        // Print preview size
        ctx.fillText(`${s.x}×${s.y} px`, this.pos.x + 10, this.pos.y + handleSize + 83)
    }
}

class ColorWidget extends Widget {
    constructor(pos, setColor) {
        super(pos, new Vec(120, 160), "Color");
        this.setColor = setColor;
        this.color = "black";
        this.hue = 0;
        this.saturation = 100;
        this.lightness = 0;

        this.sliders = [
            new Slider(this, new Vec(10, 60), 100, "Hue", 0, 360, this.hue, h => {
                this.hue = h;
                this.updateColor();
            }),
            new Slider(this, new Vec(10, 90), 100, "Saturation", 0, 100, this.saturation, s => {
                this.saturation = s;
                this.updateColor();
            }),
            new Slider(this, new Vec(10, 120), 100, "Lightness", 0, 100, this.lightness, l => {
                this.lightness = l;
                this.updateColor();
            })
        ];
    }

    changeColor(c) {
        let g = c.match(/hsl\((?<h>[0-9]+), ?(?<s>[0-9]+)%, ?(?<l>[0-9]+)%\)/).groups;
        this.color = c;
        this.hue = this.sliders[0].value = g.h;
        this.saturation = this.sliders[1].value = g.s;
        this.lightness = this.sliders[2].value = g.l;
    }

    updateColor() {
        this.color = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`
        this.setColor(this.color);
    }

    drawContent(ctx) {
        // Color viewer
        ctx.lineWidth = 3;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = dark;
        ctx.beginPath();
        ctx.rect(this.pos.x + 10, this.pos.y + handleSize + 10, 100, 40);
        ctx.fill();
        ctx.stroke();

        // Input buttons
        /*ctx.fillStyle = dark;
        ctx.strokeRect(this.pos.x + 10, this.pos.y + handleSize + 155, 30, 20);
        ctx.fillText("RGB", this.pos.x + 15, this.pos.y + handleSize + 160)
        ctx.strokeRect(this.pos.x + 10, this.pos.y + handleSize + 155, 30, 20);*/

        this.sliders.forEach(s => s.draw(ctx));
    }

    onClick(evt) {
        this.sliders.forEach(s => s.onClick(evt));
    }

    onDrag(evt) {
        this.sliders.forEach(s => s.onDrag(evt));
    }

    onMouseUp(evt) {
        this.sliders.forEach(s => s.selected = false);
    }
}

class GridWidget extends Widget {
    constructor(pos, setParams) {
        super(pos, new Vec(100, 125), "Grid");
        this.setParams = setParams;
        this.showGrid = true;
        this.showAxes = true;
        this.mainGridLines = new Vec(8);
        this.checkboxes = [
            new Checkbox(this, new Vec(10), "Show grid", true, g => {
                this.showGrid = g;
                this.updateParams();
            }),
            new Checkbox(this, new Vec(10, 30), "Show axes", true, a => {
                this.showAxes = a;
                this.updateParams();
            })
        ];
        this.sliders = [
            new Slider(this, new Vec(10, 60), 80, "V lines", 0, 20, 8, x => {
                this.mainGridLines.x = x;
                this.updateParams();
            }),
            new Slider(this, new Vec(10, 90), 80, "H lines", 0, 20, 8, y => {
                this.mainGridLines.y = y;
                this.updateParams();
            })
        ];
    }

    updateParams() {
        this.setParams(this.showGrid, this.showAxes, this.mainGridLines)
    }

    drawContent(ctx) {
        this.checkboxes.forEach(c => c.draw(ctx));
        this.sliders.forEach(s => s.draw(ctx));
    }

    onClick(evt) {
        this.checkboxes.forEach(c => c.onClick(evt));
        this.sliders.forEach(s => s.onClick(evt));
    }

    onDrag(evt) {
        this.sliders.forEach(s => s.onDrag(evt));
    }

    onMouseUp(evt) {
        this.sliders.forEach(s => s.selected = false);
    }
}

class PaletteWidget extends Widget {
    constructor(pos, setColor) {
        super(pos, new Vec(120, 75
        ), "Palette");
        this.setColor = setColor;
        this.colors = ["hsl(0, 100%, 0%)"];
    }

    drawContent(ctx) {
        /*// Palette backgrond
        ctx.fillStyle = dark;
        ctx.fillRect(this.pos.x + 5, this.pos.y + handleSize + 5, 110, Math.floor((this.colors.length - 1) / 7) * 15 + 20);
        */
        // Colors
        let x = -15, y = 0;
        this.colors.forEach((c, i) => {
            ctx.fillStyle = c;
            x = (i % 7) * 15;
            y = Math.floor(i / 7) * 15;
            ctx.fillRect(this.pos.x + 10 + x, this.pos.y + handleSize + 10 + y, 10, 10);
        });

        // Plus button
        if (this.colors.length < 28) {
            x += 15;
            if (x === 105) {
                y += 15;
                x = 0;
            }
            x += this.pos.x + 10;
            y += this.pos.y + handleSize + 10;
            ctx.fillStyle = dark;
            ctx.fillRect(x, y, 10, 10);
            ctx.fillStyle = light;
            ctx.fillRect(x + 4, y + 2, 2, 6);
            ctx.fillRect(x + 2, y + 4, 6, 2);
        }
    }

    onClick(evt) {
        let pos = new Vec(evt).sub(this.pos).sub(new Vec(10, handleSize + 10));
        if (Vec.mod(pos, 15).inRect(new Vec(0), new Vec(10))) {
            let i = 7 * Math.floor(pos.y / 15) + Math.floor(pos.x / 15);

            if (i < this.colors.length) {
                if (evt.button === 0)
                    this.setColor(this.colors[i]);
                else if (evt.button === 2)
                    this.colors.splice(i, 1);
            } else if (i === this.colors.length && this.colors.length < 28 && !this.colors.includes(color))
                this.colors.push(color);
        }
    }
}