// get details of each teacher
$.getJSON("/getTeachers", function(teacher) {

  $('#display').append(
    "<table class='table table-striped'>" +
      "<thead>" +
        "<tr>" +
          "<th scope='col'>Name:</th>" +
          "<th scope='col'>DoE Username:</th>" +
          "<th scope='col'>Access:</th>" +
          "<th scope='col' style='width: 120px;'></th>" +
        "</tr>" +
      "</thead>" +
      "<tbody id='teacher-table'></tbody>" +
    "</table>"
  );

  $.each(teacher, function(key,val) {

    let access1,access2,access3;
    if(val.access == 0) { access1 = " selected " } else { access1 = " " };
    if(val.access == 1) { access2 = " selected " } else { access2 = " " };
    if(val.access == 2) { access3 = " selected " } else { access3 = " " };

    $('#teacher-table').append(
      "<tr>" +
        "<td><a href='#'>" + val.name + "</a></td>" +
        "<td>" +
          "<input class='form-control' value='" + val.username + "'>" +
        "</td>" +
        "<td>" +
          "<select class='form-control'>" +
            "<option value='0'" + access1 + ">Teacher</option>" +
            "<option value='1'" + access2 + ">Executive</option>" +
            "<option value='3'" + access3 + ">Administrator</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<button class='btn btn-primary'>Save</button>" +
          "<button class='btn btn-danger' style='margin-left: 5px;'>X</button>" +
        "</td>" +
      "</tr>"
    );
  });
});

function updateTeacher(teacherName) {

}

$(document).ready(function() {



});
