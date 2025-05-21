const colors = ["--indian-red", "--icterine", "--spring-green", "--raisin-black"].map((propertyName) => {
	return window.getComputedStyle(document.body).getPropertyValue(propertyName);
});

let currentVirus = 2;
const virusPresets = [
	{
		contractionProbability: 0.1,
		contractionRadius: 0.05,
		infectionTime: 1800,
	},
	{
		contractionProbability: 0.2,
		contractionRadius: 0.045,
		infectionTime: 500,
	},
	{
		contractionProbability: 0.175,
		contractionRadius: 0.075,
		infectionTime: 160,
	},
];
document.querySelector("select.VirusPicker").onchange = (ev) => {
	currentVirus = ev.target.value;

	restart();
};

document.querySelector("select.PopulationPicker").onchange = (ev) => {
	simulation_options.scale = ev.target.value;

	restart();
};

// the canvas html element we will be drawing on
const canvas = document.createElement("canvas");
const statsHTML = document.createElement("div");
console.log(statsHTML);
const infectedCountHTML = document.createElement("p");
const recoveredCountHTML = document.createElement("p");
const suseptibleCountHTML = document.createElement("p");
statsHTML.appendChild(infectedCountHTML);
statsHTML.appendChild(recoveredCountHTML);
statsHTML.appendChild(suseptibleCountHTML);
statsHTML.setAttribute("id", "figures");
document.getElementById("figures").appendChild(statsHTML);
// the canvas 'context' that gives us functions to draw with
const ctx = canvas.getContext("2d");

// the canvas size
const CANVAS_SIZE = { x: 420, y: 420 };

// add canvas to the html page
document.getElementById("sim").appendChild(canvas);

// set the width and height of the canvas
canvas.width = CANVAS_SIZE.x;
canvas.height = CANVAS_SIZE.y;

// create and start the simulation
let simulation_options = {
	scale: 4,
	size: { x: 400, y: 400 },
	populationSize: 400,
	...virusPresets[currentVirus],
};
let mySimulation = new Simulation(simulation_options);
mySimulation.offset = { x: 10, y: 10 };
mySimulation.population[0].infect(mySimulation.infectionTime);

// create the graph
let myGraph = new Graph({ x: 500, y: 300 }, { x: 0, y: 0 }, mySimulation.population.length);

// use a profiler to track how long functions take
let myProfiler = new Profiler();
myProfiler.update();
myProfiler.event("test");

let then = Date.now();

function restart() {
	// if (myGraph && myGraph.canvas) {
	// 	document.body.removeChild(myGraph.canvas);
	// }
	simulation_options = { ...simulation_options, ...virusPresets[currentVirus] };
	mySimulation.restart(simulation_options);
	mySimulation.population[0].infect();

	myGraph.restart();
	then = Date.now();

	loop();
}

function loop() {
	now = Date.now();
	deltaTime = (now - then) / 1000;
	then = now;

	// fill the entire canvas with black
	clear(ctx, colors[3], CANVAS_SIZE);

	// show the simulation
	mySimulation.show(ctx);

	// tick
	mySimulation.update_debug(deltaTime);

	// show
	myGraph.show(ctx);

	// update html stats
	infectedCountHTML.innerHTML = `Infected: ${mySimulation.population.filter((h) => h.infected).length}`;
	recoveredCountHTML.innerHTML = `Recovered: ${mySimulation.population.filter((h) => h.removed).length}`;
	suseptibleCountHTML.innerHTML = `Suseptible: ${
		mySimulation.population.filter((h) => !(h.removed || h.infected)).length
	}`;

	// continues the loop
	if (mySimulation.population.filter((h) => h.infected).length != 0) {
		window.requestAnimationFrame(loop);
	} else {
		mySimulation.show(ctx);
	}
}

// starts the loop()
window.requestAnimationFrame(loop);

setInterval(() => {
	myGraph.update(mySimulation);
}, 200);
