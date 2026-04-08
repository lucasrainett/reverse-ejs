import { createHexoHelpers } from "../../../../helpers";

export default {
	...createHexoHelpers(),
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
};
