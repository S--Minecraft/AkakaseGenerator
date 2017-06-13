var get = function(obj, cb){
  if(!obj) {
    throw "get(): obj is undefined or null";
  }
  var BASEURL = "https://ja.wikipedia.org/w/api.php";
  var xhr = new XMLHttpRequest();

  param = "?origin=*&";
  for(var k in obj) {
    param += k+"="+obj[k]+"&";
  }
  param = param.slice(0, -1);

  xhr.onload = function(){
    cb(JSON.parse(xhr.responseText));
  };
  xhr.open("GET", BASEURL+param);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  xhr.send();
};

var getText = function(cb){
  get({
    format: "json",
    action: "query",
    list: "random",
    rnnamespace: "0",
    rnlimit: "1"
  }, function(json){
    get({
      format: "json",
      action: "query",
      prop: "extracts",
      exintro: "",
      explaintext: "",
      titles: encodeURIComponent(json.query.random[0].title)
    }, function(json){
      for(var key in json.query.pages) {
        var text = json.query.pages[key].extract;
        break;
      }
      cb(text);
    });
  });
};

var textFormat = function(text){
  var prefix = "☝(´･_･`)";
  var suffix = "わかったかはよ垢消せ";
  var maxLen = 140 - prefix.length - suffix.length;
  if(text.length <= maxLen) {
    return text;
  }
  var lines = text.split("。");
  var newText = prefix;
  for(var i = 0; ; i++) {
    var line = lines[i];
    if(newText.length+line.length > 140) {
      break;
    }
    newText += line + "。";
  }
  return newText+suffix;
};

var addList = function(text) {
  $template = document.querySelector("#template").cloneNode(true);
  $template.removeAttribute("id");
  $template.removeAttribute("hidden");
  $template.querySelector(".text").value = textFormat(text);
  document.querySelector(".created").appendChild($template);
};

document.addEventListener("DOMContentLoaded", function(e){
  document.querySelector("#generate-button").addEventListener("click", function(e){
    getText(function(text){
      addList(text);
    });
  });
  document.addEventListener("click", function(e){
    if(!e.target.classList.contains("copy")){
      return;
    }
    var textarea = e.target.parentElement.querySelector(".text");
    textarea.select();
    document.execCommand("copy");
  });
});

