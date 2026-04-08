import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"leancloud": {
				"comment": false,
				"count": false
			},
			"welcome": {
				"enable": true,
				"text": "Welcome to my blog!"
			},
			"start_time": "2020-01-01",
			"author": "Alice",
			"share": {
				"twitter": true,
				"facebook": true,
				"weibo": false,
				"qq": false,
				"wechat": true
			},
			"mathjax": false,
			"passwords": []
		},
		"page": {
			"lock": false,
			"type": "",
			"passwords": []
		},
		"config": {
			"author": "Alice",
			"root": "/"
		},
};
