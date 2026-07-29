(function () {
	const buttonIcons = {
		"Paper": "fas fa-file-alt",
		"Extended Abstract": "fas fa-file-alt",
		"Report": "fas fa-file-alt",
		"Project Page": "fas fa-globe",
		"Website": "fas fa-globe",
		"Code": "fab fa-github",
		"Slides": "fas fa-file-powerpoint",
		"Slides (Presentation)": "fas fa-file-powerpoint",
		"Poster": "fas fa-image",
		"YouTube": "fab fa-youtube",
		"Notes": "fas fa-sticky-note",
		"File": "fas fa-file-alt",
		"File 1": "fas fa-file-alt",
		"File 2": "fas fa-file-alt"
	};

	document.querySelectorAll(".publications-page .custom-button").forEach(function (button) {
		const iconClass = buttonIcons[button.textContent.trim()];
		if (!iconClass || button.querySelector("i")) return;

		const icon = document.createElement("i");
		icon.className = iconClass;
		icon.setAttribute("aria-hidden", "true");
		button.prepend(icon);
	});
})();
