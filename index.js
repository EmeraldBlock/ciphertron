import * as pdfLib from "https://mozilla.github.io/pdf.js/build/pdf.mjs";
import { Synthesizer } from "./js/synthesizer.js";
import { Timer } from "./js/timer.js";

pdfLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.mjs";

function promisify(target, event) {
	return new Promise((resolve) => {
		target.addEventListener(event, (e) => {
			resolve(e);
		});
	});
}

const startButton = /** @type {HTMLButtonElement} */ (document.getElementById("start-button"));
const fileInput = /** @type {HTMLInputElement} */ (document.getElementById("file-input"));
const previewCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("preview-canvas"));

let pdf;

fileInput.addEventListener("change", async (e) => {
	const file = fileInput.files[0];
	const fileReader = new FileReader();
	fileReader.readAsDataURL(file);
	await promisify(fileReader, "load");
	pdf = await pdfLib.getDocument(fileReader.result).promise;
	window.actions.pages = pdf.numPages;
	await showPage({
		number: 1,
		canvas: previewCanvas,
		width: 400,
		height: 400,
	});
});

async function showPage({ number, canvas, width, height }) {
	const page = await pdf.getPage(number);
	const { width: pageWidth, height: pageHeight } = page.getViewport({ scale: 1 });
	const viewport = page.getViewport({ scale: Math.min(width / pageWidth, height / pageHeight) });
	canvas.width = viewport.width;
	canvas.height = viewport.height;
	await page.render({
		canvasContext: canvas.getContext("2d"),
		viewport,
	});
	startButton.disabled = false;
}

const timer = new Timer({
	clock: document.getElementById("clock"),
	select: document.getElementById("voice-select"),
	length: 90 * 1000,
	events: [
		{
			time: 90 * 1000,
			text: "Begin.",
		},
		{
			time: 55 * 1000,
			text: "10 seconds.",
		},
		{
			time: 45 * 1000,
			text: "2nd minute.",
		},
		{
			time: 10 * 1000,
			text: "10 seconds.",
		},
		{
			time: 0 * 1000,
			text: "Time.",
		},
	],
});

const voiceButton = /** @type {HTMLButtonElement} */ (document.getElementById("voice-button"));

voiceButton.addEventListener("click", (e) => {
	timer.synth.cancel();
	timer.synth.speak("Hello world.");
});

const startMenu = /** @type {HTMLElement} */ (document.getElementById("start-menu"));
const presentation = /** @type {HTMLElement} */ (document.getElementById("presentation"));

const pdfCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("pdf-canvas"));

async function presentPage(pageNum) {
	await showPage({
		number: pageNum,
		canvas: pdfCanvas,
		width: window.innerWidth,
		height: window.innerHeight,
	});
}

let pageNumber = 1;

let controller;

function activeCallback(time) {
	if (controller != null && !controller.closed) {
		window.requestAnimationFrame(activeCallback);
		return;
	}
	timer.reset();
	pageNumber = 1;
	presentation.classList.add("inactive");
	startMenu.classList.remove("inactive");
};

startButton.addEventListener("click", async (e) => {
	startMenu.classList.add("inactive");
	presentation.classList.remove("inactive");
	await presentPage(1);
	controller = open("./present.html", "_blank", "width=400,height=400");
	window.requestAnimationFrame(activeCallback);
});

window.addEventListener("resize", async (e) => {
	if (presentation.classList.contains("inactive")) {
		return;
	}
	await presentPage(pageNumber);
});

window.showPage = showPage;
window.actions = {
	async move(pageNum) {
		pageNumber = pageNum;
		await presentPage(pageNum);
		timer.reset();
	},
	async play() {
		timer.begin();
	},
}
