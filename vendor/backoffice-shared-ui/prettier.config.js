module.exports = {
  "endOfLine": "crlf",
  "htmlWhitespaceSensitivity": "ignore",
  "printWidth": 140,
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "indent": 2,
  "trailingComma": "none",
  "useTabs": false,
  "proseWrap": "preserve",
  "quoteProps": "as-needed",
  "arrowParens": "avoid",
  "overrides": [
    {
      "files": "*.scss",
      "options": {
        "singleQuote": true
      }
    },
    {
      "files": "*.html",
      "options": {
        "printWidth": 140
      }
    }
  ]
}
