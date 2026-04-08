import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "Pixel & Code"
		},
		"theme": {
			"jsDelivr": {
				"url": "https://cdn.jsdelivr.net/gh/user/blog@latest"
			},
			"logo": "/medias/logo.png",
			"githubLink": {
				"enable": true,
				"url": "https://github.com/alicechen/blog",
				"title": "Fork on GitHub"
			},
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
