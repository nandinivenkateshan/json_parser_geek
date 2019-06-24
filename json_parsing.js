
let fs = require('fs')
let allParserInput = fs.readFileSync('allParserFile.json').toString()

let allParser = allParserInput => {
  let parseAll = [nullParse, booleanParse, numberParse, stringParser, arrayParse, objectParser]
  for (let key of parseAll) {
    let resArr = key(allParserInput)
    if (resArr !== null) return resArr
  }
  return null
}

const nullParse = nullInput => (nullInput.startsWith('null')) ? [null, nullInput.slice(4)] : null

const booleanParse = booleanInput => {
  if (booleanInput.startsWith('true')) return [true, booleanInput.slice(4)]
  if (booleanInput.startsWith('false')) return [false, booleanInput.slice(5)]
  return null
}

const numberParse = numberInput => {
  let zeroInfinity = /^[-]?0(\.[0-9]+([eE][+-]?[0-9]+)?)/
  let zeroNaN = /^[-]?0[0-9]+/
  let zero = /^[-]?0/
  let zeroNum = /^[-]?0([eE][+-]?[0-9]+)/
  let decimalInfinity = /^[-]?[1-9][0-9]*(\.?[0-9]*([eE][+-]?[0-9]+)?)?/
  if (zeroInfinity.test(numberInput)) {
    let num = numberInput.match(zeroInfinity)
    let index = num[0].length
    return [num[0] * 1, numberInput.slice(index)]
  }
  if (zeroNum.test(numberInput)) {
    let num = numberInput.match(zeroNum)
    let index = num[0].length
    return [num[0] * 1, numberInput.slice(index)]
  }
  if (zeroNaN.test(numberInput)) return null

  if (zero.test(numberInput)) {
    let num = numberInput.match(zero)
    let index = num[0].length
    return [num[0] * 1, numberInput.slice(index)]
  }
  if (decimalInfinity.test(numberInput)) {
    let num = numberInput.match(decimalInfinity)
    let index = num[0].length
    return [num[0] * 1, numberInput.slice(index)]
  } else return null
}

const stringParser = strInput => {
  let validArr = []
  const char = { '"': '"', 'b': '\b', 'f': '\f', 'n': '\n', 'r': '\r', 't': '\t', '/': '/', '\\': '\\' }
  let hexVal = '0123456789ABCDEFabcdef'.split('')
  if (strInput.startsWith('"')) {
    strInput = strInput.slice(1)
    while (strInput[0] !== '"' && strInput.length !== 0) {
      if ((strInput[0] === '\n') || (strInput[0] === '\t') || (strInput[0] === '\r') || (strInput[0] === '\b') || (strInput[0] === '\f')) return null
      if (strInput[0] === '\\') {
        if (char.hasOwnProperty(strInput[1])) {
          validArr.push(char[strInput[1]])
          strInput = strInput.slice(2)
          if (strInput.indexOf('"') !== -1) continue
        } else if (strInput[1] === 'u') {
          let unicode = strInput.slice(2)
          let count = 0
          let i = 0
          if (unicode.length <= 4) return null
          else {
            let sliceHex = unicode.slice(0, 4)
            while (count < 4) {
              if (hexVal.includes(sliceHex[i])) {
                count++
                i++
              } else return null
            }
            if (count === 4) {
              let unicodeStr = unicode.slice(0, 4)
              let getUnicode = String.fromCodePoint(parseInt(unicodeStr, 16))
              validArr.push(getUnicode)
            }
            strInput = strInput.slice(6)
            continue
          }
        } else return null
      }
      validArr.push(strInput[0])
      strInput = strInput.slice(1)
    }
    validArr = validArr.join('')
    return [validArr, strInput.slice(1)]
  } else return null
}

const arrayParse = arrInput => {
  let validParsedArr = []
  let resultArr
  arrInput = arrInput.trim()
  if (arrInput.startsWith('[')) {
    arrInput = arrInput.slice(1)
    arrInput = arrInput.trim()
    while (arrInput[0] !== ']') {
      arrInput = arrInput.trim()
      resultArr = allParser(arrInput)
      if (resultArr === null) return null
      validParsedArr.push(resultArr[0])
      arrInput = resultArr[1].trim()
      if (arrInput[0] === ',') {
        resultArr = arrInput.slice(1)
        arrInput = resultArr.trim()
        if (arrInput.startsWith(']')) return null
      }
    }
    return [validParsedArr, arrInput.slice(1)]
  } else return null
}

const objectParser = obj => {
  obj = obj.trim()
  if (obj.startsWith('{')) {
    obj = obj.slice(1)
    obj = obj.trim()
    let objArr
    let key
    let value
    let newObj = {}
    while (obj[0] !== '}') {
      objArr = stringParser(obj)
      if (objArr === null) return null
      key = objArr[0]
      obj = objArr[1].trim()
      if (obj[0] === ':') {
        objArr = obj.slice(1)
        obj = objArr.trim()
      } else if (obj[0] !== ':') return null

      objArr = allParser(obj)
      if (objArr === null) return null
      value = objArr[0]
      newObj[key] = value
      obj = objArr[1]
      obj = obj.trim()
      if (obj[0] === ',') {
        objArr = obj.slice(1)
        obj = objArr.trim()
        if (obj.startsWith('}')) return null
      }
    }
    return [newObj, obj.slice(1)]
  } else return null
}
// console.log(allParser(allParserInput))
