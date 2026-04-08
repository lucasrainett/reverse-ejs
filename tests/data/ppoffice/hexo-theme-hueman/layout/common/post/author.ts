import { createHexoHelpers, createDate, createCollection } from "../../../../../helpers";

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
			"subtitle": "A clean blog theme",
			"menu": {
				"Home": "/",
				"Archives": "/archives",
				"About": "/about"
			},
			"customize": {
				"favicon": "/img/favicon.ico",
				"logo": "/img/logo.png",
				"social_links": {
					"rss": "/atom.xml",
					"github": "https://github.com/alice",
					"twitter": ""
				},
				"sidebar": "right",
				"thumbnail": true,
				"highlight": "github"
			},
			"plugins": {
				"bing_site_verification": "",
				"google_analytics": "",
				"baidu_analytics": ""
			},
			"miscellaneous": {
				"open_graph": {
					"fb_app_id": "",
					"fb_admins": "",
					"twitter_id": ""
				},
				"links": {
					"GitHub": "https://github.com",
					"Stack Overflow": "https://stackoverflow.com"
				}
			},
			"sidebar": "right",
			"widgets": [
				"recent_posts",
				"category",
				"tag",
				"archive"
			],
			"excerpt_link": "Read More",
			"comment": {
				"type": ""
			},
			"share": {
				"type": "default"
			},
			"search": {
				"type": "insight"
			},
			"thumbnail": true,
			"pwa": {
				"enabled": false
			},
			"cookie_consent": {}
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
		"post": {
			"title": "Sample Post",
			"content": "<p>This is the post content with <strong>formatting</strong>.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
			"excerpt": "<p>A short excerpt.</p>",
			"permalink": "https://example.com/2025/01/15/sample-post/",
			"path": "2025/01/15/sample-post/",
			"layout": "post",
			"slug": "sample-post",
			"link": "",
			"raw": "",
			"lang": "en",
			"direction": "",
			"photos": [],
			"cover": "",
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
			"prev": {
				"title": "Previous Post",
				"path": "2025/01/14/prev-post/",
				"permalink": "https://example.com/2025/01/14/prev-post/"
			},
			"next": {
				"title": "Next Post",
				"path": "2025/01/16/next-post/",
				"permalink": "https://example.com/2025/01/16/next-post/"
			},
			"author": "Alice",
			"description": "A sample post description.",
			"category": "Tech",
			"tag": "javascript",
			"keywords": "javascript,nodejs"
		},
};
