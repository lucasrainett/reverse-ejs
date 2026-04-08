import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"footer": [
				{
					"title": "Links",
					"children": [
						{
							"path": "https://github.com",
							"name": "GitHub"
						},
						{
							"path": "/about",
							"name": "About"
						}
					]
				}
			],
			"leancloud": {
				"count": false
			},
			"busuanzi": false,
			"footer_contact": "alice@example.com"
		},
};
