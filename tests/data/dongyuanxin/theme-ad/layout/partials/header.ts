import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"nav_name": "My Blog",
			"motto": "Code is poetry",
			"nav": [
				{
					"path": "/",
					"name": "Home"
				},
				{
					"path": "/archives",
					"name": "Archives"
				},
				{
					"path": "/about",
					"name": "About"
				}
			],
			"github": "https://github.com/alice"
		},
};
