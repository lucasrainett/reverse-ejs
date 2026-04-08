import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"author": "Alice",
			"keywords": "blog, javascript, web development",
			"description": "A personal tech blog",
			"rss": "/atom.xml",
			"leancloud": {
				"comment": false,
				"count": false
			},
			"mathjax": false,
			"busuanzi": false,
			"cdn": {
				"leancloud": "",
				"mathjax": "",
				"valine": "",
				"busuanzi": "",
				"font_awesome": "https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css"
			},
			"favicon": {
				"icon": "/img/favicon.ico",
				"touch_icon": "/img/touch-icon.png"
			},
			"custom_styles": null,
			"passwords": []
		},
		"page": {
			"title": "Home",
			"tags": null,
			"categories": null,
			"type": "",
			"current": 1,
			"lock": false,
			"passwords": [],
			"more": "",
			"toc_number": true
		},
		"config": {
			"title": "My Tech Blog",
			"author": "Alice",
			"description": "A personal tech blog",
			"root": "/"
		},
};
