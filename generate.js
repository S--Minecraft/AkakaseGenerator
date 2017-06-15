"use strict";

(function(){
var get = function(obj, cb){
  if(!obj) {
    throw "get(): obj is undefined or null";
  }
  var BASEURL = "https://ja.wikipedia.org/w/api.php";
  var xhr = new XMLHttpRequest();

  var param = "?origin=*&";
  for(var k in obj) {
    param += k+"="+obj[k]+"&";
  }
  param = param.slice(0, -1);

  xhr.onload = function(){
    cb(JSON.parse(xhr.responseText));
  };
  xhr.open("GET", BASEURL+param);
  xhr.send();
};

var getWiki = function(cb){
  get({
    format: "json",
    action: "query",
    prop: "extracts",
    generator: "random",
    redirects: "1",
    exintro: "1",
    exsectionformat: "raw",
    grnnamespace: "0",
    grnlimit: "1"
  }, function(json){
    for(var key in json.query.pages) {
      var html = json.query.pages[key].extract;
      break;
    }
    cb(html);
  });
};

var getP = function(html){
  var $div = document.createElement("div");
  $div.innerHTML = html;
  var $ps = $div.querySelectorAll("p");
  var text = "";
  for (var i = 0; i < $ps.length; i++) {
    text += $ps[i].textContent;
  }
  return text;
};

var prefix = "☝(´･_･`)";
var suffix = "わかったかはよ垢消せ";
var maxLen = 140 - prefix.length - suffix.length;
var textFormat = function(text){
  var text = text.replace(/\n/g, "");
  text = text.replace(/[(（][^)）]+?[)）]/g, "");
  if(text.length <= maxLen) {
    return prefix+text+suffix;
  }
  var lines = text.split("。");
  var newText = prefix;
  for(var i = 0; ; i++) {
    var line = lines[i];
    if(newText.length+line.length > maxLen) {
      break;
    }
    newText += line + "。";
  }
  return newText+suffix;
};

var addList = function(text) {
  var $template = document.querySelector("#template").cloneNode(true);
  $template.removeAttribute("id");
  $template.removeAttribute("hidden");
  var $text = $template.querySelector(".text")
  $text.value = text;
  var $parent = document.querySelector(".created")
  $parent.insertBefore($template, $parent.firstChild);
  $text.style.height = $text.scrollHeight + "px";
};

document.addEventListener("DOMContentLoaded", function(e){
  document.querySelector("#generate-button").addEventListener("click", function(e){
    getWiki(function(html){
      var text = getP(html);
      var textFormated = textFormat(text);
      addList(textFormated);
    });
  });
  document.addEventListener("click", function(e){
    if(e.target.classList.contains("copy")){
      var textarea = e.target.parentElement.parentElement.querySelector(".text");
      textarea.select();
      document.execCommand("copy");
      return;
    }
    if(e.target.classList.contains("tweet")){
      var BASEURL = "https://twitter.com/share?text=";
      var textarea = e.target.parentElement.parentElement.querySelector(".text");
      open(BASEURL+encodeURIComponent(textarea.value));
      return;
    }
  });
});
}());
