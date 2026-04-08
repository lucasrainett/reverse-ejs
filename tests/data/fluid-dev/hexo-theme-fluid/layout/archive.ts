import { createHexoHelpers, createCollection } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"archive": {
				"title": "Archives",
				"subtitle": "All posts in chronological order",
				"banner_img": "https://blog.example.com/img/archive-bg.jpg",
				"banner_img_height": 70,
				"banner_mask_alpha": 0.3
			}
		},
		"page": {
			"layout": "archive",
			"title": "Archives",
			"subtitle": "All posts in chronological order",
			"banner_img": "https://blog.example.com/img/archive-bg.jpg",
			"banner_img_height": 70,
			"banner_mask_alpha": 0.3,
			"posts": {
				"each": "__function__"
			},
			"total": 3
		},
		"site": {
			"posts": {
				"length": 5
			}
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
