let mySelect = document.getElementById("select");
console.log(mySelect);
mySelect.onchange = (ev) => {
	const selectedValue = ev.target.value;
	simulation_options.populationSize = selectedValue;

	restart();
};

// the canvas html element we will be drawing on
const canvas = document.createElement("canvas");
const statsHTML = document.createElement("div");
console.log(statsHTML);
const infectedCountHTML = document.createElement("h2");
const recoveredCountHTML = document.createElement("h2");
const suseptibleCountHTML = document.createElement("h2");
statsHTML.appendChild(infectedCountHTML);
statsHTML.appendChild(recoveredCountHTML);
statsHTML.appendChild(suseptibleCountHTML);
statsHTML.setAttribute("id", "figures");
document.getElementById("figures").appendChild(statsHTML)
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
	size: { x: 400, y: 400 },
	populationSize: mySelect.children[0].getAttribute("value"),
};
let mySimulation = new Simulation(simulation_options);
mySimulation.offset = { x: 10, y: 10 };
mySimulation.population[0].infect();

// create the graph
let myGraph = new Graph({ x: 500, y: 300 }, { x: 0, y: 0 }, mySimulation.population.length);

// use a profiler to track how long functions take
let myProfiler = new Profiler();
myProfiler.update();
myProfiler.event("test");

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
	now = Date.now();
	deltaTime = (now - then) / 1000;
	then = now;

	// fill the entire canvas with black
	clear(ctx, "#000000", CANVAS_SIZE);

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
	}
}

// starts the loop()
window.requestAnimationFrame(loop);
