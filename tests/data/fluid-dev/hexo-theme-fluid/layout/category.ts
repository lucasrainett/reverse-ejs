import { createHexoHelpers, createCollection } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"category": {
				"banner_img": "https://blog.example.com/img/category-bg.jpg",
				"banner_img_height": 70,
				"banner_mask_alpha": 0.3
			}
		},
		"page": {
			"layout": "category",
			"category": "JavaScript",
			"title": "Category - JavaScript",
			"subtitle": "Category - JavaScript",
			"banner_img": "https://blog.example.com/img/category-bg.jpg",
			"banner_img_height": 70,
			"banner_mask_alpha": 0.3,
			"posts": {
				"each": "__function__"
			},
			"total": 2
		},
		"site": {
			"categories": []
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
