class Human {
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
		if (this.infectionTime == 0) {
		} else if (this.infectionTime < 0) {
			this.infected = false;
			this.removed = true;
		} else {
			this.infectionTime -= dT * simulation.globalTimeStretch;
		}
	}

	move(simulation, dT) {
		// top level movement function. interpolates between a perlin noise generater for smooth but random movement and a
		// 'social distancing' algorithm to maintain a distance between humans

		let oldPos = { ...this.pos };
		let sdA = this.get_social_distance_velocity(simulation, dT);
		let pA = this.get_perlin_velocity(simulation, dT);
		let vel = {
			x: lerp(sdA.x, pA.x, 0.9) * simulation.globalTimeStretch * simulation.scale,
			y: lerp(sdA.y, pA.y, 0.9) * simulation.globalTimeStretch * simulation.scale,
		};
		this.pos.x += vel.x;
		this.pos.y += vel.y;
		this.boundry_collision_detenction(oldPos, simulation.options.size);
	}

	old_move(simulation, dT) {
		// old legacy code. Very primitive movement algorithm
		let oldPos = { ...this.pos };
		this.pos.x += (Math.random() * 2 - 1) * this.moveSpeed; // random number between -1 and 1
		this.pos.y += (Math.random() * 2 - 1) * this.moveSpeed; // random number between -1 and 1

		if (this.pos.x < 0 || this.pos.x > simulation.options.size.x) {
			this.pos.x = oldPos.x;
		}
		if (this.pos.y < 0 || this.pos.y > simulation.options.size.y) {
			this.pos.y = oldPos.y;
		}
	}

	get_social_distance_velocity(simulation, dT) {
		let out = { x: 0, y: 0 };
		let optimization = 10;

		// TODO: some visuals to go along with the project to explain some of the algorithms we used? like how we optimised this with the filter. lmk could be a shout
		simulation.population.forEach((oHuman) => {
			if (oHuman.index === this.index || oHuman.removed) return;
			let d = Math.min((simulation.scaledSocialDistanceRadiusSquared / distSquared(oHuman.pos, this.pos)) ** 2, 1);

			let newVel = { x: (this.pos.x - oHuman.pos.x) * d, y: (this.pos.y - oHuman.pos.y) * d };
			out.x += newVel.x;
			out.y += newVel.y;
		});

		// solves the issue with clumping on the edges? pretty much just applies the social distancing algorithm to the edges
		// along with the other humans. Doesn't solve the issue entirely, humans will still clump at high densities but sure look.
		out.x += Math.min((simulation.scaledSocialDistanceRadius / -this.pos.x) ** 2 * 0.05, 0.2);
		out.x -= Math.min((simulation.scaledSocialDistanceRadius / (this.pos.x - 1)) ** 2 * 0.05, 0.2);
		out.y += Math.min((simulation.scaledSocialDistanceRadius / -this.pos.y) ** 2 * 0.05, 0.2);
		out.y -= Math.min((simulation.scaledSocialDistanceRadius / (this.pos.y - 1)) ** 2 * 0.05, 0.2);

		// scale end result for ease of tweaking
		out.x *= simulation.socialDistanceScalar;
		out.y *= simulation.socialDistanceScalar;

		return out;
	}

	boundry_collision_detenction(oldPos, size) {
		if (this.pos.x < 0 || this.pos.x > 1) {
			this.pos.x = oldPos.x;
		}
		if (this.pos.y < 0 || this.pos.y > 1) {
			this.pos.y = oldPos.y;
		}
	}

	get_perlin_velocity(simulation, dT) {
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
	infectOthers(simulation, dT) {
		// would need to loop through every other human in the system and potentially 'infect' them.
		if (this.infected) {
			let filtered = simulation.population.filter((oHuman) => {
				if (oHuman.index === this.index) return false;
				if (oHuman.removed) return false;

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
				if (Math.random() * simulation.globalTimeStretch < simulation.contractionProbability * dT) {
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
		ctx.fillStyle = "#00ff00";
		if (this.removed) ctx.fillStyle = "#ffff00";
		if (this.infected) ctx.fillStyle = "#ff0000";
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
