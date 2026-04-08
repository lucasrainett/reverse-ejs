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
			"direction": "ltr",
			"nav": {
				"home": "/",
				"about": "/about/",
				"articles": "/archives/",
				"search": "/search/"
			},
			"social_links": [
				{
					"label": "GitHub",
					"icon": "github",
					"link": "https://github.com/example"
				},
				{
					"label": "Twitter",
					"icon": "twitter",
					"link": "https://twitter.com/example"
				},
				{
					"label": "Email",
					"icon": "mail",
					"link": "mailto:alice@example.com"
				}
			],
			"tags_overview": {
				"min_font": 12,
				"max_font": 24,
				"amount": 20
			},
			"posts_overview": {
				"show_all_posts": false,
				"post_count": 5,
				"sort_updated": false
			},
			"archive": {
				"sort_updated": false
			},
			"logo": {
				"enabled": true,
				"width": 100,
				"gravatar": false,
				"url": "/images/logo.png"
			},
			"gravatar": {
				"email": "alice@example.com",
				"hash": ""
			},
			"favicon": {
				"desktop": {
					"url": "/images/favicon.ico",
					"gravatar": false
				},
				"android": {
					"url": "/images/favicon-192.png",
					"gravatar": false
				},
				"apple": {
					"url": "/images/apple-touch-icon.png",
					"gravatar": false
				}
			},
			"rss": "/atom.xml",
			"open_graph": {
				"fb_app_id": "",
				"fb_admins": "",
				"twitter_id": "",
				"google_plus": ""
			},
			"mathjax": {
				"enabled": false
			},
			"google_analytics": {
				"enabled": false,
				"id": ""
			},
			"umami_analytics": {
				"enabled": false,
				"id": "",
				"host": "",
				"script_name": ""
			},
			"baidu_analytics": {
				"enabled": false,
				"id": ""
			},
			"cloudflare_analytics": {
				"enabled": false,
				"id": ""
			},
			"disqus": {
				"enabled": false,
				"shortname": ""
			},
			"utterances": {
				"enabled": false,
				"repo": "",
				"issue_term": "",
				"theme": "",
				"label": ""
			},
			"copyright": {
				"start_year": 2020,
				"end_year": 2025
			},
			"error_404": {
				"enabled": true,
				"title": "Page Not Found",
				"description": "Sorry, the page you were looking for cannot be found."
			},
			"projects_url": "/projects/",
			"post": {
				"show_updated": false
			}
		},
		"page": {
			"layout": "post",
			"slug": "building-a-rest-api-with-node-js",
			"title": "Building a REST API with Node.js",
			"_id": "clk7abc123",
			"path": "building-a-rest-api-with-node-js/",
			"permalink": "https://blog.example.com/building-a-rest-api-with-node-js/",
			"date": {},
			"updated": {},
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
							"date": {}
						},
						{
							"title": "Advanced Web Development Techniques",
							"path": "web development/advanced/",
							"date": {}
						}
					]
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
					"date": {},
					"updated": {},
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
									"date": {}
								},
								{
									"title": "Advanced Web Development Techniques",
									"path": "web development/advanced/",
									"date": {}
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
					"date": {},
					"updated": {},
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
									"date": {}
								},
								{
									"title": "Advanced Frontend Techniques",
									"path": "frontend/advanced/",
									"date": {}
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
					"date": {},
					"updated": {},
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
									"date": {}
								},
								{
									"title": "Advanced Programming Techniques",
									"path": "programming/advanced/",
									"date": {}
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
					"date": {},
					"updated": {},
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
									"date": {}
								},
								{
									"title": "Advanced Web Development Techniques",
									"path": "web development/advanced/",
									"date": {}
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
					"date": {},
					"updated": {},
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
									"date": {}
								},
								{
									"title": "Advanced Frontend Techniques",
									"path": "frontend/advanced/",
									"date": {}
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
					"date": {},
					"updated": {},
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
									"date": {}
								},
								{
									"title": "Advanced Programming Techniques",
									"path": "programming/advanced/",
									"date": {}
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
					"length": 3
				},
				{
					"name": "javascript",
					"path": "tags/javascript/",
					"length": 3
				},
				{
					"name": "css",
					"path": "tags/css/",
					"length": 3
				},
				{
					"name": "typescript",
					"path": "tags/typescript/",
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
							"date": {}
						},
						{
							"title": "Advanced Web Development Techniques",
							"path": "web development/advanced/",
							"date": {}
						}
					]
				},
				{
					"name": "Frontend",
					"path": "categories/Frontend/",
					"length": 5,
					"posts": [
						{
							"title": "Getting Started with Frontend",
							"path": "frontend/getting-started/",
							"date": {}
						},
						{
							"title": "Advanced Frontend Techniques",
							"path": "frontend/advanced/",
							"date": {}
						}
					]
				},
				{
					"name": "Programming",
					"path": "categories/Programming/",
					"length": 5,
					"posts": [
						{
							"title": "Getting Started with Programming",
							"path": "programming/getting-started/",
							"date": {}
						},
						{
							"title": "Advanced Programming Techniques",
							"path": "programming/advanced/",
							"date": {}
						}
					]
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
};
