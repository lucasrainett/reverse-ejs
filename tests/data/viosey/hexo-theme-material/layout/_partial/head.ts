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
			"feed": {
				"path": "atom.xml",
				"type": "atom"
			},
			"search": {
				"path": "/search.xml"
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
					"path": "tags/javascript/",
					"slug": "javascript"
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
			"hide_share": false,
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
			],
			"prev_link": "",
			"next_link": ""
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
				"head": [],
				"links": {
					"Friend Site": {
						"url": "https://friend.example.com",
						"img": "/img/friend.png",
						"text": "A great friend"
					}
				}
			}
		},
		"theme": {
			"scheme": "Paradox",
			"uiux": {
				"slogan": "Welcome to my blog",
				"theme_color": "#1B5E20",
				"hyperlink_color": "#0070ff",
				"button_color": "#0070ff",
				"android_chrome_color": "#1B5E20",
				"nprogress_color": "#1B5E20",
				"nprogress_buffer": 800,
				"background": {
					"purecolor": "#F5F5F5"
				},
				"img": {
					"header": "/img/header.png",
					"logo": "/img/logo.png",
					"footer": "/img/footer.png",
					"random": "/img/random.png",
					"sidebar_header": "/img/sidebar.png",
					"daily_pic": "/img/daily.png",
					"thumbnail": "/img/thumb.png",
					"avatar": "/img/avatar.png"
				}
			},
			"sns": {
				"github": "",
				"twitter": "",
				"weibo": "",
				"facebook": ""
			},
			"dropdown": {},
			"search": {
				"use": "",
				"swiftype_key": ""
			},
			"comment": {
				"use": "",
				"shortname": "",
				"changyan_appid": "",
				"changyan_conf": "",
				"duoshuo_thread_key_type": "path",
				"changyan_thread_key_type": "path",
				"changyan": {
					"appid": "cyr123",
					"conf": "conf123"
				},
				"disqus": {
					"shortname": "myblog"
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
				"livere": {
					"data_uid": "city-123"
				},
				"valine": {
					"appid": "app123",
					"appkey": "key123",
					"notify": false,
					"verify": false
				},
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
				},
				"facebook": {
					"admin_fb_appid": "",
					"admin_fb_username": ""
				}
			},
			"pages": {
				"links": {
					"enable": false
				},
				"timeline": {
					"enable": false
				},
				"tagcloud": {
					"enable": false
				},
				"gallery": {
					"enable": false
				}
			},
			"footer": {
				"since": 2020,
				"text": "",
				"icon": {
					"enable": false
				},
				"custom_text": ""
			},
			"post": {
				"entry_excerpt": 120,
				"toc": {
					"enable": false,
					"mdl_toc": false
				},
				"share": false,
				"qrcode": {
					"enable": false
				},
				"header_image": "",
				"thumbnail": "/img/thumb.png"
			},
			"analytics": {
				"google_site_id": "",
				"gtags_site_id": "",
				"baidu_site_id": "",
				"cnzz_site_id": ""
			},
			"leancloud": {
				"enable": false,
				"app_id": "",
				"app_key": "",
				"av_core_mini": ""
			},
			"busuanzi": {
				"enable": false,
				"all_site_uv": false
			},
			"mathjax": {
				"enable": false
			},
			"nprogress": {
				"enable": false,
				"buffer": 800
			},
			"head": {
				"favicon": "/favicon.ico",
				"high_res_favicon": "/favicon.png",
				"apple_touch_icon": "/apple-touch-icon.png",
				"keywords": "blog, tech",
				"site_verification": {
					"google": "",
					"baidu": ""
				},
				"structured_data": false
			},
			"sidebar": {
				"dropdown": {},
				"homepage": {
					"use": true,
					"icon": "home"
				},
				"archives": {
					"use": true,
					"icon": "archive"
				},
				"categories": {
					"use": true,
					"icon": "folder"
				},
				"tags": {
					"use": true,
					"icon": "tag"
				},
				"pages": {},
				"article_num": {
					"use": false
				},
				"footer": {
					"body": "",
					"text": "Powered by Hexo"
				},
				"footer_image": ""
			},
			"qrcode": {
				"enable": false
			},
			"dnsprefetch": [],
			"font": {
				"enable": false,
				"host": "",
				"use": ""
			},
			"card_elevation": 2,
			"copyright": "",
			"daily_pic": "",
			"fonts": {
				"family": "'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif",
				"use": "google",
				"custom_font_host": ""
			},
			"img": {
				"avatar": "/img/avatar.png",
				"logo": "/img/logo.png",
				"daily_pic": "/img/daily.jpg",
				"random_thumbnail": "/img/random/",
				"sidebar_header": "/img/sidebar-header.jpg"
			},
			"url": {
				"logo": "#",
				"daily_pic": "#",
				"rss": "/atom.xml"
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
			"reading": {
				"entry_excerpt": 120
			},
			"thumbnail": {
				"purecolor": "",
				"random_amount": 10
			},
			"js_effect": {
				"fade": false,
				"smoothscroll": false
			},
			"prettify": {
				"enable": false,
				"theme": "github"
			},
			"hanabi": {
				"enable": false,
				"line_number": true,
				"includeDefaultColors": true,
				"customColors": []
			},
			"vendors": {
				"materialcdn": "",
				"jquery": "",
				"prettify": "",
				"fontawesome": ""
			},
			"background": {
				"purecolor": "#f5f5f5",
				"bgimg": "",
				"bing": {
					"enable": false,
					"parameter": ""
				}
			}
		},
		"body": "<p>Page content goes here.</p>",
		"url": "https://example.com/current-page/",
		"index": true,
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
		"path": "2025/01/post-title/",
		"pin": false,
};
