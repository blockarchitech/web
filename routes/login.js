//
// Generic OAuth2 login.
// See the documentation for more information.
//

var express = require("express");
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest-ssl").XMLHttpRequest;
var session = require("express-session");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var cors = require("cors");
var createError = require("http-errors");

// This is the list of providers that we will support.

var providers = [];

router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(
  session({
    secret: "my cat really likes playing with yarn"
  })
);

router.use(cors());

// This is the logout route.  It will log the user out.
router.get("/logout", function (req, res) {
  req.session = null;
  var html =
    "<meta http-equiv='refresh' content='2;url=/'>\n\n<p>Logged out. Redirecting to home page.</p>";
  res.send(html);
});

// This is the route that will return the user's profile information as a JSON object.
router.get("/me", function (req, res, next) {
  // If the user is not logged in, return a 401 Unauthorized response.
  if (!req.session.accessToken || req.session.accessToken === "") {
    next(createError(401));

    return;
  }
  //
  // ------- STOP HERE -------
  // At this point, the user is logged in and we have an access token.
  // You can:
  //  - Use the access token to make API calls to the OAuth2 provider on behalf of the user.
  //  - Use the access token to fetch the user's profile information from the OAuth2 provider.
  // etc.
  // There are examples from the community in the README.md file under "OAuth2 Providers".
  //
  var html = `
	<h1>Logged in with ${req.session.provider}</h1>
	<p>Sorry, this provider doesn't have rich profile support yet.</p>
	`;
  res.render("me", { html: html });
});

// This is the login route.  It will redirect the user to the OAuth2 provider's authorization endpoint.
router.get("/:provider", function (req, res, next) {
  // Start OAuth2 flow by redirecting the user to the OAuth2 provider's authorization endpoint.
  if (providers.length === 0) {
    var err = new Error(
      "No OAuth2 providers are configured. Please check your configuration."
    );
    err.status = 500;
    next(err);
    return;
  }
  var provider = providers.find(function (provider) {
    return provider.name === req.params.provider;
  });
  if (!provider) {
    next(createError(404));
    return;
  }
  var url =
    provider.authorizationURL +
    "?" +
    "client_id=" +
    provider.clientID +
    "&redirect_uri=" +
    provider.callbackURL +
    "&grant_type=authorization_code" +
    "&response_type=code" +
    "&scope=" +
    provider.scope;
  res.redirect(url);
});

// This is the OAuth2 provider's authorization endpoint.  The OAuth2 provider will redirect the user to this route after
// the user has successfully authenticated.
router.get("/:provider/callback", function (req, res, next) {
  // Get the provider configuration.
  var provider = providers.find(function (provider) {
    return provider.name === req.params.provider;
  });
  if (!provider) {
    next(createError(404));
    return;
  }
  // Get the authorization code from the query parameters.
  var code = req.query.code;
  // Set up the request to the OAuth2 provider's token endpoint.
  var xhr = new XMLHttpRequest();
  xhr.open("POST", provider.tokenURL);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Accept", "application/json");
  // Handle the OAuth2 provider's response.
  xhr.addEventListener("load", function () {
    // The response will contain an access token and a refresh token.
    // we will save the access token in the session, and redirect the user to the profile page.
    var response = JSON.parse(this.responseText);
    req.session.accessToken = response.access_token;
    req.session.provider = provider.name;
    // Save the user's profile information in the session.
    req.session.user = response.user;
    res.redirect("/login/me");
  });
  // Send the request to the OAuth2 provider's token endpoint.
  xhr.send(
    "client_id=" +
      provider.clientID +
      "&client_secret=" +
      provider.clientSecret +
      "&grant_type=authorization_code" +
      "&redirect_uri=" +
      provider.callbackURL +
      "&code=" +
      code
  );
});

module.exports = router;
