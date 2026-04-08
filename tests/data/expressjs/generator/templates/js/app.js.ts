export default {
	"view": {
		"engine": "ejs",
		"render": null
	},
	"modules": {
		"cookieParser": "cookie-parser",
		"logger": "morgan"
	},
	"localModules": {
		"indexRouter": "./routes/index",
		"usersRouter": "./routes/users"
	},
	"uses": [
		"logger('dev')",
		"express.json()",
		"express.urlencoded({ extended: false })",
		"cookieParser()",
		"express.static(path.join(__dirname, 'public'))"
	],
	"mounts": [
		{
			"path": "'/'",
			"code": "indexRouter"
		},
		{
			"path": "'/users'",
			"code": "usersRouter"
		}
	]
};
