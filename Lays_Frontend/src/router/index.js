import Bags from '../views/Bags.vue';
import BagDetail from '../views/BagDetail.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import CreateBag from '../views/CreateBag.vue';
import Configurator from '../views/Configurator.vue';
import ConfiguratorVue from '../views/ConfiguratorVue.vue';

export default [
  { path: '/', redirect: '/bags' },
  { path: '/bags', component: Bags },
  { path: '/bags/:id', component: BagDetail, props: true },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/create', component: CreateBag }
  ,{ path: '/configurator', component: Configurator }
  ,{ path: '/configurator-vue', component: ConfiguratorVue }
];
