# web

Extensible boilerplate for node.js web apps.

## Features

- [x] [Express](https://expressjs.com/) web server
- [x] [ejs](https://ejs.co/) templating engine
- [x] Stupidly simple [OAuth2](https://oauth.net/2/) login system
- [x] Easily extensible with [Express](https://expressjs.com/) middleware, CSS and JS
- [x] Baked-in error handling (no more crashing!)

## Usage

1. Clone this repository.
2. Chances are; you want your own git repository. Run `rm -rf .git` to remove the git repository.
3. Run `npm install` to install dependencies.
4. Run `npm run devstart` to start the server.
5. :tada: **You're done!**

## Extending

### Middleware

You can add your own middleware to the `app.js` file. Just add it to the `app.use()` function.

### CSS/JS

You can add your own CSS and JS to the `public` folder. The `public` folder is served statically, so you can add whatever you want to it.

### Routes

You can add your own routes to the `routes` folder. Just add a new file to the `routes` folder, and add the following code to it:

```js
var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
```

Then, add the following code to the `app.js` file:

```js
var indexRouter = require("./routes/index");

app.use("/", indexRouter);
```

### OAuth

See [docs/OAuth.md](docs/OAuth.md) for more information.

## Notes

- This boilerplate is not meant to be used in production. It's meant to be used as a starting point for your own projects.
- This requires general knowledge of node.js and express. If you don't know what those are, you should probably learn them before using this boilerplate.
- This boilerplate is not meant to be used as a framework.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.
