import { createHexoHelpers } from "../../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"post": {
				"banner_img": "https://blog.example.com/img/post-bg.jpg"
			},
			"index": {
				"banner_img": "https://blog.example.com/img/index-bg.jpg",
				"banner_img_height": 100,
				"banner_mask_alpha": 0.3
			},
			"banner": {
				"parallax": true,
				"random_img": false
			},
			"banner_img_list": [],
			"fun_features": {
				"typing": {
					"enable": true,
					"scope": [
						"home"
					]
				}
			},
			"scroll_down_arrow": {
				"enable": true,
				"banner_height_limit": 90
			}
		},
		"page": {
			"layout": "index",
			"banner_img": "https://blog.example.com/img/index-bg.jpg",
			"banner_img_height": 100,
			"banner_mask_alpha": 0.3,
			"subtitle": "Welcome to Pixel & Code",
			"title": "Pixel & Code"
		},
};
