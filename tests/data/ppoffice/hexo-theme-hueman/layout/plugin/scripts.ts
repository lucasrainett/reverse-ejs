import { createHexoHelpers, createDate, createCollection } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "My Blog",
			"subtitle": "A developer blog",
			"author": "Alice Chen",
			"description": "A blog about web development.",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"timezone": "UTC",
			"date_format": "YYYY-MM-DD"
		},
		"theme": {
			"customize": {
				"thumbnail": true
			},
			"comment": {
				"disqus": "",
				"duoshuo": "",
				"youyan": "",
				"livere": "",
				"facebook": "",
				"isso": false,
				"changyan": {
					"on": false,
					"appid": "",
					"conf": ""
				},
				"valine": {
					"on": false,
					"appId": "",
					"appKey": "",
					"notify": false,
					"verify": false,
					"visitor": false
				},
				"gitalk": {
					"on": false,
					"clientID": "",
					"clientSecret": "",
					"repo": "",
					"owner": "",
					"admin": []
				}
			},
			"plugins": {
				"lightgallery": false,
				"justifiedgallery": false,
				"google_analytics": "",
				"baidu_analytics": "",
				"mathjax": false,
				"google_adsense": null,
				"cookie_consent": false,
				"statcounter": {
					"on": false,
					"sc_project": 12345678,
					"sc_invisible": 1,
					"sc_security": "abcdef12",
					"public": false
				},
				"twitter_conversion_tracking": {
					"enabled": false,
					"pixel_id": "abc123"
				}
			}
		},
		"page": {
			"title": "Hello World",
			"content": "<p>Page content here.</p>",
			"date": "2025-01-15",
			"updated": "2025-01-16",
			"tags": {
				"data": [
					{
						"name": "javascript"
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
			},
			"excerpt": "<p>Short excerpt.</p>",
			"permalink": "https://blog.example.com/2025/01/15/hello-world/",
			"path": "2025/01/15/hello-world/",
			"current": 1,
			"total": 1,
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "Getting Started with JavaScript",
						"date": "2025-01-15",
						"path": "2025/01/15/getting-started/",
						"permalink": "https://blog.example.com/2025/01/15/getting-started/",
						"excerpt": "<p>An excerpt of Getting Started with JavaScript.</p>",
						"content": "<p>Full content of Getting Started with JavaScript.</p>",
						"tags": {
							"data": [
								{
									"name": "javascript",
									"path": "tags/javascript"
								}
							],
							"length": 1
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
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "",
						"author": "Alice Chen",
						"sticky": 1,
						"hidden": false,
						"link": "",
						"updated": "2025-01-15"
					},
					{
						"title": "Advanced Node.js Patterns",
						"date": "2025-01-10",
						"path": "2025/01/10/advanced-nodejs/",
						"permalink": "https://blog.example.com/2025/01/10/advanced-nodejs/",
						"excerpt": "<p>An excerpt of Advanced Node.js Patterns.</p>",
						"content": "<p>Full content of Advanced Node.js Patterns.</p>",
						"tags": {
							"data": [
								{
									"name": "javascript",
									"path": "tags/javascript"
								}
							],
							"length": 1
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
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "",
						"author": "Alice Chen",
						"sticky": false,
						"hidden": false,
						"link": "",
						"updated": "2025-01-10"
					}
				]
			}
		},
		"site": {
			"posts": {
				"length": 2,
				"data": [
					{
						"title": "Getting Started with JavaScript",
						"date": "2025-01-15",
						"path": "2025/01/15/getting-started/",
						"permalink": "https://blog.example.com/2025/01/15/getting-started/",
						"excerpt": "<p>An excerpt of Getting Started with JavaScript.</p>",
						"content": "<p>Full content of Getting Started with JavaScript.</p>",
						"tags": {
							"data": [
								{
									"name": "javascript",
									"path": "tags/javascript"
								}
							],
							"length": 1
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
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "",
						"author": "Alice Chen",
						"sticky": 1,
						"hidden": false,
						"link": "",
						"updated": "2025-01-15"
					},
					{
						"title": "Advanced Node.js Patterns",
						"date": "2025-01-10",
						"path": "2025/01/10/advanced-nodejs/",
						"permalink": "https://blog.example.com/2025/01/10/advanced-nodejs/",
						"excerpt": "<p>An excerpt of Advanced Node.js Patterns.</p>",
						"content": "<p>Full content of Advanced Node.js Patterns.</p>",
						"tags": {
							"data": [
								{
									"name": "javascript",
									"path": "tags/javascript"
								}
							],
							"length": 1
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
						"slug": "",
						"layout": "post",
						"photos": [
							"https://blog.example.com/img/photo1.jpg"
						],
						"cover": "",
						"subtitle": "",
						"author": "Alice Chen",
						"sticky": false,
						"hidden": false,
						"link": "",
						"updated": "2025-01-10"
					}
				]
			},
			"tags": {
				"length": 1,
				"data": [
					{
						"name": "javascript",
						"path": "tags/javascript",
						"posts": {
							"length": 2
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
		"body": "<article><p>Content</p></article>",
};
