/* const xmlSample = '<tag>tag content</tag><tag2>another content</tag2><tag3><insideTag>inside content</insideTag><emptyTag /></tag3>';
console.log(parseXmlToJson(xmlSample));

https://stackoverflow.com/questions/1773550/convert-xml-to-json-and-back-using-javascript */
/* function parseXmlToJson(xml){
    const json = {};
    for (const res of xml.matchAll(/(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm)) {
      const key = res[1] || res[3];
      const value = res[2] && parseXmlToJson(res[2]);
      json[key] = ((value && Object.keys(value).length) ? value : res[2]) || null;
    }
    return json;
}

module.exports = parseXmlToJson */

function xml2json(xml) {
  try {
    var obj = {};
    if (xml.children.length > 0) {
      for (var i = 0; i < xml.children.length; i++) {
        var item = xml.children.item(i);
        var nodeName = item.nodeName;

        if (typeof (obj[nodeName]) == "undefined") {
          obj[nodeName] = xml2json(item);
        } else {
          if (typeof (obj[nodeName].push) == "undefined") {
            var old = obj[nodeName];

            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xml2json(item));
        }
      }
    } else {
      obj = xml.textContent;
    }
    return obj;
  } catch (e) {
      console.log(e.message);
  }
}

module.exports = xml2json