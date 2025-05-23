// distance function
function dist(p1, p2) {
	return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
// distance function without the square root
function distSquared(p1, p2) {
	return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
}

// set an entire canvas to one colour
function clear(ctx, colour, size) {
	ctx.fillStyle = colour;
	ctx.fillRect(0, 0, size.x, size.y);
}

// linearly-interpolates between to numbers based on a percentage given as t
function lerp(a, b, t) {
	return a + (b - a) * t;
}

