// Canvas
let canvas, ctx;
let width, height;

// Display settings
let offset = new Vec(0, 0), tmpOffset = new Vec(0, 0);
let cellSize = 30, scale = 1;
let mainGridLines = new Vec(8, 8);

// Interactivity
let tool = "move";
let widgets = {
    "test": new Widget(new Vec(20, 20), new Vec(30, 50))
};

// Input
let mouse = {
    click: false,
    dragStart: new Vec(0, 0)
};

// Utility canvas functions
function cursor(type) {
    canvas.style.cursor = type;
}

function fitCanvas() {
    canvas.width = width = window.innerWidth;
    canvas.height = height = window.innerHeight;
}

// Load and events listeners
window.addEventListener("load", () => {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    fitCanvas();
    setInterval(draw, 1000/60);
});

window.addEventListener("mousedown", evt => {
    mouse.click = true;
    mouse.dragStart = new Vec(evt);
    tmpOffset = new Vec(offset);
    if (tool === "move")
        cursor("grabbing");
});

window.addEventListener("mouseup", evt => {
    mouse.click = false;
    if (tool === "move")
        cursor("grab");
});

window.addEventListener("mousemove", evt => {
    if (mouse.click && tool === "move")
        offset = Vec.sub(evt, mouse.dragStart).add(tmpOffset);
});

window.addEventListener("mousewheel", evt => {
    offset.div(scale);
    let d = evt.wheelDelta / 1200;
    scale += d;
    if (scale < 0.1) scale = 0.1;
    if (scale > 3) scale = 3;
    offset.mul(scale);
})

window.addEventListener("resize", () => {
    fitCanvas();
    draw();
});

// Draw functions
function draw() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    for (let w of Object.values(widgets))
        w.draw(ctx);
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