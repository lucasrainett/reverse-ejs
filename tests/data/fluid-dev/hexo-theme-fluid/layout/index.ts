import { createHexoHelpers, createDate, createCollection } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"index": {
				"banner_img": "https://blog.example.com/img/index-bg.jpg",
				"banner_img_height": 100,
				"banner_mask_alpha": 0.3,
				"slogan": {
					"enable": true,
					"text": "Welcome to Pixel & Code"
				},
				"post_url_target": "_self",
				"post_sticky": {
					"enable": true,
					"icon": "iconfont icon-top"
				},
				"auto_excerpt": {
					"enable": true
				},
				"post_meta": {
					"date": true,
					"category": true,
					"tag": true
				}
			},
			"post": {
				"default_index_img": "https://blog.example.com/img/default-post.jpg"
			}
		},
		"page": {
			"layout": "index",
			"subtitle": "Welcome to Pixel & Code",
			"banner_img": "https://blog.example.com/img/index-bg.jpg",
			"banner_img_height": 100,
			"banner_mask_alpha": 0.3,
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
		"date_format": "YYYY-MM-DD",
};
