const parser = require('fast-xml-parser');
const he = require('he');
const ZKI = require('./zki');
const fs = require('fs')

let rawdata = fs.readFileSync('configuration.json');
let config = JSON.parse(rawdata);

var options = {
  attributeNamePrefix : "@_",
  attrNodeName: "attr", //default is 'false'
  textNodeName : "#text",
  ignoreAttributes : true,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  localeRange: "", //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
  tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
  stopNodes: ["parse-me-as-string"]
};

module.exports = {
  echo: function () { },
  provjera: function () { },
  pdo: function () { },
  racun: function () { }
}