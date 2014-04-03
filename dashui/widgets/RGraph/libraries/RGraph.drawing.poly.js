    /**
    * o--------------------------------------------------------------------------------o
    * | This file is part of the RGraph package. RGraph is Free Software, licensed     |
    * | under the MIT license - so it's free to use for all purposes. If you want to   |
    * | donate to help keep the project going then you can do so here:                 |
    * |                                                                                |
    * |                             http://www.rgraph.net/donate                       |
    * o--------------------------------------------------------------------------------o
    */
    
    /**
    * Having this here means that the RGraph libraries can be included in any order, instead of you having
    * to include the common core library first.
    */

    // Define the RGraph global variable
    RGraph = window.RGraph || {isRGraph: true};
    RGraph.Drawing = RGraph.Drawing || {};






    /**
    * The constructor. This function sets up the object. It takes the ID (the HTML attribute) of the canvas as the
    * first argument, then the coordinates of the coords of the shape
    * 
    * @param string id     The canvas tag ID
    * @param number coords The coordinates of the shape
    */
    RGraph.Drawing.Poly = function (id, coords)
    {
        var tmp = RGraph.getCanvasTag(id);

        // Get the canvas and context objects
        this.id                = tmp[0];
        this.canvas            = tmp[1];
        this.context           = this.canvas.getContext ? this.canvas.getContext("2d") : null;
        this.colorsParsed      = false;
        this.canvas.__object__ = this;
        this.coords            = coords;
        this.coordsText        = [];
        this.original_colors   = [];


        /**
        * This defines the type of this shape
        */
        this.type = 'drawing.poly';


        /**
        * This facilitates easy object identification, and should always be true
        */
        this.isRGraph = true;


        /**
        * This adds a uid to the object that you can use for identification purposes
        */
        this.uid = RGraph.CreateUID();


        /**
        * This adds a UID to the canvas for identification purposes
        */
        this.canvas.uid = this.canvas.uid ? this.canvas.uid : RGraph.CreateUID();


        /**
        * This does a few things, for example adding the .fillText() method to the canvas 2D context when
        * it doesn't exist. This facilitates the graphs to be still shown in older browser (though without
        * text obviously). You'll find the function in RGraph.common.core.js
        */
        //RGraph.OldBrowserCompat(this.context);


        /**
        * Some example background properties
        */
        this.properties =
        {
            'chart.linewidth':               1,
            'chart.strokestyle':             'black',
            'chart.fillstyle':               'red',
            'chart.events.click':            null,
            'chart.events.mousemove':        null,
            'chart.tooltips':                null,
            'chart.tooltips.override':       null,
            'chart.tooltips.effect':         'fade',
            'chart.tooltips.css.class':      'RGraph_tooltip',
            'chart.tooltips.event':          'onclick',
            'chart.tooltips.highlight':      true,
            'chart.highlight.stroke':        'rgba(0,0,0,0)',
            'chart.highlight.fill':          'rgba(255,255,255,0.7)',
            'chart.shadow':                  false,
            'chart.shadow.color':            'rgba(0,0,0,0.2)',
            'chart.shadow.offsetx':          3,
            'chart.shadow.offsety':          3,
            'chart.shadow.blur':             5
        }

        /**
        * A simple check that the browser has canvas support
        */
        if (!this.canvas) {
            alert('[DRAWING.POLY] No canvas support');
            return;
        }
        
        /**
        * Create the dollar object so that functions can be added to them
        */
        this.$0 = {};


        /**
        * Translate half a pixel for antialiasing purposes - but only if it hasn't beeen
        * done already
        */
        if (!this.canvas.__rgraph_aa_translated__) {
            this.context.translate(0.5,0.5);

            this.canvas.__rgraph_aa_translated__ = true;
        }




        // Short variable names
        var RG    = RGraph;
        var ca    = this.canvas;
        var co    = ca.getContext('2d');
        var prop  = this.properties;
        var jq    = jQuery;
        var pa    = RG.Path;
        var win   = window;
        var doc   = document;
        var ma    = Math;
        
        
        
        /**
        * "Decorate" the object with the generic effects if the effects library has been included
        */
        if (RG.Effects && typeof RG.Effects.decorate === 'function') {
            RG.Effects.decorate(this);
        }




        /**
        * A setter method for setting properties.
        * 
        * @param name  string The name of the property to set
        * @param value mixed  The value of the property
        */
        this.set =
        this.Set = function (name, value)
        {
            name = name.toLowerCase();
    
            /**
            * This should be done first - prepend the property name with "chart." if necessary
            */
            if (name.substr(0,6) != 'chart.') {
                name = 'chart.' + name;
            }
    
            prop[name] = value;
    
            return this;
        };




        /**
        * A getter method for retrieving graph properties. It can be used like this: obj.Get('chart.strokestyle');
        * 
        * @param name  string The name of the property to get
        */
        this.get =
        this.Get = function (name)
        {
            /**
            * This should be done first - prepend the property name with "chart." if necessary
            */
            if (name.substr(0,6) != 'chart.') {
                name = 'chart.' + name;
            }
    
            return prop[name.toLowerCase()];
        };




        /**
        * Draws the shape
        */
        this.draw =
        this.Draw = function ()
        {
            /**
            * Fire the onbeforedraw event
            */
            RG.FireCustomEvent(this, 'onbeforedraw');
    
    
            /**
            * Parse the colors. This allows for simple gradient syntax
            */
            if (!this.colorsParsed) {
    
                this.parseColors();
    
                // Don't want to do this again
                this.colorsParsed = true;
            }
    
    
    
    
            /**
            * DRAW THE SHAPE HERE
            */

            var obj = this;
            pa(this, ['b','fu',function (obj){if (prop['chart.shadow'])
                {
                    co.shadowColor = prop['chart.shadow.color'];
                    co.shadowOffsetX = prop['chart.shadow.offsetx'];
                    co.shadowOffsetY = prop['chart.shadow.offsety'];
                    co.shadowBlur = prop['chart.shadow.blur'];
                }},'fu',function (obj)
                {
                    co.strokeStyle=prop['chart.strokestyle'];
                    co.fillStyle=prop['chart.fillstyle'];
                    obj.DrawPoly();
                },'lw',prop['chart.linewidth'],'f',prop['chart.fillstyle'], 'fu', function ()
                {
                    RG.NoShadow(obj);
                }, 's',prop['chart.strokestyle']]);



            /**
            * Turn off shadow again
            */
            RG.NoShadow(this)
    
    
    
            /**
            * This installs the event listeners
            */
            RG.InstallEventListeners(this);
    
    
            /**
            * Fire the ondraw event
            */
            RG.FireCustomEvent(this, 'ondraw');
            
            return this;
        };




        /**
        * The getObjectByXY() worker method
        */
        this.getObjectByXY = function (e)
        {
            if (this.getShape(e)) {
                return this;
            }
        };




        /**
        * Draw the Poly but doesn't stroke or fill - that's left to other functions
        */
        this.drawPoly =
        this.DrawPoly = function ()
        {
            var coords = this.coords;
            
            pa(this, ['b','m',coords[0][0], coords[0][1]]);

            // Draw lines to subsequent coords
            for (var i=1,len=coords.length; i<len; ++i) {
                co.lineTo(coords[i][0],coords[i][1]);
            }

            // Close the path and stroke/fill it with whatever the current fill/stroke styles are
            pa(this, ['lw', prop['chart.linewidth'], 'c','f',co.fillStyle, 's',co.strokeStyle]);
        };




        /**
        * Not used by the class during creating the graph, but is used by event handlers
        * to get the coordinates (if any) of the selected bar
        * 
        * @param object e The event object
        */
        this.getShape = function (e)
        {
            var coords  = this.coords;
            var mouseXY = RGraph.getMouseXY(e);
            var mouseX  = mouseXY[0];
            var mouseY  = mouseXY[1];
    
            // Should redraw the poly but not stroke or fill it and then use isPointInPath() to test it
            // DON'T USE PATH OBJECT HERE
            co.beginPath();
            co.strokeStyle = 'rgba(0,0,0,0)';
            co.fillStyle = 'rgba(0,0,0,0)';
            this.DrawPoly();
    
            if (co.isPointInPath(mouseX, mouseY)) {
                    
                return {
                        0: this, 1: this.coords, 2: 0,
                        'object': this, 'coords': this.coords, 'index': 0, 'tooltip': prop['chart.tooltips'] ? prop['chart.tooltips'][0] : null
                       };
            }
            
            return null;
        };




        /**
        * This function positions a tooltip when it is displayed
        * 
        * @param obj object    The chart object
        * @param int x         The X coordinate specified for the tooltip
        * @param int y         The Y coordinate specified for the tooltip
        * @param objec tooltip The tooltips DIV element
        */
        this.positionTooltip = function (obj, x, y, tooltip, idx)
        {
            var canvasXY = RGraph.getCanvasXY(obj.canvas);
            var width    = tooltip.offsetWidth;
            var height   = tooltip.offsetHeight;
    
            // Set the top position
            tooltip.style.left = 0;
            tooltip.style.top  = (y - height - 7) +  'px';
    
            // By default any overflow is hidden
            tooltip.style.overflow = '';
    
            // The arrow
            var img = new Image();
                img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAFCAYAAACjKgd3AAAARUlEQVQYV2NkQAN79+797+RkhC4M5+/bd47B2dmZEVkBCgcmgcsgbAaA9GA1BCSBbhAuA/AagmwQPgMIGgIzCD0M0AMMAEFVIAa6UQgcAAAAAElFTkSuQmCC';
                img.style.position = 'absolute';
                img.id = '__rgraph_tooltip_pointer__';
                img.style.top = (tooltip.offsetHeight - 2) + 'px';
            tooltip.appendChild(img);
            
            
            
            
            /**
            * Reposition the tooltip if at the edges:
            */
    
    
    
            // LEFT edge
            if (x - (width / 2) < 10) {
                tooltip.style.left = (canvasXY[0] + x - (width * 0.1)) - 8.5+ 'px';
                img.style.left = ((width * 0.1) - 8.5) + 'px';
    
            // RIGHT edge
            } else if ((x + (width / 2)) > doc.body.offsetWidth) {
                tooltip.style.left = x - (width * 0.9) + 'px';
                img.style.left = ((width * 0.9) - 8.5) + 'px';
    
            // Default positioning - CENTERED
            } else {
                tooltip.style.left = x - (width / 2) + 'px';
                img.style.left = ((width * 0.5) - 8.5) + 'px';
            }
        };




        /**
        * Each object type has its own Highlight() function which highlights the appropriate shape
        * 
        * @param object shape The shape to highlight
        */
        this.highlight =
        this.Highlight = function (shape)
        {
            // Evidentally this is necessary
            co.fillStyle = prop['chart.fillstyle'];

            // Add the new highlight
            if (prop['chart.tooltips.highlight']) {
                pa(this, ['b','fu', function (obj){obj.DrawPoly();},'f',prop['chart.highlight.fill'],'s',prop['chart.highlight.stroke']]);
            }
        };




        /**
        * This allows for easy specification of gradients
        */
        this.parseColors = function ()
        {

            // Save the original colors so that they can be restored when the canvas is reset
            if (this.original_colors.length === 0) {
                this.original_colors['chart.fillstyle']        = RG.array_clone(prop['chart.fillstyle']);
                this.original_colors['chart.strokestyle']      = RG.array_clone(prop['chart.strokestyle']);
                this.original_colors['chart.highlight.stroke'] = RG.array_clone(prop['chart.highlight.stroke']);
                this.original_colors['chart.highlight.fill']   = RG.array_clone(prop['chart.highlight.fill']);
            }




            var func = this.parseSingleColorForGradient;
    
            /**
            * Parse various properties for colors
            */
            prop['chart.fillstyle']        = func(prop['chart.fillstyle']);
            prop['chart.strokestyle']      = func(prop['chart.strokestyle']);
            prop['chart.highlight.stroke'] = func(prop['chart.highlight.stroke']);
            prop['chart.highlight.fill']   = func(prop['chart.highlight.fill']);
        };




        /**
        * This parses a single color value
        */
        this.parseSingleColorForGradient = function (color)
        {
            if (!color) {
                return color;
            }
    
            if (typeof color === 'string' && color.match(/^gradient\((.*)\)$/i)) {
    
                var parts = RegExp.$1.split(':');
    
                // Create the gradient
                var grad = co.createLinearGradient(0,0,ca.width,0);
    
                var diff = 1 / (parts.length - 1);
    
                grad.addColorStop(0, RG.trim(parts[0]));
    
                for (var j=1,len=parts.length; j<len; ++j) {
                    grad.addColorStop(j * diff, RG.trim(parts[j]));
                }
            }
    
            return grad ? grad : color;
        };




        /**
        * Using a function to add events makes it easier to facilitate method chaining
        * 
        * @param string   type The type of even to add
        * @param function func 
        */
        this.on = function (type, func)
        {
            if (type.substr(0,2) !== 'on') {
                type = 'on' + type;
            }
            
            this[type] = func;
    
            return this;
        };




        /**
        * Objects are now always registered so that the chart is redrawn if need be.
        */
        RG.Register(this);
    };
// version: 2014-03-28

