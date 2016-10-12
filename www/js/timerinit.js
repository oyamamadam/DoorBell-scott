$(function(){
function initTimePicker(){

if(!$('#starttimer').hasClass('initialized')){

$('#starttimer').off().mobiscroll().time({
	onSelect: setMinMax,
	timeFormat: "hh:ii:A",
	theme: "android",     
  mode: "scroller",        
  display: "inline",
  lang: ""      
});
$('#starttimer').addClass('initialized');
}

if(!$('#endtimer').hasClass('initialized')){

$('#endtimer').off().mobiscroll().time({
	timeFormat: "hh:ii:A",
	theme: "android",      
  mode: "scroller",        
  display: "inline",
  lang: ""        
});
$('#endtimer').addClass('initialized');
$(".dwl").attr("style","display:block !important;color:#DADADA;");
}
	$(".loading-container").hide();
 $("#starttimer_container,#endttimer_container,.timer-container").show();
}

function setMinMax(){

 $('#endtimer').scroller('option', 'minDate', $('#starttimer').scroller('getDate'));

}


function initDateTimePicker(){

if(!$('#dstDateTimepicker').hasClass('initialized')){ 

$('#dstDateTimepicker').off().mobiscroll().datetime({
	dateFormat: "dd-mm-yy",
	timeFormat: "hh:ii:A",
 	theme: "android",    
	mode: "scroller",       
	display: "bubble", 
  minDate: new Date(),  
  maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   
  stepMinute: 1  
});
$('#dstDateTimepicker').addClass('initialized');
}
	$(".loading-container").hide();
	$(".donot-display-any-content-if-ble-is-not-connected").show();
 $("#dstDateTimepicker_container").show();

}



setTimeout(function(){
if($("body").attr("ISCONNECTED")=="true"){

if($(".main-header").attr("page")=="timer"){
initTimePicker();
}else if($(".main-header").attr("page")=="settings"){
initDateTimePicker();
}
}else{

$(".donot-display-any-content-if-ble-is-not-connected").hide();

}
}, 1000);

});
