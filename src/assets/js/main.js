$(document).ready(function(){
    $('.ct_search_icon').click(function(){
        $('.ct_search_input').toggleClass('ct_show_search')
    })

    $('.ct_menu_bar').click(function(){
        $('.ct_nav_bar ul').addClass('ct_show_menu')
    })
    $('.ct_close_menu').click(function(){
        $('.ct_nav_bar ul').removeClass('ct_show_menu')
    })

    // Testimonial js S
    $('.ct_testimonial_slider').owlCarousel({
        loop:true,
        margin:10,
        autoplayTimeout: 4000,
        autoplay: true,
        smartSpeed: 1500,
        items:1,
        nav:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:3
            }
        }
    })
    // Testimonial js E


    AOS.init();
// $('.ct_i_am_user_btn').click(function(){
//     // $(this).addClass('ct_hide_btn');
//     // $('.ct_i_am_coach_btn').addClass('');
//     $('.ct_i_am_user_img').addClass('ct_hide_img12')
//     $('.ct_i_am_coach_img').addClass('ct_show_img12')

// })
// $('.ct_i_am_coach_btn').click(function(){
//     $(this).addClass('');
//     $('.ct_i_am_coach_btn').removeClass('')
//     $('.ct_i_am_coach_img').addClass('ct_hide_img12')
//     $('.ct_i_am_user_img').addClass('ct_show_img12')
// })
// $('.ct_i_am_user_btn').click(function(){
//     $('.ct_i_am_user_img').addClass('ct_hide_img12');
//     $('.ct_i_am_coach_img').addClass('ct_show_img12')
    

// })
// $('.ct_i_am_coach_btn').click(function(){

//     $('.ct_i_am_user_img').removeClass('ct_hide_img12');
//     $('.ct_i_am_coach_img').removeClass('ct_show_img12')
//     $('.ct_i_am_coach_img').addClass('ct_hide_img12');
//     $('.ct_i_am_user_img').removeClass('ct_show_img12')
//     $('.ct_i_am_coach_img').removeClass('ct_hide_img12');
// })
    
})

jQuery(document).ready(function() {
    jQuery('.ct_loader_main').fadeOut();
});


$(window).scroll(function() {    
    var scroll = $(window).scrollTop();

     //>=, not <=
    if (scroll >= 300) {
        //clearHeader, not clearheader - caps H
        $("header").addClass("ct_sticky_menu");
    }else{
        $("header").removeClass("ct_sticky_menu");
    }
}); //missing );



$(document).ready(function(){
    $('#ct_audio_btn').click(function(){
        $(this).addClass('ct_uploaded_btn_active');
        $('#ct_video_btn').removeClass('ct_uploaded_btn_active');
        $('#ct_audio').addClass('d-block');
        $('#ct_video').removeClass('d-block');
    })
    $('#ct_video_btn').click(function(){
        $(this).addClass('ct_uploaded_btn_active')
        $('#ct_audio_btn').removeClass('ct_uploaded_btn_active');
        $('#ct_video').addClass('d-block');
        $('#ct_audio').removeClass('d-block')
    })

    // $('.ct_notification_icon').click(function(){
    //     $(".ct_notification_main_div").addClass('ct_show_notification')
    // })

    $('.ct_message_user_lit li').click(function(){
        $('.ct_right_message_area').addClass('active')
    })
    $('.ct_back_to_list').click(function(){
        $('.ct_right_message_area').removeClass('active')
    })
})


