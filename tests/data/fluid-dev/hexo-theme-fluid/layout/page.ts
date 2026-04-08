import { createHexoHelpers } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"page": {
				"banner_img": "https://blog.example.com/img/page-bg.jpg",
				"banner_img_height": 70,
				"banner_mask_alpha": 0.3
			}
		},
		"page": {
			"layout": "page",
			"title": "Custom Page",
			"subtitle": "A custom page",
			"banner_img": "https://blog.example.com/img/page-bg.jpg",
			"banner_img_height": 70,
			"banner_mask_alpha": 0.3,
			"content": "<p>This is a custom page with some content.</p>"
		},
		"config": {
			"title": "Pixel & Code",
			"subtitle": "A Developer's Journey",
			"author": "Alice Chen",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"theme": "fluid",
			"description": "A blog about web development and design",
			"keywords": [
				"javascript",
				"web",
				"development"
			],
			"date_format": "YYYY-MM-DD",
			"pagination_dir": "page",
			"index_generator": {
				"order_by": "-date"
			}
		},
};
