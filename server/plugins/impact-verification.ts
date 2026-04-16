export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head.push('<meta name="impact-site-verification" value="4c126f80-0e83-4090-98f2-6708921ba3c2">')
  })
})