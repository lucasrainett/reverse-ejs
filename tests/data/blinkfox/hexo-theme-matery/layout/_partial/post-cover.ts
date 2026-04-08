import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"jsDelivr": {
				"url": "https://cdn.jsdelivr.net/gh/user/blog@latest"
			},
			"featureImages": [
				"/medias/featureimages/0.jpg",
				"/medias/featureimages/1.jpg",
				"/medias/featureimages/2.jpg",
				"/medias/featureimages/3.jpg"
			]
		},
		"page": {
			"title": "Hello World",
			"img": "/medias/featureimages/1.jpg",
			"path": "posts/hello-world/"
		},
};
