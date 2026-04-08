import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"post": {
				"comments": {
					"type": "utterances",
					"enable": true
				}
			}
		},
		"page": {
			"layout": "post",
			"comments": true,
			"comment": ""
		},
};
