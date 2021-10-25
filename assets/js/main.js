// Throttling
// From: https://stackoverflow.com/a/27078401
// License: MIT, (C)2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//
// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}
// Check Bootstrap breakpoints
var whichBreakpointInitialized = false;
var breakpoints = ["xs", "sm", "md", "lg", "xl"];
function whichBreakpoint() {
    function checkIfBlock(target) {
        return $(target).css("display") == "block";
    }
    function checkSize() {
        for (var i = 0; i < breakpoints.length; i++) {
            if(checkIfBlock(".breakpoint-check ." + breakpoints[i]))
                return i;
        }
        return -1;
    }
    function init() {
        if (whichBreakpointInitialized) return false;
        // Add some invisible elements with Bootstrap CSS visibile utility classes
        var html = "";
        for (var i = 0; i < breakpoints.length; i++) {
            var classList = [];
            classList.push(breakpoints[i]);
            if (i != 0) {
                classList.push("d-" + breakpoints[i] + "-block");
            } else {
                classList.push("d-block");
            }

            if (i != breakpoints.length - 1) {
                classList.push("d-" + breakpoints[i + 1] + "-inline");
            }

            html += '<span class="' + classList.join(" ") + '"></span>';
        }
        $("body").append('<div style="display:none;" class="breakpoint-check">' + html + "</div>");
        whichBreakpointInitialized = true;
    }
    init();
    return checkSize();
}
(function($) {
    var remPx = parseFloat(getComputedStyle(document.body).fontSize);
    // Frontpage slick navigation
    var isRTL = $('body').hasClass('persian') || $('body').css('direction') === 'rtl';
    if(isRTL)
    {
        $('nav#main-navigation ul').attr("dir","rtl");
    }
    $("#main-navigation .inner ul").slick({
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 10,
        autoplay: false,
        variableWidth: true,
        nextArrow: "nav#main-navigation .next",
        prevArrow: "nav#main-navigation .prev",
        rtl: isRTL
    });
    var $body = $("body");
    var hasHeaderWrapped = $body.hasClass("layout-post") || $body.hasClass("layout-page");
    var hasSidebar = $("body").hasClass("layout-default");
    // Sticky header
    var $header = hasHeaderWrapped ? $("#header-wrapper") : $("nav#main-navigation");

    var headerOffsetYDefault = $header[0].offsetTop;
    var headerHeight = $header.outerHeight(false);
    var lastScrollTop = $(window).scrollTop();
    var sticked = false;
    $(window).scroll(
        throttle(
            function(e) {
                var scrollTop = $(this).scrollTop();
                if (window.pageYOffset > headerOffsetYDefault) {
                    $header.addClass("sticky");
                    sticked = true;
                    $header.next().css("margin-top", headerHeight);
                } else {
                    $header.next().css("margin-top", 0);
                    sticked = false;
                    $header.removeClass("sticky");
                }
                if (sticked) {
                    if (hasHeaderWrapped) {
                        if (scrollTop < lastScrollTop) {
                            // scroll up: show header
                            $header.animate({ top: 0 }, 300);
                        } else {
                            // scroll down: hide header
                            $header.animate({ top: -1 * headerHeight }, 300);
                        }
                    }
                }
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            },
            hasHeaderWrapped ? 300 : 30
        )
    );

    // Night mode
    function setNightMode(state, noFade) {
        function switchIcons(_, from, to, noFade) {
            if (_.data("absolute") != "yes") {
                var width = from.width();
                var height = from.height();
                _.width(_.width());
                _.height(_.height());
                to.width(width);
                to.height(height);
                from.width(width);
                from.height(height);
                from.css({ position: "absolute" });
                to.css({ position: "absolute" });
                _.data("absolute", "yes");
            }
            if (noFade) {
                from.hide();
                to.show();
            } else {
                from.fadeOut();
                to.fadeIn();
            }
        }
        var $headerSwitchBtn = $("header#header .night-mode"),
            $dayIcon = $headerSwitchBtn.children(".day"),
            $nightIcon = $headerSwitchBtn.children(".night");
        switchIcons($headerSwitchBtn, state ? $dayIcon : $nightIcon, state ? $nightIcon : $dayIcon, noFade);

        if (state) $("body").addClass("night");
        else $("body").removeClass("night");
        window.sessionStorage.setItem("night-mode", state ? "yes" : "no");
    }

    var prefersDark =
        (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) || window.sessionStorage.getItem("night-mode") == "yes";
    if (prefersDark) {
        console.log("prefers dark");
        setNightMode(true, true);
    } else {
        console.log("prefers light");
    }
    $("header#header .night-mode").click(function(e) {
        if (!$("body").hasClass("night")) {
            setNightMode(true, false);
        } else {
            setNightMode(false, false);
        }
        e.preventDefault();
    });
    // sticky sidebar
    if (typeof $.fn.stickySidebar !== "undefined") {
        if (hasSidebar) {
            var sidebarSticked = false;
            
            function checkStickySidebar(){
                function stickSidebar(state) {
                    if (state) {
                        console.log("wants sticking");
                        if (!sidebarSticked) {
                            console.log("sticking");
                            $("aside#sidebar").stickySidebar({
                                topSpacing: headerHeight + 1 * remPx,
                                bottomSpacing: 60,
                                containerSelector: "section#frontpage-content",
                                resizeSensor: true
                            });
                            sidebarSticked = true;
                        }
                    } else {
                        console.log("wants unsticking");
                        if (sidebarSticked){
                            console.log("unsticking");
                            $("aside#sidebar")
                                .data("stickySidebar")
                                .destroy();
                            $("aside#sidebar").data("stickySidebar",null);
                            sidebarSticked = false;
                        }
                    }
                }
                var bk = whichBreakpoint() ;
                console.log(bk);
                if(bk < 2){
                    console.log("stick");
                    stickSidebar(false);
                }else{
                    console.log("unstick");
                    stickSidebar(true);
                }
            }
            $(window).resize(throttle(checkStickySidebar, 300));
            checkStickySidebar();
        }
    }

    // infinite scroll
    var loadingPlaceholder =
        '<div class="ph-item loading-post">' +
        '<div class="ph-col-3 loading-post-picture">' +
        '<div class="ph-picture"></div>' +
        "</div>" +
        '<div class="ph-col-8 loading-post-content">' +
        '<div class="ph-row">' +
        '<div class="ph-col-6 big"></div>' +
        '<div class="ph-col-6 empty big"></div>' +
        '<div class="ph-col-4"></div>' +
        '<div class="ph-col-8 empty"></div>' +
        '<div class="ph-col-6"></div>' +
        '<div class="ph-col-6 empty"></div>' +
        '<div class="ph-col-12"></div>' +
        '<div class="ph-col-12 empty"></div>' +
        '<div class="ph-col-4"></div>' +
        '<div class="ph-col-6 empty"></div>' +
        '<div class="ph-col-2"></div>' +
        "</div>" +
        "</div>" +
        "</div>";
    // $(loadingPlaceholder.repeat(20)).appendTo(".loading");
})(jQuery);
