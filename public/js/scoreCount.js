var yearChart;
var wholeChart;

function wholeSchoolChart() {
  console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/countScores", function(values) {
    console.log(values);
    var canvas = document.getElementById("chart");
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if(yearChart != null) {
      yearChart.destroy();
    }
    wholeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Ones", "Twos", "Threes", "Fours", "Fives"],
            datasets: [{
                label: 'Count',
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            },
            legend: {
              display: false
            }
        }
    });
    $('#loading').fadeOut(200).empty();
    $('#chart').fadeIn(400);
  });
}

function byYearChart() {
  console.log("Generating chart...");
  $('#chart').hide();
  $('#loading').show();
  $('#loading').append("<div id='loading-spinner'></div>");
  $('#loading-spinner').jmspinner('large');
  $.getJSON("/countScores?year=7", function(year7) {
    $.getJSON("/countScores?year=8", function(year8) {
      $.getJSON("/countScores?year=9", function(year9) {
        $.getJSON("/countScores?year=10", function(year10) {
          console.log(year7);
          console.log(year8);
          console.log(year9);
          console.log(year10);
          var canvas = document.getElementById("chart");
          var ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.beginPath();
          if(wholeChart != null) {
            wholeChart.destroy();
          }
          yearChart = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ["Ones", "Twos", "Threes", "Fours", "Fives"],
                datasets: [
                    {
                        label: "Year 7",
                        backgroundColor: "blue",
                        data: year7
                    },
                    {
                        label: "Year 8",
                        backgroundColor: "red",
                        data: year8
                    },
                    {
                        label: "Year 9",
                        backgroundColor: "green",
                        data: year9
                    },
                    {
                        label: "Year 10",
                        backgroundColor: "orange",
                        data: year10
                    }
                ]
              },
              options: {
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero:true
                          }
                      }]
                  },
                  legend: {
                    display: true
                  }
              }
          });
          $('#loading').fadeOut(200).empty();
          $('#chart').fadeIn(400);
        });
      });
    });
  });
}

$(document).ready(function() {

  $("#byWhole").click(function(event) {
    wholeSchoolChart();
  });

  $("#byYear").click(function(event) {
    byYearChart();
  });

});
