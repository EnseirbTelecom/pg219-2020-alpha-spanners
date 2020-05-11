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
        //user: { ... emptyUserInfo} //copy the fields of emptyUserInfo into user
    };
  },
  // App root methods
  methods: {
    deleteUserData: function (){
      delete app.data.user 
      delete localStorage.tokenExp;
      delete localStorage.token;
    },
    checkToken: function(){
      if (localStorage.tokenExp){
        if (localStorage.tokenExp > Date.now()){
          return true;
        } else {
          this.dialog.alert('Session has expired. <br> Please login ');
        }
      }
      this.views.main.router.navigate('/');  
      return false;
    },
    //The following function can seem a bit unorthodox as they might neither 
    //reject or resolve because they'll simply redirect to login page
    checkTokenOnRoute: function (routeTo, routeFrom, resolve, reject){
      if( app.methods.checkToken() ){
        resolve();
      }
    },
    tokenHandlingFetch: async function(relativePath, data){
      // this function does the same as fetch except it adds the token in the url and handle the invalid token error from the server
      if (app.methods.checkToken()){
        return  fetch( app.data.serverAddress + relativePath + "/?token=" + localStorage.token,data)
                .catch(err => {
                  if (err.message == "TokenExpiredError"){
                    this.dialog.alert('Session has expired. <br> Please login ');
                    this.$router.navigate('/')
                  } else {
                    throw err;
                  }
                })

      } 
    }
  },




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
  
// App routes
// we add route to app after, so that route is created when routes are loaded => routes can use app
app.routes = routes;

// if there is user data is save in JSON in localStorage we retrive it
if (localStorage.userJson){
  app.data.user = JSON.parse(localStorage.userJson)
}

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
          .catch(err => {app.dialog.alert('Error ' + err); throw err;})
})


app.views.create('.view-main',{
  url:'/home',
}) 
