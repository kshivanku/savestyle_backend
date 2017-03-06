var url;
function initialize() {
    $("input").keypress(function(event) {
        if (event.which == 13) {
          event.preventDefault();
          url = $('input').val();
          //CANNOT SENT A URL IN A SIMPLE GET REQUEST SOMEHOW
          if(url){
            $("#font_list").empty();
            $("#color_blocks").empty();
            $("#font_heading").html("");
            $("#color_heading").html("");
            $("#loading").css('display', 'block');
            var query = {
                'url': url
            }
            $.ajax({
              type: 'POST',
              dataType: "json",
              url: '/scrapecolor',
              data: query,
              success: function(data){
                  gotData(data);
              }
            });
          }
        }
    });
}

function gotData(data) {
  $("#loading").css("display", "none");
  $("#font_heading").html("Total Fonts: " + data.fonts.length);
  $("#color_heading").html("Total Colors: " + data.colors.length);
  for(j = 0 ; j< data.fonts.length ; j++){
    $("#font_list").append('<p id = font'+j+'></p>');
    $("#font"+j).html(data.fonts[j]);
  }
  for(i = 0; i < data.colors.length; i++){
    $("#color_blocks").append('<div class="color_block" id=color'+i+'></div>');
    $("#color"+i).css('background-color', data.colors[i]);
    $("#color"+i).html(data.colors[i]);
  }
}
