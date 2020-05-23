
var routes = [
  {
    name: 'login',
    path: '/',
    componentUrl: './pages/login.html',
    beforeEnter: (routeTo, routeFrom, resolve, reject) => {app.methods.deleteUserData(); resolve()}
  },
  {
    name:'home',
    path:'/home',
    componentUrl: './pages/home.html',
    beforeEnter: (a,b,c,d) => {app.methods.checkTokenOnRoute(a,b,c,d)}
  },
  {
    path: '/register',
    componentUrl: './pages/register.html',
  },
  {
    path:'/info',
    componentUrl:'./pages/loginForm.html'
  },
  {
    name:'addfriends',
    path:'/addfriends',
    componentUrl:'./pages/addFriends.html',
    beforeEnter: (a,b,c,d) => {app.methods.checkTokenOnRoute(a,b,c,d)}
  },
  {
    name:'friends',
    path: '/friendlist',
    componentUrl: './pages/friendList.html',
    beforeEnter: (a,b,c,d) => {app.methods.checkTokenOnRoute(a,b,c,d)}
  },
  {
    name:'notif',
    path:'/notif',
    componentUrl:'./pages/notification.html',
    beforeEnter: (a,b,c,d) => {app.methods.checkTokenOnRoute(a,b,c,d)}
  },
  {
    name:'sentRequests',
    path:'/sentRequest',
    componentUrl:'./pages/sentRequest.html'
  },
  {
    name:'position',
    path:'/formPosition',
    componentUrl:'./pages/formPosition.html'
  },
  {
    name:'testmap',
    path:'/map',
    componentUrl:'./pages/carte.html'
  },
  {
    name:'pastpositions',
    path:'/pastpositions',
    componentUrl:'./pages/pastposition.html'
  },
  {
    name:'map',
    path:'/position/:latitude/:longitude',
    componentUrl:'/pages/positionOnMap.html'
  },
  
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
