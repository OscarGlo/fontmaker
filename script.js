// Canvas
let canvas, ctx;
let width, height;

// Display settings
let offset = new Vec(-120, 120), tmpOffset = null;
let cellSize = 30, scale = 1;
let mainGridLines = new Vec(8, 8);

// Drawing
let color = "black";
let drawing = new Dynamic2DArray();

// Widgets
let tool = "move";
let widgets = {};
let curWidget = null;

function initWidgets() {
    widgets = {
        "tools": new ToolsWidget(new Vec(20, 20), t => {
            tool = t;
            setToolCursor();
        })
    }
}

// Input
let mouse = {
    click: false,
    dragStart: new Vec(0, 0)
};

// Utility canvas functions
function cursor(type) {
    document.body.style.cursor = type;
}

function setToolCursor() {
    cursor(tool === Tool.move ? "grab" : "default")
}

function updateCanvas() {
    canvas.width = width = window.innerWidth;
    canvas.height = height = window.innerHeight;

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

window.addEventListener("resize", () => {
    updateCanvas();
    draw();
});

window.addEventListener("contextmenu", evt => evt.preventDefault())

window.addEventListener("mousedown", evt => {
    evt.preventDefault();

    if (!mouse.click) {
        mouse.click = true;
        mouse.dragStart = new Vec(evt);

        for (let w of Object.values(widgets).reverse())
            if (w.inHandle(evt)) {
                w.tmpPos = new Vec(w.pos);
                curWidget = w;
                cursor("grabbing");
                return;
            } else if (w.inWidget(evt)) {
                w.onClick(evt);
                return;
            }

        if (tool === Tool.move || evt.button === 1) {
            tmpOffset = new Vec(offset);
            cursor("grabbing");
        }
    }
});

window.addEventListener("mouseup", evt => {
    mouse.click = false;
    curWidget = null;
    tmpOffset = null;

    // Reset cursor
    setToolCursor();
});

window.addEventListener("mousemove", evt => {
    let drag = Vec.sub(evt, mouse.dragStart);

    if (curWidget != null) {
        curWidget.pos = Vec.add(drag, curWidget.tmpPos);
    }
    else if (tmpOffset != null) {
        offset = Vec.add(drag, tmpOffset);
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

// Draw functions
function draw() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    for (let w of Object.values(widgets)) {
        w.draw(ctx);
    }
}

function drawGrid() {
    let ax = width / 2 + offset.x,
        ay = height / 2 + offset.y;

    // Draw base grid
    let c = cellSize * scale;
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = "rgb(150, 160, 180)";
    ctx.beginPath();
    for (let x = ax % c; x <= width; x += c)
        ctx.line(x, 0, x, height);
    for (let y = ay % c; y <= height; y += c)
        ctx.line(0, y, width, y);
    ctx.stroke();

    // Draw main grid lines
    ctx.lineWidth = 5 * scale;
    ctx.beginPath();
    if (mainGridLines.x !== 0) {
        let mx = c * mainGridLines.x;
        for (let x = ax % mx; x <= width; x += mx)
            ctx.line(x, 0, x, height);
    }
    if (mainGridLines.y !== 0) {
        let my = c * mainGridLines.y;
        for (let y = ay % my; y <= height; y += my)
            ctx.line(0, y, width, y);
    }
    ctx.stroke();

    // Draw axes
    ctx.strokeStyle = "rgb(60, 70, 90)";
    ctx.beginPath();
    ctx.line(ax, 0, ax, height);
    ctx.line(0, ay, width, ay);
    ctx.stroke();
}