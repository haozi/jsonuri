/**
 * JsonUri
 * @author Linkjun @linkjun.com
 * @description
 *   get(data, '/menu/id/');
 *   get(data, '/menu/id/../');
 *   get(data, '/menu/id/.../');
 *   get(data, '/menu/id/~/');
 *   set(data, '/menu/id/',[0,1,2,3,4]);
 *   mv(data, '/menu/id/0', '/menu/id/2');
 *   swap(data, '/menu/id/0', '/menu/id/1');
 *   rm(data, '/menu/value/');
 */

/**
 * require isObject,
 *         isArray,
 *         arrayMove
 */
import Jsonuri from './jsonuri'
import {isInteger, isObject, isArray, arrayMove, walk, combingPathKey, normalizePath, indexOf} from './util'

/**
 * Get
 * @param  {Object} data  typeof Object or Array.
 * @param  {String} path  ex: '/menu/nav/list'.
 * @param {[type]}        return value.
 */
function get(data, path) {
  return Jsonuri(data, path)
}

/**
 * Set
 * @param  {Object} data  typeof Object or Array.
 * @param  {String} path  ex: '/menu/nav/list'.
 * @param  {Any}    value ex: {}.
 * @param {[type]}        return data this.
 */
function set(data, path, value) {
  Jsonuri(data, path, value)
  return data
}

/**
 * Remove
 * @param  {Object} data  typeof Object or Array.
 * @param  {String} path  ex: '/menu/nav/list'.
 * @return {Any}          The deleted value.
 */
function rm(data, path) {
  let tmp = Jsonuri(data, path)
  set(data, path, null)
  return tmp
}

/**
 * Swap
 * @param  {Object} data    data type can be object or array.
 * @param  {String} pathA   ex: '/menu/nav/list/0'.
 * @param  {String} pathB   ex: '/menu/nav/list/2'.
 * @return {Object}         return data this.
 * @description  `pathA` the data swap `pathB`.
 */
function swap(data, pathA, pathB) {
  let _a = Jsonuri(data, pathA)
  let _b = Jsonuri(data, pathB)

  set(data, pathA, _b)
  set(data, pathB, _a)
  return data
}

/**
 * Move
 * @param  {Object} data      data type can be object or array.
 * @param  {String} pathA     ex: '/menu/nav/list/0'.
 * @param  {String} pathB     ex: '/menu/nav/list/2'.
 * @param  {String} sequence  ex: 'before', default 'after'.
 * @description Move data in the array.
 */
function mv(data, pathA, pathB, direction = 'after') {
  let aParent = get(data, pathA + '/../')
  let bParent = get(data, pathB + '/../')
  let _a = get(data, pathA)
  let _b = get(data, pathB)
  let aIndex = indexOf(pathA)
  let bIndex = indexOf(pathB)

  /*
   如果同个数组中移动，要考虑移动后所需要移除的路径（PathA）数据指针有变，
   所以要判断是同个数组，并且
   */

  if (aParent !== bParent) {
    //放入新值
    insert(data, pathB, _a, direction)
    //删除PathA
    rm(data, pathA)
    return
  }

  //移动位置相同直接退出
  if (aIndex === bIndex) return

  //放入新值
  insert(data, pathB, _a, direction)

  //更新bIndex
  bIndex += direction === 'before' ? -1 : 0

  //向👈移动aIndex + 1
  if (bIndex < aIndex) {
    aIndex++
  }

  pathA = normalizePath(pathA, `/../${aIndex}`)
  rm(data, normalizePath(pathA, `/../${aIndex}`))
}

/**
 * Up
 * @param  {Object} data      data type can be object or array.
 * @param  {String} pathA     ex: '/menu/nav/list/0'.
 * @description Move up data in the array.
 */
function up(data, path, gap = 1) {
  let parent = get(data, path + '/../')
  let index = indexOf(path)
  let targetIndex = index - gap
  let pathB = normalizePath(path, `/../${targetIndex}/`)

  if (!isArray(parent)) {
    console.error('操作的不是数组')
    return
  }
  //移动溢出
  if (index <= 0 || index >= parent.length) {
    return
  }

  mv(data, path, pathB, 'before')
}

/**
 * Down
 * @param  {Object} data      data type can be object or array.
 * @param  {String} pathA     ex: '/menu/nav/list/0'.
 * @description Move up data in the array.
 */
function down(data, path, gap = 1) {
  let parent = get(data, path + '/../')
  let index = indexOf(path)
  let targetIndex = index + gap
  let pathB = normalizePath(path, `/../${targetIndex}/`)

  if (!isArray(parent)) {
    console.error('操作的不是数组')
    return
  }
  //移动溢出
  if (index < 0 || index >= parent.length) {
    return
  }

  mv(data, path, pathB, 'after')
}

/**
 * 在 path 之前 或者之后插入一个数据, 如果不是数组,控制台报错
 * @param  {[type]} data      [description]
 * @param  {[type]} path      [description]
 * @param  {String} direction [description]
 * @return {[type]}           [description]
 */
const [max, min] = [Math.max, Math.min]

function insert(data, path, value, direction = 'after') {
  let parent = get(data, path + '/../')
  let index = path.split('/').filter(item => item).slice(-1)[0] - 0

  if (!isInteger(index)) {
    console.error(path + '不是数字')
    return
  }

  if (!isArray(parent)) {
    console.error(path + '不是数组')
    return
  }

  let isAfter = direction === 'after'
  let target = isAfter ? index + 1 : index
  target = min(parent.length, target)
  target = max(0, target)
  parent.splice(target, 0, value)
  return data
}

export default {get, set, rm, swap, mv, up, down, insert, walk, normalizePath}
// export {get, set, rm, swap, mv, up, down, insert, walk, normalizePath}
