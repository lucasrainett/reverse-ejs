import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"jsDelivr": {
				"url": "https://cdn.jsdelivr.net/gh/user/blog@latest"
			},
			"sharejs": {
				"enable": true,
				"sites": "wechat,qq,weibo,tencent,twitter,facebook"
			},
			"addthis": {
				"enable": false,
				"pubid": "ra-5c5c5c5c5c5c5c5c"
			}
		},
};
