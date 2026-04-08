import { createHexoHelpers, createDate, createCollection } from "../../../helpers";

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
			"jsDelivr": {
				"url": "https://cdn.jsdelivr.net/gh/user/blog@latest"
			},
			"dream": {
				"enable": true
			},
			"music": {
				"enable": true,
				"fixed": false
			},
			"video": {
				"enable": true
			},
			"recommend": {
				"enable": true
			},
			"featureImages": [
				"/medias/featureimages/0.jpg",
				"/medias/featureimages/1.jpg",
				"/medias/featureimages/2.jpg",
				"/medias/featureimages/3.jpg"
			]
		},
		"page": {
			"current": 1,
			"total": 3,
			"posts": [
				{
					"title": "Getting Started with Hexo",
					"path": "posts/getting-started-with-hexo/",
					"img": "/medias/featureimages/1.jpg",
					"date": "2025-01-11",
					"updated": "2025-01-13",
					"content": "<p>Getting Started with Hexo content goes here with detailed information.</p>",
					"excerpt": "Getting Started with Hexo content goes here with detailed information.",
					"summary": "A brief overview of Getting Started with Hexo.",
					"author": "Alice Chen",
					"cover": true,
					"coverImg": "/medias/cover/featured.jpg",
					"top": true,
					"toc": true,
					"password": "",
					"mathjax": false,
					"layout": "post",
					"categories": [
						{
							"name": "JavaScript",
							"path": "categories/javascript/",
							"length": 5
						},
						{
							"name": "Web Dev",
							"path": "categories/web-dev/",
							"length": 3
						}
					],
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
					]
				},
				{
					"title": "Advanced CSS Tricks",
					"path": "posts/advanced-css-tricks/",
					"img": "/medias/featureimages/2.jpg",
					"date": "2025-01-12",
					"updated": "2025-01-14",
					"content": "<p>Advanced CSS Tricks content goes here with detailed information.</p>",
					"excerpt": "Advanced CSS Tricks content goes here with detailed information.",
					"summary": "A brief overview of Advanced CSS Tricks.",
					"author": "Alice Chen",
					"cover": false,
					"top": true,
					"toc": true,
					"password": "",
					"mathjax": false,
					"layout": "post",
					"categories": [
						{
							"name": "JavaScript",
							"path": "categories/javascript/",
							"length": 5
						},
						{
							"name": "Web Dev",
							"path": "categories/web-dev/",
							"length": 3
						}
					],
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
					]
				},
				{
					"title": "React Hooks Deep Dive",
					"path": "posts/react-hooks-deep-dive/",
					"img": "/medias/featureimages/3.jpg",
					"date": "2025-01-13",
					"updated": "2025-01-15",
					"content": "<p>React Hooks Deep Dive content goes here with detailed information.</p>",
					"excerpt": "React Hooks Deep Dive content goes here with detailed information.",
					"summary": "A brief overview of React Hooks Deep Dive.",
					"author": "Alice Chen",
					"cover": false,
					"top": false,
					"toc": true,
					"password": "",
					"mathjax": false,
					"layout": "post",
					"categories": [
						{
							"name": "JavaScript",
							"path": "categories/javascript/",
							"length": 5
						},
						{
							"name": "Web Dev",
							"path": "categories/web-dev/",
							"length": 3
						}
					],
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
					]
				}
			]
		},
		"site": {
			"posts": [
				{
					"title": "Getting Started with Hexo",
					"path": "posts/getting-started-with-hexo/",
					"img": "/medias/featureimages/1.jpg",
					"date": "2025-01-11",
					"updated": "2025-01-13",
					"content": "<p>Getting Started with Hexo content goes here with detailed information.</p>",
					"excerpt": "Getting Started with Hexo content goes here with detailed information.",
					"summary": "A brief overview of Getting Started with Hexo.",
					"author": "Alice Chen",
					"cover": true,
					"coverImg": "/medias/cover/featured.jpg",
					"top": true,
					"toc": true,
					"password": "",
					"mathjax": false,
					"layout": "post",
					"categories": [
						{
							"name": "JavaScript",
							"path": "categories/javascript/",
							"length": 5
						},
						{
							"name": "Web Dev",
							"path": "categories/web-dev/",
							"length": 3
						}
					],
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
					]
				},
				{
					"title": "Advanced CSS Tricks",
					"path": "posts/advanced-css-tricks/",
					"img": "/medias/featureimages/2.jpg",
					"date": "2025-01-12",
					"updated": "2025-01-14",
					"content": "<p>Advanced CSS Tricks content goes here with detailed information.</p>",
					"excerpt": "Advanced CSS Tricks content goes here with detailed information.",
					"summary": "A brief overview of Advanced CSS Tricks.",
					"author": "Alice Chen",
					"cover": false,
					"top": true,
					"toc": true,
					"password": "",
					"mathjax": false,
					"layout": "post",
					"categories": [
						{
							"name": "JavaScript",
							"path": "categories/javascript/",
							"length": 5
						},
						{
							"name": "Web Dev",
							"path": "categories/web-dev/",
							"length": 3
						}
					],
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
					]
				},
				{
					"title": "React Hooks Deep Dive",
					"path": "posts/react-hooks-deep-dive/",
					"img": "/medias/featureimages/3.jpg",
					"date": "2025-01-13",
					"updated": "2025-01-15",
					"content": "<p>React Hooks Deep Dive content goes here with detailed information.</p>",
					"excerpt": "React Hooks Deep Dive content goes here with detailed information.",
					"summary": "A brief overview of React Hooks Deep Dive.",
					"author": "Alice Chen",
					"cover": false,
					"top": false,
					"toc": true,
					"password": "",
					"mathjax": false,
					"layout": "post",
					"categories": [
						{
							"name": "JavaScript",
							"path": "categories/javascript/",
							"length": 5
						},
						{
							"name": "Web Dev",
							"path": "categories/web-dev/",
							"length": 3
						}
					],
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
					]
				}
			],
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
				},
				{
					"name": "CSS",
					"path": "tags/css/",
					"length": 3
				}
			],
			"categories": [
				{
					"name": "JavaScript",
					"path": "categories/javascript/",
					"length": 5
				},
				{
					"name": "Web Dev",
					"path": "categories/web-dev/",
					"length": 3
				},
				{
					"name": "Design",
					"path": "categories/design/",
					"length": 2
				}
			],
			"data": {
				"friends": [
					{
						"name": "Bob Li",
						"avatar": "/medias/avatars/bob.jpg",
						"introduction": "Full-stack developer",
						"url": "https://bob.example.com",
						"title": "Visit Blog"
					},
					{
						"name": "Carol Wang",
						"avatar": "/medias/avatars/carol.jpg",
						"introduction": "UI/UX designer",
						"url": "https://carol.example.com",
						"title": "Visit Blog"
					}
				],
				"recommends": [
					{
						"title": "Getting Started with Hexo",
						"path": "posts/getting-started-with-hexo/",
						"img": "/medias/featureimages/1.jpg",
						"content": "<p>Getting started content.</p>",
						"summary": "Learn how to set up Hexo.",
						"categories": [
							{
								"name": "JavaScript",
								"path": "categories/javascript/"
							}
						],
						"categoryName": "JavaScript",
						"categoryPath": "categories/javascript/",
						"top": true
					},
					{
						"title": "Advanced CSS Tricks",
						"path": "posts/advanced-css-tricks/",
						"img": "/medias/featureimages/2.jpg",
						"content": "<p>CSS tricks content.</p>",
						"summary": "Master advanced CSS techniques.",
						"categories": [
							{
								"name": "Web Dev",
								"path": "categories/web-dev/"
							}
						],
						"categoryName": "Web Dev",
						"categoryPath": "categories/web-dev/",
						"top": true
					}
				]
			}
		},
};
