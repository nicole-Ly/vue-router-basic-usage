let _Vue = null
export default class VueRouter {
  /**
   * 初始化options、routeMap、data
   */
  constructor (options) {
    this.options = options // 初始化options
    this.routeMap = {} // 记录路径和对应的组件
    this.data = _Vue.observable({ // 记录当前路由，让其变成响应式数据(Object.defineProperty)
      current: '/'
    })
    this.init()
  }

  /**
   * 静态方法 VueRouter.install
   * 1. 判断当前插件是否已安装
   * 2. 把Vue构造函数记录在全局
   * 3. 将创建Vue的实例时传入的router对象注入到Vue每个实例中 $router上
   */
  static install (Vue) {
    if (VueRouter.install.installed && _Vue === Vue) return // 如果插件已经安装直接返回
    VueRouter.install.installed = true
    _Vue = Vue
    Vue.mixin({
      beforeCreate () { // 拿到当前vue实例，将this指向vue实例
        // new Vue({router,render: h => h(App)}),new Vue()中传入的对象会挂在到实例$options
        if (this.$options.router) { // 判断 router 对象是否已经挂载了 Vue 实例上
          _Vue.prototype.$router = this.$options.router // 把 router 对象注入到 Vue 实例上
        }
      }
    })
  }

  init () {
    this.initRouteMap()
    this.initComponent(_Vue)
    this.initEvent()
  }

  initRouteMap () {
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  /**
   * 创建router-link组件: 点击to标签用来改变路由
   * 创建router-view组件: 路由匹配到的组件将渲染在这里
   */
  initComponent (Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      // template: '<a :href="to"><slot></slot></a>'
      render (h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickhander
          }
        }, [this.$slots.default])
      },
      methods: {
        clickhander (e) {
          history.pushState({}, '', this.to)
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    const self = this
    Vue.component('router-view', {
      render (h) {
      // self.data.current
        const cm = self.routeMap[self.data.current]
        return h(cm)
      }
    })
  }

  /**
   * 监听浏览器返回事件
   */
  initEvent () {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }
}
