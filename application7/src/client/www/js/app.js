var $$ = Dom7;

var app = new Framework7({
  root: '#app', // App root element

  id: 'io.framework7.myapp', // App bundle ID
  name: 'FriendFinder', // App name
  theme: 'auto', // Automatic theme detection

  // App root data
  data: function () {
    return {
        serverAddress: 'http://localhost:3000',
        user: {
          name : "",
          surname : "",
          id : "",
          pseudo : "",
          birthday : "",
          lat:"",
          lng:""
        }
    };
  },
  // App root methods
  methods: {
/*     helloWorld: function () {
      app.dialog.alert('Hello World!');
    }, */

  },
  // App routes
  routes: routes,


  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
        cordovaApp.init(f7);
      }
    },
  },
});
// Login Screen Demo
$$('#my-login-screen .login-button').on('click', function () {
  var username = $$('#my-login-screen [name="username"]').val();
  var password = $$('#my-login-screen [name="password"]').val();

  // Close login screen
  app.loginScreen.close('#my-login-screen');

  // Alert username and password
  app.dialog.alert('Username: ' + username + '<br>Password: ' + password);
});

$$(document).on('page:init', '.page[data-name="testmap"]', function (e) {
  let response = fetch(app.data.serverAddress + "/position/" + app.data.user.id)
                    .then(res => res.json())
                    .then(function(res){
                              alert(res.latitude + ' ' + res.longitude);
                              var map = new google.maps.Map(document.getElementById('map'), {
                                zoom: 8,
                                center: {lat: parseInt(res.latitude), lng: parseInt(res.longitude)}
                              });


                              var myLatLng = { lat: parseInt(res.latitude), lng: parseInt(res.longitude) };
                              var marker = new google.maps.Marker(
                                  {
                                    position: myLatLng,
                                    map: map,
                                  });
                    })

});

$$(document).on('page:init', '.page[data-name="formPosition"]', function (e) {
  window.navigator.geolocation.getCurrentPosition(function(position) {
        var inputLatitude = document.getElementById('latitude')
        var inputLongitude = document.getElementById('longitude')
        inputLatitude.value = position.coords.latitude
        inputLongitude.value = position.coords.longitude
        alert('hello')
  },function(error){
       alert("Error in localisation N° " + error.code + " : " + error.message);
   });
});

$$(document).on('page:init', '.page[data-name="home"]', function (e) {
  fetch(app.data.serverAddress +"/positions", {
            method: "DELETE",
          })
          .catch(err => this.$app.dialog.alert('Error ' + err))
})

app.views.create('.view-main',{
  url:'/',
})
