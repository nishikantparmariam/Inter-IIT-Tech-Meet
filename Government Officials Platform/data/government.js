var loggedIn = false;
var maxRating = 1000;


var db = firebase.firestore();
var mapInfo;

function login(){
    var key = $('#login_key').val();
    db.collection('government_key').doc('Mac2UUMd99GtwkjJZ6EA').get().then(function(doc) {
        if (doc.exists) {
            var logginKey = doc.data().key;
            if(logginKey==key){
                $('.before_login').hide();
                $('.after_login').fadeIn(300);
            }
        } 
    }).catch(function(error) {        
    });
}

function logout(){
    $('.before_login').fadeIn(300);
    $('.after_login').hide();
}

function changeStatus(doc_id, bool){
    db.collection("contractors").doc(doc_id).update({inConstruction:bool});
}

function card_maker(data, doc_id){
    var star_count;
    if(data.total_reports==0){
        star_count = 3;
    } else {
        star_count = parseInt((data.resolved_reports*5)/data.total_reports);        
    }        
    var star_text = "";        

    for(var i = 0; i<star_count; i++){
        star_text+='<i class="fa fa-star" style="color:#ffa500;"></i>';
    } 
    for(var i=0; i<5-star_count;i++){
        star_text+='<i class="fa fa-star" style="color:#e9ebee;"></i>';
    } 

    var status = "";

    if(data.inConstruction){
        status='<button class="btn btn-sm btn-primary" onclick="changeStatus(\''+doc_id+'\', false)">Construction</button>&nbsp;<button  onclick="changeStatus(\''+doc_id+'\', false)" class="btn btn-sm btn-light">Maintenance</button>';
    } else {
        status='<button  onclick="changeStatus(\''+doc_id+'\', true)" class="btn btn-sm btn-light">Construction</button>&nbsp;<button  onclick="changeStatus(\''+doc_id+'\', false)" class="btn btn-sm btn-primary">Maintenance</button>';
    }
    return '<div class="card"><div class="card-body"><h5 >'+data.name+' ('+data.road_name+')</h5><div style="float:right;">'+status+'</div>'+star_text+'<br><hr>Login Key - '+data.user_id+'<hr> <p class="card-text">Total Reports -<b>'+data.total_reports+'</b> and Resolved Reports - <b>'+data.resolved_reports+'</b></p><a target="_blank" href="https://www.google.com/maps/search/?api=1&query='+data.lat+','+ data.lng+'" class="card-link">See Location on Map</a> | <a href="'+data.drive_link+'" target="_blank">Open Link</a></div></div><br>'
}


function fetch(){    
    var data = db.collection("contractors")
    .onSnapshot(function(querySnapshot) {     
     document.getElementById("cards").innerHTML="";                          
        querySnapshot.forEach(function(doc) {
            
            var p = document.createElement('div');
            p.innerHTML = card_maker(doc.data(), doc.id);
           
            document.getElementById("cards").append(p);
            console.log(doc.data());                                
        });
    });
}


$( document ).ready(function() {
    
    fetch(); 
    $('.after_login').hide();
    $('.before_login').hide();
    $('.before_login').fadeIn(300);
    $('.reportForm').hide(300);
    loadLeaderBoardData(); 
});

function buildleaderboarduser(data, doc_id, rank){
    var star_count;    
    var star_text = "";
    if(data.points<maxRating/5){
        star_count = 1;
    } else if(data.points<2*maxRating/5){
        star_count = 2;
    } else if(data.points<3*maxRating/5){
        star_count = 3;
    } else if(data.points<4*maxRating/5){
        star_count = 4;
    } else {
        star_count = 5;
    }

    for(var i = 0; i<star_count; i++){
        star_text+='<span class="fa fa-star" style="color:#ffa500;"></span>';
    } 
    for(var i=0; i<5-star_count;i++){
        star_text+='<span class="fa fa-star" style="color:#e9ebee;"></span>';
    }

    var showMe = "";
    

    return '<th scope="row" style="font-size: 15pt;">'+rank+'&nbsp;&nbsp;'+star_text+'</th><td>'+data.fullname+'</td><td>'+data.total_queries+'</td><td><b>'+data.points+'</b></td>';     
}

function loadLeaderBoardData(){
    document.getElementById("leaderboard_users").innerHTML="Loading...";        
    db.collection("users").orderBy("points", "desc")
    .onSnapshot(function(querySnapshot) {        
        document.getElementById("leaderboard_users").innerHTML="";  
        var rank = 0;                                     
        querySnapshot.forEach(function(doc) { 
            rank+=1;                       
            var iDiv = document.createElement('tr');                                    
            iDiv.innerHTML = buildleaderboarduser(doc.data(), doc.id, rank);
            document.getElementById("leaderboard_users").append(iDiv);                                           
        }); 
        //console.log("Current cities in CA: ", cities.join(", "));
    });
}


var map, infoWindow,lati,longi, pos;        
var center={
    lat: 28.704060, lng:77.102493
}
          
    
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -29.8543, lng:77.8880},
        zoom: 17
    });            

    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log(pos);

            pos_for_marker = {
                lat: position.coords.latitude-0.001,
                lng: position.coords.longitude
            };
            
            infoWindow.setPosition(pos);            
            infoWindow.open(map);
            map.setCenter(pos);                  
            
            marker = new google.maps.Marker(
            {
                map:map,
                draggable:true,
                animation: google.maps.Animation.DROP,
                position: pos_for_marker
            });
            google.maps.event.addListener(marker, 'dragend', function() 
            {
                var long = marker.getPosition().lng();
                var lati = marker.getPosition().lat();
                console.log(long);
                console.log(lati);
                getPlaceNameAndId(long, lati);                      
            });
            
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function getPlaceNameAndId(long, lati){
    $.get("https://roads.googleapis.com/v1/snapToRoads?path="+lati+","+long+"&interpolate=true&key=AIzaSyBHC4iI3Z72s1fGv_KBTIdrkvG2RBa-e1s", function(data){                            
            var placeid= new Set();
            for(var i=0 ;i<(data.snappedPoints).length;i++){
                placeid.add(data.snappedPoints[i].placeId);
            }

            ids=Array.from(placeid);                
            var url='https://maps.googleapis.com/maps/api/place/details/json?place_id='+ids[0]+'&fields=name,rating,formatted_phone_number&key=AIzaSyBHC4iI3Z72s1fGv_KBTIdrkvG2RBa-e1s';
            var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            $.get(proxyUrl+url, function(data){                           
                console.log(data);
                mapInfo = {
                    long:long,
                    lati:lati,
                    placeId:ids[0],
                    road_name:data.result.name
                }
                showFormAndStatus();
            });
        });
}


function showFormAndStatus(){
    $('.reportForm').hide();
    if(mapInfo.road_name=="Unnamed Road"){
        $('.roadStatusShower').html('<div class="alert alert-danger" role="alert"><i class="fa fa-times" style="font-size:16pt;"></i> Sorry can\'t add contractor for unnamed road.</div>');    
    } else {
        $('.roadStatusShower').html('<div class="alert alert-info" role="alert"><i class="fa fa-check" style="font-size:16pt;"></i> You can add contractor to this location.</div>');            
        $('.reportForm').fadeIn(300);
        $('#contractor_roadname').val(mapInfo.road_name+" (Longitutde : "+mapInfo.long+", Latitude : "+mapInfo.lati);                        
    }       
}

function addcontractor(){
    var name = $('#contractor_name').val();
    if(name==""){
        alert("Please fill all the details");
        return false;
    } else {
        var newKey = db.collection('contractors').doc().id;
        console.log(newKey);
        toEnterData = {
            lat:mapInfo.lati,
            lng:mapInfo.long,
            name:name,
            place_id:mapInfo.placeId,
            resolved_reports:0,
            road_name:mapInfo.road_name,
            total_reports:0,
            user_id:newKey,
            inConstruction:true,
            drive_link:"",
        }
        console.log(toEnterData);
        db.collection('contractors').doc(newKey).set(toEnterData).then(()=>{
            $('.roadStatusShower').html('<div class="alert alert-success" role="alert"><i class="fa fa-check" style="font-size:16pt;"></i> Successfully added contractor.</div>');            
            $('.reportForm').hide();
        });
    }
}

// // fetch();