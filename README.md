# webpack-auto-export

A webpack plugin to automatically export all modules from within a given path.

## Understanding the problem

It's very common, in a react environment, to, for instance, have a `/components` folder to hold all our shared components. 
We then go on to import all the necessary components in our `/pages` or `/containers` definitions.

```js
import Button from '../../components/Button'
import Form from '../../components/Form'
import Icon from '../../components/Icon'
```

If, however, we create an `index` file inside `/components` folder, we can export all of the definitions from the same path.

```js
// components/index.js
export { default as Button } from './Button'
export { default as Form } from './Form'
export { default as Icon } from './Icon'
```

This allows us to makes our imports a lot cleaner, as shown next:

```js
// page / container definition:
import { Button, Form, Icon } from '../../components'
```

## The downside

As you can probably already imagine, despite the simplified imports, this comes with a necessity for the developer to maintain all of the exports manually. 

Say you create a new component. If you don't export it from `components/index` file, then, your pages definition can look like the following: 

```js
import { Button, Form, Icon } from '../../components'
import Table from '../../components/Table'
```

So, if any of your components are not exported from the index file, it defeats the purpose of exporting any component from there. 

And, as developers, we might not be really interested in maintaining bureocracy in our code, and we force ourselvs to do so simply to keep the consistency. 

## The solution

`webpack-auto-export` is a webpack plugin that allows you to automatically export your modules from any specified folder.

With an extremelly simple configuration, you can be up and running within seconds.

```js
// webpack.config.js
const AutoExport = require('webpack-auto-export')

module.exports = {
  ...
  plugins: [
    ...
    new AutoExport({
      extension: '.js', // define extension of generated index file
      exportType: 'named', // the default way to export. values can be: 'named' | 'default' | 'detect'
      baseDir: './src', // base directory to observe the changes
      paths: [ // the folders to be automatically exported
        'hooks', // hooks folder will use default exportType
        { path: 'components', exportType: 'detect' }, // we can also specify the export type for any given path.
      ],
    })
  ]
}
```

One great feature of the plugin is that it allows for use to choose the `exportType`. The values can be:

• `named` - export as named export (`export * from './PATH'`)
• `default` - export as default export (`export { default as Module } from './PATH'`)
• `detect` - Detect should be avoided, for performance issues. It will read the files and detect whether or not they contain an export default. If so, it uses `default` export, otherwise, it'll use `named` export.
