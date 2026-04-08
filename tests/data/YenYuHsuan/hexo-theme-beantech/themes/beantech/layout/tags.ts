import { createHexoHelpers, createDate, createCollection } from "../../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "My Blog",
			"subtitle": "A developer blog",
			"author": "Alice Chen",
			"description": "A blog about web development.",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"timezone": "UTC",
			"date_format": "YYYY-MM-DD",
			"home_posts_tag": true,
			"duoshuo_share": false,
			"duoshuo_username": "",
			"disqus_username": "",
			"anchorjs": false,
			"featured-tags": true,
			"SEOTitle": "My Blog - Web Development",
			"header-img": "img/home-bg.jpg",
			"friends": [
				{
					"title": "GitHub",
					"href": "https://github.com"
				}
			]
		},
		"theme": {},
		"page": {
			"title": "Hello World",
			"content": "<p>This is a sample keynote page content with some details.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
			"tags": {
				"data": [
					{
						"name": "javascript",
						"path": "tags/javascript"
					}
				],
				"length": 1
			},
			"categories": {
				"data": [
					{
						"name": "Tech",
						"path": "categories/tech"
					}
				],
				"length": 1
			},
			"excerpt": "<p>A short excerpt.</p>",
			"permalink": "https://blog.example.com/2025/01/15/hello-world/",
			"path": "2025/01/15/hello-world/",
			"layout": "keynote",
			"slug": "hello-world",
			"subtitle": "Welcome to my blog",
			"author": "Alice Chen",
			"iframe": "https://slides.example.com/presentation",
			"prev": {
				"title": "Previous Post",
				"path": "2025/01/14/prev-post/"
			},
			"next": {
				"title": "Next Post",
				"path": "2025/01/16/next-post/"
			},
			"prev_link": "2025/01/14/prev-post/",
			"next_link": "2025/01/16/next-post/",
			"header-img": "img/post-bg.jpg",
			"current": 1,
			"total": 1,
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "Getting Started with JavaScript",
						"date": "2025-01-15",
						"path": "2025/01/15/getting-started/",
						"permalink": "https://blog.example.com/2025/01/15/getting-started/",
						"excerpt": "<p>An excerpt of Getting Started with JavaScript.</p>",
						"content": "<p>Full content of Getting Started with JavaScript.</p>",
						"tags": {
							"data": [
								{
									"name": "javascript",
									"path": "tags/javascript"
								}
							],
							"length": 1
						},
						"categories": {
							"data": [
								{
									"name": "Tech",
									"path": "categories/tech"
								}
							],
							"length": 1
						},
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "A beginner guide",
						"author": "Alice Chen",
						"sticky": false,
						"hidden": false,
						"link": "",
						"updated": "2025-01-15"
					},
					{
						"title": "Advanced Node.js Patterns",
						"date": "2025-01-10",
						"path": "2025/01/10/advanced-nodejs/",
						"permalink": "https://blog.example.com/2025/01/10/advanced-nodejs/",
						"excerpt": "<p>An excerpt of Advanced Node.js Patterns.</p>",
						"content": "<p>Full content of Advanced Node.js Patterns.</p>",
						"tags": {
							"data": [
								{
									"name": "nodejs",
									"path": "tags/nodejs"
								}
							],
							"length": 1
						},
						"categories": {
							"data": [
								{
									"name": "Tech",
									"path": "categories/tech"
								}
							],
							"length": 1
						},
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "",
						"author": "Alice Chen",
						"sticky": false,
						"hidden": false,
						"link": "",
						"updated": "2025-01-10"
					}
				]
			}
		},
		"site": {
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "Getting Started with JavaScript",
						"date": "2025-01-15",
						"path": "2025/01/15/getting-started/",
						"permalink": "https://blog.example.com/2025/01/15/getting-started/",
						"excerpt": "<p>An excerpt of Getting Started with JavaScript.</p>",
						"content": "<p>Full content of Getting Started with JavaScript.</p>",
						"tags": {
							"data": [
								{
									"name": "javascript",
									"path": "tags/javascript"
								}
							],
							"length": 1
						},
						"categories": {
							"data": [
								{
									"name": "Tech",
									"path": "categories/tech"
								}
							],
							"length": 1
						},
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "A beginner guide",
						"author": "Alice Chen",
						"sticky": false,
						"hidden": false,
						"link": "",
						"updated": "2025-01-15"
					},
					{
						"title": "Advanced Node.js Patterns",
						"date": "2025-01-10",
						"path": "2025/01/10/advanced-nodejs/",
						"permalink": "https://blog.example.com/2025/01/10/advanced-nodejs/",
						"excerpt": "<p>An excerpt of Advanced Node.js Patterns.</p>",
						"content": "<p>Full content of Advanced Node.js Patterns.</p>",
						"tags": {
							"data": [
								{
									"name": "nodejs",
									"path": "tags/nodejs"
								}
							],
							"length": 1
						},
						"categories": {
							"data": [
								{
									"name": "Tech",
									"path": "categories/tech"
								}
							],
							"length": 1
						},
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "",
						"author": "Alice Chen",
						"sticky": false,
						"hidden": false,
						"link": "",
						"updated": "2025-01-10"
					}
				]
			},
			"tags": [],
			"categories": [],
			"pages": [
				{
					"title": "About",
					"path": "about/index.html"
				},
				{
					"title": "Tags",
					"path": "tags/index.html"
				}
			]
		},
		"body": "<article><p>Content</p></article>",
};
