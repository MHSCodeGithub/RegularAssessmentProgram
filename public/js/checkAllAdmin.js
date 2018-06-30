// Delete student from class
function deleteStudent(studentID) {
  var posting = $.post( "/deleteStudentFromPeriod", { student: studentID });
  posting.done(function(success) {
    if(success == 'true') {
      console.log("Deleted: " + studentID);
      $('#' + studentID).find('td').fadeOut(1000,
        function() {
            $('#' + studentID).remove();
        });
    } else {
      console.log("Could not delete student");
    }
  });
}
