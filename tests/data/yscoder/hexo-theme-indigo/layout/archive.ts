import { createHexoHelpers, createDate, createCollection } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "Pixel & Code",
			"subtitle": "Thoughts on modern web development",
			"author": "Alice Chen",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"description": "A blog about web development, JavaScript, and open source tools.",
			"keywords": "web development, javascript, nodejs",
			"date_format": "YYYY-MM-DD",
			"archive_dir": "archives",
			"relative_link": false,
			"feed": {
				"path": "atom.xml"
			},
			"highlight": {
				"enable": true
			},
			"search": {
				"path": "search.xml"
			},
			"archive": {
				"per_page": 10
			},
			"tag": {
				"per_page": 10
			},
			"category": {
				"per_page": 10
			}
		},
		"theme": {
			"color": "#3F51B5",
			"favicon": "/favicon.ico",
			"avatar": "/images/avatar.jpg",
			"avatar_link": "/",
			"email": "alice@example.com",
			"rss": "/atom.xml",
			"menu": {
				"home": {
					"url": "/",
					"text": "Home"
				},
				"archive": {
					"url": "/archives/",
					"text": "Archives"
				},
				"tags": {
					"url": "/tags/",
					"text": "Tags"
				},
				"about": {
					"url": "/about/",
					"text": "About"
				}
			},
			"excerpt_render": true,
			"excerpt_link": "Read More...",
			"excerpt_length": 300,
			"hideMenu": false,
			"search": true,
			"share": false,
			"toc": {
				"list_number": true
			},
			"reward": null,
			"duoshuo": "",
			"disqus_shortname": "",
			"mathjax": false,
			"cnzz": "",
			"tags": {
				"title": "All Tags"
			},
			"twitter": "",
			"google_plus": "",
			"fb_admins": "",
			"fb_app_id": ""
		},
		"page": {
			"layout": "post",
			"slug": "building-a-rest-api-with-node-js",
			"title": "Building a REST API with Node.js",
			"_id": "clk7abc123",
			"path": "building-a-rest-api-with-node-js/",
			"permalink": "https://blog.example.com/building-a-rest-api-with-node-js/",
			"date": "2025-01-15",
			"updated": "2025-01-15",
			"content": "<p>This tutorial walks through creating a RESTful API using Express.js and MongoDB.</p>",
			"excerpt": "<p>Learn how to build a modern REST API.</p>",
			"description": "Learn how to build a modern REST API with Node.js",
			"comments": true,
			"tags": [
				{
					"name": "nodejs",
					"path": "tags/nodejs/",
					"length": 3,
					"_id": "id_0",
					"posts": []
				},
				{
					"name": "javascript",
					"path": "tags/javascript/",
					"length": 3,
					"_id": "id_1",
					"posts": []
				},
				{
					"name": "api",
					"path": "tags/api/",
					"length": 3,
					"_id": "id_2",
					"posts": []
				}
			],
			"categories": [
				{
					"name": "Web Development",
					"path": "categories/Web Development/",
					"length": 5,
					"posts": [
						{
							"title": "Getting Started with Web Development",
							"path": "web development/getting-started/",
							"date": "2025-01-15"
						},
						{
							"title": "Advanced Web Development Techniques",
							"path": "web development/advanced/",
							"date": "2025-01-15"
						}
					],
					"_id": "id_0"
				}
			],
			"photos": [],
			"link": "",
			"prev": 0,
			"next": 2,
			"author": "",
			"year": 2025,
			"month": 1,
			"tag": "",
			"category": "",
			"archive": false,
			"search": false,
			"type": "",
			"keywords": "",
			"canonical_path": "hello-world/index.html",
			"copyright": true,
			"reward": true,
			"license": "",
			"mathjax": false,
			"zoom_image": true,
			"post_meta": true,
			"author_img": "",
			"noDate": false,
			"total": 3,
			"current": 1,
			"prev_link": "",
			"next_link": "page/2/",
			"posts": [
				{
					"layout": "post",
					"slug": "building-a-rest-api-with-node-js",
					"title": "Building a REST API with Node.js",
					"_id": "clk7abc123",
					"path": "building-a-rest-api-with-node-js/",
					"permalink": "https://blog.example.com/building-a-rest-api-with-node-js/",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"content": "<p>This tutorial walks through creating a RESTful API using Express.js and MongoDB.</p>",
					"excerpt": "<p>Learn how to build a modern REST API.</p>",
					"description": "Learn how to build a modern REST API with Node.js",
					"comments": true,
					"tags": [
						{
							"name": "nodejs",
							"path": "tags/nodejs/",
							"length": 3
						},
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"length": 3
						},
						{
							"name": "api",
							"path": "tags/api/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Web Development",
							"path": "categories/Web Development/",
							"length": 5,
							"posts": [
								{
									"title": "Getting Started with Web Development",
									"path": "web development/getting-started/",
									"date": "2025-01-15"
								},
								{
									"title": "Advanced Web Development Techniques",
									"path": "web development/advanced/",
									"date": "2025-01-15"
								}
							]
						}
					],
					"photos": [],
					"link": "",
					"prev": null,
					"next": null,
					"author": "",
					"year": 2025,
					"month": 1,
					"tag": "",
					"category": "",
					"archive": false,
					"search": false,
					"type": "",
					"keywords": "",
					"canonical_path": "hello-world/index.html",
					"copyright": true,
					"reward": true,
					"license": "",
					"mathjax": false,
					"zoom_image": true,
					"post_meta": true,
					"author_img": "",
					"noDate": false
				},
				{
					"layout": "post",
					"slug": "css-grid-layout",
					"title": "CSS Grid Layout Deep Dive",
					"_id": "clk7def456",
					"path": "css-grid-layout/",
					"permalink": "https://blog.example.com/css-grid-layout/",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"content": "<p>This tutorial walks through creating a RESTful API using Express.js and MongoDB.</p>",
					"excerpt": "<p>Learn how to build a modern REST API.</p>",
					"description": "Learn how to build a modern REST API with Node.js",
					"comments": true,
					"tags": [
						{
							"name": "css",
							"path": "tags/css/",
							"length": 3
						},
						{
							"name": "layout",
							"path": "tags/layout/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Frontend",
							"path": "categories/Frontend/",
							"length": 5,
							"posts": [
								{
									"title": "Getting Started with Frontend",
									"path": "frontend/getting-started/",
									"date": "2025-01-15"
								},
								{
									"title": "Advanced Frontend Techniques",
									"path": "frontend/advanced/",
									"date": "2025-01-15"
								}
							]
						}
					],
					"photos": [],
					"link": "",
					"prev": null,
					"next": null,
					"author": "",
					"year": 2025,
					"month": 1,
					"tag": "",
					"category": "",
					"archive": false,
					"search": false,
					"type": "",
					"keywords": "",
					"canonical_path": "hello-world/index.html",
					"copyright": true,
					"reward": true,
					"license": "",
					"mathjax": false,
					"zoom_image": true,
					"post_meta": true,
					"author_img": "",
					"noDate": false
				},
				{
					"layout": "post",
					"slug": "typescript-generics",
					"title": "TypeScript Generics Explained",
					"_id": "clk7ghi789",
					"path": "typescript-generics/",
					"permalink": "https://blog.example.com/typescript-generics/",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"content": "<p>This tutorial walks through creating a RESTful API using Express.js and MongoDB.</p>",
					"excerpt": "<p>Learn how to build a modern REST API.</p>",
					"description": "Learn how to build a modern REST API with Node.js",
					"comments": true,
					"tags": [
						{
							"name": "typescript",
							"path": "tags/typescript/",
							"length": 3
						},
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Programming",
							"path": "categories/Programming/",
							"length": 5,
							"posts": [
								{
									"title": "Getting Started with Programming",
									"path": "programming/getting-started/",
									"date": "2025-01-15"
								},
								{
									"title": "Advanced Programming Techniques",
									"path": "programming/advanced/",
									"date": "2025-01-15"
								}
							]
						}
					],
					"photos": [],
					"link": "",
					"prev": null,
					"next": null,
					"author": "",
					"year": 2025,
					"month": 1,
					"tag": "",
					"category": "",
					"archive": false,
					"search": false,
					"type": "",
					"keywords": "",
					"canonical_path": "hello-world/index.html",
					"copyright": true,
					"reward": true,
					"license": "",
					"mathjax": false,
					"zoom_image": true,
					"post_meta": true,
					"author_img": "",
					"noDate": false
				}
			]
		},
		"site": {
			"posts": [
				{
					"layout": "post",
					"slug": "building-a-rest-api-with-node-js",
					"title": "Building a REST API with Node.js",
					"_id": "clk7abc123",
					"path": "building-a-rest-api-with-node-js/",
					"permalink": "https://blog.example.com/building-a-rest-api-with-node-js/",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"content": "<p>This tutorial walks through creating a RESTful API using Express.js and MongoDB.</p>",
					"excerpt": "<p>Learn how to build a modern REST API.</p>",
					"description": "Learn how to build a modern REST API with Node.js",
					"comments": true,
					"tags": [
						{
							"name": "nodejs",
							"path": "tags/nodejs/",
							"length": 3
						},
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"length": 3
						},
						{
							"name": "api",
							"path": "tags/api/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Web Development",
							"path": "categories/Web Development/",
							"length": 5,
							"posts": [
								{
									"title": "Getting Started with Web Development",
									"path": "web development/getting-started/",
									"date": "2025-01-15"
								},
								{
									"title": "Advanced Web Development Techniques",
									"path": "web development/advanced/",
									"date": "2025-01-15"
								}
							]
						}
					],
					"photos": [],
					"link": "",
					"prev": null,
					"next": null,
					"author": "",
					"year": 2025,
					"month": 1,
					"tag": "",
					"category": "",
					"archive": false,
					"search": false,
					"type": "",
					"keywords": "",
					"canonical_path": "hello-world/index.html",
					"copyright": true,
					"reward": true,
					"license": "",
					"mathjax": false,
					"zoom_image": true,
					"post_meta": true,
					"author_img": "",
					"noDate": false
				},
				{
					"layout": "post",
					"slug": "css-grid-layout",
					"title": "CSS Grid Layout Deep Dive",
					"_id": "clk7def456",
					"path": "css-grid-layout/",
					"permalink": "https://blog.example.com/css-grid-layout/",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"content": "<p>This tutorial walks through creating a RESTful API using Express.js and MongoDB.</p>",
					"excerpt": "<p>Learn how to build a modern REST API.</p>",
					"description": "Learn how to build a modern REST API with Node.js",
					"comments": true,
					"tags": [
						{
							"name": "css",
							"path": "tags/css/",
							"length": 3
						},
						{
							"name": "layout",
							"path": "tags/layout/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Frontend",
							"path": "categories/Frontend/",
							"length": 5,
							"posts": [
								{
									"title": "Getting Started with Frontend",
									"path": "frontend/getting-started/",
									"date": "2025-01-15"
								},
								{
									"title": "Advanced Frontend Techniques",
									"path": "frontend/advanced/",
									"date": "2025-01-15"
								}
							]
						}
					],
					"photos": [],
					"link": "",
					"prev": null,
					"next": null,
					"author": "",
					"year": 2025,
					"month": 1,
					"tag": "",
					"category": "",
					"archive": false,
					"search": false,
					"type": "",
					"keywords": "",
					"canonical_path": "hello-world/index.html",
					"copyright": true,
					"reward": true,
					"license": "",
					"mathjax": false,
					"zoom_image": true,
					"post_meta": true,
					"author_img": "",
					"noDate": false
				},
				{
					"layout": "post",
					"slug": "typescript-generics",
					"title": "TypeScript Generics Explained",
					"_id": "clk7ghi789",
					"path": "typescript-generics/",
					"permalink": "https://blog.example.com/typescript-generics/",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"content": "<p>This tutorial walks through creating a RESTful API using Express.js and MongoDB.</p>",
					"excerpt": "<p>Learn how to build a modern REST API.</p>",
					"description": "Learn how to build a modern REST API with Node.js",
					"comments": true,
					"tags": [
						{
							"name": "typescript",
							"path": "tags/typescript/",
							"length": 3
						},
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Programming",
							"path": "categories/Programming/",
							"length": 5,
							"posts": [
								{
									"title": "Getting Started with Programming",
									"path": "programming/getting-started/",
									"date": "2025-01-15"
								},
								{
									"title": "Advanced Programming Techniques",
									"path": "programming/advanced/",
									"date": "2025-01-15"
								}
							]
						}
					],
					"photos": [],
					"link": "",
					"prev": null,
					"next": null,
					"author": "",
					"year": 2025,
					"month": 1,
					"tag": "",
					"category": "",
					"archive": false,
					"search": false,
					"type": "",
					"keywords": "",
					"canonical_path": "hello-world/index.html",
					"copyright": true,
					"reward": true,
					"license": "",
					"mathjax": false,
					"zoom_image": true,
					"post_meta": true,
					"author_img": "",
					"noDate": false
				}
			],
			"tags": [
				{
					"name": "nodejs",
					"path": "tags/nodejs/",
					"length": 3,
					"_id": "id_0",
					"posts": []
				},
				{
					"name": "javascript",
					"path": "tags/javascript/",
					"length": 3,
					"_id": "id_1",
					"posts": []
				},
				{
					"name": "css",
					"path": "tags/css/",
					"length": 3,
					"_id": "id_2",
					"posts": []
				},
				{
					"name": "typescript",
					"path": "tags/typescript/",
					"length": 3,
					"_id": "id_3",
					"posts": []
				},
				{
					"name": "api",
					"path": "tags/api/",
					"length": 3,
					"_id": "id_4",
					"posts": []
				}
			],
			"categories": [
				{
					"name": "Web Development",
					"path": "categories/Web Development/",
					"length": 5,
					"posts": [
						{
							"title": "Getting Started with Web Development",
							"path": "web development/getting-started/",
							"date": "2025-01-15"
						},
						{
							"title": "Advanced Web Development Techniques",
							"path": "web development/advanced/",
							"date": "2025-01-15"
						}
					],
					"_id": "id_0"
				},
				{
					"name": "Frontend",
					"path": "categories/Frontend/",
					"length": 5,
					"posts": [
						{
							"title": "Getting Started with Frontend",
							"path": "frontend/getting-started/",
							"date": "2025-01-15"
						},
						{
							"title": "Advanced Frontend Techniques",
							"path": "frontend/advanced/",
							"date": "2025-01-15"
						}
					],
					"_id": "id_1"
				},
				{
					"name": "Programming",
					"path": "categories/Programming/",
					"length": 5,
					"posts": [
						{
							"title": "Getting Started with Programming",
							"path": "programming/getting-started/",
							"date": "2025-01-15"
						},
						{
							"title": "Advanced Programming Techniques",
							"path": "programming/advanced/",
							"date": "2025-01-15"
						}
					],
					"_id": "id_2"
				}
			],
			"data": {
				"projects": [
					{
						"name": "reverse-ejs",
						"url": "https://github.com/example/reverse-ejs",
						"desc": "Extract data from rendered EJS templates"
					},
					{
						"name": "hexo-optimizer",
						"url": "https://github.com/example/hexo-optimizer",
						"desc": "Performance optimization plugin for Hexo"
					}
				]
			}
		},
		"body": "<article><p>Building modern web applications requires a solid understanding of REST API design.</p></article>",
		"expand": false,
		"index": true,
		"pagination": {
			"per_page": 10
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
