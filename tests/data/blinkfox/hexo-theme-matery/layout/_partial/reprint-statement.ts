import { createHexoHelpers, createDate, createCollection } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "Pixel & Code",
			"author": "Alice Chen",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"description": "A blog about web development and design",
			"keywords": "blog, web, javascript, hexo",
			"date_format": "YYYY-MM-DD",
			"subtitle": "Thoughts on code and creativity"
		},
		"theme": {
			"reprint": {
				"enable": true,
				"default": "cc_by"
			}
		},
		"page": {
			"title": "Hello World",
			"content": "<p>This is a sample blog post with some interesting content about web development.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
			"tags": [
				{
					"name": "Node.js",
					"path": "tags/nodejs/",
					"length": 4
				},
				{
					"name": "Tutorial",
					"path": "tags/tutorial/",
					"length": 6
				}
			],
			"categories": [
				{
					"name": "JavaScript",
					"path": "categories/javascript/",
					"length": 5
				}
			],
			"excerpt": "This is a sample blog post with some interesting content.",
			"summary": "A brief overview of the Hello World post.",
			"permalink": "https://blog.example.com/posts/hello-world/",
			"path": "posts/hello-world/",
			"photos": [],
			"toc": true,
			"img": "/medias/featureimages/1.jpg",
			"description": "Page not found",
			"author": "Alice Chen",
			"password": "",
			"mathjax": false,
			"layout": "post",
			"reprintPolicy": "cc_by",
			"current": 1,
			"total": 3,
			"prev": 0,
			"next": 2,
			"prev_link": "/page/1/",
			"next_link": "/page/3/",
			"year": 2025,
			"month": 1,
			"category": "JavaScript",
			"tag": "Node.js",
			"__post": true,
			"keywords": "hexo, blog, javascript"
		},
};
