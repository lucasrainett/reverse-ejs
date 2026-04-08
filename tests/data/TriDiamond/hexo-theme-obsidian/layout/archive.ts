import { createHexoHelpers, createDate, createCollection } from "../../../helpers";

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
			"keywords": "blog,obsidian,hexo",
			"favicon": "/img/favicon.ico",
			"rss": "/atom.xml",
			"google_analytics": "",
			"mathjax": false,
			"menu": {
				"Home": "/",
				"Archives": "/archives",
				"Tags": "/tags",
				"Categories": "/categories",
				"About": "/about"
			},
			"page_titles": {
				"categories": "Categories",
				"tags": "Tags",
				"archives": "Archives"
			},
			"welcome_cover": "/img/welcome-cover.jpg",
			"cover": "/img/default-cover.jpg",
			"avatar": "/img/avatar.png",
			"descriptionOne": "Exploring the world of code",
			"descriptionTwo": "One commit at a time",
			"symbols_count_time": {
				"enable": true,
				"wordCount": true,
				"readCount": true,
				"awl": 4,
				"wpm": 275,
				"suffix": "min"
			},
			"valine": {
				"enable": false,
				"visitor": false
			},
			"busuanzi": {
				"enable": false
			},
			"gitalk": {
				"enable": false,
				"autoExpand": true,
				"clientID": "",
				"clientSecret": "",
				"repo": "",
				"owner": "",
				"admin": "",
				"distractionFreeMode": false,
				"proxy": ""
			},
			"sharejs": {
				"enable": false,
				"disabled": ""
			},
			"post_navigation": true,
			"socials": {
				"github": "https://github.com/alicechen",
				"twitter": "https://twitter.com/alicechen",
				"stackoverflow": ""
			},
			"TOC": true,
			"html_truncate": {
				"enable": false,
				"postLength": 500,
				"coverLength": 200,
				"ellipsis": "...",
				"excludes": "",
				"keepWhitespaces": false,
				"reserveLastWord": true
			},
			"codemirror": {
				"modes": [
					"javascript",
					"css",
					"python"
				]
			},
			"version": "1.5.2",
			"beian": {
				"enable": false
			},
			"police": {
				"enable": false
			},
			"aplayer": {
				"enable": false
			},
			"header_html": "",
			"footer_html": "",
			"post": {
				"show_updated": true
			},
			"posts_overview": {
				"sort_updated": false
			},
			"archive": {
				"sort_updated": false
			},
			"autoplay": false,
			"mp3": {}
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
};
