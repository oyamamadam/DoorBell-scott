$(function(){

setTimeout(function(){ 

if(device.platform==="Android"){
	$('body').attr("toggle-with-version","false");
}else{
	if(Number(device.version) >= 9 ){
		$('body').attr("toggle-with-version","true");
		toggleWithVersion();
	}else{
		$('body').attr("toggle-with-version","false");
	}
}
}, 1000);

//menu  toggle effect

$(".toggle").on("click",function(){

openAndCollapse();

$(".parent-menu").removeClass('active');
var i=0;
while(i<20){
    
if($(this).parents().eq(i).hasClass('parent-menu')){
	$(this).parents().eq(i).addClass('active');
	break;
}

i++;    
}

});

function toggleWithVersion(){

$("a#side-nav-menu-selecter").off('click').on("click",function(){ 
if($("#app-body").hasClass("sidebar-open")){

	$("#app-body").removeClass("sidebar-open");

}else{

	$("#app-body").addClass("sidebar-open");

}

});

}

function openAndCollapse(){

	if(!$("#app-body").hasClass("sidebar-collapse")){
		
		$("#app-body").addClass("sidebar-collapse");

	}
	if($("#app-body").hasClass("sidebar-open")){
		
	$(".sidebar-toggle").trigger("click");
	}

}


$('body').on('click',function(event){


if(event.target.id !=$(".sidebar-toggle").attr('id')){

	$("#app-body").removeClass("sidebar-open");
	$("#app-body").addClass("sidebar-collapse");
}

});

$('.required-text-box').on('blur',function(){

$(this).next().next().find('.req').show();

});



});
