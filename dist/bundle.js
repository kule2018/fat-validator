'use strict';

const on = (function () {
    if (document.addEventListener) {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.addEventListener(event, handler, true);
            }
        }
    } else {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.attachEvent(`on${event}`, handler);
            }
        }
    }
})();

const off = (function () {
    if (document.removeEventListener) {
        return function (element, event, handler) {
            if (element && event) {
                element.removeEventListener(event, handler, true);
            }
        }
    } else {
        return function (element, event, handler) {
            if (element && event) {
                element.detachEvent(`on${event}`, handler);
            }
        }
    }
})();

const findFailNeed = (value = {}, rules) => {
    let failRule = null;
    if (Array.isArray(rules)) {
        failRule = rules.find(item => {
            return !item.need(value)
        });
    }
    return {
        warn: failRule ? failRule.warn : '',
        success: !failRule
    }
};

class eventHandler {
    constructor (context) {
        this.context = context;
        this.subscribers = {};
    }

    bind (context) {
        this.context = context;
    }

    subscribe (options) {
        const { name } = options;
        this.subscribers[name] = Object.assign({}, options);
    }

    removeSubscribe (name) {
        const { context, subscribers } = this;
        const { handler } = subscribers[name];

        delete subscribers[name];
        delete context.validateErrs[name];
        return handler
    }

    broadcast (name) {
        const { context, subscribers } = this;
        const { element, rules } = subscribers[name];
        const error = findFailNeed(element.value, rules);
        // 脏更新
        context.validateErrs[name] = error;
        context.$forceUpdate();
        return error.success
    }

    broadcastAll () {
        const { context, subscribers } = this;
        const keys = Object.keys(subscribers);

        let res = keys.map(id => {
            const { element, rules, name } = subscribers[id];
            const value = element.value || context[name];
            context.validateErrs[name] = findFailNeed(
                value,
                rules
            );
            return context.validateErrs[name].success
        }).filter(item => item);

        context.$forceUpdate();
        return keys.length === res.length
    }
}

var index = {
    install (Vue) {
        let eventHandler$$1 = null;
        let context = null;
        Vue.directive('validate', {
            bind (element, binding, vnode) {
                let { arg: name } = binding;
                const { modifiers, value: rules } = binding;
                const method = Object.keys(modifiers)[0];

                context = vnode.context;

                if (eventHandler$$1) {
                    eventHandler$$1.bind(context);
                } else {
                    eventHandler$$1 = new eventHandler(context);
                }

                const handler = function () {
                    eventHandler$$1.broadcast(name);
                };

                eventHandler$$1.subscribe({
                    name,
                    method,
                    rules,
                    element,
                    handler
                });

                method && on(element, method, handler);
            },

            unbind (element, binding) {
                const { arg: name, modifiers } = binding;
                const method = Object.keys(modifiers)[0];
                const handler = eventHandler$$1.removeSubscribe(name);

                method && off(element, method, handler);
            }
        });

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
                                console.warn('Please confirm v-validate is bound.', error);
                            }
                        },
                        validateAll () {
                            return eventHandler$$1
                                ? eventHandler$$1.broadcastAll()
                                : !eventHandler$$1
                        },
                        reset (name) {
                            delete this[name];
                            context && context.$forceUpdate();
                        },
                        resetAll () {
                            Object.keys(this).forEach(key => {
                                if (
                                    this[key] &&
                                    typeof this[key] !== 'function'
                                ) {
                                    delete this[key];
                                }
                            });
                            context && context.$forceUpdate();
                        }
                    }
                }
            }
        });
    }
};

module.exports = index;