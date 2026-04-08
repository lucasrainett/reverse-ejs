import { createHexoHelpers, createCollection } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"tag": {
				"banner_img": "https://blog.example.com/img/tag-bg.jpg",
				"banner_img_height": 70,
				"banner_mask_alpha": 0.3
			}
		},
		"page": {
			"layout": "tag",
			"tag": "JavaScript",
			"title": "Tag - JavaScript",
			"subtitle": "Tag - JavaScript",
			"banner_img": "https://blog.example.com/img/tag-bg.jpg",
			"banner_img_height": 70,
			"banner_mask_alpha": 0.3,
			"posts": {
				"each": "__function__"
			},
			"total": 2
		},
		"site": {
			"tags": []
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
