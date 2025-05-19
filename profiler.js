class Profiler {
	constructor() {
		this.times = [];
		// link needed to create svg elements, idk why it works.
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("width", "300");
		this.svg.setAttribute("height", "300");
		this.svg.setAttribute("viewBox", "0 0 400 400");
		document.body.appendChild(this.svg);
	}
	update() {
		this.startTime = 0;
		this.then = Date.now();
		this.times = [];
	}
	event(eventName) {
		this.times.push({ eventName, time: Date.now() - this.then });
	}
	show() {
		this.svg.innerHTML = null;

		let T = 0;
		this.times.forEach((t) => {
			T += t.time;
		});

		this.times.forEach((t) => {
			let p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			let d = "";
			let theta = (t.time / T) * 2 * Math.PI;
			console.log((t.time / T) * 2 * Math.PI);

			let point = { x: Math.cos(theta) * 200, y: Math.sin(theta) * 200 };

			d += "M200 200 l200 0 ";
			d += `A200 200 0 0 0 ${point.x} ${point.y}`;

			p.setAttribute("d", d);

			this.svg.appendChild(p);
		});
	}
}
