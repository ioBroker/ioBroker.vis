/*!
 * segment-display.js
 *
 * Copyright 2012, Rüdiger Appel
 * http://www.3quarks.com
 * Published under Creative Commons 3.0 License.
 *
 * Date: 2012-02-14
 * Version: 1.0.0
 * 
 * Dokumentation: http://www.3quarks.com/de/Segmentanzeige
 * Documentation: http://www.3quarks.com/en/SegmentDisplay
 */

// Segment display types
SegmentDisplay.SevenSegment    = 7;
SegmentDisplay.FourteenSegment = 14;
SegmentDisplay.SixteenSegment  = 16;

// Segment corner types
SegmentDisplay.SymmetricCorner = 0;
SegmentDisplay.SquaredCorner   = 1;
SegmentDisplay.RoundedCorner   = 2;


function SegmentDisplay(displayId) {
  this.displayId       = displayId;
  this.pattern         = '##:##:##';
  this.value           = '12:34:56';
  this.digitHeight     = 20;
  this.digitWidth      = 10;
  this.digitDistance   = 2.5;
  this.displayAngle    = 12;
  this.segmentWidth    = 2.5;
  this.segmentDistance = 0.2;
  this.segmentCount    = SegmentDisplay.SevenSegment;
  this.cornerType      = SegmentDisplay.RoundedCorner;
  this.colorOn         = 'rgb(233, 93, 15)';
  this.colorOff        = 'rgb(75, 30, 5)';
};

SegmentDisplay.prototype.setValue = function(value) {
  this.value = value;
  this.draw();
};

SegmentDisplay.prototype.draw = function() {
  var display = document.getElementById(this.displayId);
  if (display) {
    var context = display.getContext('2d');
    if (context) {
      // clear canvas
      context.clearRect(0, 0, display.width, display.height);
      
      // compute and check display width
      var width = 0;
      var first = true;
      if (this.pattern) {
        for (var i = 0; i < this.pattern.length; i++) {
          var c = this.pattern.charAt(i).toLowerCase();
          if (c == '#') {
            width += this.digitWidth;
          } else if (c == '.' || c == ':') {
            width += this.segmentWidth;
          } else if (c != ' ') {
            return;
          }
          width += first ? 0 : this.digitDistance;
          first = false;
        }
      }
      if (width <= 0) {
        return;
      }
      
      // compute skew factor
      var angle = -1.0 * Math.max(-45.0, Math.min(45.0, this.displayAngle));
      var skew  = Math.tan((angle * Math.PI) / 180.0);
      
      // compute scale factor
      var scale = Math.min(display.width / (width + Math.abs(skew * this.digitHeight)), display.height / this.digitHeight);
      
      // compute display offset
      var offsetX = (display.width - (width + skew * this.digitHeight) * scale) / 2.0;
      var offsetY = (display.height - this.digitHeight * scale) / 2.0;
      
      // context transformation
      context.save();
      context.translate(offsetX, offsetY);
      context.scale(scale, scale);
      context.transform(1, 0, skew, 1, 0, 0);

      // draw segments
      var xPos = 0;
      var size = (this.value) ? this.value.length : 0;
      for (var i = 0; i < this.pattern.length; i++) {
        var mask  = this.pattern.charAt(i);
        var value = (i < size) ? this.value.charAt(i).toLowerCase() : ' ';
        xPos += this.drawDigit(context, xPos, mask, value);
      }

      // finish drawing
      context.restore();
    }
  }
};

SegmentDisplay.prototype.drawDigit = function(context, xPos, mask, c) {
  switch (mask) {
    case '#':
      var r = Math.sqrt(this.segmentWidth * this.segmentWidth / 2.0);
      var d = Math.sqrt(this.segmentDistance * this.segmentDistance / 2.0);
      var e = d / 2.0; 
      var f = (this.segmentWidth - d) * Math.sin((45.0 * Math.PI) / 180.0);
      var g = f / 2.0;
      var h = (this.digitHeight - 3.0 * this.segmentWidth) / 2.0;
      var w = (this.digitWidth - 3.0 * this.segmentWidth) / 2.0;
      var s = this.segmentWidth / 2.0;
      var t = this.digitWidth / 2.0;

      // draw segment a (a1 and a2 for 16 segments)
      if (this.segmentCount == 16) {
        var x = xPos;
        var y = 0;
        context.fillStyle = this.getSegmentColor(c, null, '02356789abcdefgiopqrstz@%');
        context.beginPath();
        switch (this.cornerType) {
          case SegmentDisplay.SymmetricCorner:
            context.moveTo(x + s + d, y + s);
            context.lineTo(x + this.segmentWidth + d, y);
            break;
          case SegmentDisplay.SquaredCorner:
            context.moveTo(x + s + e, y + s - e);
            context.lineTo(x + this.segmentWidth, y);
            break;
          default:
            context.moveTo(x + this.segmentWidth - f, y + this.segmentWidth - f - d);
            context.quadraticCurveTo(x + this.segmentWidth - g, y, x + this.segmentWidth, y);
        }
        context.lineTo(x + t - d - s, y);
        context.lineTo(x + t - d, y + s);
        context.lineTo(x + t - d - s, y + this.segmentWidth);
        context.lineTo(x + this.segmentWidth + d, y + this.segmentWidth);
        context.fill();
        
        var x = xPos;
        var y = 0;
        context.fillStyle = this.getSegmentColor(c, null, '02356789abcdefgiopqrstz@');
        context.beginPath();
        context.moveTo(x + this.digitWidth - this.segmentWidth - d, y + this.segmentWidth);
        context.lineTo(x + t + d + s, y + this.segmentWidth);
        context.lineTo(x + t + d, y + s);
        context.lineTo(x + t + d + s, y);
        switch (this.cornerType) {
          case SegmentDisplay.SymmetricCorner:
            context.lineTo(x + this.digitWidth - this.segmentWidth - d, y);
            context.lineTo(x + this.digitWidth - s - d, y + s);
            break;
          case SegmentDisplay.SquaredCorner:
            context.lineTo(x + this.digitWidth - this.segmentWidth, y);
            context.lineTo(x + this.digitWidth - s - e, y + s - e);
            break;
          default:
            context.lineTo(x + this.digitWidth - this.segmentWidth, y);
            context.quadraticCurveTo(x + this.digitWidth - this.segmentWidth + g, y, x + this.digitWidth - this.segmentWidth + f, y + this.segmentWidth - f - d);
        }
        context.fill();
        
      } else {
        var x = xPos;
        var y = 0;
        context.fillStyle = this.getSegmentColor(c, '02356789acefp', '02356789abcdefgiopqrstz@');
        context.beginPath();
        switch (this.cornerType) {
          case SegmentDisplay.SymmetricCorner:
            context.moveTo(x + s + d, y + s);
            context.lineTo(x + this.segmentWidth + d, y);
            context.lineTo(x + this.digitWidth - this.segmentWidth - d, y);
            context.lineTo(x + this.digitWidth - s - d, y + s);
            break;
          case SegmentDisplay.SquaredCorner:
            context.moveTo(x + s + e, y + s - e);
            context.lineTo(x + this.segmentWidth, y);
            context.lineTo(x + this.digitWidth - this.segmentWidth, y);
            context.lineTo(x + this.digitWidth - s - e, y + s - e);
            break;
          default:
            context.moveTo(x + this.segmentWidth - f, y + this.segmentWidth - f - d);
            context.quadraticCurveTo(x + this.segmentWidth - g, y, x + this.segmentWidth, y);
            context.lineTo(x + this.digitWidth - this.segmentWidth, y);
            context.quadraticCurveTo(x + this.digitWidth - this.segmentWidth + g, y, x + this.digitWidth - this.segmentWidth + f, y + this.segmentWidth - f - d);
        }
        context.lineTo(x + this.digitWidth - this.segmentWidth - d, y + this.segmentWidth);
        context.lineTo(x + this.segmentWidth + d, y + this.segmentWidth);
        context.fill();
      }
      
      // draw segment b
      x = xPos + this.digitWidth - this.segmentWidth;
      y = 0;
      context.fillStyle = this.getSegmentColor(c, '01234789adhpy', '01234789abdhjmnopqruwy');
      context.beginPath();
      switch (this.cornerType) {
        case SegmentDisplay.SymmetricCorner:
          context.moveTo(x + s, y + s + d);
          context.lineTo(x + this.segmentWidth, y + this.segmentWidth + d);
          break;
        case SegmentDisplay.SquaredCorner:
          context.moveTo(x + s + e, y + s + e);
          context.lineTo(x + this.segmentWidth, y + this.segmentWidth);
          break;
        default:
          context.moveTo(x + f + d, y + this.segmentWidth - f);
          context.quadraticCurveTo(x + this.segmentWidth, y + this.segmentWidth - g, x + this.segmentWidth, y + this.segmentWidth);
      }
      context.lineTo(x + this.segmentWidth, y + h + this.segmentWidth - d);
      context.lineTo(x + s, y + h + this.segmentWidth + s - d);
      context.lineTo(x, y + h + this.segmentWidth - d);
      context.lineTo(x, y + this.segmentWidth + d);
      context.fill();
      
      // draw segment c
      x = xPos + this.digitWidth - this.segmentWidth;
      y = h + this.segmentWidth;
      context.fillStyle = this.getSegmentColor(c, '013456789abdhnouy', '01346789abdghjmnoqsuw@', '%');
      context.beginPath();
      context.moveTo(x, y + this.segmentWidth + d);
      context.lineTo(x + s, y + s + d);
      context.lineTo(x + this.segmentWidth, y + this.segmentWidth + d);
      context.lineTo(x + this.segmentWidth, y + h + this.segmentWidth - d);
      switch (this.cornerType) {
        case SegmentDisplay.SymmetricCorner:
          context.lineTo(x + s, y + h + this.segmentWidth + s - d);
          context.lineTo(x, y + h + this.segmentWidth - d);
          break;
        case SegmentDisplay.SquaredCorner:
          context.lineTo(x + s + e, y + h + this.segmentWidth + s - e);
          context.lineTo(x, y + h + this.segmentWidth - d);
          break;
        default:
          context.quadraticCurveTo(x + this.segmentWidth, y + h + this.segmentWidth + g, x + f + d, y + h + this.segmentWidth + f); //
          context.lineTo(x, y + h + this.segmentWidth - d);
      }
      context.fill();
      
      // draw segment d (d1 and d2 for 16 segments)
      if (this.segmentCount == 16) {
        x = xPos;
        y = this.digitHeight - this.segmentWidth;
        context.fillStyle = this.getSegmentColor(c, null, '0235689bcdegijloqsuz_=@');
        context.beginPath();
        context.moveTo(x + this.segmentWidth + d, y);
        context.lineTo(x + t - d - s, y);
        context.lineTo(x + t - d, y + s);
        context.lineTo(x + t - d - s, y + this.segmentWidth);
        switch (this.cornerType) {
          case SegmentDisplay.SymmetricCorner:
            context.lineTo(x + this.segmentWidth + d, y + this.segmentWidth);
            context.lineTo(x + s + d, y + s);
            break;
          case SegmentDisplay.SquaredCorner:
            context.lineTo(x + this.segmentWidth, y + this.segmentWidth);
            context.lineTo(x + s + e, y + s + e);
            break;
          default:
            context.lineTo(x + this.segmentWidth, y + this.segmentWidth);
            context.quadraticCurveTo(x + this.segmentWidth - g, y + this.segmentWidth, x + this.segmentWidth - f, y + f + d);
            context.lineTo(x + this.segmentWidth - f, y + f + d);
        }
        context.fill();

        x = xPos;
        y = this.digitHeight - this.segmentWidth;
        context.fillStyle = this.getSegmentColor(c, null, '0235689bcdegijloqsuz_=@', '%');
        context.beginPath();
        context.moveTo(x + t + d + s, y + this.segmentWidth);
        context.lineTo(x + t + d, y + s);
        context.lineTo(x + t + d + s, y);
        context.lineTo(x + this.digitWidth - this.segmentWidth - d, y);
        switch (this.cornerType) {
          case SegmentDisplay.SymmetricCorner:
            context.lineTo(x + this.digitWidth - s - d, y + s);
            context.lineTo(x + this.digitWidth - this.segmentWidth - d, y + this.segmentWidth);
            break;
          case SegmentDisplay.SquaredCorner:
            context.lineTo(x + this.digitWidth - s - e, y + s + e);
            context.lineTo(x + this.digitWidth - this.segmentWidth, y + this.segmentWidth);
            break;
          default:
            context.lineTo(x + this.digitWidth - this.segmentWidth + f, y + f + d);
            context.quadraticCurveTo(x + this.digitWidth - this.segmentWidth + g, y + this.segmentWidth, x + this.digitWidth - this.segmentWidth, y + this.segmentWidth);
        }
        context.fill();
      }
      else {
        x = xPos;
        y = this.digitHeight - this.segmentWidth;
        context.fillStyle = this.getSegmentColor(c, '0235689bcdelotuy_', '0235689bcdegijloqsuz_=@');
        context.beginPath();
        context.moveTo(x + this.segmentWidth + d, y);
        context.lineTo(x + this.digitWidth - this.segmentWidth - d, y);
        switch (this.cornerType) {
          case SegmentDisplay.SymmetricCorner:
            context.lineTo(x + this.digitWidth - s - d, y + s);
            context.lineTo(x + this.digitWidth - this.segmentWidth - d, y + this.segmentWidth);
            context.lineTo(x + this.segmentWidth + d, y + this.segmentWidth);
            context.lineTo(x + s + d, y + s);
            break;
          case SegmentDisplay.SquaredCorner:
            context.lineTo(x + this.digitWidth - s - e, y + s + e);
            context.lineTo(x + this.digitWidth - this.segmentWidth, y + this.segmentWidth);
            context.lineTo(x + this.segmentWidth, y + this.segmentWidth);
            context.lineTo(x + s + e, y + s + e);
            break;
          default:
            context.lineTo(x + this.digitWidth - this.segmentWidth + f, y + f + d);
            context.quadraticCurveTo(x + this.digitWidth - this.segmentWidth + g, y + this.segmentWidth, x + this.digitWidth - this.segmentWidth, y + this.segmentWidth);
            context.lineTo(x + this.segmentWidth, y + this.segmentWidth);
            context.quadraticCurveTo(x + this.segmentWidth - g, y + this.segmentWidth, x + this.segmentWidth - f, y + f + d);
            context.lineTo(x + this.segmentWidth - f, y + f + d);
        }
        context.fill();
      }
      
      // draw segment e
      x = xPos;
      y = h + this.segmentWidth;
      context.fillStyle = this.getSegmentColor(c, '0268abcdefhlnoprtu', '0268acefghjklmnopqruvw@');
      context.beginPath();
      context.moveTo(x, y + this.segmentWidth + d);
      context.lineTo(x + s, y + s + d);
      context.lineTo(x + this.segmentWidth, y + this.segmentWidth + d);
      context.lineTo(x + this.segmentWidth, y + h + this.segmentWidth - d);
      switch (this.cornerType) {
        case SegmentDisplay.SymmetricCorner:
          context.lineTo(x + s, y + h + this.segmentWidth + s - d);
          context.lineTo(x, y + h + this.segmentWidth - d);
          break;
        case SegmentDisplay.SquaredCorner:
          context.lineTo(x + s - e, y + h + this.segmentWidth + s - d + e);
          context.lineTo(x, y + h + this.segmentWidth);
          break;
        default:
          context.lineTo(x + this.segmentWidth - f - d, y + h + this.segmentWidth + f); 
          context.quadraticCurveTo(x, y + h + this.segmentWidth + g, x, y + h + this.segmentWidth);
      }
      context.fill();
      
      // draw segment f
      x = xPos;
      y = 0;
      context.fillStyle = this.getSegmentColor(c, '045689abcefhlpty', '045689acefghklmnopqrsuvwy@', '%');
      context.beginPath();
      context.moveTo(x + this.segmentWidth, y + this.segmentWidth + d);
      context.lineTo(x + this.segmentWidth, y + h + this.segmentWidth - d);
      context.lineTo(x + s, y + h + this.segmentWidth + s - d);
      context.lineTo(x, y + h + this.segmentWidth - d);
      switch (this.cornerType) {
        case SegmentDisplay.SymmetricCorner:
          context.lineTo(x, y + this.segmentWidth + d);
          context.lineTo(x + s, y + s + d);
          break;
        case SegmentDisplay.SquaredCorner:
          context.lineTo(x, y + this.segmentWidth);
          context.lineTo(x + s - e, y + s + e);
          break;
        default:
          context.lineTo(x, y + this.segmentWidth);
          context.quadraticCurveTo(x, y + this.segmentWidth - g, x + this.segmentWidth - f - d, y + this.segmentWidth - f); 
          context.lineTo(x + this.segmentWidth - f - d, y + this.segmentWidth - f); 
      }
      context.fill();

      // draw segment g for 7 segments
      if (this.segmentCount == 7) {
        x = xPos;
        y = (this.digitHeight - this.segmentWidth) / 2.0;
        context.fillStyle = this.getSegmentColor(c, '2345689abdefhnoprty-=');
        context.beginPath();
        context.moveTo(x + s + d, y + s);
        context.lineTo(x + this.segmentWidth + d, y);
        context.lineTo(x + this.digitWidth - this.segmentWidth - d, y);
        context.lineTo(x + this.digitWidth - s - d, y + s);
        context.lineTo(x + this.digitWidth - this.segmentWidth - d, y + this.segmentWidth);
        context.lineTo(x + this.segmentWidth + d, y + this.segmentWidth);
        context.fill();
      }
            
      // draw inner segments for the fourteen- and sixteen-segment-display
      if (this.segmentCount != 7) {
        // draw segment g1
        x = xPos;
        y = (this.digitHeight - this.segmentWidth) / 2.0;
        context.fillStyle = this.getSegmentColor(c, null, '2345689aefhkprsy-+*=', '%');
        context.beginPath();
        context.moveTo(x + s + d, y + s);
        context.lineTo(x + this.segmentWidth + d, y);
        context.lineTo(x + t - d - s, y);
        context.lineTo(x + t - d, y + s);
        context.lineTo(x + t - d - s, y + this.segmentWidth);
        context.lineTo(x + this.segmentWidth + d, y + this.segmentWidth);
        context.fill();
        
        // draw segment g2
        x = xPos;
        y = (this.digitHeight - this.segmentWidth) / 2.0;
        context.fillStyle = this.getSegmentColor(c, null, '234689abefghprsy-+*=@', '%');
        context.beginPath();
        context.moveTo(x + t + d, y + s);
        context.lineTo(x + t + d + s, y);
        context.lineTo(x + this.digitWidth - this.segmentWidth - d, y);
        context.lineTo(x + this.digitWidth - s - d, y + s);
        context.lineTo(x + this.digitWidth - this.segmentWidth - d, y + this.segmentWidth);
        context.lineTo(x + t + d + s, y + this.segmentWidth);
        context.fill();
        
        // draw segment j 
        x = xPos + t - s;
        y = 0;
        context.fillStyle = this.getSegmentColor(c, null, 'bdit+*', '%');
        context.beginPath();
        if (this.segmentCount == 14) {
          context.moveTo(x, y + this.segmentWidth + this.segmentDistance);
          context.lineTo(x + this.segmentWidth, y + this.segmentWidth + this.segmentDistance);
        } else {
          context.moveTo(x, y + this.segmentWidth + d);
          context.lineTo(x + s, y + s + d);
          context.lineTo(x + this.segmentWidth, y + this.segmentWidth + d);
        }
        context.lineTo(x + this.segmentWidth, y + h + this.segmentWidth - d);
        context.lineTo(x + s, y + h + this.segmentWidth + s - d);
        context.lineTo(x, y + h + this.segmentWidth - d);
        context.fill();
        
        // draw segment m
        x = xPos + t - s;
        y = this.digitHeight;
        context.fillStyle = this.getSegmentColor(c, null, 'bdity+*@', '%');
        context.beginPath();
        if (this.segmentCount == 14) {
          context.moveTo(x, y - this.segmentWidth - this.segmentDistance);
          context.lineTo(x + this.segmentWidth, y - this.segmentWidth - this.segmentDistance);
        } else {
          context.moveTo(x, y - this.segmentWidth - d);
          context.lineTo(x + s, y - s - d);
          context.lineTo(x + this.segmentWidth, y - this.segmentWidth - d);
        }
        context.lineTo(x + this.segmentWidth, y - h - this.segmentWidth + d);
        context.lineTo(x + s, y - h - this.segmentWidth - s + d);
        context.lineTo(x, y - h - this.segmentWidth + d);
        context.fill();
        
        // draw segment h
        x = xPos + this.segmentWidth;
        y = this.segmentWidth;
        context.fillStyle = this.getSegmentColor(c, null, 'mnx\\*');
        context.beginPath();
        context.moveTo(x + this.segmentDistance, y + this.segmentDistance);
        context.lineTo(x + this.segmentDistance + r, y + this.segmentDistance);
        context.lineTo(x + w - this.segmentDistance , y + h - this.segmentDistance - r);
        context.lineTo(x + w - this.segmentDistance , y + h - this.segmentDistance);
        context.lineTo(x + w - this.segmentDistance - r , y + h - this.segmentDistance);
        context.lineTo(x + this.segmentDistance, y + this.segmentDistance + r);
        context.fill();
        
        // draw segment k
        x = xPos + w + 2.0 * this.segmentWidth;
        y = this.segmentWidth;
        context.fillStyle = this.getSegmentColor(c, null, '0kmvxz/*', '%');
        context.beginPath();
        context.moveTo(x + w - this.segmentDistance, y + this.segmentDistance);
        context.lineTo(x + w - this.segmentDistance, y + this.segmentDistance + r);
        context.lineTo(x + this.segmentDistance + r, y + h - this.segmentDistance);
        context.lineTo(x + this.segmentDistance, y + h - this.segmentDistance);
        context.lineTo(x + this.segmentDistance, y + h - this.segmentDistance - r);
        context.lineTo(x + w - this.segmentDistance - r, y + this.segmentDistance);
        context.fill();
        
        // draw segment l
        x = xPos + w + 2.0 * this.segmentWidth;
        y = h + 2.0 * this.segmentWidth;
        context.fillStyle = this.getSegmentColor(c, null, '5knqrwx\\*');
        context.beginPath();
        context.moveTo(x + this.segmentDistance, y + this.segmentDistance);
        context.lineTo(x + this.segmentDistance + r, y + this.segmentDistance);
        context.lineTo(x + w - this.segmentDistance , y + h - this.segmentDistance - r);
        context.lineTo(x + w - this.segmentDistance , y + h - this.segmentDistance);
        context.lineTo(x + w - this.segmentDistance - r , y + h - this.segmentDistance);
        context.lineTo(x + this.segmentDistance, y + this.segmentDistance + r);
        context.fill();
        
        // draw segment n
        x = xPos + this.segmentWidth;
        y = h + 2.0 * this.segmentWidth;
        context.fillStyle = this.getSegmentColor(c, null, '0vwxz/*', '%');
        context.beginPath();
        context.moveTo(x + w - this.segmentDistance, y + this.segmentDistance);
        context.lineTo(x + w - this.segmentDistance, y + this.segmentDistance + r);
        context.lineTo(x + this.segmentDistance + r, y + h - this.segmentDistance);
        context.lineTo(x + this.segmentDistance, y + h - this.segmentDistance);
        context.lineTo(x + this.segmentDistance, y + h - this.segmentDistance - r);
        context.lineTo(x + w - this.segmentDistance - r, y + this.segmentDistance);
        context.fill();
      }
      
      return this.digitDistance + this.digitWidth;
      
    case '.':
      context.fillStyle = (c == '#') || (c == '.') ? this.colorOn : this.colorOff;
      this.drawPoint(context, xPos, this.digitHeight - this.segmentWidth, this.segmentWidth);
      return this.digitDistance + this.segmentWidth;
      
    case ':':
      context.fillStyle = (c == '#') || (c == ':') ? this.colorOn : this.colorOff;
      var y = (this.digitHeight - this.segmentWidth) / 2.0 - this.segmentWidth;
      this.drawPoint(context, xPos, y, this.segmentWidth);
      this.drawPoint(context, xPos, y + 2.0 * this.segmentWidth, this.segmentWidth);
      return this.digitDistance + this.segmentWidth;
      
    default:
      return this.digitDistance;    
  }
};

SegmentDisplay.prototype.drawPoint = function(context, x1, y1, size) {
  var x2 = x1 + size;
  var y2 = y1 + size;
  var d  = size / 4.0;
  
  context.beginPath();
  context.moveTo(x2 - d, y1);
  context.quadraticCurveTo(x2, y1, x2, y1 + d);
  context.lineTo(x2, y2 - d);
  context.quadraticCurveTo(x2, y2, x2 - d, y2);
  context.lineTo(x1 + d, y2);
  context.quadraticCurveTo(x1, y2, x1, y2 - d);
  context.lineTo(x1, y1 + d);
  context.quadraticCurveTo(x1, y1, x1 + d, y1);
  context.fill();
}; 

SegmentDisplay.prototype.getSegmentColor = function(c, charSet7, charSet14, charSet16) {
  if (c == '#') {
    return this.colorOn;
  } else {
    switch (this.segmentCount) {
      case 7:  return (charSet7.indexOf(c) == -1) ? this.colorOff : this.colorOn;
      case 14: return (charSet14.indexOf(c) == -1) ? this.colorOff : this.colorOn;
      case 16: var pattern = charSet14 + (charSet16 === undefined ? '' : charSet16);
               return (pattern.indexOf(c) == -1) ? this.colorOff : this.colorOn;
      default: return this.colorOff;
    }
  }
};




