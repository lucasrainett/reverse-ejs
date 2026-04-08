import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
	"theme": {
			"plugins": {
				"twitter_conversion_tracking": {
					"enabled": true,
					"pixel_id": "tw-abc123-xyz"
				}
			}
		},
};
