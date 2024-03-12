export class Synthesizer {
	/**
	 * @param {HTMLSelectElement} select
	 */
	constructor(select) {
		this.select = select;
		window.speechSynthesis.addEventListener("voiceschanged", this.refresh.bind(this));
		this.refresh();
	}
	refresh() {
		this.select.replaceChildren();
		this.voices = {};
		for (const voice of window.speechSynthesis.getVoices()) {
			const option = document.createElement("option");
			option.textContent = `${voice.name} (${voice.lang})`;
			option.value = voice.name;
			option.selected = voice.default;
			this.select.add(option);
			this.voices[voice.name] = voice;
		}
	}
	/**
	 * @param {string} text
	 */
	speak(text) {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.voice = this.voices[this.select.selectedOptions[0].value];
		utterance.lang = utterance.voice.lang;
		window.speechSynthesis.speak(utterance);
	}
	cancel() {
		window.speechSynthesis.cancel();
	}
}
