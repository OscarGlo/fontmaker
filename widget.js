let handleSize = 16;

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
        ctx.fillStyle = "rgb(150, 160, 180)";
        ctx.strokeStyle = "rgb(60, 70, 90)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y + handleSize);
        ctx.fill();
        ctx.stroke();

        // Draw handle
        ctx.fillStyle = "rgb(60, 70, 90)";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, handleSize);

        // Draw widget name
        ctx.fillStyle = "rgb(150, 160, 180)";
        ctx.textBaseline = "top";
        ctx.fillText(this.name, this.pos.x + 2, this.pos.y + 2)

        this.drawContent(ctx);
    }

    drawContent(ctx) {}
    onClick(evt) {}
}

Tool = {
    pencil: 0,
    move: 1
}
let nbTools = Object.keys(Tool).length;

class ToolsWidget extends Widget {
    constructor(pos, setTool) {
        super(pos, new Vec(40, 75), "Tools");
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
        ctx.fillStyle = "rgb(60, 70, 90)";
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

