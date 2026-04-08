import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"leancloud": {
				"comment": false
			},
			"disqus": {
				"enable": true,
				"id": "myblog"
			}
		},
		"page": {
			"path": "posts/hello-world/"
		},
};
