import { createHexoHelpers, createDate, createCollection } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "My Blog",
			"subtitle": "A personal tech blog",
			"description": "Sharing knowledge about web development",
			"author": "Alice Chen",
			"url": "https://example.com",
			"root": "/",
			"language": "en",
			"keywords": "blog,tech,web",
			"relative_link": false,
			"archive": 2,
			"category": 2,
			"tag": 2,
			"archive_dir": "archives",
			"disqus_shortname": "",
			"algolia": {
				"applicationID": "app123",
				"apiKey": "key123",
				"indexName": "blog"
			}
		},
		"theme": {
			"SEO_title": "My Blog - Alice Chen",
			"SEO_keywords": "blog,tech,web",
			"main_title": "My Blog",
			"subtitle": "A personal tech blog",
			"favicon": "/images/favicon.ico",
			"avatar": "/images/avatar.jpg",
			"avatar_border": true,
			"author": "Alice Chen",
			"signature": "Code is poetry",
			"social": {
				"github": "https://github.com/alice",
				"email": "alice@example.com",
				"twitter": "https://twitter.com/alice"
			},
			"friends": {
				"Bob": "https://bob.example.com",
				"Charlie": "https://charlie.example.com"
			},
			"about": {
				"enable": true,
				"image": "/images/about-bg.jpg"
			},
			"search": {
				"enable": true,
				"url": "example.com",
				"engine": "google"
			},
			"profile_sticky": false,
			"profile_icons": {
				"enable": false
			},
			"profile_links": [],
			"algolia_search": {
				"enable": false,
				"hits": {
					"per_page": 10
				},
				"labels": {}
			},
			"busuanzi": false,
			"busuanzi_slug": "Total ${count} visitors",
			"busuanzi_pv_or_uv": "pv",
			"toc": true,
			"show_categories": true,
			"read_more_button": true,
			"truncate_length": 300,
			"reading_info": false,
			"site_header_image": "/images/header.jpg",
			"post_header_image": "/images/post-header.jpg",
			"_404_image": "/images/404.jpg",
			"index_intro_height": 50,
			"post_intro_height": 50,
			"about_intro_height": 50,
			"post_banner_theme": "normal",
			"float_button_theme": "normal",
			"read_progress_color": "default",
			"custom_font": {
				"enable": false
			},
			"comment": {},
			"copyright": {
				"enable": false,
				"license": "CC BY-NC-SA 4.0"
			},
			"math": {
				"mathjax": {
					"enable": false,
					"version": "3"
				}
			},
			"donate": {
				"enable": false,
				"title": "Donate",
				"description": "Buy me a coffee",
				"qr_code": [
					{
						"alt": "WeChat Pay",
						"url": "/images/wechat.png"
					}
				]
			},
			"website_approve": {
				"enable": false
			},
			"baidu_analytics": "",
			"google_analytics": "",
			"CNZZ_analytics": "",
			"mermaid": {
				"enable": false,
				"version": "9",
				"theme": "default"
			},
			"twitter": "",
			"google_plus": "",
			"fb_admins": "",
			"fb_app_id": "",
			"style": {},
			"rss": ""
		},
		"page": {
			"title": "Page Title",
			"content": "<p>This is the page content.</p>",
			"date": "2025-01-15T00:00:00.000Z",
			"updated": "2025-01-20T00:00:00.000Z",
			"tags": [
				{
					"name": "JavaScript",
					"slug": "javascript",
					"path": "tags/javascript/",
					"permalink": "https://example.com/tags/javascript/",
					"length": 10
				},
				{
					"name": "Web",
					"slug": "web",
					"path": "tags/web/",
					"permalink": "https://example.com/tags/web/",
					"length": 3
				}
			],
			"categories": [
				{
					"name": "Tech",
					"slug": "tech",
					"path": "categories/tech/",
					"permalink": "https://example.com/categories/tech/",
					"length": 4
				}
			],
			"permalink": "https://example.com/page/",
			"path": "page/",
			"slug": "page",
			"layout": "page",
			"comments": true,
			"top": false,
			"sticky": false,
			"toc": true,
			"photos": [],
			"albums": [],
			"authors": [],
			"prev": {
				"title": "Previous Post",
				"path": "2025/01/14/previous/"
			},
			"next": {
				"title": "Next Post",
				"path": "2025/01/16/next/"
			},
			"link": "",
			"noDate": false,
			"excerpt": "<p>Excerpt text.</p>",
			"abstract": "",
			"reward": false,
			"copyright": false,
			"translated": null,
			"timeliness": false,
			"mathjax": false,
			"math": false,
			"no_word_count": false,
			"no_toc": false,
			"no_valine": true,
			"no_reward": true,
			"header_image": "",
			"subtitle": "",
			"description": "Page description",
			"keywords": "blog,page",
			"copyright_content": "",
			"year": 2025,
			"month": 1,
			"total": 1,
			"posts": [
				{
					"title": "Hello World",
					"slug": "hello-world",
					"layout": "post",
					"path": "2025/01/15/hello-world/",
					"permalink": "https://example.com/2025/01/15/hello-world/",
					"date": "2025-01-15T00:00:00.000Z",
					"updated": "2025-01-20T00:00:00.000Z",
					"content": "<p>This is the content of the post.</p>",
					"excerpt": "<p>This is the excerpt.</p>",
					"abstract": "",
					"tags": [
						{
							"name": "JavaScript",
							"slug": "javascript",
							"path": "tags/javascript/",
							"permalink": "https://example.com/tags/javascript/",
							"length": 10
						},
						{
							"name": "Web",
							"slug": "web",
							"path": "tags/web/",
							"permalink": "https://example.com/tags/web/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Tech",
							"slug": "tech",
							"path": "categories/tech/",
							"permalink": "https://example.com/categories/tech/",
							"length": 4
						}
					],
					"comments": true,
					"top": false,
					"sticky": false,
					"toc": true,
					"photos": [],
					"albums": [],
					"authors": [],
					"prev": null,
					"next": null,
					"link": "",
					"noDate": false,
					"reward": false,
					"copyright": false,
					"timeliness": false,
					"mathjax": false,
					"math": false,
					"no_word_count": false,
					"no_toc": false,
					"no_valine": true,
					"no_reward": true,
					"header_image": "",
					"subtitle": "A subtitle for the post",
					"description": "A description for the post",
					"keywords": "test,blog",
					"_id": "1"
				},
				{
					"title": "Getting Started with Node.js",
					"slug": "getting-started-nodejs",
					"layout": "post",
					"path": "2025/01/15/getting-started-nodejs/",
					"permalink": "https://example.com/2025/01/15/getting-started-nodejs/",
					"date": "2025-01-15T00:00:00.000Z",
					"updated": "2025-01-20T00:00:00.000Z",
					"content": "<p>This is the content of the post.</p>",
					"excerpt": "<p>This is the excerpt.</p>",
					"abstract": "",
					"tags": [
						{
							"name": "Node.js",
							"slug": "node.js",
							"path": "tags/node.js/",
							"permalink": "https://example.com/tags/node.js/",
							"length": 7
						},
						{
							"name": "Backend",
							"slug": "backend",
							"path": "tags/backend/",
							"permalink": "https://example.com/tags/backend/",
							"length": 7
						}
					],
					"categories": [
						{
							"name": "Programming",
							"slug": "programming",
							"path": "categories/programming/",
							"permalink": "https://example.com/categories/programming/",
							"length": 11
						}
					],
					"comments": true,
					"top": false,
					"sticky": false,
					"toc": true,
					"photos": [],
					"albums": [],
					"authors": [],
					"prev": null,
					"next": null,
					"link": "",
					"noDate": false,
					"reward": false,
					"copyright": false,
					"timeliness": false,
					"mathjax": false,
					"math": false,
					"no_word_count": false,
					"no_toc": false,
					"no_valine": true,
					"no_reward": true,
					"header_image": "",
					"subtitle": "A subtitle for the post",
					"description": "A description for the post",
					"keywords": "test,blog",
					"_id": "1"
				},
				{
					"title": "CSS Tips and Tricks",
					"slug": "css-tips",
					"layout": "post",
					"path": "2025/01/15/css-tips/",
					"permalink": "https://example.com/2025/01/15/css-tips/",
					"date": "2025-01-15T00:00:00.000Z",
					"updated": "2025-01-20T00:00:00.000Z",
					"content": "<p>This is the content of the post.</p>",
					"excerpt": "<p>This is the excerpt.</p>",
					"abstract": "",
					"tags": [
						{
							"name": "CSS",
							"slug": "css",
							"path": "tags/css/",
							"permalink": "https://example.com/tags/css/",
							"length": 3
						},
						{
							"name": "Design",
							"slug": "design",
							"path": "tags/design/",
							"permalink": "https://example.com/tags/design/",
							"length": 6
						}
					],
					"categories": [
						{
							"name": "Frontend",
							"slug": "frontend",
							"path": "categories/frontend/",
							"permalink": "https://example.com/categories/frontend/",
							"length": 8
						}
					],
					"comments": true,
					"top": false,
					"sticky": false,
					"toc": true,
					"photos": [],
					"albums": [],
					"authors": [],
					"prev": null,
					"next": null,
					"link": "",
					"noDate": false,
					"reward": false,
					"copyright": false,
					"timeliness": false,
					"mathjax": false,
					"math": false,
					"no_word_count": false,
					"no_toc": false,
					"no_valine": true,
					"no_reward": true,
					"header_image": "",
					"subtitle": "A subtitle for the post",
					"description": "A description for the post",
					"keywords": "test,blog",
					"_id": "1"
				}
			],
			"tag": "JavaScript",
			"category": "Tech",
			"archive": false,
			"_id": "1"
		},
		"site": {
			"posts": [
				{
					"title": "Hello World",
					"slug": "hello-world",
					"layout": "post",
					"path": "2025/01/15/hello-world/",
					"permalink": "https://example.com/2025/01/15/hello-world/",
					"date": "2025-01-15T00:00:00.000Z",
					"updated": "2025-01-20T00:00:00.000Z",
					"content": "<p>This is the content of the post.</p>",
					"excerpt": "<p>This is the excerpt.</p>",
					"abstract": "",
					"tags": [
						{
							"name": "JavaScript",
							"slug": "javascript",
							"path": "tags/javascript/",
							"permalink": "https://example.com/tags/javascript/",
							"length": 10
						},
						{
							"name": "Web",
							"slug": "web",
							"path": "tags/web/",
							"permalink": "https://example.com/tags/web/",
							"length": 3
						}
					],
					"categories": [
						{
							"name": "Tech",
							"slug": "tech",
							"path": "categories/tech/",
							"permalink": "https://example.com/categories/tech/",
							"length": 4
						}
					],
					"comments": true,
					"top": false,
					"sticky": false,
					"toc": true,
					"photos": [],
					"albums": [],
					"authors": [],
					"prev": null,
					"next": null,
					"link": "",
					"noDate": false,
					"reward": false,
					"copyright": false,
					"timeliness": false,
					"mathjax": false,
					"math": false,
					"no_word_count": false,
					"no_toc": false,
					"no_valine": true,
					"no_reward": true,
					"header_image": "",
					"subtitle": "A subtitle for the post",
					"description": "A description for the post",
					"keywords": "test,blog",
					"_id": "1"
				},
				{
					"title": "Getting Started with Node.js",
					"slug": "getting-started-nodejs",
					"layout": "post",
					"path": "2025/01/15/getting-started-nodejs/",
					"permalink": "https://example.com/2025/01/15/getting-started-nodejs/",
					"date": "2025-01-15T00:00:00.000Z",
					"updated": "2025-01-20T00:00:00.000Z",
					"content": "<p>This is the content of the post.</p>",
					"excerpt": "<p>This is the excerpt.</p>",
					"abstract": "",
					"tags": [
						{
							"name": "Node.js",
							"slug": "node.js",
							"path": "tags/node.js/",
							"permalink": "https://example.com/tags/node.js/",
							"length": 7
						},
						{
							"name": "Backend",
							"slug": "backend",
							"path": "tags/backend/",
							"permalink": "https://example.com/tags/backend/",
							"length": 7
						}
					],
					"categories": [
						{
							"name": "Programming",
							"slug": "programming",
							"path": "categories/programming/",
							"permalink": "https://example.com/categories/programming/",
							"length": 11
						}
					],
					"comments": true,
					"top": false,
					"sticky": false,
					"toc": true,
					"photos": [],
					"albums": [],
					"authors": [],
					"prev": null,
					"next": null,
					"link": "",
					"noDate": false,
					"reward": false,
					"copyright": false,
					"timeliness": false,
					"mathjax": false,
					"math": false,
					"no_word_count": false,
					"no_toc": false,
					"no_valine": true,
					"no_reward": true,
					"header_image": "",
					"subtitle": "A subtitle for the post",
					"description": "A description for the post",
					"keywords": "test,blog",
					"_id": "1"
				},
				{
					"title": "CSS Tips and Tricks",
					"slug": "css-tips",
					"layout": "post",
					"path": "2025/01/15/css-tips/",
					"permalink": "https://example.com/2025/01/15/css-tips/",
					"date": "2025-01-15T00:00:00.000Z",
					"updated": "2025-01-20T00:00:00.000Z",
					"content": "<p>This is the content of the post.</p>",
					"excerpt": "<p>This is the excerpt.</p>",
					"abstract": "",
					"tags": [
						{
							"name": "CSS",
							"slug": "css",
							"path": "tags/css/",
							"permalink": "https://example.com/tags/css/",
							"length": 3
						},
						{
							"name": "Design",
							"slug": "design",
							"path": "tags/design/",
							"permalink": "https://example.com/tags/design/",
							"length": 6
						}
					],
					"categories": [
						{
							"name": "Frontend",
							"slug": "frontend",
							"path": "categories/frontend/",
							"permalink": "https://example.com/categories/frontend/",
							"length": 8
						}
					],
					"comments": true,
					"top": false,
					"sticky": false,
					"toc": true,
					"photos": [],
					"albums": [],
					"authors": [],
					"prev": null,
					"next": null,
					"link": "",
					"noDate": false,
					"reward": false,
					"copyright": false,
					"timeliness": false,
					"mathjax": false,
					"math": false,
					"no_word_count": false,
					"no_toc": false,
					"no_valine": true,
					"no_reward": true,
					"header_image": "",
					"subtitle": "A subtitle for the post",
					"description": "A description for the post",
					"keywords": "test,blog",
					"_id": "1"
				}
			],
			"tags": [
				{
					"name": "JavaScript",
					"slug": "javascript",
					"path": "tags/javascript/",
					"permalink": "https://example.com/tags/javascript/",
					"length": 10
				},
				{
					"name": "Node.js",
					"slug": "node.js",
					"path": "tags/node.js/",
					"permalink": "https://example.com/tags/node.js/",
					"length": 7
				},
				{
					"name": "CSS",
					"slug": "css",
					"path": "tags/css/",
					"permalink": "https://example.com/tags/css/",
					"length": 3
				}
			],
			"categories": [
				{
					"name": "Tech",
					"slug": "tech",
					"path": "categories/tech/",
					"permalink": "https://example.com/categories/tech/",
					"length": 4
				},
				{
					"name": "Programming",
					"slug": "programming",
					"path": "categories/programming/",
					"permalink": "https://example.com/categories/programming/",
					"length": 11
				},
				{
					"name": "Frontend",
					"slug": "frontend",
					"path": "categories/frontend/",
					"permalink": "https://example.com/categories/frontend/",
					"length": 8
				}
			]
		},
		"body": "<p>Page content goes here.</p>",
		"post": {
			"title": "Hello World",
			"slug": "hello-world",
			"layout": "post",
			"path": "2025/01/15/hello-world/",
			"permalink": "https://example.com/2025/01/15/hello-world/",
			"date": "2025-01-15T00:00:00.000Z",
			"updated": "2025-01-20T00:00:00.000Z",
			"content": "<p>This is the content of the post.</p>",
			"excerpt": "<p>This is the excerpt.</p>",
			"abstract": "",
			"tags": [
				{
					"name": "JavaScript",
					"slug": "javascript",
					"path": "tags/javascript/",
					"permalink": "https://example.com/tags/javascript/",
					"length": 10
				},
				{
					"name": "Web",
					"slug": "web",
					"path": "tags/web/",
					"permalink": "https://example.com/tags/web/",
					"length": 3
				}
			],
			"categories": [
				{
					"name": "Tech",
					"slug": "tech",
					"path": "categories/tech/",
					"permalink": "https://example.com/categories/tech/",
					"length": 4
				}
			],
			"comments": true,
			"top": false,
			"sticky": false,
			"toc": true,
			"photos": [],
			"albums": [],
			"authors": [],
			"prev": {
				"title": "Previous Post",
				"path": "2025/01/14/previous/"
			},
			"next": {
				"title": "Next Post",
				"path": "2025/01/16/next/"
			},
			"link": "",
			"noDate": false,
			"reward": false,
			"copyright": false,
			"timeliness": false,
			"mathjax": false,
			"math": false,
			"no_word_count": false,
			"no_toc": false,
			"no_valine": true,
			"no_reward": true,
			"header_image": "",
			"subtitle": "A subtitle for the post",
			"description": "A description for the post",
			"keywords": "test,blog",
			"_id": "1"
		},
		"index": true,
		"pagination": 2,
		"class_name": "article-title",
		"date_format": null,
		"even": false,
		"url": "https://example.com/2025/01/15/hello-world/",
		"key": "hello-world",
		"title": "Hello World",
		"currPost": {
			"title": "Hello World",
			"slug": "hello-world",
			"layout": "post",
			"path": "2025/01/15/hello-world/",
			"permalink": "https://example.com/2025/01/15/hello-world/",
			"date": "2025-01-15T00:00:00.000Z",
			"updated": "2025-01-20T00:00:00.000Z",
			"content": "<p>This is the content of the post.</p>",
			"excerpt": "<p>This is the excerpt.</p>",
			"abstract": "",
			"tags": [
				{
					"name": "JavaScript",
					"slug": "javascript",
					"path": "tags/javascript/",
					"permalink": "https://example.com/tags/javascript/",
					"length": 10
				},
				{
					"name": "Web",
					"slug": "web",
					"path": "tags/web/",
					"permalink": "https://example.com/tags/web/",
					"length": 3
				}
			],
			"categories": [
				{
					"name": "Tech",
					"slug": "tech",
					"path": "categories/tech/",
					"permalink": "https://example.com/categories/tech/",
					"length": 4
				}
			],
			"comments": true,
			"top": false,
			"sticky": false,
			"toc": true,
			"photos": [],
			"albums": [],
			"authors": [],
			"prev": {
				"title": "Previous Post",
				"path": "2025/01/14/previous/"
			},
			"next": {
				"title": "Next Post",
				"path": "2025/01/16/next/"
			},
			"link": "",
			"noDate": false,
			"reward": false,
			"copyright": false,
			"timeliness": false,
			"mathjax": false,
			"math": false,
			"no_word_count": false,
			"no_toc": false,
			"no_valine": true,
			"no_reward": true,
			"header_image": "",
			"subtitle": "A subtitle for the post",
			"description": "A description for the post",
			"keywords": "test,blog",
			"_id": "1"
		},
		"className": "post-tags",
		"attr": "height",
		"global": 0,
		"locals": {},
};
