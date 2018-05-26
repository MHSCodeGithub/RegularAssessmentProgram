$(document).ready(function() {
  $('#exportRAP').click(function(event) {
    event.preventDefault();
    $.get("/exportRAP", function(data) {
      var blob = new Blob([data], {type: 'application/json'});
      var filename =  'RapData.json';
      if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }
    });
  });
});
