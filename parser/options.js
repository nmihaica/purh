
// default fastxml parser options
var he = require('he');

var options = {
  attributeNamePrefix : "@_",
  attrNodeName: "attr", // default is 'false'
  textNodeName : "#text",
  ignoreAttributes : true,
  ignoreNameSpace : false,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: "__cdata", // default is 'false'
  cdataPositionChar: "\\c",
  localeRange: "", // to support non english character in tag/attribute values.
  parseTrueNumberOnly: false,
  attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
  tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
  stopNodes: ["parse-me-as-string"]
};

module.exports = options