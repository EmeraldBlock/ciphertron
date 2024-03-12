import * as pdfLib from "https://mozilla.github.io/pdf.js/build/pdf.mjs";

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
const pdfCanvas = /** @type {HTMLCanvasElement} */ (document.getElementById("pdf-canvas"));

let pdf;
let pageNum = 1;

fileInput.addEventListener("change", async (e) => {
	const file = fileInput.files[0];
	const fileReader = new FileReader();
	fileReader.readAsDataURL(file);
	await promisify(fileReader, "load");
	pdf = await pdfLib.getDocument(fileReader.result).promise;
	await showPage(pageNum);
});

async function showPage(pageNumber) {
	const page = await pdf.getPage(pageNumber);
	const viewport = page.getViewport({ scale: 2 });
	pdfCanvas.width = viewport.width;
	pdfCanvas.height = viewport.height;
	await page.render({
		canvasContext: pdfCanvas.getContext("2d"),
		viewport,
	});
}

startButton.addEventListener("click", (e) => {
	open("./present.html", undefined, "width=400,height=400");
});

window.actions = {
	async prev() {
		pageNum = Math.max(pageNum - 1, 1);
		await showPage(pageNum);
	},
	async next() {
		pageNum = Math.min(pageNum + 1, pdf.numPages);
		await showPage(pageNum);
	},
	async play() {

	},
}
