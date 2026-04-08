import { createHexoHelpers, createDate, createCollection } from "../../../../../helpers";

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
			"root": "/",
			"avatar": "/images/avatar.jpg",
			"author": "Alice Chen",
			"subtitle": "A personal tech blog",
			"favicon": "/images/favicon.ico",
			"rss": "",
			"menu": {
				"Home": "/",
				"Archives": "/archives",
				"About": "/about"
			},
			"subnav": {
				"github": "https://github.com/alice",
				"rss": "/atom.xml"
			},
			"smart_menu": {
				"innerArchive": "All",
				"friends": "Friends",
				"aboutme": "About"
			},
			"friends": {
				"Bob": "https://bob.example.com",
				"Charlie": "https://charlie.example.com"
			},
			"aboutme": "Hi, I am Alice. A web developer.",
			"excerpt_link": "Read More",
			"show_all_link": "View All",
			"top": true,
			"toc": 1,
			"toc_empty_wording": "No table of contents",
			"toc_hide_index": false,
			"mathjax": false,
			"open_in_new": false,
			"reward_type": 0,
			"reward_wording": "Buy me a coffee",
			"alipay": "",
			"weixin": "",
			"share_jia": false,
			"duoshuo": "",
			"wangyiyun": "",
			"changyan_appid": "",
			"changyan_conf": "",
			"disqus": "",
			"gitment_owner": "",
			"gitment_repo": "",
			"gitment_oauth": {
				"client_id": "",
				"client_secret": ""
			},
			"google_analytics": "",
			"baidu_analytics": "",
			"twitter": "",
			"google_plus": "",
			"fb_admins": "",
			"fb_app_id": "",
			"style": {
				"header": "#4d4d4d",
				"slider": "linear-gradient(200deg,#a0cfe4,#e8c37e)"
			},
			"slider": {
				"showTags": true
			}
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
