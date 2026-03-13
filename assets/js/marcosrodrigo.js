/*!
=========================================================
* Marcos Rodrigo - Personal Website
=========================================================
*/

// smooth scroll
$(document).ready(function(){
    $(".navbar .nav-link").on('click', function(event) {

        if (this.hash !== "") {

            event.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 700, function(){
                window.location.hash = hash;
            });
        } 
    });
});

// portfolio filters
$(window).on("load", function() {
    var container = $(".portfolio-container");

    // Initialize Isotope with chronological sorting
    container.isotope({
        filter: '*',
        sortBy: 'order',
        getSortData: {
            order: function(itemElem) {
                return -parseInt($(itemElem).attr('data-order'));
            }
        },
        animationOptions: {
            duration: 750,
            easing: "linear",
            queue: false
        }
    });

    // Filter click handler
    $(".filters a").click(function() {
        $(".filters .active").removeClass("active");
        $(this).addClass("active");

        var selector = $(this).attr("data-filter");
        container.isotope({
            filter: selector,
            sortBy: 'order',
            animationOptions: {
                duration: 750,
                easing: "linear",
                queue: false
            }
        });
        return false;
    });
});


// ──────────────────────────────────────────────
// Dark Mode Toggle
// ──────────────────────────────────────────────
(function() {
    var toggle = document.getElementById('theme-toggle');
    var iconLight = toggle.querySelector('.theme-icon-light');
    var iconDark = toggle.querySelector('.theme-icon-dark');
    var html = document.documentElement;

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            iconLight.style.display = 'none';
            iconDark.style.display = 'inline';
        } else {
            iconLight.style.display = 'inline';
            iconDark.style.display = 'none';
        }
    }

    // Initialize: only apply dark if explicitly saved
    var saved = localStorage.getItem('theme');
    if (saved) {
        setTheme(saved);
    }

    toggle.addEventListener('click', function() {
        var current = html.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
})();

// ──────────────────────────────────────────────
// Scroll Animations: Section Reveals + Progress Bars
// ──────────────────────────────────────────────
(function() {
    // --- Section Reveal ---
    var revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var isMobile = window.innerWidth <= 768;
        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: isMobile ? 0.02 : 0.1,
            rootMargin: isMobile ? '0px 0px 0px 0px' : '0px 0px -50px 0px'
        });

        revealElements.forEach(function(el) {
            revealObserver.observe(el);
        });
    } else {
        // Fallback: reveal everything immediately
        revealElements.forEach(function(el) {
            el.classList.add('revealed');
        });
    }

    // --- Progress Bar Animation ---
    var progressBars = document.querySelectorAll('.progress-bar');

    // Store target widths and reset to 0
    progressBars.forEach(function(bar) {
        var targetWidth = bar.style.width || bar.getAttribute('aria-valuenow') + '%';
        bar.setAttribute('data-width', targetWidth);
        bar.style.width = '0%';
    });

    if ('IntersectionObserver' in window && progressBars.length > 0) {
        var resumeSection = document.getElementById('resume');

        if (resumeSection) {
            var progressObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        progressBars.forEach(function(bar, index) {
                            setTimeout(function() {
                                bar.style.width = bar.getAttribute('data-width');
                            }, index * 100);
                        });
                        progressObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2
            });

            progressObserver.observe(resumeSection);
        }
    } else {
        // Fallback: set widths immediately
        progressBars.forEach(function(bar) {
            bar.style.width = bar.getAttribute('data-width');
        });
    }
})();

// google maps
function initMap() {
// Styles a map in night mode.
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.674, lng: -73.945},
        zoom: 12,
        scrollwheel:  false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
      styles: [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
      ]
    });
}
