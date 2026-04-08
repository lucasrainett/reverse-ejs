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
			"per_page": 10
		},
		"page": {
			"title": "Post Title",
			"content": "<p>This is the main content of the post.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
			"tags": {
				"length": 0,
				"data": []
			},
			"categories": {
				"length": 0,
				"data": []
			},
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
			"total": 3,
			"lang": "en",
			"description": "Post description",
			"keywords": "post, blog",
			"type": "post"
		},
		"site": {
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "First Post",
						"date": "2025-01-10",
						"path": "2025/01/first-post/",
						"permalink": "https://example.com/2025/01/first-post/",
						"excerpt": "<p>First post excerpt</p>",
						"categories": {
							"length": 0,
							"data": []
						},
						"tags": {
							"length": 0,
							"data": []
						}
					},
					{
						"title": "Second Post",
						"date": "2025-01-12",
						"path": "2025/01/second-post/",
						"permalink": "https://example.com/2025/01/second-post/",
						"excerpt": "<p>Second post excerpt</p>",
						"categories": {
							"length": 0,
							"data": []
						},
						"tags": {
							"length": 0,
							"data": []
						}
					}
				]
			},
			"tags": {
				"length": 0,
				"data": []
			},
			"categories": {
				"length": 0,
				"data": []
			}
		},
		"theme": {
			"scheme": "Paradox",
			"uiux": {
				"slogan": "Welcome to my blog",
				"theme_color": "#1B5E20",
				"hyperlink_color": "#1B5E20",
				"button_color": "#1B5E20",
				"android_chrome_color": "#1B5E20",
				"nprogress_color": "#1B5E20",
				"nprogress_buffer": "#1B5E20",
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
				"github": "https://github.com/alice",
				"twitter": "",
				"weibo": ""
			},
			"dropdown": {},
			"search": {
				"use": "local",
				"swiftype_key": ""
			},
			"comment": {
				"use": "",
				"shortname": "",
				"changyan_appid": "",
				"changyan_conf": ""
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
				}
			},
			"post": {
				"entry_excerpt": 120,
				"toc": {
					"enable": true,
					"mdl_toc": false
				},
				"share": {
					"enable": false
				},
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
				"enable": false
			},
			"mathjax": {
				"enable": false
			},
			"nprogress": {
				"enable": false
			},
			"head": {},
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
				}
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
			"daily_pic": {
				"enable": false,
				"description": "",
				"options": {}
			}
		},
		"body": "<p>Page content goes here.</p>",
		"url": "https://example.com/current-page/",
		"post": {
			"title": "Post Title",
			"content": "<p>This is the main content of the post.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
			"excerpt": "<p>A brief excerpt.</p>",
			"permalink": "https://example.com/2025/01/post-title/",
			"path": "2025/01/post-title/",
			"slug": "post-title",
			"layout": "post",
			"link": "",
			"photos": [],
			"comments": true,
			"mathjax": false,
			"tags": [],
			"categories": [],
			"prev": null,
			"next": null,
			"sidebar": "default"
		},
};
