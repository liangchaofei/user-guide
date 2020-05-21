<!--
 * @Author: your name
 * @Date: 2020-05-21 15:57:53
 * @LastEditTime: 2020-05-21 17:18:03
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /user-guide/README.md
--> 
### react 版本 用户引导组件

### 技术实现
+ ts+react+hooks



### 安装
```
    npm install
    or 
    yarn 
```

### 用法
```tsx
    import React from 'react';
    import Guide from '@curry_fe/react_user_guide';

    const { memo } = React;

    const App = memo(() => {
        <Guide username='curry'>
            <h1 data-step="1" data-tip="标题1" data-desc="描述1">一级标题</h1>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <h2 data-step="2" data-tip="标题2" data-desc="描述2">二级标题</h2>
            <br />
            <br />
            <br />
            <br />
            <br />
            <h3 data-step="3" data-tip="标题3" data-desc="描述3">三级标题</h3>
        </Guide>
    })

    export default App;
```

### API
| 名称 | 描述 | 类型 | 默认值 | 
|  ---   |  ---  |  ---  |  ---  |
| hasNum | 是否有数字指引 | boolean | false |
| hasPoint | 是否有点显示 | boolean | false |
| username | 传入一个用户名判断当前用户是否已完成或者跳过指引|string|空|
| backText | 上一步文字| string| back|
|nextText | 下一步文字 | string | next | 