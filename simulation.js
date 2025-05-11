class Simulation {
	constructor(options) {
		// any options about the actual simulation
		this.options = options;

		// offset the simulation visualisation
		this.offset = { x: 0, y: 0 };

		// create the population
		this.population = [];
		for (let i = 0; i < this.options.populationSize; i++) {
			// Math.random() creates a random number between 0 and 1
			// to put the human at a random spot in the boundary, multiply by the size of boundary for each component
			this.population.push(new Human(Math.random(), Math.random(), i));
		}

		// global parameters
		this.time = 0;
		this.steps = 1;
		this.globalTimeStretch = 1;
		this.scale = 0.7;

		// human parameters
		this.perlinAcceleration = 0.7;
		this.perlinScalar = 0.001;
		this.socialDistanceScalar = 0.5;
		this.socialDistanceRadius = 0.02;

		// infection parameters
		this.contractionProbability = 0.135;
		this.contractionRadius = 0.04;
		this.contractionRadiusSquared = this.contractionRadius ** 2;
		this.infectionTime = 8;

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

	show(ctx) {
		// draw boundries of the simulation
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(this.offset.x, this.offset.y);
		ctx.lineTo(this.offset.x + this.options.size.x, this.offset.y);
		ctx.lineTo(this.offset.x + this.options.size.x, this.offset.y + this.options.size.y);
		ctx.lineTo(this.offset.x, this.offset.y + this.options.size.y);
		ctx.lineTo(this.offset.x, this.offset.y);
		ctx.stroke();
		ctx.closePath();

		this.population.forEach((human) => {
			human.show(ctx, this);
		});
	}
}
