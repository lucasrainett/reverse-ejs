import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"leancloud": {
				"comment": false,
				"count": false
			},
			"disqus": {
				"enable": false,
				"id": ""
			},
			"reward": [
				{
					"src": "/img/wechat.png",
					"alt": "WeChat"
				}
			]
		},
		"page": {
			"current": 1,
			"total": 3,
			"prev_link": "",
			"next_link": "/page/2/",
			"prev": null,
			"next": null,
			"type": ""
		},
};
