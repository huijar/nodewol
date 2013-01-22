var animation
var myPath
var e
var e2
var m
var p

var hours = [
    [12, 0],
    [1, 13],
    [2, 14],
    [3, 15],
    [4, 16],
    [5, 17],
    [6, 18],
    [7, 19],
    [8, 20],
    [9, 21],
    [10, 22],
    [11, 23],
];

var h_coords = []
var m_coords = []

var populate_coords = function(sr, br, baser) {
    var max = 12
    var r = sr
    for (var i = 0; i < max; ++i)
    {
        time = i

        var a = 2*time/max

        var div = max
        
        if (a > 0.5) a = 1 - a

        // Either 12 o'clock or 6 o'clock
        if (time == 0 || time == div/2)
        {
            var ex = 0
            var ey = (time ? 1 : -1) * r
        }
        else if (time == div/4 || time == 3*div/4) // 3 o'clock or 9 o'clock
        {
            var ex = (time == div/4 ? 1 : -1) * r
            var ey = 0
        }
        else
        {
            a *= Math.PI

            var ex = (time > 3*div/4 ? -1 : 1) * r * Math.tan(a) / Math.sqrt(Math.pow(Math.tan(a),2)+1)
            var ey = (time < div/4 || time > 3*div/4 ? -1 : 1) * Math.sqrt(Math.pow(r,2) - Math.pow(ex,2))
        }

        h_coords[i] = [ex + baser, ey + baser]
            
    }

    r = br

    max = 60
    for (var i = 0; i < max; ++i)
    {
        time = i

        var a = 2*time/max

        var div = max
        
        if (a > 0.5) a = 1 - a

        // Either 12 o'clock or 6 o'clock
        if (time == 0 || time == div/2)
        {
            var ex = 0
            var ey = (time ? 1 : -1) * r
        }
        else if (time == div/4 || time == 3*div/4) // 3 o'clock or 9 o'clock
        {
            var ex = (time == div/4 ? 1 : -1) * r
            var ey = 0
        }
        else
        {
            a *= Math.PI

            var ex = (time > 3*div/4 ? -1 : 1) * r * Math.tan(a) / Math.sqrt(Math.pow(Math.tan(a),2)+1)
            var ey = (time < div/4 || time > 3*div/4 ? -1 : 1) * Math.sqrt(Math.pow(r,2) - Math.pow(ex,2))
        }

        m_coords[i] = [ex + baser, ey + baser]
            
    }
}

function findTotalOffset(obj) {
    var ol = ot = 0;
    if (obj.offsetParent)
    {
        do
        {
            ol += obj.offsetLeft;
            ot += obj.offsetTop;
        }
        while (obj = obj.offsetParent);
    }
    return {x : ol, y : ot}
}

/*
var genpath = function (x, y, r, time, morh, curr) {
    var path = "M"
    path += x + "," + y + "A" + r + "," + r + ",0,"

    var laf = 0 // The large-arc-flag
    var sf = 1 // The sweep-flag

    // Then the hard(er) part, figuring the endpoint

    var div = morh == 'h' ? 12 : 60;

    time = time % div

    var a = 2*time/div
    
    if (a > 0.5) a = 1 - a

    // Either 12 o'clock or 6 o'clock
    if (time == 0 || time == div/2)
    {
        var ex = 0
        var ey = (time ? 1 : -1) * r
    }
    else if (time == div/4 || time == 3*div/4 ) // 3 o'clock or 9 o'clock
    {
        var ex = (time == div/4 ? 1 : -1) * r
        var ey = 0
    }
    else
    {
        a *= Math.PI

        //var ex = (time > div/2 ? -1 : 1) * r * Math.tan(a) / Math.sqrt(Math.tan(a)^2+1)
        //var ey = (time < div/4 || time > 3*div/4 ? -1 : 1) * Math.sqrt(r^2 - ex^2)
        var ex = (time > 3*div/4 ? -1 : 1) * r * Math.tan(a) / Math.sqrt(Math.pow(Math.tan(a),2)+1)
        var ey = (time < div/4 || time > 3*div/4 ? -1 : 1) * Math.sqrt(Math.pow(r,2) - Math.pow(ex,2))
    }

    //if (curr - time < div/2 && curr > time) sf = 0
    //if (( curr <= div/4 || curr >= 3*div/4 ) && (time <= div/4 || time >= 3*div/4)) sf = 0

    ex += 175
    ey += 175

    path += laf + "," + sf + ","
    path += ex + "," + ey
    
    return path
}
*/

var ClockView = Backbone.View.extend({
    text: $("<h1 class='center'></h1>"),
    time: $("<span></span>"),
    img: document.createElement('div'),
    imgcont: document.createElement('div'),
    initialize: function() {
        // Radiuses
        this.rad = 175
        this.srad_mult = 0.6
        this.srad = this.rad * this.srad_mult
        this.ssrad = this.rad * ( 1 - this.srad_mult ) / 2

        var rad = this.rad
        var srad_mult = this.srad_mult
        var srad = this.srad
        var ssrad = this.ssrad

        populate_coords(srad - ssrad, rad - ssrad, rad)

        // DOM

        $(this.img).attr('id', 'img')
        $(this.img).css('width', rad * 2 + 'px')
        $(this.img).css('height', rad * 2 + 'px')
        $(this.img).css('display', 'inline-block')
        this.text.html('up at ')
        this.time.html(this.model.toString())
        this.text.append(this.time)
        $(this.el).append(this.text)
        $(this.imgcont).append(this.img)
        $(this.el).append(this.imgcont)

        // Shapes

        this.paper = Raphael(this.img, rad*2, rad*2)
        this.m_circle = this.paper.circle(rad, rad, rad)
        this.h_circle = this.paper.circle(rad, rad, srad)
        this.m = this.paper.circle( rad, rad + srad + ssrad, ssrad )
        this.h = this.paper.circle( rad - srad + ssrad, rad, ssrad )

        // Texts

        this.h_text = this.paper.text( this.h.attr('cx'), this.h.attr('cy'), this.model.h() )
        this.m_text = this.paper.text( this.m.attr('cx'), this.m.attr('cy'), this.model.m() )

        this.h_text.attr({ "font-family": "'ColaborateLightRegular', Helvetica, Arial, sans-serif" });
        this.m_text.attr({ "font-family": "'ColaborateLightRegular', Helvetica, Arial, sans-serif" });

        // Colours

        var dark = "#222"
        var light = "#ccc"

        var darkg = "r(0.5, 0.2)#444-#222"
        var lightg = "r(0.5, 0.2)#eee-#ccc"
        var strokeg = "r(0.5, 0.2)#333-#555"
        var stroke = "#777"

        var darkc = { "fill": darkg, "stroke": stroke }
        var lightc = { "fill": lightg, "stroke": stroke }

        var darkt = { "fill": dark }
        var lightt = { "fill": light }

        this.m_circle.attr(lightc)
        this.h_circle.attr(darkc)
        this.h.attr(lightc)
        this.m.attr(darkc)
        this.m_text.attr(lightt)
        this.h_text.attr(darkt)

        // Other styles

        var disable_sel = {
            "-webkit-touch-callout": "none",
            "-webkit-user-select": "none",
            "-khtml-user-select": "none",
            "-moz-user-select": "none",
            "-ms-user-select": "none",
            "-o-user-select": "none",
            "user-select": "none",
            "cursor": "default"
        }

        var fonts = {"font-size": ssrad, "font-weight": "bold" }

        this.h_text.attr(fonts)
        this.m_text.attr(fonts)

        $("text").css(disable_sel)
        $("tspan").css(disable_sel)

        this.m_circle.attr('stroke-width', 0)
        this.h_circle.attr('stroke-width', 0)

        this.model.bind('change', this.render, this)

        // Component events

        this.h.drag(function(dx,dy,x,y,event) {
            this.conv_coords(event, false, this.h_circle)
        }, false, false, this)

        this.m.drag(function(dx,dy,x,y,event) {
            this.conv_coords(event, false, this.m_circle)
        }, false, false, this)

        this.m_text.drag(function(dx,dy,x,y,event) {
            this.conv_coords(event, false, this.m_circle)
        }, false, false, this)

        this.h_text.drag(function(dx,dy,x,y,event) {
            this.conv_coords(event, false, this.h_circle)
        }, false, false, this)

        this.h_circle.drag(function(dx,dy,x,y,event) {
            this.conv_coords(event, false, this.h_circle)
        }, false, false, this)

        this.m_circle.drag(function(dx,dy,x,y,event) {
            this.conv_coords(event, false, this.m_circle)
        }, false, false, this)
    },

    events: {
        'click': 'click'
    },

    conv_coords: function(event, round, context) {
        round = round || false
        context = context || false

        if (event.target.r == undefined && !context)
        {
            return
        }
        var r = context !== false ? context.attr('r') : event.target.r.animVal.value
        //var lt = findTotalOffset(document.getElementById('img'))
        var lt = findTotalOffset(this.img)
        //var lt = findTotalOffset(this.m_circle.node)
        var x = event.pageX - lt.x - this.rad
        var y = event.pageY - lt.y - this.rad

        if ( y != 0 )
            var a = Math.atan(x/y)
        else
            var a = 0 

        // Is this the minute or the hour circle?
        if ( r <= this.srad + 1 )
        {
            var dev = 12
            var mult = dev/(Math.PI*2)
            var morh = 'h'
        }
        else
        {
            var dev = 60
            var mult = dev/(Math.PI*2)
            var morh = 'm'
        }

        // Which quadrant are we on?
        if ( x >= 0 && y <= 0 )
            var mult2 = 0
        else if ( x >= 0 && y >= 0 )
            var mult2 = 1
        else if ( x <= 0 && y >= 0 )
            var mult2 = 2
        else if ( x <= 0 && y <= 0 )
            var mult2 = 3

        // Do we need to "flip" the angle? (for 3-6 and 9-12)
        a = mult2 % 2 ? Math.PI/2 - a : a

        var time = Math.round((Math.abs(a)+mult2*Math.PI/2)*mult) % dev

        // Formatting
        if ( morh == 'h' )
        {
            var start = this.model.h() % dev
            var end = time
            var d = start - end
            var d2 = dev + start - end
            var inc = ( ( d > 0 && d < dev/2 ) || ( d2 > 0 && d2 < dev/2 ) ? -1 : 1 )
            for (var i = start; i != end; i = (dev + i + inc) % dev)
            {
                // Skipped past the am/pm point, need to flip
                if ( ( i == 1 && inc == -1 ) || ( i == 0 && inc == 1 ) )
                {
                    this.model.togglepm()
                }
            }
            time = hours[time % hours.length][(this.model.pm() ? 1 : 0)]
        }

        // Round to the nearest 5 minutes
        if ( morh == 'm' && round ) 
            time = Math.round(time / 5) * 5 % dev

        // Add a preceding 0
        if ( time < 10 ) time = '0' + time

        this.model.set(morh, time)
    },

    click: function(event) {
        this.conv_coords(event, true)
    },

    render: function() {
        var morh = 'h'
        // Hours
        var dev = hours.length
        var start = this.h_text.attr('text') % dev
        var end = this.model.h() % dev
        if ( start != end )
        {
            morh = 'h'
            var d = start - end
            var d2 = dev + start - end
            var inc = ( ( d > 0 && d < dev/2 ) || ( d2 > 0 && d2 < dev/2 ) ? -1 : 1 )

            var path = "M" + h_coords[start][0] + "," + h_coords[start][1] + "L"

            for (i = start; i != end; i = (dev + i + inc) % dev)
            {
                path += h_coords[i][0] + "," + h_coords[i][1] + ","
            }

            path += h_coords[end][0] + "," + h_coords[end][1]
        }

        // Minutes
        
        dev = m_coords.length
        start = this.m_text.attr('text') % dev
        end = this.model.m() % dev
        if ( start != end )
        {
            morh = 'm'
            var d = start - end
            var d2 = dev + start - end
            var inc = ( ( d > 0 && d < dev/2 ) || ( d2 > 0 && d2 < dev/2 ) ? -1 : 1 )

            var path = "M" + m_coords[start][0] + "," + m_coords[start][1] + "L"

            for (i = start; i != end; i = (dev + i + inc) % dev)
            {
                path += m_coords[i][0] + "," + m_coords[i][1] + ","
            }

            path += m_coords[end][0] + "," + m_coords[end][1]
        }

        this.time.html(this.model.toString())

        /*var hpath = genpath(this.h.attr('cx'), this.h.attr('cy'), this.srad - this.ssrad, this.model.h(), 'h', this.h_text.attr('text'))
          */

        p = this.paper.path(path).attr({'stroke-width': 0, 'opacity': 0})
        var len = p.getTotalLength()
        e = ( morh == 'h' ? this.h : this.m )
        e2 = ( morh == 'h' ? this.h_text : this.m_text )
        this.paper.customAttributes.along = function (v) {
            var point = p.getPointAtLength(v * len)
            var coords = { cx: point.x, cy: point.y }
            e2.attr({x: point.x, y: point.y})
            return coords;
        };

        if ( path != undefined )
        {
            e.attr({along: 0})
            run()
            e2.attr('text', this.model.get(morh))
        }
        /*
        this.h.animateAlong({
            path: hpath,
            rotate: false,
            duration: 1000,
            debug: true
        })
        */
    }
})

function run() {
    e.animate({along: 1}, 100, function () {
        $("path").remove();
        //e.attr({along: 0});
        //setTimeout(run);
    });
}
