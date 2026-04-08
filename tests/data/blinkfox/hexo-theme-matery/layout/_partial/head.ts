import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"config": {
			"title": "Pixel & Code",
			"author": "Alice Chen",
			"url": "https://blog.example.com",
			"root": "/",
			"language": "en",
			"description": "A blog about web development and design",
			"keywords": "blog, web, javascript, hexo",
			"date_format": "YYYY-MM-DD",
			"subtitle": "Thoughts on code and creativity"
		},
		"theme": {
			"jsDelivr": {
				"url": "https://cdn.jsdelivr.net/gh/user/blog@latest"
			},
			"libs": {
				"css": {
					"fontAwesome": "/libs/awesome/css/all.min.css",
					"materialize": "/libs/materialize/materialize.min.css",
					"aos": "/libs/aos/aos.css",
					"animate": "/libs/animate/animate.min.css",
					"lightgallery": "/libs/lightGallery/css/lightgallery.min.css",
					"matery": "/css/matery.css",
					"mycss": "/css/my.css",
					"gitalk": "/libs/gitalk/gitalk.css",
					"aplayer": "/libs/aplayer/APlayer.min.css",
					"dplayer": "/libs/dplayer/DPlayer.min.css",
					"tocbot": "/libs/tocbot/tocbot.css",
					"prism": "/libs/prism/prism.css",
					"jqcloud": "/libs/jqcloud/jqcloud.min.css"
				},
				"js": {
					"jquery": "/libs/jquery/jquery.min.js",
					"materialize": "/libs/materialize/materialize.min.js",
					"masonry": "/libs/masonry/masonry.pkgd.min.js",
					"aos": "/libs/aos/aos.js",
					"scrollProgress": "/libs/scrollprogress/scrollProgress.min.js",
					"lightgallery": "/libs/lightGallery/js/lightgallery-all.min.js",
					"matery": "/js/matery.js",
					"clicklove": "/libs/others/clicklove.js",
					"busuanzi": "/libs/others/busuanzi.pure.mini.js",
					"canvas_nest": "/libs/others/canvas-nest.min.js",
					"ribbon_dynamic": "/libs/others/ribbon-dynamic.js",
					"instantpage": "/libs/others/instantpage.js",
					"ribbon": "/libs/others/ribbon.min.js",
					"ribbonRefresh": "/libs/others/ribbon-refresh.min.js",
					"gitalk": "/libs/gitalk/gitalk.min.js",
					"valine": "/libs/valine/Valine.min.js",
					"tocbot": "/libs/tocbot/tocbot.min.js",
					"aplayer": "/libs/aplayer/APlayer.min.js",
					"dplayer": "/libs/dplayer/DPlayer.min.js",
					"echarts": "/libs/echarts/echarts.min.js",
					"jqcloud": "/libs/jqcloud/jqcloud.min.js",
					"crypto": "/libs/crypto-js/crypto-js.min.js"
				}
			},
			"favicon": "/medias/favicon.png",
			"googleAnalytics": {
				"enable": true,
				"id": "UA-12345678-1"
			}
		},
		"page": {
			"title": "Hello World",
			"keywords": "hexo, blog, javascript",
			"summary": "A sample blog post.",
			"__post": true,
			"content": "<p>Full content here.</p>"
		},
};
