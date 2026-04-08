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
			"head": {
				"high_res_favicon": "/favicon.png",
				"apple_touch_icon": "/apple-touch-icon.png",
				"keywords": "blog"
			},
			"nav": {
				"logo": {
					"text": "Suka Blog"
				},
				"menu": {
					"Home": "/",
					"Archive": "/archives"
				}
			},
			"footer": {
				"since": 2020,
				"custom_text": ""
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
				"share": {
					"enable": false
				}
			},
			"comment": {
				"use": "",
				"shortname": "",
				"livere_uid": ""
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
				"swiftype_key": ""
			},
			"busuanzi": {
				"enable": false,
				"site_uv": false,
				"site_pv": false,
				"page_pv": false
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
			}
		},
		"body": "<p>Page content goes here.</p>",
		"url": "https://example.com/current-page/",
};
