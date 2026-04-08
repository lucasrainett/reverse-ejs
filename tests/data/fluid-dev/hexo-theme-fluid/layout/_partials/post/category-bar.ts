import { createHexoHelpers, createDate, createCollection } from "../../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"post": {
				"category_bar": {
					"enable": true,
					"post_limit": 5,
					"post_order_by": "-date",
					"specific": false,
					"placement": "left"
				}
			},
			"category": {
				"collapse_depth": 2
			}
		},
		"page": {
			"categories": [],
			"category_bar": false,
			"_id": "post001"
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
		"post": {
			"title": "Sample Post",
			"path": "posts/sample/",
			"permalink": "https://example.com/posts/sample/",
			"content": "<p>Sample content</p>",
			"excerpt": "Sample excerpt",
			"abstract": "",
			"date": "2025-01-15",
			"updated": "2025-01-15",
			"categories": [],
			"tags": [],
			"photos": [],
			"comments": true,
			"cover": "/images/cover.jpg",
			"lang": "en",
			"subtitle": "",
			"top": false,
			"sticky": false,
			"lock": false,
			"link": ""
		},
};
