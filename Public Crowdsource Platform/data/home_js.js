var radiusInMeter = 200;
var user_upvoted  = [];
var db = firebase.firestore();
var maxRating = 1000;
var contractor_data;
var marker;

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

function checkForRealTime(){
    db.collection("users").doc(user_id)
    .onSnapshot({        
    }, function(doc) {        
        firebaseUserData = doc.data();
        setUserData(doc.data()); 
        makeReportsPieChart(doc.data());  
    });    
}


function report(){
    var report_title = $('#report_title').val();
    var report_des = $('#report_des').val();
    if(report_title!="" && report_des!=""){
        var toAdd = {
            contractor_id:contractor_data.user_id,
            description:report_des,
            lat:marker.getPosition().lat(),
            lng:marker.getPosition().lng(),
            status:0,
            timestamp:new Date().toLocaleString(),
            title:report_title,
            road_name:contractor_data.road_name,
            user_id:user_id
        };
        db.collection("queries").add(toAdd)
        .then(function() {
            $('.roadStatusShower').html('<div class="alert alert-success" role="alert"><i class="fa fa-check-circle" style="font-size:16pt;"></i> Successfully submitted report!!</div>');
            $('.reportForm').hide(300);
            //Increase Points
            

            var toAddP = parseInt(getRandomArbitrary(1,30));
            var newPoints = firebaseUserData.points+toAddP;
            
            if(newPoints>maxRating){
                newPoints = maxRating;
            }

            //Increase contractor query num
            db.collection("contractors").doc(contractor_data.user_id).update({total_reports:firebase.firestore.FieldValue.increment(1)});

            console.log(firebaseUserData.total_queries+" hey");
            db.collection("users").doc(user_id).update({points:newPoints, total_queries:firebaseUserData.total_queries+1})
            .then(function() {                                
                                   
                $('#congratsModal').modal('show'); 
                $('#increasedRatingDiv').html('+'+toAddP);
            })
            .catch(function(error) {
                
            });


        })
        .catch(function(error) {
            //document.getElementById("post_length").innerHTML = "Please try again";
        });
    }    else {
        $('.roadStatusShower').html('<div class="alert alert-danger" role="alert"><i class="fa fa-times" style="font-size:16pt;"></i> Please fill all the details</div>');
    }
}

function checkForRoadInDB(roadName, isIn){
    $('.reportForm').hide(300);
    $('#road_status_div').html("");
    if(!isIn){
        $('.roadStatusShower').html('<div class="alert alert-danger" role="alert"><i class="fa fa-times" style="font-size:16pt;"></i> You can only report within the specified area.</div>');
    } else {
        if(roadName=="Unnamed Road"){
            $('.roadStatusShower').html('<div class="alert alert-info" role="alert"><i class="fa fa-check-circle" style="font-size:16pt;"></i> Road Name : '+roadName+', sorry this road is not in our database.</div>');
        }   else {
            $('.roadStatusShower').html('<div class="alert alert-info" role="alert"><i class="fa fa-search" style="font-size:16pt;"></i> Searching in database...</div>');
            //search for road in db
           db.collection("contractors").where("road_name", "==", roadName)
            .get()
            .then(function(querySnapshot) {
                if(querySnapshot.size==0){
                    $('.roadStatusShower').html('<div class="alert alert-info" role="alert"><i class="fa fa-check-circle" style="font-size:16pt;"></i> Road Name : '+roadName+', sorry this road is not in our database.</div>');
                } 
                var j = 0;
                //console.log(querySnapshot.size);
                querySnapshot.forEach(function(doc) {
                    // doc.data() is never undefined for query doc snapshots
                    contractor_data = doc.data();
                    if(j==0){
                        $('.roadStatusShower').html('<div class="alert alert-success" role="alert"><i class="fa fa-check-circle" style="font-size:16pt;"></i> Report for - '+roadName+'</div>');
                        $('.reportForm').fadeIn(300);
                        if(contractor_data.inConstruction){
                            $('#road_status_div').html("<b>ROAD UNDER CONSTRUCTION</b>");
                        }   else {
                            $('#road_status_div').html("<b>ROAD UNDER MAINTENANCE</b>");
                        }
                        $('#report_roadname').val(contractor_data.road_name+" ("+marker.getPosition().lng()+","+marker.getPosition().lat());                        
                    }                    
                    j = 1;
                });
            })
            .catch(function(error) {                
            });            
        }
    }
}

function showPlaceName(name) {
    $('.roadNameShower').html(name);
}

function makeReportsPieChart(data){
    var canvas = document.getElementById("barChart");
    var ctx = canvas.getContext('2d');
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 16;

    var rq;
    if(data.total_queries==0){
        rq = 0;
    } else {
        rq = (data.resolved_queries*100)/data.total_queries;
        
    }


    var data = {
        labels: ["Resolved Reports %", "Unresolved Reports %"],
        datasets: [
            {
                fill: true,
                backgroundColor: [
                    '#36A2EB',
                    '#FF6384'],
                data: [parseInt(rq), parseInt((100-rq))],
            }
        ]
    };
    var options = {
        
    };
    var myBarChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: options
    });

}

function make_one_report(data, doc_id){

    var status_text = "";
    if(data.status==0){
        status_text='<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-light" > 25%</button>--<button class="badge btn badge-light" > 50%</button>--<button class="badge btn badge-light" > 75%</button>--<button class="badge btn badge-light" > Resolved</button>';
    } else if(data.status==1){
        status_text='<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-light" > 50%</button>--<button class="badge btn badge-light" > 75%</button>--<button class="badge btn badge-light" > Resolved</button>';
    } else if(data.status==2){
        status_text= '<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 50%</button>--<button class="badge btn badge-light" > 75%</button>--<button class="badge btn badge-light" > Resolved</button>';
    }else if(data.status==3){
        status_text='<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 50%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 75%</button>--<button class="badge btn badge-light" > Resolved</button>'
    }
    else {
        status_text= '<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 50%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 75%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> Resolved    </button>';
    }
    return '<div class="card"><div class="card-body" style=""><h5 class="card-title font-weight-bold" style="display:inline-block;">'+data.title+'</h5><h6 class="card-subtitle mb-2 text-muted float-right" style="display: inline-block;">'+data.timestamp+'</h6><p class="card-text">'+data.description+'</p><a target="_blank" href="https://www.google.com/maps/search/?api=1&query='+data.lat+','+ data.lng+'" class="card-link">See Location in Map</a><div class="float-right" style="display: inline-block;">'+status_text+'</div></div></div><br>';
}


function setUserData(f){
    var html_in = "<div style='float:left;border-radius:100%;margin-right:15px;width:40px;height:40px;background:#888;color:#fff;font-size:20pt;padding:1px 10px;'><span class='fa fa-user'></span></div>"+f.fullname+"<br><div style='font-size:10pt;'>"+f.email+"</div>";
    $(".user_id_div").html(html_in);    
    $(".userNameDisplay").html(f.fullname+'\'s Profile');  
    $(".userInitalDisplay").html(f.fullname.substring(0,1));
    $(".usertotalReportsCount").html('<hr>Total Reports Submitted<br><b>'+f.total_queries+'</b><hr>');
    $(".report_status").html('Total Reports Submitted - <b>'+f.total_queries+'</b><br>Resolved Reports - <b>'+f.resolved_queries+'</b>');
    var star_count;    
    var star_text = "";
    var data = f;
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
    $('.userStarDisplay').html(star_text);
    $('.userRatingDisplay').html("Rating : "+f.points);
        
}
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

function loadReports(){
    document.getElementById("reports_shower").innerHTML="Loading...";        
    db.collection("queries")
    .onSnapshot(function(querySnapshot) {        
        document.getElementById("reports_shower").innerHTML="";                                             
        if(querySnapshot.size==0){
            document.getElementById("reports_shower").innerHTML="No reports to show. Please report about a road.";    
        }
        querySnapshot.forEach(function(doc) {          
            if(doc.data().user_id==user_id){
                var iDiv = document.createElement('div');                                    
                iDiv.innerHTML = make_one_report(doc.data(), doc.id);
                document.getElementById("reports_shower").append(iDiv);                                           
            }                                     
        }); 
        //console.log("Current cities in CA: ", cities.join(", "));
    });
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
            if(doc.id==user_id){
                //showMe = "background:#e9ebec;";
                iDiv.style.background="#f5f5f5";
            }
            iDiv.innerHTML = buildleaderboarduser(doc.data(), doc.id, rank);
            document.getElementById("leaderboard_users").append(iDiv);                                           
        }); 
        //console.log("Current cities in CA: ", cities.join(", "));
    });
}
function setUserInfo() 
            {
                    firebase.auth().onAuthStateChanged(function(user) {
                    if (user) 
                    {
                        var displayname=document.getElementById('displaynameask').value;                        
                        if (displayname!="")
                        {                            
                            firebaseUserData = {
                                  "fullname":displayname,
                                  "points":0,
                                  "email":user.email,
                                  "total_queries":0,   
                                  "resolved_queries":0                               
                            };
                            db.collection("users").doc(user.uid).set(firebaseUserData)
                            .then(function() {                                
                                document.getElementById('askFordisplayName').style.cssText="display:none !important;";   
                                checkForRealTime();                                
                                fetch_posts(0);                             
                            })
                            .catch(function(error) {
                                document.getElementById('err_show_display_name').innerHTML="<div style='color:red;'>Please try again.</div>";
                            });

                            
                        }
                        else 
                        {
                           document.getElementById('err_show_display_name').innerHTML="<div style='color:red;'>Please try again.</div>";
                        }
                    }
                    else 
                    {
                        
                    }
                }
            );
        }

        function showsdnvb() 
        {
            document.getElementById('all_except_side_nav').style.cssText="margin-left:90vw !important;"
            document.getElementById('sidnavb').style.cssText="margin-left:0px !important;width:90vw;"
            document.getElementById('sidnavcloset').style.cssText="display:block !important;"
            
           
        }
        function closdnvb() 
        {
            document.getElementById('all_except_side_nav').style.cssText="margin-left:0px !important;"
            document.getElementById('sidnavb').style.cssText="margin-left:-100vw !important;width:100vw;"
            document.getElementById('sidnavcloset').style.cssText="display:none !important;"
        }
        function openlistdp(vv)
        {
            if (vv.classList.contains("random"))
            {
                document.getElementById('dpnlist').style.cssText="display:none !important;";
                vv.classList.remove("random");
            }
            else {
                    document.getElementById('dpnlist').style.cssText="display:block !important;"
                    vv.classList.add("random");
            }
            
        };

        function all_hide(){
            $('#homec').hide();
            $('#ratingc').hide();   
            $('#leaderboardc').hide();
            $('#reportsc').hide();
        }
        $(document).ready(function() {  
            $(".user_id_div").html("<div style='float:left;border-radius:100%;margin-right:15px;width:40px;height:40px;background:#888;color:#fff;font-size:20pt;padding:1px 10px;'> </div>Loading...<br><div style='font-size:10pt;'>&nbsp;</div>");          
            all_hide();            
            $('#homec').fadeIn(300);
            $(".userNameDisplay").html('Loading...');  
            $('.reportForm').hide();
            //$('#leaderboardc').fadeIn(300);
            $('#map').css({'position':'none !important'});  
            
            $('#road_status_div').html(" ");
            loadLeaderBoardData(); 
            loadReports();                                      
        });
        function clickedlinnb(v) 
        {
            v.classList.add('clickednb');
            $('.linsnb').not(v).each(function(){
                $(this).removeClass('clickednb');
             });
        }
        function changedpna() 
        {
            document.getElementById('askFordisplayName').style.cssText="display:block !important;";
        }
        function loadinc(x)  
        {                 
            all_hide();   
            $('#'+x).fadeIn(300);
            
            var sw = window.innerWidth;
            //window.alert(sw);
            if (sw<900) {
            document.getElementById('all_except_side_nav').style.cssText="margin-left:0px !important;"
            document.getElementById('sidnavb').style.cssText="margin-left:-100vw !important;width:100vw;"
            document.getElementById('sidnavcloset').style.cssText="display:none !important;"
            
            }
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
                infoWindow.setContent('You are here');
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
                    var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(lati, long), new google.maps.LatLng(pos.lat, pos.lng)); 
                    if(distance<radiusInMeter){
                        getPlaceNameAndId(long, lati); 
                    }   else {                        
                        checkForRoadInDB(" ", false); 
                    }                                                       
                });

                var circle = new google.maps.Circle({
                    map:map,
                    center:new google.maps.LatLng(pos.lat, pos.lng),
                    radius:radiusInMeter,
                    strokeColor:"Red",
                    fillColor:"rgba(255,0,0,0.2)",
                    editable:false
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
                var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
                targetUrl = url
                fetch(proxyUrl + targetUrl)
                    .then(blob => blob.json())
                    .then(data => {                    
                        checkForRoadInDB(data.result.name, true);                                                                        
                        return data;
                    });
            });
    }