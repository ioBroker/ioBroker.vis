    /**
    * o--------------------------------------------------------------------------------o
    * | This file is part of the RGraph package. RGraph is Free Software, licensed     |
    * | under the MIT license - so it's free to use for all purposes. If you want to   |
    * | donate to help keep the project going then you can do so here:                 |
    * |                                                                                |
    * |                             http://www.rgraph.net/donate                       |
    * o--------------------------------------------------------------------------------o
    */
    RGraph = window.RGraph || {isRGraph: true};




    /**
    * The LED lights constructor
    * 
    * @param object canvas The canvas object
    * @param array  data   The chart data
    */
    RGraph.LED = function (id, text)
    {
        var tmp = RGraph.getCanvasTag(id);

        // Get the canvas and context objects
        this.id                = tmp[0];
        this.canvas            = tmp[1];
        this.context           = this.canvas.getContext ? this.canvas.getContext("2d") : null;
        this.canvas.__object__ = this;
        this.type              = 'led';
        this.isRGraph          = true;
        this.uid               = RGraph.CreateUID();
        this.canvas.uid        = this.canvas.uid ? this.canvas.uid : RGraph.CreateUID();
        this.colorsParsed      = false;
        this.original_colors   = [];


        /**
        * Compatibility with older browsers
        */
        //RGraph.OldBrowserCompat(this.context);


        /**
        * Set the string that is to be displayed
        */
        this.text = text.toLowerCase();
        
        /**
        * The letters and numbers
        */
        this.lights = {
            '#': [[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1],[1,1,1,1]],
            '-': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
            '_': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,1,1,1]],
            '*': [[0,0,0,0],[0,0,0,0],[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,0,0,0]],
            '<': [[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],
            '>': [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0]],
            '%': [[0,0,0,0],[0,0,0,0],[1,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,1],[0,0,0,0]],
            '¡': [[0,0,1,0],[0,0,0,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
            '!': [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0],[0,0,1,0]],
            '¿': [[0,0,1,0],[0,0,0,0],[0,0,1,0],[0,1,1,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
            '?': [[1,1,1,0],[0,0,0,1],[0,0,0,1],[0,1,1,0],[0,1,0,0],[0,0,0,0],[0,1,0,0]],
            '+': [[0,0,0,0],[0,0,0,0],[0,1,0,0],[1,1,1,0],[0,1,0,0],[0,0,0,0],[0,0,0,0]],
            '/': [[0,0,0,0],[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[0,0,0,0],[0,0,0,0]],
            ',': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,1,0],[0,1,0,0]],
            '.': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,1,0,0]],
            ';': [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,1,0],[0,0,0,0],[0,0,1,0],[0,1,0,0]],
            ':': [[0,0,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,0]],
            '"': [[1,0,1,0],[1,0,1,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
            '[': [[1,1,1,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,0]],
            ']': [[0,1,1,1],[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,1,1,1]],
            '(': [[0,0,1,1],[0,1,1,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,1,0],[0,0,1,1]],
            ')': [[1,1,0,0],[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,1,1,0],[1,1,0,0]],
            'R': [[1,0,0,0],[1,1,0,0],[1,1,1,0],[1,1,1,1],[1,1,1,0],[1,1,0,0],[1,0,0,0]],
            'L': [[0,0,0,1],[0,0,1,1],[0,1,1,1],[1,1,1,1],[0,1,1,1],[0,0,1,1],[0,0,0,1]],
            'a': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]],
            'b': [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
            'c': [[0,1,1,0],[1,0,0,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,1],[0,1,1,0]],
            'd': [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
            'e': [[1,1,1,1],[1,0,0,0],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
            'f': [[1,1,1,1],[1,0,0,0],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
            'g': [[0,1,1,0],[1,0,0,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            'h': [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]],
            'i': [[0,1,1,1],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,1,1,1]],
            'j': [[0,1,1,1],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,1,0,0]],
            'k': [[1,0,0,1],[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1],[1,0,0,1]],
            'l': [[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
            'm': [[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]],
            'n': [[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]],
            'o': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            'p': [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],
            'q': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,1,1],[0,1,1,1]],
            'r': [[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1],[1,0,0,1]],
            's': [[0,1,1,0],[1,0,0,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
            't': [[1,1,1,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
            'u': [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            'v': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0],[0,1,0]],
            'w': [[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,1,1,0]],
            'x': [[0,1,0,1],[0,1,0,1],[0,1,0,1],[0,0,1,0],[0,1,0,1],[0,1,0,1],[0,1,0,1]],
            'y': [[0,1,0,1],[0,1,0,1],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
            'z': [[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
            ' ': [[],[],[],[],[], [], []],
            '0': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            '1': [[0,0,1,0],[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,1,1,1]],
            '2': [[0,1,1,0],[1,0,0,1],[0,0,0,1],[0,0,1,0],[0,1,,0],[1,0,0,0],[1,1,1,1]],
            '3': [[0,1,1,0],[1,0,0,1],[0,0,0,1],[0,1,1,0],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
            '4': [[1,0,0,0],[1,0,0,0],[1,0,1,0],[1,0,1,0],[1,1,1,1],[0,0,1,0],[0,0,1,0]],
            '5': [[1,1,1,1],[1,0,0,0],[1,0,0,0],[1,1,1,0],[0,0,0,1],[1,0,0,1],[0,1,1,0]],
            '6': [[0,1,1,0],[1,0,0,1],[1,0,0,0],[1,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            '7': [[1,1,1,1],[0,0,0,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
            '8': [[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
            '9': [[0,1,1,1],[1,0,0,1],[1,0,0,1],[0,1,1,1],[0,0,0,1],[0,0,0,1],[0,0,0,1]]
        }

        // Various config type stuff
        this.properties =
        {
            'chart.dark':          '#eee',
            'chart.light':         '#f66',
            'chart.tooltips':      null,
            'chart.zoom.factor':   1.5,
            'chart.zoom.fade.in':  true,
            'chart.zoom.fade.out': true,
            'chart.zoom.hdir':     'right',
            'chart.zoom.vdir':     'down',
            'chart.zoom.frames':   25,
            'chart.zoom.delay':    16.666,
            'chart.zoom.shadow':   true,
            'chart.zoom.background': true,
            'chart.zoom.action':     'zoom',
            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            'chart.radius':                   null
        }

        
        
        

        
        
        
        
        
        // Check for support
        if (!this.canvas) {
            alert('[LED] No canvas support');
            return;
        }



        /*
        * Translate half a pixel for antialiasing purposes - but only if it hasn't beeen
        * done already
        */
        if (!this.canvas.__rgraph_aa_translated__) {
            this.context.translate(0.5,0.5);
            
            this.canvas.__rgraph_aa_translated__ = true;
        }



        
        // Short variable names
        var RG   = RGraph;
        var ca   = this.canvas;
        var co   = ca.getContext('2d');
        var prop = this.properties;
        var jq   = jQuery;
        var pa   = RG.Path;
        var win  = window;
        var doc  = document;
        var ma   = Math;
        
        
        
        /**
        * "Decorate" the object with the generic effects if the effects library has been included
        */
        if (RG.Effects && typeof RG.Effects.decorate === 'function') {
            RG.Effects.decorate(this);
        }





        /**
        * A setter
        * 
        * @param name  string The name of the property to set
        * @param value mixed  The value of the property
        */
        this.set =
        this.Set = function (name, value)
        {
            name = name.toLowerCase();
    
            /**
            * This should be done first - prepend the propertyy name with "chart." if necessary
            */
            if (name.substr(0,6) != 'chart.') {
                name = 'chart.' + name;
            }
    
            prop[name.toLowerCase()] = value;
    
            return this;
        };




        /**
        * A getter
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
        * This draws the LEDs
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
    

            
            for (var l=0,len=this.text.length; l<len; l++) {
                this.DrawLetter(this.text.charAt(l), l);
            }
            
            /**
            * Set the title attribute on the canvas
            */
            ca.title = RG.rtrim(this.text);
    
            /**
            * Setup the context menu if required
            */
            if (prop['chart.contextmenu']) {
                RG.ShowContext(this);
            }
    
            
            /**
            * This function enables resizing
            */
            if (prop['chart.resizable']) {
                RG.AllowResizing(this);
            }
    
    
            /**
            * This installs the event listeners
            */
            RG.InstallEventListeners(this);

            /**
            * Fire the RGraph ondraw event
            */
            RG.FireCustomEvent(this, 'ondraw');
            
            return this;
        };




        /**
        * Draws a single letter
        * 
        * @param string lights The lights to draw to draw
        * @param int    index  The position of the letter
        */
        this.drawLetter =
        this.DrawLetter = function (letter, index)
        {
            var light    = prop['chart.light'];
            var dark     = prop['chart.dark'];
            var lights   = (this.lights[letter] ? this.lights[letter] : [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]);
    
    
            /**
            * Now allow user specified radius of the size of the lights
            */
            if (typeof(prop['chart.radius']) == 'number') {
                radius = Number(prop['chart.radius']);
                diameter = 2 * radius;
                lwidth   = diameter * 5;
            } else {
                var radius   = ((ca.width / this.text.length) / 5) / 2;
                var diameter = radius * 2;
                var lwidth   = diameter * 5;
            }

            //var lheight = diameter * 7;
            //if (lheight > ca.height) {
            //    lheight  = ca.height;
            //    diameter = (lheight / 7);
            //    radius   = (diameter / 2);
            //    lwidth   = diameter * 5;
            //}
    
            for (var i=0; i<7; i++) {
                for (var j=0; j<5; j++) {
    
                    var x = (j * diameter) + (index * lwidth) + radius;
                    var y = ((i * diameter)) + radius;
    
                    // Draw a circle
                    co.fillStyle   = (lights[i][j] ? light : dark);
                    co.strokeStyle = (lights[i][j] ? '#ccc' : 'rgba(0,0,0,0)');
                    co.beginPath();
                    co.arc(x, y, radius, 0, RG.TWOPI, 0);
    
                    co.stroke();
                    co.fill();
                }
            }
        };




        /**
        * A place holder
        * 
        * @param object e The event object
        */
        this.getValue = function (e)
        {
            return this.text;
        };




        /**
        * This allows for easy specification of gradients
        */
        this.parseColors = function ()
        {
            // Save the original colors so that they can be restored when the canvas is reset
            if (this.original_colors.length === 0) {
                this.original_colors['chart.dark']  = RG.array_clone(prop['chart.dark']);
                this.original_colors['chart.light'] = RG.array_clone(prop['chart.light']);
            }

            prop['chart.dark'] = this.parseSingleColorForGradient(prop['chart.dark']);
            prop['chart.light'] = this.parseSingleColorForGradient(prop['chart.light']);
        };




        /**
        * This parses a single color value
        */
        this.parseSingleColorForGradient = function (color)
        {
            if (typeof color === 'string' && color.match(/^gradient\((.*)\)$/i)) {
    
                var parts = RegExp.$1.split(':');

                // Create the gradient
                var grad = co.createLinearGradient(0,0,0,ca.height);
    
                var diff = 1 / (parts.length - 1);
    
                grad.addColorStop(0, RG.trim(parts[0]));
    
                for (var j=1; j<parts.length; ++j) {
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
        * A placeholder
        */
        this.getObjectByXY = function ()
        {
        }




        RG.Register(this);
    };
// version: 2014-03-28

