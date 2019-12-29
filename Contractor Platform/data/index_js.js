var db = firebase.firestore();
var user_id = null;
var curr_query_data = null;
$(document).ready(()=>{
    $('.before_login').hide();
    $('.after_login').hide();
    $('.before_login').fadeIn(300);
});
    
function login() 
{
    if(true){
        var login_key = document.getElementById("login_key").value;
        if (login_key=="") 
        {
            document.getElementById("err_show1").innerHTML="Please fill all fields.";            
        } else
        {            
            var db = firebase.firestore();
            db.collection("contractors").where("user_id", "==", login_key)
            .get()
            .then(function(querySnapshot) {                    
                if(querySnapshot.size==0){   
                    console.log(login_key);
                    document.getElementById("err_show1").innerHTML="Invalid Key";                   
                } else {
                    $('.before_login').hide();
                    $('.after_login').fadeIn(300);
                    user_id = login_key;
                    load_queries(user_id);
                    load_contractor_data(user_id);
                }
                
            })
            .catch(function(error) {                
            }); 
        }
    }        
}

function load_contractor_data(user_id){
    db.collection("contractors").doc(user_id)
    .onSnapshot(function(doc) {
        makeReportsPieChart(doc.data());
        console.log("Current data: ", doc.data());
    });
}

function onClick(data_uid,doc_id, curr_status)
{
    console.log("clicked "+doc_id);
    if (!confirm('Are you sure?')) return false;
    var updated_status=curr_status+1;    
    if(updated_status > 4) {updated_status=4;   } 

    //update query status
    db.collection("queries").doc(doc_id).update({status:updated_status});

     //update contractor status

    //update user status
    if(updated_status==4 && curr_status==3){
        db.collection("contractors").doc(user_id).update({resolved_reports:firebase.firestore.FieldValue.increment(1)});
        db.collection("users").doc(data_uid).update({resolved_queries:firebase.firestore.FieldValue.increment(1)});
    }
}

function updateLink(){
    var new_link = $('#drive_link_text').val();
    if(new_link==""){
        alert("Please fill all the details.");
        return false;
    } else {
        db.collection('contractors').doc(user_id).update({drive_link:new_link});
        alert("Link Updated!!");
    }   
}

function makeReportsPieChart(data){
    
    $('.folder_link').html('<br><br>Share this drive link with Government Officials : <br><br><input type="text" id="drive_link_text" class="form-control" value="'+data.drive_link+'"><br><button type="submit" class="btn btn-sm btn-primary" onclick="updateLink();">Submit</button>');
    $('.report_info').html('Total Requests - <b>'+data.total_reports+'</b><br>Resolved Requests - <b>'+data.resolved_reports+'</b>');
    $('.contractor-name').html('<h3>'+data.name+'</h3>');
    var canvas = document.getElementById("barChart");
    var ctx = canvas.getContext('2d');
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.defaultFontSize = 16;

    var rq;
    if(data.total_queries==0){
        rq = 0;
    } else {
        rq = (data.resolved_reports*100)/data.total_reports;
        
    }


    var data = {
        labels: ["Resolved  Reports %", "Unresolved Reports %"],
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
        status_text='<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> 25%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> 50%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> 75%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> Resolved</button>';
    } else if(data.status==1){
        status_text='<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> 50%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> 75%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> Resolved</button>';
    } else if(data.status==2){
        status_text= '<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 50%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> 75%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> Resolved</button>';
    }else if(data.status==3){
        status_text='<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 50%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 75%</button>--<button class="badge btn badge-light" onclick="onClick(\''+data.user_id+'\',\''+doc_id+'\','+data.status+');"> Resolved</button>'
    }
    else {
        status_text= '<button class="badge btn badge-success"><i class="fa fa-check"></i> Received</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 25%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 50%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> 75%</button>--<button class="badge btn badge-success"><i class="fa fa-check"></i> Resolved    </button>';
    }
    return '<div class="card"><div class="card-body" style=""><h5 class="card-title font-weight-bold" style="display:inline-block;">'+data.title+'</h5><h6 class="card-subtitle mb-2 text-muted float-right" style="display: inline-block;">'+data.timestamp+'</h6><p class="card-text">'+data.description+'</p><a target="_blank" href="https://www.google.com/maps/search/?api=1&query='+data.lat+','+ data.lng+'" class="card-link">See Location in Map</a><div class="float-right" style="display: inline-block;">'+status_text+'</div></div></div><br>';
}


function load_queries(user_id){       
    
    db.collection("queries").where("contractor_id","==",user_id)
    .onSnapshot(function(querySnapshot) {
        var shower = document.getElementById("queries_shower");
        shower.innerHTML="";
        querySnapshot.forEach(function(doc) {
            var iDiv = document.createElement('div');                        
            iDiv.innerHTML = make_one_report(doc.data(), doc.id);
            shower.append(iDiv);
        });
        });
}