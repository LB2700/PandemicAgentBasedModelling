let mySelect = document.getElementById("select");
console.log(mySelect);
mySelect.onchange = (ev) => {
	const selectedValue = ev.target.value;
	simulation_options.populationSize = selectedValue;

	restart();
};

// the canvas html element we will be drawing on
const canvas = document.createElement("canvas");
const statsHTML = document.getElementById("stats");
const infectedCountHTML = document.createElement("h2");
const recoveredCountHTML = document.createElement("h2");
const suseptibleCountHTML = document.createElement("h2");
document.body.appendChild(infectedCountHTML);
document.body.appendChild(recoveredCountHTML);
document.body.appendChild(suseptibleCountHTML);

// the canvas 'context' that gives us functions to draw with
const ctx = canvas.getContext("2d");

// the canvas size
const CANVAS_SIZE = { x: 420, y: 420 };

// add canvas to the html page
document.body.appendChild(canvas);

// set the width and height of the canvas
canvas.width = CANVAS_SIZE.x;
canvas.height = CANVAS_SIZE.y;

// create the simulation
let simulation_options = {
	size: { x: 400, y: 400 },
	populationSize: mySelect.children[0].getAttribute("value"),
};
let mySimulation = new Simulation(simulation_options);
mySimulation.offset = { x: 10, y: 10 };
mySimulation.population[0].infect();

mySimulation.population[0].pos = { x: 0.1, y: 0.5 };
mySimulation.population[1].pos = { x: 0.12, y: 0.5 };

let myGraph = new Graph({ x: 500, y: 300 }, { x: 0, y: 0 }, mySimulation.population.length);

let myProfiler = new Profiler();

let then = Date.now();

function restart() {
	if (myGraph && myGraph.canvas) {
		document.body.removeChild(myGraph.canvas);
	}
	mySimulation = new Simulation(simulation_options);
	mySimulation.offset = { x: 10, y: 10 };

	mySimulation.population[0].infect();
	myGraph = new Graph({ x: 500, y: 300 }, { x: 0, y: 0 }, mySimulation.population.length);

	myGraph.restart();
	then = Date.now();

	loop();
}

function loop() {
	myProfiler.update();

	now = Date.now();
	deltaTime = (now - then) / 1000;
	then = now;

	// fill the entire canvas with black
	clear(ctx, "#000000", CANVAS_SIZE);

	// show the simulation
	myProfiler.event("Show");
	mySimulation.show(ctx);

	myProfiler.event("Update");
	mySimulation.update(deltaTime);

	// mySimulation.time += deltaTime;

	// let times = [];

	// now = Date.now();
	// mySimulation.population.forEach((h) => {
	// 	h.move(mySimulation, deltaTime);
	// });
	// times.push(Date.now() - now);
	// mySimulation.population.forEach((h) => {
	// 	h.infectOthers(mySimulation, deltaTime);
	// });
	// times.push(Date.now() - now);
	// mySimulation.population.forEach((h) => {
	// 	h.progressInfection(deltaTime);
	// });
	// times.push(Date.now() - now);
	// console.log(`Move takes ${times[0]} milliseconds`);

	myGraph.show(ctx);

	infectedCountHTML.innerHTML = `Infected: ${mySimulation.population.filter((h) => h.infected).length}`;
	recoveredCountHTML.innerHTML = `Recovered: ${mySimulation.population.filter((h) => h.removed).length}`;
	suseptibleCountHTML.innerHTML = `Suseptible: ${
		mySimulation.population.filter((h) => !(h.removed || h.infected)).length
	}`;

	myProfiler.event("End");

	// continues the loop
	if (mySimulation.population.filter((h) => h.infected).length != 0) {
		window.requestAnimationFrame(loop);
	}
}

// starts the loop()
window.requestAnimationFrame(loop);

setInterval(() => {
	myGraph.update(mySimulation);
}, 500);
