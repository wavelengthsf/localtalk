/* Initilize slided down navigation menu */
$(function () {
    var slideUpDelayer;
    
    $('#header-container').show(0);
    /*@todo Replace to Tiggzi*/
    if ($.cookie("tiggr-preview-menu")==null) {
        $('#header-container').slideUp(0);
    }

    $('#header-trigger').click(function(event) {
       $('#header-container').slideDown(); 
       if (slideUpDelayer) {
           clearTimeout(slideUpDelayer);
           slideUpDelayer = null;
       }
       /*@todo Replace to Tiggzi*/
       $.cookie("tiggr-preview-menu", "visible");
    });
    
    $('#header-close-trigger').click(function(event){
    	slideUpDelayer = null;
    	$('#header-container').slideUp();
        /*@todo Replace to Tiggzi*/
    	$.cookie("tiggr-preview-menu", null);
    });
    
    /*
    $('#header').mouseleave(function(event) {
        slideUpDelayer = setTimeout(function() {
            $('#header-container').slideUp();
        }, 1000);
    });
    
    $('#header').mouseenter(function(event) {
        if (slideUpDelayer) {
            clearTimeout(slideUpDelayer);
            slideUpDelayer = null;
        }
    });
    */
});            