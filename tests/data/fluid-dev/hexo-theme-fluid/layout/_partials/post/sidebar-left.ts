import { createHexoHelpers } from "../../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"post": {
				"toc": {
					"enable": true,
					"placement": "left"
				},
				"category_bar": {
					"enable": true,
					"placement": "left",
					"specific": false
				}
			}
		},
		"page": {
			"toc": true,
			"hide": false,
			"category_bar": false
		},
};
