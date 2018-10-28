/* eslint-disable */
export const on = (function () {
    if (document.addEventListener) {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.addEventListener(event, handler, true)
            }
        }
    } else {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.attachEvent(`on${event}`, handler)
            }
        }
    }
})()

export const off = (function () {
    if (document.removeEventListener) {
        return function (element, event, handler) {
            if (element && event) {
                element.removeEventListener(event, handler, true)
            }
        }
    } else {
        return function (element, event, handler) {
            if (element && event) {
                element.detachEvent(`on${event}`, handler)
            }
        }
    }
})()

export const findFailNeed = (value = {}, rules) => {
    let failRule = null
    if (Array.isArray(rules)) {
        failRule = rules.find(item => {
            return !item.need(value)
        })
    }
    return {
        warn: failRule ? failRule.warn : '',
        success: !failRule
    }
}