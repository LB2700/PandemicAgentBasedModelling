class Simulation {
	constructor(options) {
		// any options about the actual simulation

		// offset the simulation visualisation
		this.offset = { x: 0, y: 0 };
		this.size = options.size;

		// create the population
		this.population = [];
		for (let i = 0; i < options.populationSize; i++) {
			// Math.random() creates a random number between 0 and 1
			// to put the human at a random spot in the boundary, multiply by the size of boundary for each component
			this.population.push(new Human(Math.random(), Math.random(), i));
		}

		// global parameters
		this.time = 0;
		this.steps = 1;
		this.globalTimeStretch = 1;
		this.scale = options.scale;

		// human parameters
		this.perlinAcceleration = 0.7;
		this.perlinScalar = 0.001;
		this.socialDistanceScalar = 0.5;
		this.socialDistanceRadius = 0.02;

		// infection parameters
		this.contractionProbability = 0.135;
		this.contractionRadius = 0.04;
		this.contractionRadiusSquared = this.contractionRadius ** 2;
		this.infectionTime = 600;

		// scaled
		this.scaledContractionRadiusSquared = this.contractionRadiusSquared * this.scale;
		this.scaledSocialDistanceRadius = this.socialDistanceRadius * this.scale;
		this.scaledSocialDistanceRadiusSquared = this.socialDistanceRadius ** 2 * this.scale;
	}

	update(dT) {
		for (let i = 0; i < this.steps; i++) {
			this.time += (this.globalTimeStretch * dT) / this.steps;

			this.population.forEach((human) => {
				human.update(this, dT / this.steps);
			});
		}
	}

	update_debug(dT) {
		for (let i = 0; i < this.steps; i++) {
			this.time += (this.globalTimeStretch * dT) / this.steps;

			myProfiler.update();

			this.population.forEach((human) => {
				human.move(this, dT / this.steps);
			});

			myProfiler.event("Move");

			this.population.forEach((human) => {
				human.infectOthers(this, dT / this.steps);
			});

			myProfiler.event("InfectOthers");

			this.population.forEach((human) => {
				human.progressInfection(this, dT / this.steps);
			});

			myProfiler.event("ProgressInfection");
		}
	}

	show(ctx) {
		// draw boundries of the simulation
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(this.offset.x, this.offset.y);
		ctx.lineTo(this.offset.x + this.size.x, this.offset.y);
		ctx.lineTo(this.offset.x + this.size.x, this.offset.y + this.size.y);
		ctx.lineTo(this.offset.x, this.offset.y + this.size.y);
		ctx.lineTo(this.offset.x, this.offset.y);
		ctx.stroke();
		ctx.closePath();

		this.population.forEach((human) => {
			human.show(ctx, this);
		});
	}

	restart(options) {
		this.scale = options.scale;
		this.population = [];
		for (let i = 0; i < options.populationSize; i++) {
			// Math.random() creates a random number between 0 and 1
			// to put the human at a random spot in the boundary, multiply by the size of boundary for each component
			this.population.push(new Human(Math.random(), Math.random(), i));
		}
	}
}
