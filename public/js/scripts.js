function handleClick(student, classCode, score) {
  $.get("/save?student="+student+"&classCode="+classCode+"&score="+score, function(string) {
    // Pass student, class and score data to server
  });
}

$(document).ready(function() {

  // AJAX request for Teacher's classes
  $( "#teacher-form" ).submit(function( event ) {
    var name = $('#name').val();
    $.getJSON("/teacher?name="+name, function(string) {
      //alert("JSON Received");

      // destroy any class lists that are already there
      $('#classes-card').remove();

      // Create tab list
      $('#classes').append("<div class='card' id='classes-card'></div>");
      $('#classes-card').append("<div class='card-header' id='classes-header'></div>");
      $('#classes-card').append("<div class='card-body' id='classes-body'></div>");
      $('#classes-header').append("<ul id='subject-tabs' class='nav nav-pills nav-fill' role='tablist'></ul>");

      // Loop through each subject and create a tab to click
      $.each(string, function(key,val) {

        if(key == 0) {
          $('#subject-tabs').append("<li class='nav-item'>" +
              "<a class='nav-link active' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
              key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>");
        } else {
          $('#subject-tabs').append("<li class='nav-item'>" +
              "<a class='nav-link' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
              key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>");
        }
      });

      // Create tab content container
      $('#classes-body').append("<div class='tab-content' id='tab-container'></div>");

      // Create table of students
      $.each(string, function(x,y) {

        if(x == 0) {
          $('#tab-container').append("<div class='tab-pane fade show active' id='tab-container-" + x +
          "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
        } else {
          $('#tab-container').append("<div class='tab-pane fade' id='tab-container-" + x +
          "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
        }

        $('#tab-container-' + x).append("<table class='table table-striped'><thead><tr>" +
            "<th scope='col'>Name:</th>" +
            "<th scope='col'>1</th>" +
            "<th scope='col'>2</th>" +
            "<th scope='col'>3</th>" +
            "<th scope='col'>4</th>" +
            "<th scope='col'>5</th>" +
          "</tr></thead><tbody id='subjects-body-" + x + "''></tbody></table>");

        $.each(y.students, function(i, student) {
          $('#subjects-body-' + x).append("<tr>" +
              "<td>" + student + "</td>" +
              "<td><input class='form-check-input' type='radio' name=" + student + "' id='option1_"
              + student + "' value='option1_" + student + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 1);'></td>" +
              "<td><input class='form-check-input' type='radio' name=" + student + "' id='option2_"
              + student + "' value='option2_" + student + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 2);'></td>" +
              "<td><input class='form-check-input' type='radio' name=" + student + "' id='option3_"
              + student + "' value='option3_" + student + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 3);'></td>" +
              "<td><input class='form-check-input' type='radio' name=" + student + "' id='option4_"
              + student + "' value='option4_" + student + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 4);'></td>" +
              "<td><input class='form-check-input' type='radio' name=" + student + "' id='option5_"
              + student + "' value='option5_" + student + "' onClick='handleClick(\""+student+"\", \""+y.code+"\", 5);'></td>" +
            "</tr>");
        });
      });

    });

    event.preventDefault();

  });

});
