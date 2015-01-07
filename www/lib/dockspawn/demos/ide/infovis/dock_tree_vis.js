var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){}
};

var _spaceTree;

function getJsonTree(dockNode) {
	var children = [];
	for (var i = 0; i < dockNode.children.length; i++) {
	  var childInfo = getJsonTree(dockNode.children[i]);
	  children.push(childInfo);
	}
	var id = dockNode.container.name;
	var title = id;
	var type = dockNode.container.containerType;
	if (type == "panel") {
		title = dockNode.container.title;
	}
	var caption = title + " [" + type + "]";
	var json = {
		id: id,
        name: caption,
        data: {},
        children: children
	};
	return json;
}

DockVisListener = function() {};
DockVisListener.prototype.onDock = function(dockManager, dockNode) {
	var rootNode = dockManager.context.model.rootNode;	// TODO: Root node is not synced properly
	RebuildDebugTree(rootNode);
};
DockVisListener.prototype.onUndock = function(dockManager, dockNode) {
	var rootNode = dockManager.context.model.rootNode;	// TODO: Root node is not synced properly
	RebuildDebugTree(rootNode);
};

function RebuildDebugTree(rootNode) {
	var json = getJsonTree(rootNode);
	BindDebugData(json);
}

function InitDebugTreeVis(dockManager) {
    var dockListener = new DockVisListener();
	dockManager.addLayoutListener(dockListener);

    //Implement a node rendering function called 'nodeline' that plots a straight line
    //when contracting or expanding a subtree.
    $jit.ST.Plot.NodeTypes.implement({
        'nodeline': {
          'render': function(node, canvas, animating) {
                if(animating === 'expand' || animating === 'contract') {
                  var pos = node.pos.getc(true), nconfig = this.node, data = node.data;
                  var width  = nconfig.width, height = nconfig.height;
                  var algnPos = this.getAlignedPos(pos, width, height);
                  var ctx = canvas.getCtx(), ort = this.config.orientation;
                  ctx.beginPath();
                  if(ort == 'left' || ort == 'right') {
                      ctx.moveTo(algnPos.x, algnPos.y + height / 2);
                      ctx.lineTo(algnPos.x + width, algnPos.y + height / 2);
                  } else {
                      ctx.moveTo(algnPos.x + width / 2, algnPos.y);
                      ctx.lineTo(algnPos.x + width / 2, algnPos.y + height);
                  }
                  ctx.stroke();
              } 
          }
        }
          
    });
	
    //init Spacetree
    //Create a new ST instance
    var st = new $jit.ST({
        //id of viz container element
        injectInto: 'infovis',
        //set duration for the animation
        duration: 0,
        //set animation transition type
        transition: $jit.Trans.Quart.easeInOut,
        //set distance between node and its children
        levelDistance: 50,
		subtreeOffset: 10,  
		siblingOffset: 20,  
		levelsToShow: 100,
		constrained: false,
		orientation: 'top',
        //enable panning
        Navigation: {
          enable:true,
          panning:true
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: {
            height: 20,
            width: 140,
            //use a custom
            //node rendering function
            type: 'nodeline',
            color:'#23A4FF',
            lineWidth: 2,
            align:"center",
            overridable: true
        },
        
        Edge: {
            type: 'bezier',
            lineWidth: 2,
            color:'#23A4FF',
            overridable: true
        },
        
        onBeforeCompute: function(node){
            Log.write("loading " + node.name);
        },
        
        onAfterCompute: function(){
            Log.write("done");
        },
        
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
            label.id = node.id;            
            label.innerHTML = node.name;
            label.onclick = function(){
            	if(normal.checked) {
            	  st.onClick(node.id);
            	} else {
                st.setRoot(node.id, 'animate');
            	}
            };
            //set label styles
            var style = label.style;
            style.width = 140 + 'px';
            style.height = 17 + 'px';            
            style.cursor = 'pointer';
            style.color = '#fff';
            style.fontSize = '0.8em';
            style.textAlign= 'center';
            style.paddingTop = '3px';
        },
        
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){
            //add some color to the nodes in the path between the
            //root node and the selected node.
            if (node.selected) {
                node.data.$color = "#ff7";
            }
            else {
                delete node.data.$color;
                //if the node belongs to the last plotted level
                if(!node.anySubnode("exist")) {
                    //count children number
                    var count = 0;
                    node.eachSubnode(function(n) { count++; });
                    //assign a node color based on
                    //how many children it has
                    node.data.$color = ['#aaa', '#baa', '#caa', '#daa', '#eaa', '#faa'][count];                    
                }
            }
        },
        
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
            if (adj.nodeFrom.selected && adj.nodeTo.selected) {
                adj.data.$color = "#eed";
                adj.data.$lineWidth = 3;
            }
            else {
                delete adj.data.$color;
                delete adj.data.$lineWidth;
            }
        }
    });
	
	_spaceTree = st;
	RebuildDebugTree(dockManager.context.model.rootNode);
}


function BindDebugData(json) {
    //load json data
    _spaceTree.loadJSON(json);
    //compute node positions and layout
    _spaceTree.compute();
    //optional: make a translation of the tree
    _spaceTree.geom.translate(new $jit.Complex(0, 0), "current");
    //emulate a click on the root node.
    _spaceTree.onClick(_spaceTree.root);
}