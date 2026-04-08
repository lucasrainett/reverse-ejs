import { createHexoHelpers, createDate, createCollection } from "../../../../helpers";

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
			"menu": {
				"Home": "/",
				"Archives": "/archives",
				"Tags": "/tags",
				"Categories": "/categories"
			},
			"google_analytics": "",
			"comments": {
				"disqus_shortname": "myblog",
				"facebook": null
			},
			"default_post_title": "Untitled",
			"archive_date_format": "MMM DD, YYYY",
			"footer_about": "A blog about modern web development, design, and technology. Built with passion and caffeine.",
			"footer_copyright": "&copy; 2025 Alice Chen. All rights reserved.",
			"github_url": "https://github.com/alicechen",
			"twitter_url": "https://twitter.com/alicechen",
			"facebook_url": "",
			"instagram_url": "https://instagram.com/alicechen",
			"dribble_url": "",
			"telegram_url": "",
			"behance_url": "",
			"fivehundredpx_url": "",
			"email_url": "alice@example.com",
			"rss_url": "/atom.xml",
			"fa_logo": "fa-code",
			"twitter_handle": "alicechen"
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
		"item": {
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
			"link": "",
			"name": "sample",
			"show_tagcon": false,
			"expand_all": false,
			"expand_active": false,
			"rss": "",
			"limit": 5
		},
};
