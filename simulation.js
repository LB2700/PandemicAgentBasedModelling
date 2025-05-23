class Simulation {
	// contains an array of all humans called population

	// contains MANY parameters that control the simulation,
	// some have more of an effect than others

	// abstract all looping logic in main functions such as update and show

	// other functions help the control of the simulation and aid in debuging

	constructor(options) {
		// offset the simulation visualisation
		this.offset = { x: 0, y: 0 };
		this.size = options.size;

		// create the population
		this.population = [];
		this.populationSize = options.populationSize;
		for (let i = 0; i < this.populationSize; i++) {
			// Math.random() creates a random number between 0 and 1
			// to put the human at a random spot in the boundary, multiply by the size of boundary for each component
			this.population.push(new Human(Math.random(), Math.random(), i));
		}

		// global parameters
		this.time = 0;
		this.steps = 1;
		this.globalTimeStretch = 1;
		this.scale = options.scale * (400 / options.populationSize);

		// human parameters
		this.populationBehaviour = options.populationBehaviour;
		this.perlinAcceleration = 0.7;
		this.perlinScalar = 0.003;
		this.socialDistanceScalar = 0.01;
		this.socialDistanceRadius = 0.02;
		this.perlinMovePercentage = 0.95;
		this.humanSpeed = 1;

		// infection parameters
		this.contractionProbability = 0.05;
		this.contractionRadius = 0.05;
		this.contractionRadiusSquared = this.contractionRadius ** 2;
		this.infectionTime = 300;

		// scaled
		this.scaledContractionRadiusSquared = this.contractionRadiusSquared * this.scale;
		this.scaledSocialDistanceRadius = this.socialDistanceRadius * this.scale;
		this.scaledSocialDistanceRadiusSquared = this.socialDistanceRadius ** 2 * this.scale;

		console.log(options);
	}

	update(dT) {
		for (let i = 0; i < this.steps; i++) {
			this.time += (this.globalTimeStretch * 0.016) / this.steps;

			this.population.forEach((human) => {
				human.update(this, dT / this.steps);
			});
		}
	}

	update_debug(dT) {
		for (let i = 0; i < this.steps; i++) {
			this.time += (this.globalTimeStretch * 0.016) / this.steps;

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

	updateProps() {
		// these need only be calculated on initiation, or when their dependancies have been altered
		this.contractionRadiusSquared = this.contractionRadius ** 2;

		this.scaledContractionRadiusSquared = this.contractionRadiusSquared * this.scale;
		this.scaledSocialDistanceRadius = this.socialDistanceRadius * this.scale;
		this.scaledSocialDistanceRadiusSquared = this.socialDistanceRadius ** 2 * this.scale;
		restart();
	}

	restart(options) {
		// human parameters
		this.populationBehaviour = options.populationBehaviour;

		// infection parameters
		this.contractionRadiusSquared = this.contractionRadius ** 2;

		this.scale = options.scale;
		this.population = [];
		for (let i = 0; i < this.populationSize; i++) {
			// Math.random() creates a random number between 0 and 1
			// to put the human at a random spot in the boundary, multiply by the size of boundary for each component
			this.population.push(new Human(Math.random(), Math.random(), i));
		}
	}
}
