import { createHexoHelpers, createDate, createCollection } from "../../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "My Blog",
			"subtitle": "Exploring the world of web development",
			"author": "Alice Chen",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"description": "A blog about modern web development, JavaScript, and software engineering",
			"date_format": "YYYY-MM-DD",
			"per_page": 10,
			"keywords": "javascript,web development,programming",
			"archive_dir": "archives",
			"tag_dir": "tags",
			"relative_link": false,
			"cover": "/img/default-cover.jpg",
			"search": {
				"path": "search.xml"
			},
			"algolia": null,
			"feed": {
				"type": "atom",
				"path": "atom.xml"
			},
			"post_asset_folder": false,
			"disqus_shortname": "myblog",
			"highlightjs": false,
			"rss": "/atom.xml"
		},
		"theme": {
			"gravatar_email": "",
			"author": {
				"picture": "/img/avatar.jpg",
				"location": "San Francisco, CA",
				"google_plus": "",
				"google_plus_business": "",
				"twitter": "@alicechen"
			},
			"image_dir": "/assets/images",
			"sidebar_behavior": 1,
			"clear_reading": false,
			"cover_image": "https://example.com/cover.jpg",
			"thumbnail_image_position": "right",
			"image_gallery": true,
			"google_analytics_id": "UA-12345678-1",
			"baidu_analytics_id": "",
			"fb_admin_ids": "123456789",
			"fb_app_id": "app123",
			"favicon": "favicon.png",
			"disqus_shortname": "myblog",
			"gitment": {
				"enable": false
			},
			"gitalk": {
				"enable": false
			},
			"sharing_options": {
				"twitter": {
					"icon": "fab fa-twitter",
					"url": "https://twitter.com/intent/tweet?text={title}&url={url}"
				},
				"facebook": {
					"icon": "fab fa-facebook",
					"url": "https://www.facebook.com/sharer/sharer.php?u={url}"
				}
			},
			"sidebar": {
				"main": {
					"home": {
						"title": "sidebar.home",
						"url": "/",
						"icon": "fa fa-home",
						"class": ""
					},
					"categories": {
						"title": "sidebar.categories",
						"url": "/all-categories",
						"icon": "fa fa-bookmark",
						"class": ""
					},
					"tags": {
						"title": "sidebar.tags",
						"url": "/all-tags",
						"icon": "fa fa-tags",
						"class": ""
					}
				},
				"social": {
					"github": {
						"title": "sidebar.github",
						"url": "https://github.com/alicechen",
						"icon": "fab fa-github",
						"class": ""
					}
				}
			},
			"header": {
				"right_link": {
					"url": "/#about",
					"icon": "",
					"class": ""
				}
			},
			"archive_pagination": 2,
			"category_pagination": 2,
			"tag_pagination": 2
		},
		"page": {
			"title": "Hello World",
			"content": "<p>Welcome to my blog. This is a place where I share my thoughts on web development.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-20",
			"tags": [
				{
					"name": "javascript",
					"slug": "javascript",
					"path": "tags/javascript/",
					"length": 5
				},
				{
					"name": "programming",
					"slug": "programming",
					"path": "tags/programming/",
					"length": 3
				}
			],
			"categories": [
				{
					"name": "Tech",
					"slug": "tech",
					"path": "categories/Tech/",
					"length": 8
				}
			],
			"excerpt": "<p>Welcome to my blog.</p>",
			"permalink": "https://blog.example.com/hello-world/",
			"path": "hello-world/",
			"comments": true,
			"prev_link": "page/1/",
			"next_link": "page/3/",
			"current": 2,
			"total": 5,
			"lang": "en",
			"year": 2025,
			"month": 1,
			"description": "My personal blog about web development",
			"keywords": "blog,web,dev"
		},
		"site": {
			"posts": [
				{
					"title": "Understanding Modern JavaScript",
					"path": "2025/01/15/understanding-modern-javascript/",
					"date": "2025-01-15",
					"excerpt": "<p>Post excerpt</p>",
					"content": "<p>JavaScript has evolved significantly over the past decade. ES6 introduced arrow functions, destructuring, and template literals.</p>",
					"updated": "2025-01-15",
					"categories": [],
					"tags": []
				},
				{
					"title": "Building REST APIs with Express",
					"path": "2025/01/12/building-rest-apis-express/",
					"date": "2025-01-15",
					"excerpt": "<p>Post excerpt</p>",
					"content": "<p>Express.js is a minimal and flexible Node.js web application framework. It provides a robust set of features for web and mobile applications.</p>",
					"updated": "2025-01-15",
					"categories": [],
					"tags": []
				},
				{
					"title": "Introduction to TypeScript",
					"path": "2024/12/20/introduction-to-typescript/",
					"date": "2025-01-15",
					"excerpt": "<p>Post excerpt</p>",
					"content": "<p>TypeScript adds static typing to JavaScript, making your code more predictable and easier to debug.</p>",
					"updated": "2025-01-15",
					"categories": [],
					"tags": []
				}
			],
			"tags": [
				{
					"name": "javascript",
					"slug": "javascript",
					"path": "tags/javascript/",
					"length": 5
				},
				{
					"name": "programming",
					"slug": "programming",
					"path": "tags/programming/",
					"length": 3
				},
				{
					"name": "typescript",
					"slug": "typescript",
					"path": "tags/typescript/",
					"length": 2
				}
			],
			"categories": [
				{
					"name": "Tech",
					"slug": "tech",
					"path": "categories/Tech/",
					"length": 8
				},
				{
					"name": "Tutorials",
					"slug": "tutorials",
					"path": "categories/Tutorials/",
					"length": 4
				}
			]
		},
		"body": "<article><p>Welcome to my blog. This is the main content area.</p></article>",
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
		"classes": [
			"post-meta"
		],
};
