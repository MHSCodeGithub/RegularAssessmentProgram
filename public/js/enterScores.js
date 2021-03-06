function labelClick() {
  event.preventDefault();
}

// Click handler for radio buttons
function handleClick(student, classCode, score, teacher, obj) {

  var id = $(event.target).prev().attr('id');
  var posting = $.post( "/save", { student: unescape(student), classCode: classCode, score: score, teacher: teacher });

  posting.done(function(success) {
    if(success == "true") {
      $("#" + id).prop("checked", true);
    } else {
      $("#" + id).prop("checked", false);
    }
  });
}


// todo: delete student method

// Fill down score for particular class
function fillRadios(num, classCode, teacher) {

  // NEW FUNCTION: Describe Rubric

  if(num == 5)
  {
    $('#rubric-modal-title').text("Outstanding");
    $('#rubric-modal-col1').html(
      "<strong>Is a respectful student who always:</strong>" +
      "<ul>" +
        "<li>Wears school uniform to promote a positive image of the school</li>" +
        "<li>Follows staff instructions</li>" +
        "<li>Speaks politely and uses manners</li>" +
        "<li>Maintains a clean and safe environment</li>" +
        "<li>Listens to the speaker without interrupting</li>" +
        "<li>Puts their hand up to speak</li>" +
      "</ul>"
    );
    $('#rubric-modal-col2').html(
      "<strong>Is a responsible student who always:</strong>" +
      "<ul>" +
        "<li>Is in the right place at the right time</li>" +
        "<li>Has digital devices on silent and in their bag</li>" +
        "<li>Has a pass to be out of class when necessary</li>" +
        "<li>Tells the truth and is honest regarding the property of the school and others.</li>" +
        "<li>Uses equipment for its purpose</li>" +
      "</ul>"
    );
    $('#rubric-modal-col3').html(
      "<strong>Demonstrates learning by always:</strong>" +
      "<ul>" +
        "<li>Having necessary equipment ready to learn</li>" +
        "<li>Asking questions if unsure of task</li>" +
        "<li>Completing all tasks to the standard requested.</li>" +
        "<li>Letting others work</li>" +
        "<li>Submitting work on time</li>" +
      "</ul>"
    );
  }

  if(num == 4)
  {
    $('#rubric-modal-title').text("Excellent");
    $('#rubric-modal-col1').html(
      "<strong>Is a respectful student who consistently:</strong>" +
      "<ul>" +
        "<li>Wears school uniform to promote a positive image of the school</li>" +
        "<li>Follows staff instructions</li>" +
        "<li>Speaks politely and uses manners</li>" +
        "<li>Maintains a clean and safe environment</li>" +
        "<li>Listens to the speaker without interrupting</li>" +
        "<li>Puts their hand up to speak</li>" +
      "</ul>"
    );
    $('#rubric-modal-col2').html(
      "<strong>Is a responsible student who consistently:</strong>" +
      "<ul>" +
        "<li>Is in the right place at the right time</li>" +
        "<li>Has digital devices on silent and in their bag</li>" +
        "<li>Has a pass to be out of class when necessary</li>" +
        "<li>Tells the truth and is honest regarding the property of the school and others.</li>" +
        "<li>Uses equipment for its purpose</li>" +
      "</ul>"
    );
    $('#rubric-modal-col3').html(
      "<strong>Demonstrates learning by consistently:</strong>" +
      "<ul>" +
        "<li>Having necessary equipment ready to learn</li>" +
        "<li>Asking questions if unsure of task</li>" +
        "<li>Completing all tasks to the standard requested.</li>" +
        "<li>Letting others work</li>" +
        "<li>Submitting work on time</li>" +
      "</ul>"
    );
  }

  if(num == 3)
  {
    $('#rubric-modal-title').text("Good");
    $('#rubric-modal-col1').html(
      "<strong>Is a respectful student who satisfactorily:</strong>" +
      "<ul>" +
        "<li>Wears school uniform to promote a positive image of the school</li>" +
        "<li>Follows staff instructions</li>" +
        "<li>Speaks politely and uses manners</li>" +
        "<li>Maintains a clean and safe environment</li>" +
        "<li>Listens to the speaker without interrupting</li>" +
        "<li>Puts their hand up to speak</li>" +
      "</ul>"
    );
    $('#rubric-modal-col2').html(
      "<strong>Is a responsible student who satisfactorily:</strong>" +
      "<ul>" +
        "<li>Is in the right place at the right time</li>" +
        "<li>Has digital devices on silent and in their bag</li>" +
        "<li>Has a pass to be out of class when necessary</li>" +
        "<li>Tells the truth and is honest regarding the property of the school and others.</li>" +
        "<li>Uses equipment for its purpose</li>" +
      "</ul>"
    );
    $('#rubric-modal-col3').html(
      "<strong>Demonstrates learning by satisfactorily:</strong>" +
      "<ul>" +
        "<li>Having necessary equipment ready to learn</li>" +
        "<li>Asking questions if unsure of task</li>" +
        "<li>Completing all tasks to the standard requested.</li>" +
        "<li>Letting others work</li>" +
        "<li>Submitting work on time</li>" +
      "</ul>"
    );
  }

  if(num == 2)
  {
    $('#rubric-modal-title').text("Of Concern");
    $('#rubric-modal-col1').html(
      "<strong>Is a student who at times:</strong>" +
      "<ul>" +
        "<li>Demonstrates disruptive behaviours such as talking, not listening, calling out and interfering with the rights of other students to learn</li>" +
        "<li>Interrupts the teacher</li>" +
        "<li>Needs rule reminders</li>" +
        "<li>Wears school uniform incorrectly or disregards the dress code</li>" +
        "<li>Fails to maintain a clean and safe environment</li>" +
      "</ul>"
    );
    $('#rubric-modal-col2').html(
      "<strong>Is a student who at times:</strong>" +
      "<ul>" +
        "<li>Late for class or truants class</li>" +
        "<li>Is reminded to put their phone away.</li>" +
        "<li>Leaves the classroom without permission and no pass</li>" +
        "<li>Dishonest regarding the property of the school and others</li>" +
        "<li>Uses equipment inappropriately</li>" +
      "</ul>"
    );
    $('#rubric-modal-col3').html(
      "<strong>Is a student who at times:</strong>" +
      "<ul>" +
        "<li>Arriving with no equipment ready for the lesson</li>" +
        "<li>Does not ask questions if unsure of tasks or asks inappropriate questions</li>" +
        "<li>Does not complete tasks to the standard requested</li>" +
        "<li>Does not submit assessment tasks on time</li>" +
        "<li>Interrupts the learning of others</li>" +
      "</ul>"
    );
  }

  if(num == 1)
  {
    $('#rubric-modal-title').text("Unsatisfactory Performance");
    $('#rubric-modal-col1').html(
      "<strong>Is a student who often:</strong>" +
      "<ul>" +
        "<li>Demonstrates disruptive behaviours such as talking, not listening, calling out and interfering with the rights of other students to learn</li>" +
        "<li>Interrupts the teacher</li>" +
        "<li>Needs rule reminders</li>" +
        "<li>Wears school uniform incorrectly or disregards the dress code</li>" +
        "<li>Fails to maintain a clean and safe environment</li>" +
        "<li>Is referred to the Head Teacher</li>" +
      "</ul>"
    );
    $('#rubric-modal-col2').html(
      "<strong>Is a student who often:</strong>" +
      "<ul>" +
        "<li>Late for class or truants class</li>" +
        "<li>Is reminded to put their phone away.</li>" +
        "<li>Leaves the classroom without permission and no pass</li>" +
        "<li>Dishonest regarding the property of the school and others</li>" +
        "<li>Uses equipment inappropriately</li>" +
      "</ul>"
    );
    $('#rubric-modal-col3').html(
      "<strong>Is a student who often:</strong>" +
      "<ul>" +
        "<li>Arriving with no equipment ready for the lesson</li>" +
        "<li>Does not ask questions if unsure of tasks or asks inappropriate questions</li>" +
        "<li>Does not complete tasks to the standard requested</li>" +
        "<li>Does not submit assessment tasks on time</li>" +
        "<li>Interrupts the learning of others</li>" +
      "</ul>"
    );
  }

  $('#rubric-modal').modal();

  /* REMOVED DUE TO ABUSE
  let matches = document.querySelectorAll(".form-check-input");
  $.each(matches, function(i, stu) {
    if(stu.value == classCode && stu.id.slice(0,1) == num) {
      if (typeof document.getElementById(stu.id) != 'undefined') {
        document.getElementById(stu.id).checked = true;
      }
    }
  });
  $.post( "/fillRadios", { classCode: classCode, score: num, teacher: teacher });
  */
}

// Generate the HTML for student scores for each class
function generateScores(name) {

  $('#classes').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');

  $.getJSON("/teacher?name="+name, function(string) {

    // destroy any class lists that are already there
    $('#classes').empty();

    // Create tab list
    $('#classes').append("<div class='card' id='classes-card'></div>");
    $('#classes-card').append("<div class='card-header' id='classes-header'></div>");
    $('#classes-card').append("<div class='card-body' id='classes-body'></div>");
    $('#classes-header').append("<ul id='subject-tabs' class='nav nav-pills nav-fill' role='tablist'></ul>");

    // Loop through each subject and create a tab to click
    $.each(string, function(key,val) {

      // Dynamically creates the tabs for each subject
      if(key == 0) {
        $('#subject-tabs').append(
          "<li class='nav-item' data-toggle='tooltip' data-placement='bottom' title='" + val.subject + "' onclick='refreshTooltips();'>" +
              "<a class='nav-link active' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
              key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>" +
            "</li>"
          );
      } else {
        $('#subject-tabs').append(
          "<li class='nav-item' data-toggle='tooltip' data-placement='bottom' title='" + val.subject + "' onclick='refreshTooltips();'>" +
            "<a class='nav-link' id='tab" + key + "' data-toggle='pill' href='#tab-container-" +
            key + "' role='tab' aria-controls='tab-container-" +  key + "' aria-selected='true'>" + val.code + "</a>" +
          "</li>"
        );
      }
    });

    $('#subject-tabs').append(
      "<li class='nav-item ml-auto' style='flex: 0 0 60px;' " +
        "data-toggle='tooltip' data-placement='bottom' title='Add a Missing Class'>" +
        "<a class='nav-link' id='tab-add' data-toggle='pill' href='#tab-container-add' role='tab' " +
          "aria-controls='tab-container-add' aria-selected='true'>" +
           "<i class='fa fa-plus' aria-hidden='true'></i>" +
          "</a>" +
      "</li>"
    );

    // Create tab content container
    $('#classes-body').append("<div class='tab-content' id='tab-container'></div>");

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

      // Search box and button to add students missing from class
      $('#tab-container-' + x).append(
        "<div class='row' id='add-student'>" +
          "<div class='col-lg-8 col-md-6 col-sm-12 col-xs-12'>" +
            "<input type='text' class='form-control studentNames form-control-lg' id='" + y.code + "' placeholder='Missing Student Name' " +
            "data-toggle='tooltip' data-placement='bottom' title='If a student is missing from " + y.code + " add them here'>" +
          "</div>" +
          "<div class='col-lg-2 col-md-3 col-sm-6 col-xs-6'>" +
            "<button class='btn btn-primary btn-lg' style='width: 100%;' " +
              "onclick='addStudent(\"" + y.code + "\", \"" + name + "\", \"" + y.subject +
              "\", " + x + ")'>Add Student</button>" +
          "</div>" +
          "<div class='col-lg-2 col-md-3 col-sm-6 col-xs-6'>" +
            "<button class='btn btn-danger btn-lg' style='width: 100%;' " +
              "onclick='removeClass(\"" + y.code + "\")'>Remove Class</button>" +
          "</div>" +
        "</div>"
      );

      // Dynamically creates the headings for each column
      $('#tab-container-' + x).append(
        "<div class='row'>" +
          "<div class='col-sm-12'>" +
            "<table class='table table-striped'>" +
              "<thead>" +
                "<tr>" +
                  "<th scope='col' style='width: 20px;'></th>" +
                  "<th scope='col'>Name:</th>" +
                  "<th scope='col' class='scoreColumn'>" +
                    "<a href='#' onClick='fillRadios(1, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Click for Description'>1 </a>" +
                    "<a href='#' onClick='fillRadios(2, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Click for Description'>2 </a>" +
                    "<a href='#' onClick='fillRadios(3, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Click for Description'>3 </a>" +
                    "<a href='#' onClick='fillRadios(4, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Click for Description'>4 </a>" +
                    "<a href='#' onClick='fillRadios(5, \""+y.code+"\", \"" + name + "\");' data-toggle='tooltip' data-placement='bottom' title='Click for Description'>5 </a>" +
                  "</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody id='subjects-body-" + x + "'></tbody>" +
            "</table>" +
          "</div>" +
        "</div>"
      );

      $.each(y.students, function(i, student) {

        student.name = escape(student.name);
        var convertedName = student.name.replace(/\s+/g, '-').toLowerCase();

        // Checks radio buttons based on student's current score
        var checked1 = "";
        var checked2 = "";
        var checked3 = "";
        var checked4 = "";
        var checked5 = "";
        if(student.score == 1) { checked1 = "checked" };
        if(student.score == 2) { checked2 = "checked" };
        if(student.score == 3) { checked3 = "checked" };
        if(student.score == 4) { checked4 = "checked" };
        if(student.score == 5) { checked5 = "checked" };

        // Dynamically creates the radio buttons
        $('#subjects-body-' + x).append(
          "<tr id='" + y.code + "_" + student.id + "'>" +
            "<td class='student-delete'>" +
              "<button class='btn btn-danger btn-delete' id=\"" + convertedName + "-delete\"" +
              "data-toggle='tooltip' data-placement='bottom' title='Remove Student' " +
              "onclick='deleteStudent(\"" + student.name + "\", \"" + y.code + "\", \"" + student.id + "\", \"" + name + "\")'>X</button>" +
            "</td>" +
            "<td class='student-label'>" +
              "<a href='../check/single?name=" + unescape(student.name) + "' " +
              "data-toggle='tooltip' data-placement='right' title='<img src=\"/img/students/" + student.id + ".jpg\"/>'>" + unescape(student.name) + "</a>" +
            "</td>" +
            "<td class='scoreColumn'>" +

              // Radio Button 1
              "<input class='form-check-input' " + checked1 + " type='radio' name='" + y.code + "_" + student.name + "' " +
              "id='1" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='1" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();'" +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 1, \"" + name + "\", this);' " +
              "data-toggle='tooltip' data-placement='bottom' title='Unsatisfactory Performance'>1</label>" +

              // Radio Button 2
              "<input class='form-check-input' " + checked2 + " type='radio' name='" + y.code + "_" + student.name + "' " +
              "id='2" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='2" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 2, \"" + name + "\");' " +
              "data-toggle='tooltip' data-placement='bottom' title='Of Concern'>2</label>" +

              // Radio Button 3
              "<input class='form-check-input' " + checked3 + " type='radio' name='" + y.code + "_" + student.name + "' " +
              "id='3" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='3" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 3, \"" + name + "\");' " +
              "data-toggle='tooltip' data-placement='bottom' title='Good'>3</label>" +

              // Radio Button 4
              "<input class='form-check-input' " + checked4 + " type='radio' name='" + y.code + "_" + student.name + "' " +
              "id='4" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='4" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 4, \"" + name + "\");' " +
              "data-toggle='tooltip' data-placement='bottom' title='Excellent'>4</label>" +

              // Radio Button 5
              "<input class='form-check-input' " + checked5 + " type='radio' name='" + y.code + "_" + student.name + "' " +
              "id='5" + "_" + i + "_" + y.code + "' value='" + y.code + "'>" +
              "<label for='5" + "_" + i + "_" + y.code + "' class='scoreRadio' onclick='labelClick();' " +
              "onmouseup='handleClick(\""+student.name+"\", \""+y.code+"\", 5, \"" + name + "\");'" +
              "data-toggle='tooltip' data-placement='bottom' title='Outstanding'>5</label>" +

            "</td>" +
          "</tr>"
        );

      });
    });

    $('#tab-container').append(
      "<div class='tab-pane fade' id='tab-container-add' role='tabpanel' aria-labelledby='tab-add'>" +
        "<div class='row' id='add-class'>" +
          "<div class='col-lg-9 col-md-8 col-sm-6 col-xs-12'>" +
            "<input id='classInput' type='text' class='form-control classCodes form-control-lg' placeholder='Missing Class Code' " +
            "data-toggle='tooltip' data-placement='bottom' title='Search for the missing class'>" +
          "</div>" +
          "<div class='col-lg-3 col-md-4 col-sm-6 col-xs-12'>" +
            "<button class='btn btn-primary btn-lg' style='width: 100%;' " +
              "onClick='addClass();'>Add Missing Class</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );

    // Activate tooltips
    refreshTooltips();

    // Fill all student name inputs with autocomplete data
    $.getJSON("/autocompleteStudents", function(students) {
      $(".studentNames").autocomplete({
        source:[students]
      });
    });

    // Fill the 'Add Class' input with class codes
    $.getJSON("/autocompleteClasses", function(classes) {
      $(".classCodes").autocomplete({
        source:[classes]
      });
    });

    $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
      $("img").bind("error",function(){
        $(this).attr("src","/img/students/default.jpg");
      });
    });

  });

}

// Remove and re-add tooltips
function refreshTooltips() {
  $('[data-toggle="tooltip"]').tooltip('dispose');
  $('[data-toggle="tooltip"]').tooltip({
    animated: 'fade',
    html: true,
    offset: '50, 10'
  });
  $('[data-toggle="tooltip"]').on('shown.bs.tooltip', function () {
    $("img").bind("error",function(){
      $(this).attr("src","/img/students/default.jpg");
    });
  });
}

// Add class
function addClass() {
  var classCode = $('#classInput').val();
  var name;
  if ($('#teacher-form').length) {
    name = $('#teacherName').val();
  } else {
    name = $('#teacherName').html();
  }
  var posting = $.post( "/addClass", { classCode: classCode, teacher: name });

  posting.done(function(success) {
    generateScores(name);
  });
}

// Remove class
function removeClass(classCode) {
  if (confirm('Are you sure you want to remove ' + classCode)) {
    var name;
    if ($('#teacher-form').length) {
      name = $('#teacherName').val();
    } else {
      name = $('#teacherName').html();
    }
    var posting = $.post( "/removeClass", { classCode: classCode, teacher: name });
    posting.done(function(success) {
      generateScores(name);
    });
  }
}

// Add a missing student
function addStudent(classCode, teacher, subject, x) {
  var student = escape($('#' + classCode).val());
  var convertedName = student.replace(/\s+/g, '-').toLowerCase();
  var posting = $.post( "/addStudent", { student: unescape(student), classCode: classCode, subject: subject, teacher: teacher });
  posting.done(function(success) {
    if(success != 'false') {
      student = JSON.parse(success);
      student.name = escape(student.name);
      $("<tr id='" + classCode + "_" + student.id + "'>" +
          "<td class='student-delete'>" +
            "<button class='btn btn-danger btn-delete' id=\"" + convertedName + "-delete\"" +
            "data-toggle='tooltip' data-placement='bottom' title='Remove Student' " +
            "onclick='deleteStudent(\"" + student.name + "\" , \"" + classCode + "\", \"" + student.id + "\", \"" + teacher + "\")'>X</button>" +
          "</td>" +
          "<td class='student-label'>" +
            "<a href='check/single?name=" + unescape(student.name) + "' " +
            "data-toggle='tooltip' data-placement='right' title='<img src=\"/img/students/" + student.id + ".jpg\"/>'>" + unescape(student.name) + "</a>" +
          "</td>" +
          "<td class='scoreColumn'>" +

            // Radio Button 1
            "<input class='form-check-input' type='radio' name='" + classCode + "_" + student.name + "' id='1" + "_" +
            student.id + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='1" + "_" + student.id + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student.name+"\", \""+classCode+"\", 1, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Unsatisfactory Performance'>1</label>" +

            // Radio Button 2
            "<input class='form-check-input' type='radio' name='" + classCode + "_" + student.name + "' id='2" + "_" +
            student.id + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='2" + "_" + student.id + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student.name+"\", \""+classCode+"\", 2, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Of Concern'>2</label>" +

            // Radio Button 3
            "<input class='form-check-input' type='radio' name='" + classCode + "_" + student.name + "' id='3" + "_" +
            student.id + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='3" + "_" + student.id + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student.name+"\", \""+classCode+"\", 3, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Good'>3</label>" +

            // Radio Button 4
            "<input class='form-check-input' type='radio' name='" + classCode + "_" + student.name + "' id='4" + "_" +
            student.id + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='4" + "_" + student.id + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student.name+"\", \""+classCode+"\", 4, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Excellent'>4</label>" +

            // Radio Button 5
            "<input class='form-check-input' type='radio' name='" + classCode + "_" + student.name + "' id='5" + "_" +
            student.id + "_" + classCode + "' value='" + classCode + "'>" +
            "<label for='5" + "_" + student.id + "_" + classCode + "' class='scoreRadio' onclick='labelClick();' " +
            "onmouseup='handleClick(\""+student.name+"\", \""+classCode+"\", 5, \"" + teacher + "\");' " +
            "data-toggle='tooltip' data-placement='bottom' title='Outstanding'>5</label>" +

          "</td>" +
        "</tr>"
      ).hide().prependTo('#subjects-body-' + x).fadeIn("slow");
      refreshTooltips();
    } else {
      alert("Student not enrolled, or student already in your class");
    }
  });
}

// Delete student from class
function deleteStudent(studentName, classCode, num, teacher) {
  var posting = $.post( "/deleteStudent", { student: unescape(studentName), classCode: classCode, teacherName: teacher });
  posting.done(function(success) {
    if(success == 'true') {
      console.log("Deleted: " + studentName);
      $('#' + classCode + "_" + num).find('td').fadeOut(1000,
        function() {
            $(this).parents('tr:first').remove();
        });
      refreshTooltips();
    } else {
      console.log("Could not delete student");
    }
  });
}

// Find out if the page was accessed with a GET parameter
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'), sParameterName, i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

// Functions to run on startup
function startup() {
  // If we are on the student search page
  if ($('#teacher-form').length) {
    // Autocomplete for Teacher text box
    $.getJSON("/autocomplete", function(teachers) {
      $("#teacherName").autocomplete({
        source:[teachers]
      });
      $('#teacherName').focus();
    });
    // AJAX request for Teacher's classes
    $("#teacher-form" ).submit(function( event ) {
      var name = $('#teacherName').val();
      generateScores(name);
      window.history.pushState("", "", '/check/teacher?name=' + name);
      event.preventDefault();
    });

    var name = getUrlParameter('name');

    if(name != null) {
      $('#teacherName').val(name);
      generateScores(name);
    }
  // Otherwise we are on the teacher's home page
  } else {
    // Grab name and generate scores
    var name = $('#teacherName').html();
    generateScores(name);
  }

  // MODAL WINDOW
  $('body').append(
    "<!-- Modal -->" +
    "<div class='modal fade' id='rubric-modal' tabindex='-1' role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>" +
      "<div class='modal-dialog modal-dialog-centered modal-lg' role='document'>" +
        "<div class='modal-content'>" +
          "<div class='modal-header'>" +
            "<h5 class='modal-title' id='rubric-modal-title'></h5>" +
            "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
              "<span aria-hidden='true'>&times;</span>" +
            "</button>" +
          "</div>" +
          "<div class='modal-body'>" +
            "<div class='row'>" +
              "<div class='col-sm-4' id='rubric-modal-col1'></div>" +
              "<div class='col-sm-4' id='rubric-modal-col2'></div>" +
              "<div class='col-sm-4' id='rubric-modal-col3'></div>" +
            "</div>" +
          "</div>" +
          "<div class='modal-footer'>" +
            "<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>"
  );



}

// Runs when document loaded
$(document).ready(function() {
  jQuery.ajaxSetup({ cache: false }); // Fix for IE11
  startup();
});

// Get rid of tooltips for mobile users
window.addEventListener('touchstart', function() {
  $('[data-toggle="tooltip"]').tooltip('dispose');
});
