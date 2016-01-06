/*angular model tested on windows 10 created by : Raldes krisnu p
How to used?
in tag <html> change like this <html ng-app"Your name module"> i choose Popups as name module;
and in the body used name controller like <body ng-controller="your controller">

just documentation :D
*/

angular.module('CustomFilterModule', []).filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});

angular.module('MainModule', ['ionic', 'ngCordova','CustomFilterModule'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
		if(window.Connection) {
                if(navigator.connection.type == Connection.NONE) {
                    alert('no conn');
                }
            }
    });
})

.controller('MainController', function($scope, $cordovaCamera, $cordovaFile, $http,$rootScope,$window, $ionicPopup,$cordovaGeolocation,$ionicLoading) {
	
    // inisialisasi variable 
    $scope.images = [];
	$scope.data = [];
	$scope.formData = {};
	var arr = [];
	var markers=[];
	

    $scope.addImage = function() {
        // 2
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
        };

        // 3
        $cordovaCamera.getPicture(options).then(function(imageData) {

            // 4
            onImageSuccess(imageData);

            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            // 5
            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                    fileEntry.copyTo(
                        fileSystem2,
                        newName,
                        onCopySuccess,
                        fail
                    );
                },
                fail);
            }

            // 6
            function onCopySuccess(entry) {
                $scope.$apply(function () {
                    $scope.images.push(entry.nativeURL);
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i=0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

        }, function(err) {
            console.log(err);
        });
    }

    $scope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        return trueOrigin;
    }
	
	
	$scope.loadImage = function()
	{
		$http.get("http://raldeskrisnu.com/wisatabahari/readImage.php").success(function (data)
		{
			$scope.slider = data;
			images = $scope.array = data.split('');
			
			for(var i = 1; i<images.length+1; i++)
			{
				 $scope.images.push({id: i, src:"http://raldeskrisnu.com/wisatabahari/images/img"+i+".jpg"});
			}
			console.log(images);
		}).error(function (){
			alert('something error');
		})
	}
	
	$scope.loadData = function()
	{
		$http.get("http://raldeskrisnu.com/wisatabahari/data.php")
		.then(function (response) {
			$scope.names = response.data.records;
			
		});
	}
	$scope.loadData();
	
	$scope.check_credentials = function () {
	
		var request = $http({
		method: "post",
		url: "http://raldeskrisnu.com/wisatabahari/insert.php",
		data: {
        name: $scope.formData.username,
        tempat: $scope.formData.place,
		harga: $scope.formData.harga,
		lokasi: $scope.formData.location,
		deskripsi: $scope.formData.desc,
		foto:$scope.formData.photo
		},
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});

	request.success(function (data) {
		 var alertPopup = $ionicPopup.alert({
       title: 'Alert',
       template: data
     });
     alertPopup.then(function(res) {
       console.log('sukses');
     });
	});
}

  $scope.gmaps = function()
  { 
	$ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Harap tunggu'
        });
         
        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
            
            var myLatlng = new google.maps.LatLng(lat, long);
             
            var mapOptions = {
                center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };          
             
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
			
			var infowindow = new google.maps.InfoWindow({map:map});	
			var marker = new google.maps.Marker({
                                        position: myLatlng,
                                        map: map,
                                    });
			
			infowindow.setPosition(myLatlng);
			infowindow.setContent('im here');
			map.setCenter(myLatlng);						
            $scope.map = map;   
            $ionicLoading.hide(); 
			
             
        }, function(err) {
            $ionicLoading.hide();
            console.log(err);
        });
		
  }
  
  $scope.topPoster = function()
  {
	  $http.get("http://raldeskrisnu.com/wisatabahari/topposter.php")
		.then(function (response) {
			$scope.myposting = response.data.records;
		});
	
  }
	$scope.topPoster();
});