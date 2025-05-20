class Profiler {
	constructor() {
		this.times = [];
		this.div = document.getElementById("debug");
	}
	update() {
		this.div.innerHTML = "";
		this.times.forEach((t) => {
			let child = document.createElement("p");
			child.classList.add("debugLabel");
			child.classList.add(t.eventName);
			child.innerText = t.time;
			//this.div.appendChild(child);
		});

		this.startTime = 0;
		this.then = Date.now();
		this.times = [];
	}
	event(eventName) {
		this.times.push({ eventName, time: Date.now() - this.then });
		this.then = Date.now();
	}
}
