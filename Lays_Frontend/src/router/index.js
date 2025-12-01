import Bags from '../views/Bags.vue';
import BagDetail from '../views/BagDetail.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import CreateBag from '../views/CreateBag.vue';

export default [
  { path: '/', redirect: '/bags' },
  { path: '/bags', component: Bags },
  { path: '/bags/:id', component: BagDetail, props: true },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/create', component: CreateBag }
];
