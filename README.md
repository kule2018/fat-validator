Fat-Validator
==================================================

安装
----------------------------

npm

```bash
npm install --save-dev fat-validator
```

开始
----------------------------
```js
import Vue from 'vue';
import Validator from 'fat-validator';

Vue.use(Validator);
```

使用方法以及Demo
----------------------------
```js
<template>
<input 
    placeholder="请输入"
    v-model="form.nativeInput"
    v-validate:nativeInput.blur="validates.nativeInput"
    @focus="errors.reset('nativeInput')"
/>
<span class="u-info">{{ errors.get('nativeInput').warn }}
</span>
</template>
<script>
import { validateResult } from 'fat-validator'

export default {
    mixins: [ validateResult],
    data () {
        return {
            form: {
                nativeInput: ''
            },
            validates: {
                nativeInput: [
                    {
             	        need: () => !!this.form.nativeInput,
                        warn: '不能为空'
                    }
                ]
            }
        }
    }
}
</script>
```

1. 组件的`data`中维护表单的数据`form`以及待验证的规则`validates`，通过`() => {}`，将`this`指针绑定在当前组件内，省去传值。

2. `v-validate:nativeInput.blur`当前`input`需要校验，校验结果的key为`nativeInput`，`blur`代表失焦校验；
   
3. 校验规则以及警告信息则维护在组件的`data`的`validates `中；
   
4. 校验结果为`errors.get('nativeInput')`，其包含`{ success: true, warn }`。


其他API
----------------------------
`this.errors.validate(name)`：校验某个`name`规则；
`this.errors.validateAll()`：校验所有规则；

`this.errors.reset()`：重置某个`name`校验结果；
`this.errors.resetAll()`：重置所有校验结果。