// Canvas
let canvas, ctx;
let screenSize = new Vec(0);

// Display settings
let offset = new Vec(-120, 120), tmpOffset;
let cellSize = 30, scale = 1;
let mainGridLines = new Vec(8);
let showGrid = true;
let showAxes = true;

// Drawing
let color = "hsl(0, 100%, 0%)", prevColor = color;
let prevButton = 0;
let drawing = new Dynamic2DArray();
let curPixel;

// Widgets
let tool = "move";
let widgets = {};
let dragWidget, clickWidget;

function initWidgets() {
    widgets = {
        "tools": new ToolsWidget(new Vec(20), t => {
            tool = t;
            setToolCursor();
        }),
        "color": new ColorWidget(new Vec(20, 170), c => color = c),
        "palette": new PaletteWidget(new Vec(20, 370), setColor),
        "preview": new PreviewWidget(new Vec(screenSize.x - 120, 20), drawing),
        "grid": new GridWidget(new Vec(20, screenSize.y - 150 - handleSize), (gr, ax, mgl) => {
            showGrid = gr;
            showAxes = ax;
            mainGridLines = mgl;
        })
    }
}

// Input
let mouse = {
    click: false,
    button: -1,
    dragStart: new Vec(0, 0)
};
let keys = {};

// Utility canvas functions
function cursor(type) {
    document.body.style.cursor = type;
}

function setToolCursor() {
    cursor(tool === Tool.move ? "grab" : "default")
}

function setColor(col) {
    color = col;
    widgets["color"].pickColor(col);
}

// Get grid position from window position
function gridPos(pos) {
    return Vec.sub(pos, offset).sub(Vec.div(screenSize, 2)).div(cellSize * scale).map(Math.floor);
}

function posFromGrid(pos) {
    return Vec.mul(pos, cellSize * scale).add(offset).add(Vec.div(screenSize, 2));
}

function updateCanvas() {
    canvas.width = screenSize.x = window.innerWidth;
    canvas.height = screenSize.y = window.innerHeight;

    ctx.font = "11px JetBrains Mono";
}

// Load and events listeners
window.addEventListener("load", () => {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    updateCanvas();
    setInterval(draw, 1000/60);

    initWidgets();
});

window.addEventListener("keydown", evt => {
    keys[evt.key] = true;
});

window.addEventListener("keyup", evt => {
    delete keys[evt.key];
});

window.addEventListener("resize", () => {
    updateCanvas();

    for (let w of Object.values(widgets))
        w.updateScreenPos(screenSize);

    draw();
});

window.addEventListener("contextmenu", evt => evt.preventDefault())

window.addEventListener("mousedown", evt => {
    evt.preventDefault();

    mouse.click = true;
    mouse.button = evt.button;
    mouse.dragStart = new Vec(evt);

    for (let w of Object.values(widgets).reverse())
        if (w.inHandle(evt) && evt.button === 0) {
            w.tmpPos = new Vec(w.pos);
            dragWidget = w;
            cursor("grabbing");
            return;
        } else if (w.inWidget(evt)) {
            clickWidget = w;
            w.onClick(evt);
            return;
        }

    if ((tool === Tool.move && evt.button === 0) || evt.button === 1) {
        tmpOffset = new Vec(offset);
        cursor("grabbing");
    } else if ((tool === Tool.eyedropper && evt.button === 0) || keys["Alt"]) {
        let col = drawing.get(gridPos(evt));
        if (col != null) {
            setColor(col);
        }
    } else if (tool === Tool.pencil) {
        drawPixel(evt);
    }
});

window.addEventListener("mouseup", evt => {
    mouse.click = false;
    tmpOffset = null;
    dragWidget = null;
    if (clickWidget) {
        clickWidget.onMouseUp(evt);
        clickWidget = null;
    }

    // Reset cursor
    setToolCursor();
});

window.addEventListener("mousemove", evt => {
    let drag = Vec.sub(evt, mouse.dragStart);

    if (mouse.click) {
        if (dragWidget != null) {
            dragWidget.pos = Vec.add(drag, dragWidget.tmpPos);
            dragWidget.updateScreenPos(screenSize);
        }
        else if (clickWidget != null) {
            clickWidget.onDrag(evt);
        }
        else if (tmpOffset != null) {
            offset = Vec.add(drag, tmpOffset);
        }
        else if (tool === Tool.pencil) {
            drawPixel(evt);
        }
    }
});

window.addEventListener("mousewheel", evt => {
    offset.div(scale);
    let d = evt.wheelDelta / 1200;
    scale += d;
    if (scale < 0.1) scale = 0.1;
    if (scale > 3) scale = 3;
    offset.mul(scale);
})

// User draw functions
function drawPixel(evt) {
    let p = gridPos(evt);
    if (!p.equals(curPixel) || mouse.button !== prevButton || color !== prevColor) {
        curPixel = p;
        prevButton = mouse.button;
        prevColor = color;

        if (mouse.button === 0)
            drawing.set(p, color);
        else
            drawing.delete(p);
    }
}

// Canvas draw functions
function draw() {
    ctx.clearRect(0, 0, screenSize.x, screenSize.y);
    drawGrid();
    drawCells();
    for (let w of Object.values(widgets)) {
        w.draw(ctx);
    }
}

function drawCells() {
    drawing.forEach((c, x, y) => {
        let pos = posFromGrid(new Vec(x, y));
        let size = cellSize * scale + 0.5;
        ctx.fillStyle = c;
        ctx.fillRect(pos.x, pos.y, size, size);
    });
}

function drawGrid() {
    let a = Vec.div(screenSize, 2).add(offset);
    let c = cellSize * scale;

    // Draw base grid
    if (showGrid) {
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = light;
        ctx.beginPath();
        for (let x = a.x % c; x <= screenSize.x; x += c)
            ctx.line(x, 0, x, screenSize.y);
        for (let y = a.y % c; y <= screenSize.y; y += c)
            ctx.line(0, y, screenSize.x, y);
        ctx.stroke();

        // Draw main grid lines
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        if (mainGridLines.x !== 0) {
            let mx = c * mainGridLines.x;
            for (let x = a.x % mx; x <= screenSize.x; x += mx)
                ctx.line(x, 0, x, screenSize.y);
        }
        if (mainGridLines.y !== 0) {
            let my = c * mainGridLines.y;
            for (let y = a.y % my; y <= screenSize.y; y += my)
                ctx.line(0, y, screenSize.x, y);
        }
        ctx.stroke();
    } else {
        ctx.lineWidth = 5 * scale;
    }

    // Draw axes
    if (showAxes) {
        ctx.strokeStyle = dark;
        ctx.beginPath();
        ctx.line(a.x, 0, a.x, screenSize.y);
        ctx.line(0, a.y, screenSize.x, a.y);
        ctx.stroke();
    }
}