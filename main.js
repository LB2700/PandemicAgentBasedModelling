const colors = ["--indian-red", "--icterine", "--spring-green", "--raisin-black"].map((propertyName) => {
	return window.getComputedStyle(document.body).getPropertyValue(propertyName);
});

let currentVirus = 0;
const virusPresets = [
	{
		contractionProbability: 0.05,
		contractionRadius: 0.05,
		infectionTime: 18000,
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

// TODO: make preset pickers update theyre relevent sliders, idk how im gonna do this ngl
document.querySelector("select.VirusPicker").onchange = (ev) => {
	currentVirus = ev.target.value;
	restart();
};

let populationBehaviour;
document.querySelector("select.PopBehaviourPicker").onchange = (ev) => {
	populationBehaviour = ev.target.value;
	restart();
};

document.querySelector("select.PopulationPicker").onchange = (ev) => {
	simulation_options.scale = ev.target.value;
	restart();
};

// the canvas html element we will be drawing on
const canvas = document.createElement("canvas");
const statsHTML = document.createElement("div");
const infectedCountHTML = document.createElement("p");
const recoveredCountHTML = document.createElement("p");
const suseptibleCountHTML = document.createElement("p");

document.getElementById("figures").appendChild(infectedCountHTML);
document.getElementById("figures").appendChild(recoveredCountHTML);
document.getElementById("figures").appendChild(suseptibleCountHTML);
// the canvas 'context' that gives us functions to draw with
const ctx = canvas.getContext("2d");

// the canvas size
const CANVAS_SIZE = { x: 404, y: 404 };

// add canvas to the html page
document.getElementById("sim").appendChild(canvas);

// set the width and height of the canvas
canvas.width = CANVAS_SIZE.x;
canvas.height = CANVAS_SIZE.y;

// create and start the simulation
let simulation_options = {
	scale: 4,
	size: { x: 400, y: 400 },
	...virusPresets[currentVirus],
	populationBehaviour,
};
let mySimulation = new Simulation({ ...simulation_options, populationSize: 200 });
mySimulation.offset = { x: 2, y: 2 };
mySimulation.population[0].infect(mySimulation.infectionTime);

// create the graph
let myGraph = new Graph({ x: 500, y: 300 }, { x: 0, y: 0 }, mySimulation.population.length);

// use a profiler to track how long functions take
let myProfiler = new Profiler();
myProfiler.update();
myProfiler.event("test");

let then = Date.now();

// all sliders in html have the same layout. Iterate over each one and link its
// value on change to a parameter inside mySimulation, and then restart on change
document.body.querySelectorAll(".ControlWrapper").forEach((wrapper) => {
	let simPropName = wrapper.getAttribute("data-sim-prop-name");
	let range = wrapper.querySelector(".SliderSetting");
	let number = wrapper.querySelector(".ControlNumberInput");
	// Is there a better way for this?
	// I want to access a property of mySimulation but the name of it is contained in simPropName
	let initalValue = Object.values(mySimulation)[Object.keys(mySimulation).indexOf(simPropName)];
	range.value = initalValue;
	number.value = initalValue;

	range.onchange = (ev) => {
		let value = parseFloat(ev.target.value);
		Object.defineProperty(mySimulation, simPropName, { value, writable: true });
		number.value = value;
		mySimulation.updateProps();
		console.log(mySimulation);
	};

	number.onchange = (ev) => {
		console.log(ev.target.value);
		let value = parseFloat(ev.target.value);
		Object.defineProperty(mySimulation, simPropName, { value, writable: true });
		range.value = value;
		mySimulation.updateProps();
		console.log(mySimulation);
	};
});

// open close buttons, toggle data-enable attribute. CSS takes care of the rest
document.querySelector("button.OpenCloseSettings.SimulationSettings").onclick = (ev) => {
	let target = document.querySelector(".SettingsCatagory.SimSettings .Sliders");
	target.setAttribute("data-enabled", target.getAttribute("data-enabled") == "true" ? "false" : "true");
	ev.target.innerHTML = target.getAttribute("data-enabled") == "true" ? "Close" : "Open";
};

document.querySelector("button.OpenCloseSettings.VirusSettings").onclick = (ev) => {
	let target = document.querySelector(".SettingsCatagory.VirusSettings .Sliders");
	target.setAttribute("data-enabled", target.getAttribute("data-enabled") == "true" ? "false" : "true");
	ev.target.innerHTML = target.getAttribute("data-enabled") == "true" ? "Close" : "Open";
};

function restart() {
	// if (myGraph && myGraph.canvas) {
	// 	document.body.removeChild(myGraph.canvas);
	// }
	simulation_options = { ...simulation_options, ...virusPresets[currentVirus], populationBehaviour };
	mySimulation.restart(simulation_options);
	mySimulation.population[0].infect(mySimulation.infectionTime);

	// update UI controls to represent the current simulation parameters
	Object.entries(mySimulation).forEach((e) => {
		let target = document.querySelector(`*[data-sim-prop-name=${e[0]}]`);
		if (target) {
			let slider = target.querySelector(".SliderSetting");
			let number = target.querySelector(".ControlNumberInput");
			slider.value = e[1];
			number.value = e[1];
		}
	});

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
	if (true) {
		//mySimulation.population.filter((h) => h.infected).length != 0) {
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
