import { createHexoHelpers, createDate, createCollection } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "My Blog",
			"author": "Alice",
			"url": "https://example.com",
			"root": "/",
			"language": "en",
			"relative_link": false,
			"description": "A blog about technology",
			"subtitle": "Tech Blog",
			"keywords": "blog, tech",
			"timezone": "UTC",
			"per_page": 10,
			"date_format": "YYYY-MM-DD",
			"archive_dir": "archives",
			"feed": {
				"path": "atom.xml",
				"type": "atom"
			},
			"suka_theme": {
				"search": {
					"path": "/search.xml"
				}
			}
		},
		"page": {
			"title": "Post Title",
			"content": "<p>This is the main content of the post.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-15",
			"tags": [
				{
					"name": "javascript",
					"path": "tags/javascript/"
				}
			],
			"categories": [
				{
					"name": "Technology",
					"path": "categories/technology/"
				}
			],
			"excerpt": "<p>A brief excerpt of the post.</p>",
			"permalink": "https://example.com/2025/01/post-title/",
			"path": "2025/01/post-title/",
			"slug": "post-title",
			"layout": "post",
			"raw": "Post content in markdown",
			"comments": true,
			"link": "",
			"photos": [],
			"prev": null,
			"next": null,
			"sidebar": "default",
			"mathjax": false,
			"toc": true,
			"year": 2025,
			"month": 1,
			"category": "Technology",
			"tag": "javascript",
			"current": 1,
			"total": 1,
			"lang": "en",
			"description": "Post description",
			"keywords": "post, blog",
			"type": "post",
			"thumbnail": "",
			"busuanzi_offset": 0,
			"id": "page-1",
			"posts": [
				{
					"title": "First Post",
					"content": "<p>This is the main content of the post.</p>",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"excerpt": "<p>A brief excerpt of the post.</p>",
					"permalink": "https://example.com/2025/01/sample-post/",
					"path": "2025/01/sample-post/",
					"slug": "sample-post",
					"layout": "post",
					"link": "",
					"photos": [],
					"comments": true,
					"mathjax": false,
					"top": false,
					"thumbnail": "",
					"id": "post-1",
					"tags": [
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"slug": "javascript"
						}
					],
					"categories": [
						{
							"name": "Technology",
							"path": "categories/technology/",
							"slug": "technology"
						}
					],
					"prev": null,
					"next": null,
					"sidebar": "default"
				},
				{
					"title": "Second Post",
					"content": "<p>This is the main content of the post.</p>",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"excerpt": "<p>A brief excerpt of the post.</p>",
					"permalink": "https://example.com/2025/01/sample-post/",
					"path": "2025/01/sample-post/",
					"slug": "sample-post",
					"layout": "post",
					"link": "",
					"photos": [],
					"comments": true,
					"mathjax": false,
					"top": false,
					"thumbnail": "",
					"id": "post-1",
					"tags": [
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"slug": "javascript"
						}
					],
					"categories": [
						{
							"name": "Technology",
							"path": "categories/technology/",
							"slug": "technology"
						}
					],
					"prev": null,
					"next": null,
					"sidebar": "default"
				}
			]
		},
		"site": {
			"posts": [
				{
					"title": "First Post",
					"content": "<p>This is the main content of the post.</p>",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"excerpt": "<p>A brief excerpt of the post.</p>",
					"permalink": "https://example.com/2025/01/sample-post/",
					"path": "2025/01/sample-post/",
					"slug": "sample-post",
					"layout": "post",
					"link": "",
					"photos": [],
					"comments": true,
					"mathjax": false,
					"top": false,
					"thumbnail": "",
					"id": "post-1",
					"tags": [
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"slug": "javascript"
						}
					],
					"categories": [
						{
							"name": "Technology",
							"path": "categories/technology/",
							"slug": "technology"
						}
					],
					"prev": null,
					"next": null,
					"sidebar": "default"
				},
				{
					"title": "Second Post",
					"content": "<p>This is the main content of the post.</p>",
					"date": "2025-01-15",
					"updated": "2025-01-15",
					"excerpt": "<p>A brief excerpt of the post.</p>",
					"permalink": "https://example.com/2025/01/sample-post/",
					"path": "2025/01/sample-post/",
					"slug": "sample-post",
					"layout": "post",
					"link": "",
					"photos": [],
					"comments": true,
					"mathjax": false,
					"top": false,
					"thumbnail": "",
					"id": "post-1",
					"tags": [
						{
							"name": "javascript",
							"path": "tags/javascript/",
							"slug": "javascript"
						}
					],
					"categories": [
						{
							"name": "Technology",
							"path": "categories/technology/",
							"slug": "technology"
						}
					],
					"prev": null,
					"next": null,
					"sidebar": "default"
				}
			],
			"tags": [],
			"categories": [],
			"data": {
				"links": {
					"Friend Site": {
						"url": "https://friend.example.com",
						"img": "/img/friend.png",
						"text": "A great friend"
					}
				},
				"head": []
			}
		},
		"theme": {
			"head": {
				"high_res_favicon": "/favicon.png",
				"apple_touch_icon": "/apple-touch-icon.png",
				"keywords": "blog",
				"color": "#1B5E20",
				"site_verification": {
					"google": "",
					"baidu": ""
				},
				"favicon": {
					"safari_pinned_tab": ""
				},
				"pwa_manifest": "",
				"open_search": ""
			},
			"nav": {
				"logo": {
					"text": "Suka Blog"
				},
				"menu": {
					"Home": "/",
					"Archive": "/archives"
				},
				"home": {
					"use": true
				},
				"archives": {
					"use": true
				},
				"search": {
					"use": false,
					"link": "/search/"
				},
				"share": {
					"use": false
				},
				"rss": {
					"use": false
				},
				"pages": {}
			},
			"footer": {
				"since": 2020,
				"custom_text": "",
				"copyright_since": 2020
			},
			"post": {
				"entry": {
					"excerpt": 120
				},
				"header_image": {
					"enable": false,
					"default_image": ""
				},
				"toc": {
					"enable": true
				},
				"copyright": {
					"enable": false,
					"author": "Alice",
					"license": "CC BY-NC-SA 4.0",
					"license_link": ""
				},
				"share": false,
				"entry_excerpt": 120
			},
			"comment": {
				"use": "",
				"shortname": "",
				"livere_uid": "",
				"livere": {
					"data_uid": ""
				},
				"disqus": {
					"shortname": "myblog"
				},
				"disqusjs": {
					"shortname": "myblog",
					"apikey": "abc123",
					"api": "https://disqus.com/api/",
					"admin": "",
					"adminLabel": "",
					"siteName": ""
				},
				"facebook": {
					"numposts": 5,
					"colorschme": "light",
					"orderby": "social",
					"admin_fb_appid": "",
					"admin_fb_username": ""
				},
				"gitalk": {
					"client_id": "abc",
					"client_secret": "def",
					"repo": "blog-comments",
					"owner": "user"
				},
				"gitment": {
					"owner": "user",
					"repo": "blog-comments",
					"client_id": "abc",
					"client_secret": "def"
				},
				"changyan": {
					"appid": "cyr123",
					"conf": "conf123",
					"thread_key_type": "path"
				},
				"valine": {
					"leancloud_appId": "app123",
					"leancloud_appKey": "key123",
					"placeholder": "Leave a comment",
					"guest_info": "nick,mail,link",
					"pageSize": 10,
					"avatar": "mm",
					"lang": "en"
				},
				"valine_notify": "false",
				"valine_verify": "false",
				"wildfire": {
					"database_provider": "firebase",
					"theme": "light",
					"locale": "en",
					"wilddog_site_id": "",
					"firebase_api_key": "key",
					"firebase_auth_domain": "app.firebaseapp.com",
					"firebase_database_url": "https://app.firebaseio.com",
					"firebase_project_id": "myproject",
					"firebase_storage_bucket": "app.appspot.com",
					"firebase_messaging_sender_id": "123456"
				}
			},
			"analytics": {
				"google_site_id": "",
				"gtags_site_id": "",
				"baidu_site_id": "",
				"cnzz_site_id": "",
				"tencent_sid": "",
				"tencent_cid": ""
			},
			"search": {
				"enable": false,
				"use": "",
				"swiftype_key": "",
				"path": "/search.xml"
			},
			"busuanzi": {
				"enable": false,
				"site_uv": {
					"offset": 0
				},
				"site_pv": {
					"offset": 0
				},
				"page_pv": false,
				"post_pv": {
					"enable": false,
					"before": "",
					"after": ""
				}
			},
			"valine": {
				"enable": false,
				"appid": "",
				"appkey": "",
				"notify": false,
				"verify": false
			},
			"highlight": {
				"enable": true,
				"use": "hexo-hljs",
				"theme": "default"
			},
			"font": {
				"enable": false,
				"global_font": "",
				"code_font": "",
				"host": ""
			},
			"img": {
				"avatar": "/img/avatar.png",
				"header": "/img/header.png"
			},
			"links": [
				{
					"name": "Friend",
					"url": "https://friend.example.com",
					"avatar": "/img/friend.png",
					"bio": "A friend"
				}
			],
			"disqusjs": {
				"enable": false,
				"shortname": "",
				"apikey": "",
				"api": ""
			},
			"fragment_cache": false,
			"pages": {
				"links": {
					"enable": false
				},
				"search": {
					"enable": false
				},
				"tagcloud": {
					"enable": false
				}
			},
			"dns_prefetch": [],
			"site_verification": {
				"google": "",
				"baidu": ""
			},
			"structured_data": {
				"title": "",
				"description": "",
				"image": ""
			},
			"preload": {
				"enable": false
			},
			"color": {
				"primary": "#1B5E20"
			},
			"uiux": {
				"slogan": "Welcome to my blog",
				"bg_color": "#f8f9fa",
				"link_color": "#0070ff",
				"primary_color": "#1B5E20",
				"lazy_padding_bottom": ""
			},
			"vendors": {
				"lazyload": "",
				"lazyload_img": "",
				"busuanzi": "",
				"hanabi": "",
				"suka": {
					"hanabi_browser_js": "",
					"local_search_js": ""
				}
			},
			"sns_share": {
				"weibo": false,
				"twitter": false,
				"facebook": false,
				"googleplus": false,
				"linkedin": false,
				"qq": false,
				"telegram": false
			},
			"qrcode": {
				"post_share": false
			},
			"valine_counter": {
				"enable": false,
				"site_pv": {
					"enable": false,
					"before": "",
					"after": ""
				},
				"post_pv": {
					"enable": false,
					"before": "",
					"after": ""
				},
				"index_post_pv": {
					"enable": false,
					"before": "",
					"after": ""
				}
			},
			"verison": "1.3.0",
			"hanabi": {
				"enable": false
			},
			"prettify": {
				"enable": false
			},
			"toc": {
				"enable": false,
				"line_number": false
			}
		},
		"body": "<p>Page content goes here.</p>",
		"url": "https://example.com/current-page/",
		"post": {
			"title": "Sample Post",
			"content": "<p>This is the main content of the post.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-15",
			"excerpt": "<p>A brief excerpt of the post.</p>",
			"permalink": "https://example.com/2025/01/sample-post/",
			"path": "2025/01/sample-post/",
			"slug": "sample-post",
			"layout": "post",
			"link": "",
			"photos": [],
			"comments": true,
			"mathjax": false,
			"tags": [
				{
					"name": "javascript",
					"path": "tags/javascript/",
					"slug": "javascript"
				}
			],
			"categories": [
				{
					"name": "Technology",
					"path": "categories/technology/",
					"slug": "technology"
				}
			],
			"prev": null,
			"next": null,
			"sidebar": "default",
			"top": false,
			"thumbnail": "",
			"id": "post-1"
		},
		"index": false,
		"posts": [],
};
