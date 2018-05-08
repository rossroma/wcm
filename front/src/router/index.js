import Vue from 'vue'
import Router from 'vue-router'
import List from '@/components/list'
import Home from '@/components/home'
import Statistics from '@/components/statistics'
import Login from '@/components/login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '',
          component: List
        },
        {
          path: 'list',
          name: 'List',
          component: List
        },
        {
          path: 'recycle',
          name: 'Recycle',
          component: List
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: Statistics
        }
      ]
    },
    {
      path: 'login',
      name: 'Login',
      component: Login
    }
  ]
})
