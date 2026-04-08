import { createHexoHelpers, createDate, createCollection } from "../../../helpers";

export default {
	...createHexoHelpers(),
	"page": {
			"posts": {
				"data": [
					{
						"date_formatted": "2025-03-15",
						"categories_length": 1,
						"categories_data": [
							{
								"path": "categories/javascript/",
								"name": "JavaScript"
							}
						],
						"lock": false,
						"title": "Understanding Closures",
						"path": "posts/understanding-closures/",
						"description": "A deep dive into JavaScript closures and how they work.",
						"excerpt": "",
						"tags_length": 2,
						"tags_data": [
							{
								"path": "tags/javascript/",
								"name": "JavaScript"
							},
							{
								"path": "tags/fundamentals/",
								"name": "Fundamentals"
							}
						],
						"cover": "/img/closures-cover.jpg",
						"date": "2025-01-15",
						"categories": [],
						"tags": [],
						"updated": "2025-01-15",
						"content": "<p>Content</p>"
					},
					{
						"date_formatted": "2025-01-10",
						"categories_length": 0,
						"categories_data": [],
						"lock": false,
						"title": "Getting Started with Docker",
						"path": "posts/getting-started-docker/",
						"description": "",
						"excerpt": "<p>Docker is a platform for developing and shipping applications.</p>",
						"tags_length": 1,
						"tags_data": [
							{
								"path": "tags/devops/",
								"name": "DevOps"
							}
						],
						"cover": null,
						"date": "2025-01-15",
						"categories": [],
						"tags": [],
						"updated": "2025-01-15",
						"content": "<p>Content</p>"
					}
				]
			}
		},
};
