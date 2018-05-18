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
    var convertedName = val.name.replace(/\s+/g, '-').toLowerCase();
    let access1,access2,access3;
    if(val.access == 0) { access1 = " selected " } else { access1 = " " };
    if(val.access == 1) { access2 = " selected " } else { access2 = " " };
    if(val.access == 2) { access3 = " selected " } else { access3 = " " };
    $('#teacher-table').append(
      "<tr>" +
        "<td><a href='#'>" + val.name + "</a></td>" +
        "<td>" +
          "<input id='" + convertedName + "' class='form-control' value='" + val.username + "'>" +
        "</td>" +
        "<td>" +
          "<select class='form-control' id='" + convertedName + "-access'>" +
            "<option value='0'" + access1 + ">Teacher</option>" +
            "<option value='1'" + access2 + ">Executive</option>" +
            "<option value='2'" + access3 + ">Administrator</option>" +
          "</select>" +
        "</td>" +
        "<td>" +
          "<button class='btn btn-primary' onclick='updateTeacher(\"" + val.name + "\", \"" + convertedName + "\")'>Save</button>" +
          "<button class='btn btn-danger' style='margin-left: 5px;' onclick='deleteTeacher(\"" + val.name + "\")'>X</button>" +
        "</td>" +
      "</tr>"
    );
  });
});

function updateTeacher(teacherName, convertedName) {
  var username = $("#" + convertedName).val();
  var access = $("#" + convertedName +"-access").val();
  //console.log(username);
  $.getJSON("/updateTeacher?name="+teacherName+"&username="+username+"&access="+access, function(string) {
    if(string.result) {
      console.log("Result: " + string.result);
    } else {
      // Fail
    }
  });
}

function deleteTeacher(teacherName) {
  console.log(teacherName);
}

$(document).ready(function() {



});
