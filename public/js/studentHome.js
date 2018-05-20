function generateScores() {

  var name = $('#studentName').html();

  $.getJSON("/student?name="+name, function(jsonData) {

    $.each(jsonData.rap, function(key,rapPeriod) {
      var rapID = rapPeriod.year + "_" + rapPeriod.term + "_" + rapPeriod.week;
      $('#accordion').append(
        "<div class='card'>" +
          "<div id='heading_" + rapID + "' class='card-header' role='tab'>" +
            "<div class='row'>" +
              "<div class='col-sm-8'>" +
                "<h5 class='mb-0'>" +
                  "<a href='#collapse_" + rapID + "' data-toggle='collapse' aria-expanded='true' aria-controls='collapse_" + rapID + "'>" +
                    "Week " + rapPeriod.week + ", Term " + rapPeriod.term + ", " + rapPeriod.year +
                  "</a>" +
                "</h5>" +
              "</div>" +
              "<div class='col-sm-4'>" +
                "<h5 class='text-right'>Score: " + rapPeriod.average + "</h5>" +
              "</div>" +
            "</div>" +
          "</div>" +
          "<div id='collapse_" + rapID + "' class='collapse show' role='tabpanel' aria-labbelledby='heading_" + rapID + "' data-parent='#accordion'>" +
            "<div class='card-body'>" +
              "<table class='table table-striped table-bordered'>" +
                "<thead>" +
                  "<tr>" +
                    "<th scope='col'>Subject</th>" +
                    "<th scope='col'>Class</th>" +
                    "<th scope='col'>Teacher</th>" +
                    "<th scope='col'>Score</th>" +
                  "</tr>" +
                "</thead>" +
                "<tbody id='" + rapID + "'>" +
                "</tbody>" +
              "</table>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
      $.each(rapPeriod.scores, function(key,subjectScore) {
        console.log(subjectScore);
        $('#' + rapID).append(
          "<tr>" +
            "<td>" + subjectScore.subject + "</td>" +
            "<td>" + subjectScore.code + "</td>" +
            "<td>" + subjectScore.teacher + "</td>" +
            "<td>" + subjectScore.value + "</td>" +
          "</tr>"
        );
      });
    });

    /*
    // Create tab list
    $('#classes').append("<div class='card' id='classes-card'></div>");
    $('#classes-card').append("<div class='card-header' id='classes-header'></div>");
    $('#classes-card').append("<div class='card-body' id='classes-body'></div>");
    $('#classes-header').append("<ul id='subject-tabs' class='nav nav-pills nav-fill' role='tablist'></ul>");

    // Loop through each subject and create a tab to click
    $.each(string, function(key,val) {

      // Dynamically creates the tabs for each subject
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

    // Class list to hold DOM elements
    var classLists = [];

    // Create table of students
    $.each(string, function(x,y) {

      // Dynamically creates the container for each tab
      if(x == 0) {
        $('#tab-container').append("<div class='tab-pane fade show active' id='tab-container-" + x +
        "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
      } else {
        $('#tab-container').append("<div class='tab-pane fade' id='tab-container-" + x +
        "' role='tabpanel' aria-labelledby='tab" + x + "_" + y.code + "'></div>");
      }

      // Dynamically creates the headings for each column
      $('#tab-container-' + x).append("<form><table class='table table-striped'><thead><tr>" +
          "<th scope='col'>Name:</th>" +
          "<th scope='col' class='scoreColumn'>" +
            "<a href='#' onClick='fillRadios(1, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 1'>1 </a>" +
            "<a href='#' onClick='fillRadios(2, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 2'>2 </a>" +
            "<a href='#' onClick='fillRadios(3, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 3'>3 </a>" +
            "<a href='#' onClick='fillRadios(4, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 4'>4 </a>" +
            "<a href='#' onClick='fillRadios(5, \""+y.code+"\");' data-toggle='tooltip' data-placement='bottom' title='Fill Down 5'>5 </a>" +
          "</th>" +
        "</tr></thead><tbody id='subjects-body-" + x + "'></tbody></table></form>");

      $.each(y.students, function(i, student) {

        // Checks radio buttons based on student's current score
        let checked1,checked2,checked3,checked4,checked5;
        if(student.score == 1) { checked1 = "checked" } else { checked1 = " " };
        if(student.score == 2) { checked2 = "checked" } else { checked2 = " " };
        if(student.score == 3) { checked3 = "checked" } else { checked3 = " " };
        if(student.score == 4) { checked4 = "checked" } else { checked4 = " " };
        if(student.score == 5) { checked5 = "checked" } else { checked5 = " " };

        // Dynamically creates the radio buttons
        $('#subjects-body-' + x).append(
          "<tr>" +
            "<td>" + student.name + "</td>" +
            "<td class='scoreColumn'>" +
              // Radio Button 1
              "<input class='form-check-input' " + checked1 + " type='radio' name='" + student.name + "' id='1" + "_" +
              i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 1);'>" +
              "<label for='1" + "_" + i + "_" + y.code + "' class='scoreRadio'>1</label>" +
              // Radio Button 2
              "<input class='form-check-input' " + checked2 + " type='radio' name='" + student.name + "' id='2" + "_" +
              i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 2);'>" +
              "<label for='2" + "_" + i + "_" + y.code + "' class='scoreRadio'>2</label>" +
              // Radio Button 3
              "<input class='form-check-input' " + checked3 + " type='radio' name='" + student.name + "' id='3" + "_" +
              i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 3);'>" +
              "<label for='3" + "_" + i + "_" + y.code + "' class='scoreRadio'>3</label>" +
              // Radio Button 4
              "<input class='form-check-input' " + checked4 + " type='radio' name='" + student.name + "' id='4" + "_" +
              i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 4);'>" +
              "<label for='4" + "_" + i + "_" + y.code + "' class='scoreRadio'>4</label>" +
              // Radio Button 5
              "<input class='form-check-input' " + checked5 + " type='radio' name='" + student.name + "' id='5" + "_" +
              i + "_" + y.code + "' value='" + y.code + "' onClick='handleClick(\""+student.name+"\", \""+y.code+"\", 5);'>" +
              "<label for='5" + "_" + i + "_" + y.code + "' class='scoreRadio'>5</label>" +
            "</td>" +
          "</tr>");

      });
    });

    $('[data-toggle="tooltip"]').tooltip();

    */

  });

}

$(document).ready(function() {
  generateScores();
});
