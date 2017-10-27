var db = require("../models");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function(app) { 
// A GET route for scraping the NYT Tech website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/section/technology?action=click&contentCollection=personaltech&region=navbar&module=collectionsnav&pagetype=sectionfront&pgtype=sectionfront").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.image = $(this).parent().prev().find("a").find("img").attr("src");
      result.headline = $(this).children("a").text().trim();
      result.url = $(this).children("a").attr("href");
      result.summary = $(this).next().next("p").text().trim();
      result.byline = $(this).next().next().next("p").text();


      if(result.headline != "" && result.summary != "" && result.byline != "") {

        // Create a new Article using the `result` object built from scraping
        // Search for the article headline in the db. Count how many of that same headline there are. 
        db.Article.find({headline:result.headline}).count(function(err, count) {
          console.log(count);
          // If there aren't headlines that are the same (count === 0), then add the new article to the db.
          if (count === 0) {
            console.log("running");
            db.Article.create(result).then(function(dbArticle) {
              // If we were able to successfully scrape and save an Article, send message to client.
              console.log("scraped new articles")
              res.send("Scraping new articles");
            });
          } else {
            console.log("No new articles to scrape");
          }
        });
      }

    });
  });
});

// Route for getting all Articles from the db and displaying them on the page for the user
app.get("/", function(req, res) {
  db.Article.find({saved:false}).sort({_id: -1}).then(function(articles) {

    var hbsObject = { articles: articles }
    res.render("index", hbsObject);
  }).catch(function(err) {
    res.json(err);
  })
});

// Route for getting all Articles from the db and displaying it as a JSON 
app.get("/articles", function(req, res) {
  db.Article.find({}).then(function(articles) {
    res.json(articles);
  }).catch(function(err) {
    res.json(err);
  })
});

// Route for getting one article from the db and displaying it as a JSON
app.get("/articles/:id", function(req, res) {
  var id = req.params.id;
  db.Article.findOne({_id: id}).then(function(article) {
    res.json(article);
  });
});


// Route for saving an article and returning it as a JSON
app.post("/saved/:id", function(req, res) {
  var id = req.params.id;
  db.Article.findOneAndUpdate({_id: id}, {saved: true}).sort({_id: -1})
  .then(function(savedArticle) {
    res.json(savedArticle);
  }).catch(function(err) {
    res.json(err);
  })
});

// Route for saving an article and returning it to the page for the user
app.get("/saved/:id", function(req, res) {
  var id = req.params.id;
  db.Article.findOneAndUpdate({_id: id}, {saved: true})
  .then(function(savedArticle) {
    res.redirect("/saved");
  }).catch(function(err) {
    res.json(err);
  })
});


// Route for removing a saved article
app.get("/removearticle/:id", function(req, res) {
  var id = req.params.id;

  db.Article.findOneAndUpdate({_id: id}, {saved: false})
  .then(function(savedArticle) {
    res.redirect("/saved");
  }).catch(function(err) {
    res.json(err);
  })
});

// Route for retrieving saved articles
app.get("/saved", function(req, res) {
  db.Article.find({saved:true})
  .then(function(savedArticle) {
    var hbsObject = {savedArticles:savedArticle}
    res.render("saved", hbsObject);
  }).catch(function(err) {
    res.json(err);
  })
});


// Route for saving the new note to the database
app.post("/savednotes/:id", function(req, res) {
  var articleId = req.params.id;
  var note = req.body.userNote;

  console.log(note);
  console.log(articleId);

  // save the new note that gets posted to the Notes collection
  db.Note.create(req.body).then(function(dbNote) {
      // then find an article from the req.params.id
      // and update its "note" property with the _id of the new note
      return db.Article.findOneAndUpdate( {_id: articleId}, { $push: { notes: dbNote._id } }, {new: true});
    }).then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    })
});

// Route for populating the saved articles with their associated notes
app.get("/savednotes/:id", function(req, res) {
  var articleId = req.params.id;
  db.Article.findOne( {_id:articleId})
  .populate("notes")
  .then(function(dbNote) {
    res.json(dbNote);
  })
  .catch(function(err) {
  // If an error occurs, send it back to the client
    res.json(err);
  });
});

// Route for deleting a note from a saved article
app.post("/deletenote/:noteid", function(req, res) {
  var noteId = req.params.noteid;

  db.Note.findOneAndRemove( {_id:noteId}, function(err, removed) {
    db.Article.findOneAndUpdate( {notes:noteId}, { $pull: { notes:noteId } }, function(err, removed) {
      if(err) {
        console.log(err);
      }
    });
  });
});



};


