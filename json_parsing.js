
let fs = require('fs')
let allParserInput = fs.readFileSync('allParserFile.json').toString()

let allParser = input => {
  let parseAll = [nullParse, booleanParse, numberParse, stringParser, arrayParse, objectParser]
  for (let key of parseAll) {
    let resArr = key(input)
    if (resArr !== null) return resArr
  }
  return null
}

const nullParse = input => (input.startsWith('null')) ? [null, input.slice(4)] : null

const booleanParse = input => {
  if (input.startsWith('true')) return [true, input.slice(4)]
  if (input.startsWith('false')) return [false, input.slice(5)]
  return null
}

const numberParse = input => {
  let zeroInfinity = /^[-]?0(\.[0-9]+([eE][+-]?[0-9]+)?)/
  let zeroNaN = /^[-]?0[0-9]+/
  let zero = /^[-]?0/
  let zeroNum = /^[-]?0([eE][+-]?[0-9]+)/
  let decimalInfinity = /^[-]?[1-9][0-9]*(\.?[0-9]*([eE][+-]?[0-9]+)?)?/
  if (zeroInfinity.test(input)) {
    let num = input.match(zeroInfinity)
    let index = num[0].length
    return [num[0] * 1, input.slice(index)]
  }
  if (zeroNum.test(input)) {
    let num = input.match(zeroNum)
    let index = num[0].length
    return [num[0] * 1, input.slice(index)]
  }
  if (zeroNaN.test(input)) return null

  if (zero.test(input)) {
    let num = input.match(zero)
    let index = num[0].length
    return [num[0] * 1, input.slice(index)]
  }
  if (decimalInfinity.test(input)) {
    let num = input.match(decimalInfinity)
    let index = num[0].length
    return [num[0] * 1, input.slice(index)]
  } else return null
}

const stringParser = input => {
  let validArr = []
  const char = { '"': '"', 'b': '\b', 'f': '\f', 'n': '\n', 'r': '\r', 't': '\t', '/': '/', '\\': '\\' }
  let hexVal = '0123456789ABCDEFabcdef'.split('')
  if (input.startsWith('"')) {
    input = input.slice(1)
    while (input[0] !== '"' && input.length !== 0) {
      if ((input[0] === '\n') || (input[0] === '\t') || (input[0] === '\r') || (input[0] === '\b') || (input[0] === '\f')) return null
      if (input[0] === '\\') {
        if (char.hasOwnProperty(input[1])) {
          validArr.push(char[input[1]])
          input = input.slice(2)
          if (input.indexOf('"') !== -1) continue
        } else if (input[1] === 'u') {
          let unicode = input.slice(2)
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
            input = input.slice(6)
            continue
          }
        } else return null
      }
      validArr.push(input[0])
      input = input.slice(1)
    }
    validArr = validArr.join('')
    return [validArr, input.slice(1)]
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
console.log(allParser(allParserInput))
