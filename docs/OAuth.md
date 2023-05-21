# OAuth2

web comes with baked-in support for OAuth2. It is designed to work with any provider that implements the OAuth2 specification. (properly, that is)

## Introduction

Every OAuth provider is almost exactly the same. They all have a login link, a callback URL, and a token endpoint. The login link is used to redirect the user to the provider's login page. The callback URL is used to redirect the user back to your application after they have logged in. The token endpoint is used to exchange the authorization code for an access token. We're not going to go into the details of OAuth2 here, but you can read more about it [here](https://oauth.net/2/).

**Note:** web currently does not support refresh tokens. This means that the user will have to log in again after their access token expires. You also must add your own DB to store user information, to prevent users from having to re-register every time they log in.

## Usage

If you open the `routes/login.js` file, You'll see a `providers` array.

That providers array is an array of objects containing the configuration for each provider. You can add as many providers as you want to this array. Each provider requires the following properties:

- name: The name of the provider. This is used to generate the URL for the login link.
- url: The URL of the OAuth2 provider's authorization endpoint.
- clientID: The client ID for the application.
- clientSecret: The client secret for the application.
- scope: The scope to request from the provider.
- callbackURL: The callback URL to use for the OAuth2 provider's authorization endpoint.
- authorizationURL: The URL of the OAuth2 provider's authorization endpoint. (Sometimes called the "auth URL".)
- tokenURL: The URL of the OAuth2 provider's token endpoint. (Sometimes called the "access token URL".)

Here's an example of a provider configuration:

```js
{
    name: "github",
    url: "http://127.0.0.1",
    clientID: "your-client-id",
    clientSecret: "your-client-secret",
    scope: "user:email",
    callbackURL: "http://127.0.0.1:3000/login/github/callback",
    authorizationURL: "https://github.com/login/oauth/authorize",
    tokenURL: "https://github.com/login/oauth/access_token"
}
```

You can view more examples [here](https://gist.github.com/blockarchitech/860be4dd6ff7db154c8a3626f382a8c8)

## Rich Provider Support

Optionally, you can add rich provider support to the `/login/me` endpoint, which allows you to show the user their various profile information.

To do this, find the `router.get('/me')` box. Here, you'll see the following out-of-the-box code:

```js
router.get("/me", function (req, res, next) {
  // If the user is not logged in, return a 401 Unauthorized response.
  if (!req.session.accessToken || req.session.accessToken === "") {
    next(createError(401));

    return;
  }
  var html = `
	<h1>Logged in with ${req.session.provider}</h1>
	<p>Sorry, this provider doesn't have rich profile support yet.</p>
	`;
  res.render("me", { html: html });
});
```

Here, you can add your own code to fetch the user's profile information from the provider. You can use the `req.session.accessToken` variable to get the access token for the user. You can use the `req.session.provider` variable to get the name of the provider that the user logged in with.

Here's an example of how you might fetch the user's profile information from GitHub:

```js
if (req.session.provider === "github") {
  // get user info from github
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.github.com/user");
  xhr.setRequestHeader("Authorization", "token " + req.session.accessToken);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.addEventListener("load", function () {
    // The response will contain the user's profile information.
    var response = JSON.parse(this.responseText);
    // Send the user's profile information to the browser.
    var html = `
	  <h1>Logged in with ${req.session.provider}</h1>
	  <img src="${response.avatar_url}" width="200" height="200">
	  <p><strong>Name:</strong> ${response.name}</p>
	  <p><strong>Bio:</strong> ${response.bio}</p>
	  <p><strong>Public Repos:</strong> ${response.public_repos}</p>
	  <p><strong>Followers:</strong> ${response.followers}</p>
	  `;
    res.render("me", { html: html });
  });
  xhr.send();
}
```

More examples can be found [here](https://gist.github.com/blockarchitech/860be4dd6ff7db154c8a3626f382a8c8)

## Logging Out

To log the user out, you can simply delete the `accessToken` and `provider` properties from the `req.session` object.
To do this, there is a simple `/login/logout` endpoint that you can use.

All it does, is clears the session completely, and redirects the user back to the home page.

```js
router.get("/logout", function (req, res) {
  req.session = null;
  var html =
    "<meta http-equiv='refresh' content='2;url=/'>\n\n<p>Logged out. Redirecting to home page.</p>";
  res.send(html);
});
```

## Conclusion

That's it! You now have a fully functional OAuth2 login system. You can add as many providers as you want, and you can add rich profile support for each provider. Hit a roadblock? Feel free to [open an issue](https://github.com/blockarchitech/web/issues/new) and we'll help you out.
