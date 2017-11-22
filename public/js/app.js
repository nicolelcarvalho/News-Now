$(document).ready(function() { 

// On click event when user glicks to get new articles
// AJAX request is sent to the scrape route
// Messages are appended to the screen to notify the user
$("#getNew").on("click", function() {
  $(".message").html("Checking for articles...");
  var baseURL = window.location.origin;
    $.ajax({
      method: "GET", 
      url: baseURL + "/scrape"
    }).done(function(message) {

      console.log(message);
      if(message === "Scraping new articles") {
        $(".message").html("Scraping new articles...");
        setTimeout(function(){ location.reload(); }, 2000);
      }
    });
    setTimeout(function(){ $(".message").html("No new articles available."); }, 3500);
});

// Allow the user to post a note into the db as well as display it in the modal along with all the other notes
$(".add-note").on("click", function() {
  $(".add-message").hide();
  var thisId = $(this).attr("data-id");
  var baseURL = window.location.origin;
  console.log($(".note-text").val());

  if($(".note-text").val()) { 

    $.ajax({
      method: "POST",
      url: baseURL + "/savednotes/" + thisId,
      data: {
        body: $(".note-text").val()
      }
    }).then(function() { 

    $(".note-text").val("");

    $.ajax({
      method: "GET",
      url: baseURL + "/savednotes/" + thisId
    })
    .done(function(data) {
      console.log(data.notes);
      $(".all-notes").empty();
      for (var i = 0; i < data.notes.length; i++) {
        var noteDiv = $("<div>").addClass("added-notes");
        var noteBtn = $("<button>").addClass("btn delete-note-btn");
        noteBtn.text("X");
        noteBtn.attr("data-id", data.notes[i]._id);
        $(noteDiv).append(data.notes[i].body);
        $(noteDiv).append(noteBtn);
        $(".all-notes").append(noteDiv);
      }
    });
  });
  }
  else {
    $(".add-message").show();
    $(".add-message").html("Please write a message.");
  }
});

// Populate all of the notes from the db when user clicks to add a note
$(document).on("click", ".note", function() {
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  $(".all-notes").empty();
  $("#noteModal").modal('toggle');
  var baseURL = window.location.origin;

  $.ajax({
    method: "GET",
    url: baseURL + "/savednotes/" + thisId
  })
  .done(function(data) {
    console.log(data.notes);
    for (var i = 0; i < data.notes.length; i++) {
      var noteDiv = $("<div>").addClass("added-notes");
      var noteBtn = $("<button>").addClass("btn delete-note-btn");
      noteBtn.text("X");
      noteBtn.attr("data-id", data.notes[i]._id);
      $(noteDiv).append(data.notes[i].body);
      $(noteDiv).append(noteBtn);
      $(".all-notes").append(noteDiv);
    }
  });


  $.ajax({
    method: "GET",
    url: baseURL + "/articles/" + thisId
  })
  .done(function(data) {
    console.log(data);
    $(".modal-title").html(data.headline);
    $(".byline").html(data.byline);
    $(".add-note").attr("data-id", data._id);
  });


});

// Delete a note from the db
$(document).on("click", ".delete-note-btn", function() {
  var noteId = $(this).attr("data-id");
  $(this).parent().remove();
  var baseURL = window.location.origin;

  $.ajax({
    method: "POST",
    url: baseURL + "/deletenote/" + noteId
  })
  .done(function(data) {
    console.log(data);
  });
});

});
