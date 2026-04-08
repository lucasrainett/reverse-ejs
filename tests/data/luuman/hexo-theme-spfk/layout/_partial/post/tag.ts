import { createHexoHelpers, createDate, createCollection } from "../../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "Pixel & Code",
			"subtitle": "A developer blog",
			"author": "Alice Chen",
			"description": "A blog about web development and modern JavaScript.",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"timezone": "UTC",
			"relative_link": false,
			"keywords": "blog,tech,javascript",
			"date_format": "YYYY-MM-DD",
			"archive": 2,
			"category": 2,
			"tag": 2,
			"disqus_shortname": ""
		},
		"theme": {
			"menu": {
				"Home": "/",
				"Archives": "/archives",
				"About": "/about"
			},
			"subtitle": "Creative coding & design",
			"author": "Alice Chen",
			"avatar": "img/avatar.png",
			"subnav": {
				"github": "https://github.com/alicechen",
				"twitter": "https://twitter.com/alicechen"
			},
			"rss": "/atom.xml",
			"favicon": "img/favicon.ico",
			"fancybox": true,
			"animate": true,
			"open_in_new": true,
			"search_box": true,
			"tagcloud": true,
			"friends": {
				"Bob's Blog": "https://bob-blog.example.com",
				"Carol's Site": "https://carol.example.com"
			},
			"aboutme": "Hi, I'm Alice. I build things for the web.",
			"twitter": "@alicechen",
			"google_plus": "",
			"fb_admins": "",
			"fb_app_id": "",
			"baidu_site": "abc123baidu",
			"google_site": "abc123google",
			"toc": true,
			"toc_nowrap": false,
			"share": true,
			"baidushare": false,
			"showshare": false,
			"duoshuo": {
				"on": false,
				"domain": "pixelcode"
			},
			"youyan": {
				"on": false
			},
			"gitment": {
				"on": false,
				"owner": "alicechen",
				"repo": "blog-comments",
				"client_id": "abc123clientid",
				"client_secret": "secret456"
			},
			"disqus": {
				"on": false,
				"shortname": "pixelcode"
			},
			"reward_type": 0,
			"reward_wording1": "Thank you for your support!",
			"reward_wording2": "Scan to donate",
			"alipay": "/img/alipay.jpg",
			"weixin": "/img/wechat.jpg",
			"excerpt_link": "Read More",
			"background": {
				"on": true,
				"background_sum": 5,
				"background_image": 1
			},
			"mathjax": false,
			"TipTitle": true,
			"visit_counter": {
				"on": true,
				"site_visit": "Total visitors",
				"page_visit": "Page views"
			},
			"baidu_analytics": "abc123baiduanalytics",
			"google_analytics": "UA-12345678-1",
			"donate": false
		},
		"page": {
			"title": "Hello World",
			"content": "<p>Welcome to my blog. This is a sample post about JavaScript development.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
			"year": 2025,
			"month": 1,
			"tags": {
				"data": [
					{
						"name": "javascript",
						"path": "tags/javascript"
					},
					{
						"name": "nodejs",
						"path": "tags/nodejs"
					}
				],
				"length": 2
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
			"excerpt": "<p>A short excerpt about JavaScript development.</p>",
			"description": "A sample blog post about JavaScript development.",
			"permalink": "https://blog.example.com/2025/01/15/hello-world/",
			"path": "2025/01/15/hello-world/",
			"layout": "post",
			"slug": "hello-world",
			"link": "",
			"prev": {
				"title": "Previous Post",
				"path": "2025/01/10/previous-post/"
			},
			"next": {
				"title": "Next Post",
				"path": "2025/01/20/next-post/"
			},
			"photos": [],
			"cover": "",
			"category": "Tech",
			"tag": "javascript",
			"current": 1,
			"total": 3,
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "Hello World",
						"date": "2025-01-15",
						"path": "2025/01/15/hello-world/",
						"excerpt": "<p>A short excerpt</p>",
						"description": "About JavaScript development",
						"content": "<p>Hello World content</p>",
						"layout": "post",
						"slug": "hello-world",
						"categories": {
							"data": [
								{
									"name": "Tech"
								}
							],
							"length": 1
						},
						"tags": {
							"data": [
								{
									"name": "javascript"
								}
							],
							"length": 1
						},
						"noDate": false,
						"link": "",
						"toc": true,
						"top": false,
						"comments": true,
						"fancybox": true,
						"original": true,
						"updated": "2025-01-16"
					},
					{
						"title": "Getting Started with Node.js",
						"date": "2025-01-10",
						"path": "2025/01/10/getting-started-nodejs/",
						"excerpt": "<p>Learn Node.js</p>",
						"description": "Node.js basics",
						"content": "<p>Node.js content</p>",
						"layout": "post",
						"slug": "getting-started-nodejs",
						"categories": {
							"data": [
								{
									"name": "Tech"
								}
							],
							"length": 1
						},
						"tags": {
							"data": [
								{
									"name": "nodejs"
								}
							],
							"length": 1
						},
						"noDate": false,
						"link": "",
						"toc": true,
						"top": false,
						"comments": true,
						"fancybox": true,
						"original": true,
						"updated": "2025-01-12"
					}
				]
			}
		},
		"site": {
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "Hello World",
						"date": "2025-01-15",
						"path": "2025/01/15/hello-world/",
						"permalink": "https://blog.example.com/2025/01/15/hello-world/",
						"excerpt": "<p>A short excerpt</p>",
						"tags": {
							"data": [
								{
									"name": "javascript"
								}
							]
						},
						"categories": {
							"data": [
								{
									"name": "Tech"
								}
							]
						},
						"slug": "hello-world",
						"layout": "post",
						"content": "<p>Hello World content</p>"
					},
					{
						"title": "Getting Started with Node.js",
						"date": "2025-01-10",
						"path": "2025/01/10/getting-started-nodejs/",
						"permalink": "https://blog.example.com/2025/01/10/getting-started-nodejs/",
						"excerpt": "<p>Learn Node.js</p>",
						"tags": {
							"data": [
								{
									"name": "nodejs"
								}
							]
						},
						"categories": {
							"data": [
								{
									"name": "Tech"
								}
							]
						},
						"slug": "getting-started-nodejs",
						"layout": "post",
						"content": "<p>Node.js content</p>"
					}
				]
			},
			"tags": {
				"length": 2,
				"data": [
					{
						"name": "javascript",
						"path": "tags/javascript",
						"posts": {
							"length": 1
						}
					},
					{
						"name": "nodejs",
						"path": "tags/nodejs",
						"posts": {
							"length": 1
						}
					}
				]
			},
			"categories": {
				"length": 1,
				"data": [
					{
						"name": "Tech",
						"path": "categories/tech",
						"posts": {
							"length": 2
						}
					}
				]
			}
		},
		"body": "<article><p>Main content rendered by layout.</p></article>",
		"post": {
			"tags": {
				"data": [
					{
						"name": "javascript",
						"path": "tags/javascript"
					},
					{
						"name": "nodejs",
						"path": "tags/nodejs"
					}
				],
				"length": 2
			}
		},
};
