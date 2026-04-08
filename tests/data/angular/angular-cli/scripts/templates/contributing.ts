export default {
	"COMMIT_TYPES": {
		"build": {
			"description": "Changes that affect the build system or external dependencies",
			"scope": 0
		},
		"ci": {
			"description": "Changes to our CI configuration files and scripts",
			"scope": 2
		},
		"docs": {
			"description": "Documentation only changes",
			"scope": 0
		},
		"feat": {
			"description": "A new feature",
			"scope": 1
		},
		"fix": {
			"description": "A bug fix",
			"scope": 1
		},
		"perf": {
			"description": "A code change that improves performance",
			"scope": 1
		},
		"refactor": {
			"description": "A code change that neither fixes a bug nor adds a feature",
			"scope": 1
		},
		"test": {
			"description": "Adding missing tests or correcting existing tests",
			"scope": 1
		}
	},
	"ScopeRequirement": {
		"Required": 1,
		"Forbidden": 2
	},
	"packages": [
		"@angular/cli",
		"@angular-devkit/core",
		"@schematics/angular"
	]
};
