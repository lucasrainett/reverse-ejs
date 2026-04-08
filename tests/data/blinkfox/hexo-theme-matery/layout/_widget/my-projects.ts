import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"myProjects": {
				"enable": true,
				"data": {
					"Hexo Blog": {
						"url": "https://github.com/alicechen/blog",
						"icon": "fab fa-github",
						"iconBackground": "linear-gradient(to right, #6772e5, #6b8cce)",
						"desc": "My personal blog built with Hexo"
					},
					"CSS Toolkit": {
						"url": "https://github.com/alicechen/css-toolkit",
						"icon": "fas fa-paint-brush",
						"iconBackground": "linear-gradient(to right, #ff758c, #ff7eb3)",
						"desc": "A collection of reusable CSS components"
					}
				}
			}
		},
};
