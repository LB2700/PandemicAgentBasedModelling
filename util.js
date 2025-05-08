function dist(p1, p2) {
	return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
function distSquared(p1, p2) {
	return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}

function clear(ctx, colour, size) {
	// set an entire canvas to one colour
	ctx.fillStyle = colour;
	ctx.fillRect(0, 0, size.x, size.y);
}

function createCanvas(size) {
	let canvas = document.createElement("canvas");
	canvas.width = size.x;
	canvas.height = size.y;
	return canvas.getContext("2d");
}

function lerp(a, b, t) {
	return a + (b - a) * t;
}
