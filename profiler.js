class Profiler {
	constructor() {
		this.times = [];
	}
	update() {
		this.now = Date.now();
		this.times = [];
	}
	event(eventName) {
		this.times.push({ eventName, time: Date.now() });
	}
}
