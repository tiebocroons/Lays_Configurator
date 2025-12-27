import Bags from '../views/Bags.vue';
import BagDetail from '../views/BagDetail.vue';
import BagShowcase from '../views/BagShowcase.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Configurator from '../views/Configurator.vue';
import ConfiguratorVue from '../views/ConfiguratorVue.vue';
import Admin from '../views/Admin.vue';
import AdminVotes from '../views/admin/Votes.vue';
import AdminSubmissions from '../views/admin/Submissions.vue';
import AdminUsers from '../views/admin/Users.vue';
import AdminBan from '../views/admin/Ban.vue';

export default [
  { path: '/', redirect: '/bags' },
  { path: '/bags', component: Bags },
  { path: '/bags/:id', component: BagDetail, props: true },
  { path: '/bag-showcase', component: BagShowcase },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  ,{ path: '/configurator', component: Configurator }
  ,{ path: '/configurator-vue', component: ConfiguratorVue }
  ,{ path: '/admin', component: Admin },
  { path: '/admin/votes', component: AdminVotes },
  { path: '/admin/submissions', component: AdminSubmissions },
  { path: '/admin/users', component: AdminUsers },
  { path: '/admin/ban', component: AdminBan }
];
