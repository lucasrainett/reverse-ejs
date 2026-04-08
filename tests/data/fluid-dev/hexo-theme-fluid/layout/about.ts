import { createHexoHelpers } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"about": {
				"title": "About Me",
				"subtitle": "Get to know me",
				"banner_img": "https://blog.example.com/img/about-bg.jpg",
				"banner_img_height": 75,
				"banner_mask_alpha": 0.3,
				"name": "Alice Chen",
				"introduce": "Full-stack developer and open source enthusiast",
				"avatar": "/img/avatar.jpg",
				"icons": [
					{
						"class": "iconfont icon-github-fill",
						"link": "https://github.com/alicechen",
						"tip": "GitHub"
					},
					{
						"class": "iconfont icon-twitter-fill",
						"link": "https://twitter.com/alicechen",
						"tip": "Twitter"
					},
					{
						"class": "iconfont icon-wechat-fill",
						"qrcode": "/img/wechat-qr.png"
					}
				]
			},
			"post": {
				"comments": {
					"type": "utterances",
					"enable": true
				}
			}
		},
		"page": {
			"layout": "about",
			"title": "About Me",
			"subtitle": "Get to know me",
			"banner_img": "https://blog.example.com/img/about-bg.jpg",
			"banner_img_height": 75,
			"banner_mask_alpha": 0.3,
			"content": "<p>Hello! I'm Alice, a software developer based in San Francisco.</p>",
			"comments": false
		},
		"config": {
			"title": "Pixel & Code",
			"subtitle": "A Developer's Journey",
			"author": "Alice Chen",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"theme": "fluid",
			"description": "A blog about web development and design",
			"keywords": [
				"javascript",
				"web",
				"development"
			],
			"date_format": "YYYY-MM-DD",
			"pagination_dir": "page",
			"index_generator": {
				"order_by": "-date"
			}
		},
};
