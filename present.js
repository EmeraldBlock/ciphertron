window.addEventListener("keydown", (e) => {
	switch (e.key) {
	case " ": {
		break;
	}
	case "ArrowLeft": {
		window.opener.actions.prev();
		break;
	}
	case "ArrowRight": {
		window.opener.actions.next();
		break;
	}
	}
});
