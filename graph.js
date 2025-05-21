class Graph {
	// collects and displays data
	constructor(size, position, populationSize) {
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");

		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0, 0, 100, 100);

		this.canvas.width = size.x;
		this.canvas.height = size.y;

		document.getElementById("graph").appendChild(this.canvas);

		this.size = size;
		this.pos = position;
		this.populationSize = populationSize;
		this.history = [];
	}

	restart() {
		this.history = [];
	}

	update(simulation) {
		let data = {
			suseptible: simulation.population.filter((h) => !(h.infected || h.removed)).length,
			infected: simulation.population.filter((h) => h.infected).length,
			removed: simulation.population.filter((h) => h.removed).length,
		};
		if (data.removed !== this.populationSize) {
			this.history.push(data);
		}
	}
	show() {
		this.SIR_Model();

		this.drawAxes();
	}

	SIR_Model() {
		// draws graph like the one in 3blue1brown video, based on the SIR model

		// in-memory canvases, never added to the DOM
		let infectedCanvas = document.createElement("canvas");
		infectedCanvas.width = this.size.x;
		infectedCanvas.height = this.size.y;
		let infectedCtx = infectedCanvas.getContext("2d");

		let removedCanvas = document.createElement("canvas");
		removedCanvas.width = this.size.x;
		removedCanvas.height = this.size.y;
		let removedCtx = removedCanvas.getContext("2d");

		const drawGraph = (colour, output, callback, flipVertically = false) => {
			output.reset();
			output.beginPath();
			output.fillStyle = colour;
			output.lineTo(0, flipVertically ? 0 : this.size.y);
			this.history.forEach((data, i) => {
				let point = callback(i / (this.history.length - 1), data);
				output.lineTo(point.x, point.y);
			});
			output.lineTo(this.size.x, flipVertically ? 0 : this.size.y);
			output.lineTo(0, flipVertically ? 0 : this.size.y);
			output.fill();
			output.closePath();
		};

		// fill background with green. the parts subtracted from the other two graphs represents the people who haven't gotten the virus
		this.ctx.fillStyle = colors[2];
		this.ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);

		// infected
		drawGraph(colors[0], infectedCtx, (x, data) => {
			//console.log((data.suseptible / this.populationSize) * this.size.y);
			return { x: x * this.size.x, y: (1 - data.infected / this.populationSize) * this.size.y };
		});
		this.ctx.drawImage(infectedCanvas, this.pos.x, this.pos.y);

		// infected
		drawGraph(
			colors[1],
			removedCtx,
			(x, data) => {
				//console.log((data.suseptible / this.populationSize) * this.size.y);
				return { x: x * this.size.x, y: (data.removed / this.populationSize) * this.size.y };
			},
			true
		);
		this.ctx.drawImage(removedCanvas, this.pos.x, this.pos.y);

		// this.infectedCtx.reset();
		// this.infectedCtx.beginPath();
		// this.infectedCtx.fillStyle = "#ff0000";
		// this.infectedCtx.moveTo(0, this.size.y);

		// this.removedCtx.reset();
		// this.removedCtx.beginPath();
		// this.removedCtx.fillStyle = "#ffff00";
		// this.removedCtx.moveTo(0, this.size.y);

		// this.history.forEach((data, i) => {
		// 	let x = (i * this.size.x) / this.history.length;
		// 	this.suseptibleCtx.lineTo(
		// 		x,
		// 		this.size.y - ((data.suseptible + data.infected + data.removed) * this.size.y) / this.populationSize
		// 	);
		// 	this.infectedCtx.lineTo(x, this.size.y - (data.infected * this.size.y) / this.populationSize);
		// 	this.removedCtx.lineTo(x, this.size.y - ((data.removed + data.infected) * this.size.y) / this.populationSize);
		// });
		// this.suseptibleCtx.lineTo(this.size.x, this.size.y);
		// this.suseptibleCtx.lineTo(0, this.size.y);
		// this.suseptibleCtx.fill();
		// this.suseptibleCtx.closePath();

		// this.infectedCtx.lineTo(this.size.x, this.size.y);
		// this.infectedCtx.lineTo(0, this.size.y);
		// this.infectedCtx.fill();
		// this.infectedCtx.closePath();

		// this.removedCtx.lineTo(this.size.x, this.size.y);
		// this.removedCtx.lineTo(0, this.size.y);
		// this.removedCtx.fill();
		// this.removedCtx.closePath();
		//console.log(this.suseptibleCtx.getImageData(0, 0, this.size.x, this.size.y));
		//ctx.drawImage(infectedCanvas, this.pos.x, this.pos.y);
		//ctx.drawImage(this.removedCanvas, this.pos.x, this.pos.y);
		//ctx.drawImage(this.infectedCanvas, this.pos.x, this.pos.y);
	}

	fillGraph(ctx) {}

	drawAxes(ctx) {
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#ffffff";
		this.ctx.lineWidth = 1;
		this.ctx.moveTo(this.pos.x, this.pos.y);
		this.ctx.lineTo(this.pos.x, this.pos.y + this.size.y);
		this.ctx.lineTo(this.pos.x + this.size.x, this.pos.y + this.size.y);
		this.ctx.stroke();
		this.ctx.closePath();
	}
}
