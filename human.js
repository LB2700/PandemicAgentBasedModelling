class Human {
	// the human class contians all the calculations regarding movement
	// also contains logic to keep track of state based on the SIR model
	// handles the infection of other humans

	constructor(x, y, i) {
		this.index = i;
		this.pos = { x, y };
		this.infected = false;
		this.removed = false;

		// every human has a starting 'position' in the perlin noise texture
		// this ensures every human doesnt move the same way
		this.perlinOffset = { x: Math.PI * this.index + 100000, y: Math.SQRT2 * this.index * 3 };

		this.moveSpeed = 1;
		this.infectionTime = 0;
	}

	// (radius/distance) * directionVector

	update(simulation, dT) {
		// top level update function. Any updates to humans on a frame by frame basis will happen here.

		// dT stands for deltaTime, the time between two frames, smooths out the simulation at low frame rates
		//  but im questioning the accuracy of the model with this implemented. Right now it only affects the time
		// the infection lasts in a human

		// move the human
		this.move(simulation, dT);
		//this.social_distance_move(simulation, dT);

		// potentially infect others
		//console.log()
		this.infectOthers(simulation, dT);
		this.progressInfection(simulation, dT);
	}

	progressInfection(simulation, dT) {
		// 'progresses' the infection. Makes it last a certain length with a counter.
		if (this.infectionTime < 0) {
			this.infected = false;
			this.removed = true;
		} else if (this.infected) {
			this.infectionTime -= simulation.globalTimeStretch;
		}
	}

	move(simulation, dT) {
		// top level movement function. interpolates between a perlin noise generater for smooth but random movement and a
		// 'social distancing' algorithm to maintain a distance between humans

		let oldPos = { ...this.pos };
		let sdA = this.get_social_distance_velocity(simulation, dT);
		let pA = this.get_perlin_velocity(simulation, dT);
		//console.log(sdA);
		let vel = {
			x: lerp(pA.x, sdA.x, simulation.perlinMovePercentage),
			y: lerp(pA.y, sdA.y, simulation.perlinMovePercentage),
		};

		// solves the issue with clumping on the edges? pretty much just applies the social distancing algorithm to the edges
		// along with the other humans. Doesn't solve the issue entirely, humans will still clump at high densities but sure look.
		//if (simulation.populationBehaviour !== 2) {
		let scale = 0.002;
		let base = 0.1;
		let speedLimit = 0.1;
		let threshhold = 0.05;
		vel.x += Math.min(Math.pow(base, this.pos.x / threshhold - 1) * scale, speedLimit);
		vel.x -= Math.min(Math.pow(base, (1 - this.pos.x) / threshhold - 1) * scale, speedLimit);
		vel.y += Math.min(Math.pow(base, this.pos.y / threshhold - 1) * scale, speedLimit);
		vel.y -= Math.min(Math.pow(base, (1 - this.pos.y) / threshhold - 1) * scale, speedLimit);

		this.pos.x += vel.x * simulation.globalTimeStretch * simulation.scale * simulation.humanSpeed * 0.1;
		this.pos.y += vel.y * simulation.globalTimeStretch * simulation.scale * simulation.humanSpeed * 0.1;
		this.boundry_collision_detection(oldPos, simulation.size);
	}

	old_move(simulation, dT) {
		// old legacy code. Very primitive movement algorithm
		let oldPos = { ...this.pos };
		this.pos.x += (Math.random() * 2 - 1) * this.moveSpeed; // random number between -1 and 1
		this.pos.y += (Math.random() * 2 - 1) * this.moveSpeed; // random number between -1 and 1

		if (this.pos.x < 0 || this.pos.x > simulation.size.x) {
			this.pos.x = oldPos.x;
		}
		if (this.pos.y < 0 || this.pos.y > simulation.size.y) {
			this.pos.y = oldPos.y;
		}
	}

	get_social_distance_velocity(simulation) {
		let out = { x: 0, y: 0 };
		let optimization = 10;

		// TODO: some visuals to go along with the project to explain some of the algorithms we used? like how we optimised this with the filter. lmk could be a shout
		simulation.population.forEach((oHuman) => {
			if (oHuman.index === this.index) return;
			if (simulation.populationBehaviour == 2 && (this.infected || !oHuman.infected)) return;
			if (simulation.populationBehaviour == 3) return;
			//
			let d = Math.min((simulation.scaledSocialDistanceRadiusSquared / distSquared(oHuman.pos, this.pos)) ** 2, 1);
			//let d = (simulation.scaledSocialDistanceRadiusSquared / distSquared(oHuman.pos, this.pos)) * 0.02;
			//if (!isFinite(d)) console.log(this);
			//console.log(d);

			let newVel = { x: (this.pos.x - oHuman.pos.x) * d, y: (this.pos.y - oHuman.pos.y) * d };
			out.x += newVel.x;
			out.y += newVel.y;
		});

		//}
		// out.x -= Math.min((simulation.scaledSocialDistanceRadius / (this.pos.x - 1)) ** 2 * 0.05, 0.2);
		// out.y += Math.min((simulation.scaledSocialDistanceRadius / -this.pos.y) ** 2 * 0.05, 0.2);
		// out.y -= Math.min((simulation.scaledSocialDistanceRadius / (this.pos.y - 1)) ** 2 * 0.05, 0.2);

		// scale end result for ease of tweaking
		out.x *= simulation.socialDistanceScalar;
		out.y *= simulation.socialDistanceScalar;
		//console.log(out);

		return out;
	}

	boundry_collision_detection(oldPos, size) {
		if (this.pos.x < 0 || this.pos.x > 1) {
			this.pos.x = oldPos.x;
		}
		if (this.pos.y < 0 || this.pos.y > 1) {
			this.pos.y = oldPos.y;
		}
	}

	get_perlin_velocity(simulation) {
		let oldPos = { ...this.pos };
		return {
			x:
				perlin.get((simulation.time + this.perlinOffset.y) * simulation.perlinAcceleration, this.perlinOffset.x) *
				simulation.perlinScalar,
			y:
				perlin.get((simulation.time + this.perlinOffset.x) * simulation.perlinAcceleration, this.perlinOffset.y) *
				simulation.perlinScalar,
		};
	}
	infectOthers(simulation) {
		// would need to loop through every other human in the system and potentially 'infect' them.
		if (this.infected) {
			let filtered = simulation.population.filter((oHuman) => {
				if (oHuman.index === this.index) return false;
				if (oHuman.removed) return false;
				if (oHuman.infected) return false;

				let min = {
					x: this.pos.x - simulation.contractionRadius * 2,
					y: this.pos.y - simulation.contractionRadius * 2,
				};
				let max = {
					x: this.pos.x + simulation.contractionRadius * 2,
					y: this.pos.y + simulation.contractionRadius * 2,
				};
				if (oHuman.pos.x > min.x && oHuman.pos.y > min.y && oHuman.pos.x < max.x && oHuman.pos.y < max.y) {
					return distSquared(this.pos, oHuman.pos) < simulation.contractionRadiusSquared;
				} else {
					return false;
				}
			});

			filtered.forEach((oH) => {
				if (Math.random() * simulation.globalTimeStretch < simulation.contractionProbability) {
					oH.infect(simulation.infectionTime);
				}
			});
		}
	}
	infect(time) {
		this.infected = true;
		this.infectionTime = time;
	}
	show(ctx, simulation) {
		// draws small circle at the humans position
		// maybe draw the humans in the different way based  on whether they are infect/removed? different colours?
		ctx.beginPath();
		// colour of human
		ctx.fillStyle = colors[2];
		if (this.removed) ctx.fillStyle = colors[1];
		if (this.infected) ctx.fillStyle = colors[0];
		ctx.arc(
			this.pos.x * simulation_options.size.x + simulation.offset.x,
			this.pos.y * simulation_options.size.y + simulation.offset.y,
			2,
			0,
			Math.PI * 2
		);
		ctx.fill();
		ctx.closePath();
	}
}
