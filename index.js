'use strict'

import eventHandler from './lib/eventHandler'
import { on, off } from './utils'

export default {
    install (Vue) {
        let eventHandler$$1 = null
        let context = null
        Vue.directive('validate', {
            bind (element, binding, vnode) {
                let { arg: name } = binding
                const { modifiers, value: rules } = binding
                const method = Object.keys(modifiers)[0]

                context = vnode.context

                if (eventHandler$$1) {
                    eventHandler$$1.bind(context)
                } else {
                    eventHandler$$1 = new eventHandler(context)
                }

                const handler = function () {
                    eventHandler$$1.broadcast(name)
                }

                eventHandler$$1.subscribe({
                    name,
                    method,
                    rules,
                    element,
                    handler
                })

                method && on(element, method, handler)
            },

            unbind (element, binding) {
                const { arg: name, modifiers } = binding
                const method = Object.keys(modifiers)[0]
                const handler = eventHandler$$1.removeSubscribe(name)

                method && off(element, method, handler)
            }
        })

        Vue.mixin({
            data () {
                return {
                    validateErrs: {
                        get (param) {
                            return this[param]
                                ? this[param]
                                : {
                                    warn: '',
                                    success: true
                                }
                        },
                        validate (name) {
                            try {
                                return eventHandler$$1.broadcast(name)
                            } catch (error) {
                                console.warn('Please confirm v-validate is bound.', error)
                            }
                        },
                        validateAll () {
                            return eventHandler$$1
                                ? eventHandler$$1.broadcastAll()
                                : !eventHandler$$1
                        },
                        reset (name) {
                            delete this[name]
                            context && context.$forceUpdate()
                        },
                        resetAll () {
                            Object.keys(this).forEach(key => {
                                if (
                                    this[key] &&
                                    typeof this[key] !== 'function'
                                ) {
                                    delete this[key]
                                }
                            })
                            context && context.$forceUpdate()
                        }
                    }
                }
            }
        })
    }
}
