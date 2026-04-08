import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"root": "/",
			"language": "en"
		},
		"theme": {
			"menu": {
				"Index": {
					"url": "/",
					"icon": "fas fa-home"
				},
				"Tags": {
					"url": "/tags",
					"icon": "fas fa-tags"
				},
				"Categories": {
					"url": "/categories",
					"icon": "fas fa-bookmark"
				},
				"Archives": {
					"url": "/archives",
					"icon": "fas fa-archive"
				},
				"About": {
					"url": "/about",
					"icon": "fas fa-address-card"
				},
				"Contact": {
					"url": "/contact",
					"icon": "fas fa-comments"
				},
				"Friends": {
					"url": "/friends",
					"icon": "fas fa-address-book"
				}
			}
		},
};
