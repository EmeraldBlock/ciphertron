import { Synthesizer } from "./synthesizer.js";

/**
 * @param {number} seconds
 */
function timeString(seconds) {
	const ss = seconds % 60;
	const minutes = Math.floor(seconds / 60);
	return `${minutes.toFixed(0)}:${ss.toFixed(0).padStart(2, '0')}`;
}

export class Timer {
	/**
	 * @param {object} config
	 * @param {HTMLElement} config.clock
	 * @param {HTMLSelectElement} config.select
	 * @param {number} config.length
	 * @param {{ time: number, text: string }[]} config.events
	 */
	constructor({ clock, select, length, events }) {
		this.clock = clock;
		this.synth = new Synthesizer(select);
		this.length = length;
		this.events = events;

		this.reset();
	}
	reset() {
		this.synth.cancel();
		if (this.request != null) {
			window.cancelAnimationFrame(this.request);
		}
		this.clock.classList.remove("exhausted");
		this.clock.classList.add("pending");
		this.clock.innerText = timeString(Math.ceil(this.length / 1000));
	}
	begin() {
		this.reset();
		this.clock.classList.remove("pending");
		this.endTime = document.timeline.currentTime + this.length;
		this.event = 0;
		this.callback = (time) => {
			const timeLeft = Math.max(this.endTime - time, 0);
			this.clock.innerText = timeString(Math.ceil(timeLeft / 1000));
			if (this.event < this.events.length && timeLeft <= this.events[this.event].time) {
				this.synth.cancel();
				this.synth.speak(this.events[this.event].text);
				++this.event;
			}
			if (timeLeft > 0) {
				this.request = window.requestAnimationFrame(this.callback);
			} else {
				this.clock.classList.add("exhausted");
				this.callback = undefined;
			}
		};
		this.request = window.requestAnimationFrame(this.callback);
	}
}
