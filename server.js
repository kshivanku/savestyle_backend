var fs = require('fs');
var cssFolder = './saved_files/css';
var scrape = require('website-scraper');
var express = require('express');
var rimraf = require('rimraf');
var css_file = [];
var color_exp = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
var font_exp = /font-family:.*?[;}]/g;

var app = express();
var server = app.listen(process.env.PORT || 8000, function(){
// var server = app.listen(8000, function(){
  console.log("listening on port 8000");
});
app.use(express.static("public"));

//CORS IS NEEDED AS WE NEED TO ALLOW HTTP REQUESTS FROM DIFFERENT PAGES
var cors = require('cors');
app.use(cors());

//HAVE TO USE BODY PARSER TO MAKE A POST REQUEST
var bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extented: true}));

//GETTING THE URL FROM FRONTEND
app.post("/scrapecolor", readyDir);

function readyDir(request, response){  //HAVE TO CLEAN THE FOLDER TO SAVE INCOMING FILES
  rimraf('saved_files', function(){
     scrapeColor(request, response);
  });
}
function scrapeColor(request, response){
  scrape({
    urls: [request.body.url],
    directory: 'saved_files',
    sources: [
      {selector: 'link[rel="stylesheet"]', attr: 'href'}
    ]
  }, function(error, result){
    if(error){
      console.log(error);
    }
    else{
      css_file = [];
      //READ FILE NAMES OF CSS FILES THAT ARE SAVED
      fs.readdir(cssFolder, (err, files) => {
        files.forEach(file => {
          css_file.push(file);
        });
        var reply = readColorsFonts();
        response.send(reply);
      });
    }
  })
}

function readColorsFonts(){
  var reply = {};
  reply.colors = readColors();
  reply.fonts = readFonts();
  return reply;
}

function readColors(){
  var colors_ar = [];
  var colors_data;
  var css_filedata = [];
  for(i = 0 ; i < css_file.length ; i++){
    css_filedata[i] = fs.readFileSync("saved_files/css/" + css_file[i], "utf8");
    colors_data = css_filedata[i].match(color_exp);
    if(colors_data){
      colors_ar = cleanColors(colors_ar, colors_data);
    }
  }
  return colors_ar.sort();
}

function cleanColors(colors_ar, colors_data){
  for(j = 0; j < colors_data.length ; j++){
    if(colors_ar.indexOf(colors_data[j]) == -1){
      colors_ar.push(colors_data[j]);
    }
  }
  return colors_ar;
}

function readFonts(){
  var fonts_ar = [];
  var fonts_data;
  var css_filedata = [];
  for(k = 0 ; k < css_file.length ; k++){
    css_filedata[k] = fs.readFileSync("saved_files/css/" + css_file[k], "utf8");
    fonts_data = css_filedata[k].match(font_exp);
    if(fonts_data){
      fonts_ar = cleanFonts(fonts_ar, fonts_data);
    }
  }
  return fonts_ar.sort();
}

function cleanFonts(fonts_ar, fonts_data){
  var font_line;
  var font_words =[];
  var font_words_exp = /[A-Za-z0-9\-\_\s]+/g;
  for(l = 0 ; l < fonts_data.length ; l++){
    font_line = fonts_data[l].split(":").pop(); //gives the part of sentence after font-family:
    font_words = font_line.match(font_words_exp);
    if(font_words){
      for(m = 0 ; m < font_words.length ; m++){
        font_words[m] = font_words[m].replace(/\s/g, '');
        // font_words[m] = font_words[m].toLowerCase();
        if(fonts_ar.indexOf(font_words[m]) == -1 && validFont(font_words[m])){
          fonts_ar.push(font_words[m]);
        }
      }
    }
  }
  return fonts_ar;
}

function validFont(font_str){
  switch (font_str){
    case '':
      return false;
      break;
    case 'inherit':
      return false;
      break;
    case 'sans-serif':
      return false;
      break;
    case 'serif':
      return false;
      break;
    case 'important':
      return false;
      break;
    default:
      return true;
  }
}
