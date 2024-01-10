const rewired = require('react-app-rewired')
const rewireLess = require('react-app-rewire-less')
const rewireEslint = require('react-app-rewire-eslint')
const path = require('path')


function rewire(config, env) {
  const cssLoader = rewired.getLoader(
    config.module.rules,
    rule => rule.test && String(rule.test) === String(/\.css$/)
  )
  const sassLoader = {
    test: /\.scss$/,
    use: [...(cssLoader.loader || cssLoader.use), 'sass-loader']
  }
  const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf
  oneOf.unshift(sassLoader)

  config = rewired.injectBabelPlugin('transform-decorators-legacy', config)
  config = rewireLess(config, env)
  config = rewireEslint(config, env)
  config.resolve.modules.push(path.resolve('./src'))

  const alias = config.resolve.alias || {};
  alias['@ant-design/icons/lib/dist$'] = path.resolve(__dirname, './src/icons.js');
  config.resolve.alias = alias;

  return config
}

module.exports = rewire
