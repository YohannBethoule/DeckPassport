export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },
    main: {
      base: 'min-h-[calc(100vh-var(--ui-header-height)-var(--ui-footer-height))]'
    },
    footer: {
      slots: {
        container: 'py-8 lg:py-4 flex items-center justify-between gap-x-2',
        left: 'flex items-center justify-start flex-1 gap-x-1.5 mt-3 mt-0 order-1',
        center: 'mt-3 mt-0 order-2 flex items-center justify-center',
        right: 'flex-1 flex items-center justify-end gap-x-1.5 order-3'
      }
    }
  }
})
