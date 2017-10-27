var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

   headline: {
      type: String,
      trim: true,
      unique: true,
      required: true
   },

   byline: {
      type: String
   },

   url: {
      type: String,
      unique: true,
      required: true
   },

   summary: {
      type: String,
      required: true
   },

   image: {
      type: String
   },

   notes: [
      {
      type: Schema.Types.ObjectId,
      ref: "Note"
      }
   ],
   saved: {
      type: Boolean,
      default: false
   }
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
