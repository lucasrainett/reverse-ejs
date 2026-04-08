import { createHexoHelpers, createDate, createCollection } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"params": {
			"key": "archive",
			"postTotal": 5
		},
		"page": {
			"posts": [],
			"total": 2
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
		"post": {
			"title": "Sample Post",
			"path": "posts/sample/",
			"content": "<p>Content</p>",
			"excerpt": "Sample excerpt",
			"date": "2025-01-15",
			"updated": "2025-01-15",
			"categories": [],
			"tags": [],
			"photos": [],
			"comments": true,
			"cover": "/images/cover.jpg",
			"lang": "en",
			"subtitle": "",
			"year": 2025,
			"month": 1
		},
};
