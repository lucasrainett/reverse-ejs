import { createHexoHelpers, createDate, createCollection } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "My Blog",
			"subtitle": "A developer blog",
			"author": "Alice",
			"description": "A blog about web development and technology.",
			"url": "https://example.com",
			"root": "/",
			"language": "en",
			"timezone": "UTC",
			"relative_link": false,
			"keywords": "blog,tech,javascript",
			"favicon": "/img/favicon.ico",
			"feed": {
				"path": "atom.xml"
			},
			"highlight": {
				"enable": false,
				"hljs": false
			},
			"avatar": "https://example.com/avatar.png",
			"email": "alice@example.com",
			"inject": {
				"head": []
			}
		},
		"theme": {
			"menu": {
				"Home": "/",
				"Archives": "/archives",
				"About": "/about"
			},
			"sidebar": "right",
			"widgets": [
				"recent_posts",
				"category",
				"tag",
				"archive",
				"tagcloud"
			],
			"excerpt_link": "Read More",
			"fancybox": true,
			"google_analytics": "",
			"baidu_analytics": "",
			"favicon": "/img/favicon.ico",
			"twitter": "",
			"google_plus": "",
			"fb_admins": "",
			"fb_app_id": "",
			"comment_provider": "",
			"disqus_shortname": "",
			"duoshuo_shortname": "",
			"donate": {
				"enable": false,
				"alipay": "",
				"wechat": "",
				"message": ""
			},
			"search": {
				"type": "insight"
			},
			"mathjax": false,
			"busuanzi_analytics": {
				"enable": false
			},
			"social": {
				"github": "https://github.com/alice",
				"twitter": ""
			}
		},
		"page": {
			"title": "Post Title",
			"content": "<p>Hello world. This is a sample blog post with some content.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
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
			"excerpt": "<p>A short excerpt of the post.</p>",
			"permalink": "https://example.com/2025/01/15/post-title/",
			"path": "2025/01/15/post-title/",
			"layout": "post",
			"slug": "post-title",
			"link": "",
			"raw": "",
			"lang": "en",
			"language": "en",
			"prev": null,
			"next": null,
			"photos": [],
			"cover": "",
			"direction": "",
			"category": "Tech",
			"tag": "javascript",
			"year": 2025,
			"month": 1,
			"current": 1,
			"total": 1,
			"wiki": "",
			"topic": "",
			"keywords": "",
			"description": "A sample blog post description.",
			"type": "",
			"nav_tabs": null,
			"indent": null,
			"robots": "",
			"open_graph": {},
			"inject": {
				"head": []
			}
		},
		"site": {
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "First Post",
						"date": "2025-01-15",
						"path": "2025/01/15/first-post/",
						"permalink": "https://example.com/2025/01/15/first-post/",
						"excerpt": "<p>First excerpt</p>",
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
						"slug": "first-post",
						"layout": "post",
						"content": "<p>First content</p>",
						"photos": [],
						"cover": ""
					},
					{
						"title": "Second Post",
						"date": "2025-01-10",
						"path": "2025/01/10/second-post/",
						"permalink": "https://example.com/2025/01/10/second-post/",
						"excerpt": "<p>Second excerpt</p>",
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
						"slug": "second-post",
						"layout": "post",
						"content": "<p>Second content</p>",
						"photos": [],
						"cover": ""
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
		"body": "<p>Page content rendered by layout.</p>",
		"posts": [
			{
				"title": "First Post",
				"date": "2025-01-15",
				"path": "2025/01/15/first-post/",
				"permalink": "https://example.com/2025/01/15/first-post/",
				"excerpt": "<p>First excerpt</p>",
				"slug": "first-post",
				"layout": "post",
				"content": "<p>First</p>",
				"photos": [],
				"tags": {
					"data": [
						{
							"name": "js"
						}
					],
					"length": 1
				},
				"categories": {
					"data": [
						{
							"name": "Tech"
						}
					],
					"length": 1
				}
			},
			{
				"title": "Second Post",
				"date": "2025-01-10",
				"path": "2025/01/10/second-post/",
				"permalink": "https://example.com/2025/01/10/second-post/",
				"excerpt": "<p>Second excerpt</p>",
				"slug": "second-post",
				"layout": "post",
				"content": "<p>Second</p>",
				"photos": [],
				"tags": {
					"data": [
						{
							"name": "node"
						}
					],
					"length": 1
				},
				"categories": {
					"data": [
						{
							"name": "Tech"
						}
					],
					"length": 1
				}
			}
		],
		"widget": {
			"name": "recent_posts",
			"title": "Recent Posts"
		},
};
