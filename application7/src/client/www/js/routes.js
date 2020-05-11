
var routes = [
  {
    name: 'login',
    path: '/',
    componentUrl: './pages/login.html',
  },
  {
    name:'home',
    path:'/home',
    componentUrl: './pages/home.html',
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
    componentUrl:'./pages/addFriends.html'
  },
  {
    name:'friends',
    path: '/friendlist',
    componentUrl: './pages/friendList.html'
  },
  {
    name:'notif',
    path:'/notif',
    componentUrl:'./pages/notification.html'
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
    name:'latlngOnmap',
    path:'/positiononmap/:idposition',
    componentUrl:'./pages/positiononmap.html'
  },
  {
    name:'friendmap',
    path:'/position/:idfriend',
    componentUrl:'/pages/friendcarte.html'
  },

  // {
  //   path: '/about/',
  //   url: './pages/about.html',
  // },
  // {
  //   path: '/form/',
  //   url: './pages/form.html',
  // },
  //
  //
  // {
  //   path: '/dynamic-route/blog/:blogId/post/:postId/',
  //   componentUrl: './pages/dynamic-route.html',
  // },
  // {
  //   path: '/request-and-load/user/:userId/',
  //   async: function (routeTo, routeFrom, resolve, reject) {
  //     // Router instance
  //     var router = this;
  //
  //     // App instance
  //     var app = router.app;
  //
  //     // Show Preloader
  //     app.preloader.show();
  //
  //     // User ID from request
  //     var userId = routeTo.params.userId;
  //
  //     // Simulate Ajax Request
  //     setTimeout(function () {
  //       // We got user data from request
  //       var user = {
  //         firstName: 'Vladimir',
  //         lastName: 'Kharlampidi',
  //         about: 'Hello, i am creator of Framework7! Hope you like it!',
  //         links: [
  //           {
  //             title: 'Framework7 Website',
  //             url: 'http://framework7.io',
  //           },
  //           {
  //             title: 'Framework7 Forum',
  //             url: 'http://forum.framework7.io',
  //           },
  //         ]
  //       };
  //       // Hide Preloader
  //       app.preloader.hide();
  //
  //       // Resolve route to load page
  //       resolve(
  //         {
  //           componentUrl: './pages/request-and-load.html',
  //         },
  //         {
  //           context: {
  //             user: user,
  //           }
  //         }
  //       );
  //     }, 1000);
  //   },
  // },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
