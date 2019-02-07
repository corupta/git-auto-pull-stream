## Git Auto Pull Stream

Simple install this package and init an npm project add an index file and include this package to achieve auto pull stream

Example index.js
```js
require('git-auto-pull-stream')(require('./config.js'))
```

Install this package
```
npm i git-auto-pull-stream
```

Add start command like that to `package.json`
```json
{
  "scripts": {
    "start": "node index.js ../relative_path_to_updating_project_folder"  
  }
}
```

Check out the sample_config for how to create a config


then start the project
```
npm start
```

The project runs on port 1337, so you most likely want to use nginx to redirect update.yourserver.com to that port 

Let's say you redirect calls from update.yourserver.com to this node process

## To Update Your Project
```
curl update.yourserver.com -H "type: front-end"
```
or
```
curl update.yourserver.com/front-end
```
Would run the series of actions you defined in `config.js` under `'front-end'`

If you do not specify type header or a path, then the `"default"` series of actions defined in `config.js` would be run


To secure your update server define your types as `'frontend_MY_SECRET_KEY'` in your `config.js` and use curl with that header as type.

