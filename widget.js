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
        ctx.textAlign = "left";
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
    fill: 2,
    select:3,
    move: 4
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
                ctx.fillRect(dPos.x, dPos.y, 30, 30);
            if (this.icons[i].loaded)
                ctx.drawImage(this.icons[i], dPos.x + 4, dPos.y + 4);
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

let colorRegEx = {
    hsl: /hsl\(([0-9]+), *([0-9]+)%, *([0-9]+)%\)/,
    rgb: /rgb\(([0-9]+), *([0-9]+), *([0-9]+)\)/,
    hex: /#(?:([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})|([0-9a-f])([0-9a-f])([0-9a-f]))/i
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

    pickColor(c) {
        [this.hue, this.saturation, this.lightness] = hsl(c);
        this.updateColor();
    }

    updateColor() {
        this.color = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`
        this.sliders[0].value = this.hue;
        this.sliders[1].value = this.saturation;
        this.sliders[2].value = this.lightness;
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
        if (new Vec(evt).inRect(Vec.add(this.pos, new Vec(10, handleSize + 10)), new Vec(100, 40))) {
            let c = prompt("Input a color in HSL, RGB or hex :\n'hsl(h, s%, l%)', 'rgb(r, g, b)' or '#RRGGBB'");
            this.pickColor(c);
        } else {
            this.sliders.forEach(s => s.onClick(evt));
        }
    }

    onDrag(evt) {
        this.sliders.forEach(s => s.onDrag(evt));
    }

    onMouseUp(evt) {
        this.sliders.forEach(s => s.selected = false);
    }
}

function hsl(color) {
    let hslMatch = color.match(colorRegEx.hsl);
    if (hslMatch)
        return hslMatch.slice(1);

    let rgbMatch = color.match(colorRegEx.rgb);
    if (rgbMatch) {
        let [, r, g, b] = rgbMatch;
        return rgbToHsl(r, g, b);
    }

    let hexMatch = color.match(colorRegEx.hex);
    if (hexMatch) {
        let [, r, g, b, R, G, B] = hexMatch;
        if (r != null)
            return rgbToHsl(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));

        R += R;
        G += G;
        B += B;
        return rgbToHsl(parseInt(R, 16), parseInt(G, 16), parseInt(B, 16));
    }

    return null;
}

function rgbToHsl(r, g, b) {
    let h, s, l;

    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let delta = max - min;

    l = (max + min) / 2;
    if (delta === 0) {
        h = 0;
        s = 100;
    } else {
        if (r === max)
            h = ((g - b) / delta) % 6;
        else if (g === max)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;
        h *= 60;
        s = delta / Math.abs(1 - (2 * l - 1));
    }

    return [h, s * 100, l * 100].map(Math.floor);
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

function drawPlus(widget, ctx, x, y) {
    x += 15;
    if (x === 105) {
        y += 15;
        x = 0;
    }
    x += widget.pos.x + 10;
    y += widget.pos.y + handleSize + 10;
    ctx.fillStyle = dark;
    ctx.fillRect(x, y, 10, 10);
    ctx.fillStyle = light;
    ctx.fillRect(x + 4, y + 2, 2, 6);
    ctx.fillRect(x + 2, y + 4, 6, 2);
}

class PaletteWidget extends Widget {
    constructor(pos, setColor) {
        super(pos, new Vec(120, 75), "Palette");
        this.setColor = setColor;
        this.colors = ["hsl(0, 100%, 0%)", "hsl(0, 100%, 50%)", "hsl(120, 100%, 50%)", "hsl(240, 100%, 50%)"];
    }

    drawContent(ctx) {
        /*// Palette background
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
            drawPlus(this, ctx, x, y);
        }
    }

    onClick(evt) {
        let pos = new Vec(evt).sub(this.pos).sub(new Vec(10, handleSize + 10));
        if (Vec.mod(pos, 15).inRect(new Vec(0), new Vec(10))) {
            let i = 7 * Math.floor(pos.y / 15) + Math.floor(pos.x / 15);

            if (i < this.colors.length) {
                // Select color
                if (evt.button === 0)
                    this.setColor(this.colors[i]);
                // Remove color
                else if (evt.button === 2)
                    this.colors.splice(i, 1);
            }
            // Add current color
            else if (i === this.colors.length && this.colors.length < 28 && !this.colors.includes(color))
                this.colors.push(color);
        }
    }
}

class CharactersWidget extends Widget {
    constructor(pos, characters, setCurrent) {
        super(pos, new Vec(120, 100), "Characters");
        this.characters = characters;
        this.current = 0;
        this.setCurrent = i => {
            this.current = i;
            setCurrent(Object.keys(this.characters)[i]);
        }
    }

    drawContent(ctx) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        let x = -15, y = 0;
        Object.keys(this.characters).forEach((c, i) => {
            x = (i % 7) * 15;
            y = Math.floor(i / 7) * 15;
            let px = this.pos.x + 10 + x,
                py = this.pos.y + handleSize + 10 + y;

            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.rect(px, py, 10, 10);
            // Outline
            if (this.current === i) {
                ctx.strokeStyle = dark;
                ctx.stroke();
            }
            // Background
            ctx.fill();
            // Character
            ctx.fillStyle = dark;
            ctx.fillText(c, px + 5, py + 5);
        });

        // Plus button
        if (Object.keys(this.characters).length < 35) {
            drawPlus(this, ctx, x, y);
        }
    }

    onClick(evt) {
        let pos = new Vec(evt).sub(this.pos).sub(new Vec(10, handleSize + 10));
        if (Vec.mod(pos, 15).inRect(new Vec(0), new Vec(10))) {
            let i = 7 * Math.floor(pos.y / 15) + Math.floor(pos.x / 15);

            let chars = Object.keys(this.characters);

            if (i < chars.length) {
                // Select color
                if (evt.button === 0)
                    this.setCurrent(i);
                // Remove color
                else if (evt.button === 2 && chars.length > 1) {
                    delete this.characters[chars[i]];
                    if (this.current > i)
                        this.setCurrent(Math.max(this.current - 1, 0));
                    else if (this.current === i)
                        this.setCurrent(Math.min(this.current, chars.length - 2));
                }
            }
            // Add character
            else if (i === chars.length && chars.length < 35) {
                let c;
                do {
                    c = prompt("New character");
                } while (c == null || c.length !== 1 || chars.includes(c));
                this.characters[c] = new Dynamic2DArray();
                this.setCurrent(chars.length);
            }
        }
    }
}