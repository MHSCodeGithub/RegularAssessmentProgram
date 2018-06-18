$(document).ready(function() {
  $("#submit-button").click(() => {
    $('#submit-button').hide();
    $('#login-form').append("<div id='loading-spinner-login'></div>");
    $('#loading-spinner-login').jmspinner('large');
  })
});
