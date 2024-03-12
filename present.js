if (window.opener == null) {
	document.body.classList.add("disconnected");
	throw new Error("Needs presentation");
}

const instructions = /** @type {HTMLElement} */ (document.getElementById("instructions"));
const pageInfo = /** @type {HTMLElement} */ (document.getElementById("page-info"));

const pages = window.opener.actions.pages;
let pageNum = 1;

pageInfo.innerText = `Page ${pageNum} of ${pages}`;

async function prev() {
	if (pageNum == 1) {
		return;
	}
	--pageNum;
	pageInfo.innerText = `Page ${pageNum} of ${pages}`;
	await window.opener.actions.move(pageNum);
}

async function next() {
	if (pageNum == pages) {
		return;
	}
	++pageNum;
	pageInfo.innerText = `Page ${pageNum} of ${pages}`;
	await window.opener.actions.move(pageNum);
}

window.addEventListener("keydown", async (e) => {
	switch (e.key) {
	case " ": {
		await next();
		window.opener.actions.play();
		break;
	}
	case "ArrowLeft": {
		await prev();
		break;
	}
	case "ArrowRight": {
		await next();
		break;
	}
	}
});

function focusCallback(time) {
	if (window.opener == null) {
		window.close();
	}
	if (document.hasFocus()) {
		instructions.classList.remove("unfocused");
	} else {
		instructions.classList.add("unfocused");
	}
	window.requestAnimationFrame(focusCallback);
};
window.requestAnimationFrame(focusCallback);
