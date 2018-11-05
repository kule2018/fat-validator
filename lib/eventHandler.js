import { findFailNeed } from '../utils'

export default class eventHandler {
    constructor (context) {
        this.context = context
        this.subscribers = {}
    }

    bind (context) {
        this.context = context
    }

    subscribe (options) {
        const { name } = options
        this.subscribers[name] = Object.assign({}, options)
    }

    removeSubscribe (name) {
        const { context, subscribers } = this
        const { handler } = subscribers[name]

        delete subscribers[name]
        delete context.errors[name]
        return handler
    }

    broadcast (name) {
        const { context, subscribers } = this
        const { element, rules } = subscribers[name]
        const error = findFailNeed(element.value, rules)
        // 脏更新
        context.errors[name] = error
        context.$forceUpdate()
        return error.success
    }

    broadcastAll () {
        const { context, subscribers } = this
        const keys = Object.keys(subscribers)

        let res = keys.map(id => {
            const { element, rules, name } = subscribers[id]
            const value = element.value || context[name]
            context.errors[name] = findFailNeed(
                value,
                rules
            )
            return context.errors[name].success
        }).filter(item => item)

        context.$forceUpdate()
        return keys.length === res.length
    }
}