export default {
	"packages": [
		"@angular/cli",
		"@angular-devkit/core",
		"@schematics/angular"
	],
	"monorepo": {
		"packages": {
			"@angular/cli": {
				"name": "Angular CLI",
				"section": "Tooling",
				"links": [
					{
						"label": "docs",
						"url": "https://angular.dev",
						"color": "green"
					}
				],
				"snapshotRepo": "angular/cli-builds"
			},
			"@angular-devkit/core": {
				"name": "DevKit Core",
				"links": [],
				"snapshotRepo": null
			},
			"@schematics/angular": {
				"name": "Angular Schematics",
				"links": [],
				"snapshotRepo": null
			}
		}
	}
};
