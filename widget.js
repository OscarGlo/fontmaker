let handleSize = 16;

class Widget {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }

    draw(ctx) {
        // Draw main
        ctx.fillStyle = "rgb(150, 160, 180)";
        ctx.strokeStyle = "rgb(60, 70, 90)";
        ctx.strokeWidth = 3;
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.size.x, this.size.y + handleSize);
        ctx.fill();
        ctx.stroke();

        // Draw handle
        ctx.fillStyle = "rgb(60, 70, 90)";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, handleSize);
    }
}