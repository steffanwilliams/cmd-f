(function() {

  var buttonState;
  var canvas;
  
  var currentNode = 0;
  var matchedNodes =  new Array();
  
  var date = (new Date() - 0);
  var tag = 'match'+date;

  var colors = {
    iphone: {
      gradient: { 0: '#f1f3f4', 0.5: '#c4ccd2', 1: '#b4bec6' },
      active_button: '#fff',
      inactive_button: '#e0e5e8' //'#fff' : '#e0e5e8'
      //,gradient_blue: { 0: '#afbbcb', 0.48: '#8b9db5', 0.5: '#8195af', 1: '#6e86a4' }
    },
    ipad: {
      gradient: { 0: '#fff', 0.5: '#dbdde3', 1: '#a8acb9' },
      active_button: '#6a7178',
      inactive_button: '#b9bdc4'
    }
  };

  function init(){
    
    if (!document.body) {
      window.addEventListener("load", init, false);
      return;
    }

    canvas = document.createElement('canvas');
    var s = canvas.style;
    s.background = "none";
    s.border = "none";
    s.display = "block";
    s.left = s.top = 0;
    s.margin = 0;
    s.opacity = 1;
    s.padding = 0;
    s.position = "absolute";
    s.visibility = "visible";
    s.webkitTapHighlightColor = "rgba(0,0,0,0)";
    s.webkitTransformOrigin = "0% 0%";
    s.webkitUserSelect = 'none';
    s.zIndex = 2147483647;

    canvas.addEventListener('touchmove', touchStart, true);
    canvas.addEventListener('click', clickHandler, false);
    window.addEventListener('orientationchange', draw, false);        
    window.addEventListener('scroll', setLocation, false);
    document.body.addEventListener('touchstart', touchStart, true);
    document.body.addEventListener('touchend', touchEnd, true);

    document.body.appendChild(canvas);

    draw();

    //window.addEventListener('resize', draw, true);  — desktop feature
    //if ((navigator.platform.indexOf('iPhone') != -1) || (navigator.platform.indexOf('iPod') != -1) || (navigator.platform.indexOf('iPad') != -1)) { platform = 'iPhone'; } 
    //else if ((navigator.platform.indexOf('iPad') != -1)) { platform = 'iPad'; }
  }
  
  function setLocation(){
    var z = getZoomFactor(),
        x = (window.pageXOffset * (1/z))
        y = ((window.pageYOffset + window.innerHeight) - (canvas.height * z)) * (1/z);
    canvas.style.webkitTransform = 'scale(' + z + ') translateX('+x+'px) translateY('+y+'px)';
  }
  
  function resetSearch(){
    var d = document,
        nodes = d.getElementsByTagName(tag),
        nodeLength = nodes.length,
        p,
        c,
        frag;

    while(nodeLength--) {
      c = nodes[nodeLength];
      frag = d.createTextNode((c.firstChild.textContent));
      p = c.parentNode;  
      p.replaceChild(frag, c).normalize();
      p.normalize();
    }
  }
  
  function searchQuery(searchText){
    
    if (!searchText.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "").length) { draw(); return; }

    resetSearch();
    buttonState = false;

    var re          =   new RegExp("("+searchText.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/(\/|\.|\*|\+|\?|\||\(|\)|\[|\]|\{|\}|\\)/g, "\\$&")+")", "gi"),
        nodes       =   getMatches(searchText),
        nodeLength  =   nodes.length,
        text        =   "",
        currentNode,
        frag;

    if (nodeLength > 0) {
      while(nodeLength--) {
        currentNode =   nodes[nodeLength];
        frag = (function(){ 
          var d = document,
              wrap = d.createElement('div'),
              fragment = d.createDocumentFragment();
          wrap.innerHTML = currentNode.nodeValue.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(re, '<'+tag+' style="background:#ff0;">$1</'+tag+'>');
          while(wrap.firstChild){ fragment.appendChild(wrap.firstChild); }
          return fragment;
        })();
        
        currentNode.parentNode.replaceChild(frag, currentNode).normalize(); 
      }

      matchedNodes = document.getElementsByTagName(tag);
      text = matchedNodes.length + " match" + (matchedNodes.length == 1 ? "" : "es") + " found for '"+searchText+"'.";
      matchedNodes[0].style.background = '#ff9632';
      matchedNodes[0].scrollIntoView(true)
      currentNode = 0;
      if (matchedNodes.length > 1) buttonState = true;
    } 
    else { 
      text = "No matches found for '"+searchText+"'"; 
    }  
    if (text != "") alert(text);
    draw();
  }

  function findNext(direction){  
    var c = matchedNodes[currentNode],
        l = matchedNodes.length;
        
    c.style.background = '#ff0';
    currentNode += direction;
    if (currentNode < 0) { currentNode = l - 1; }
    else if (currentNode >= l) { currentNode = 0; }
    c = matchedNodes[currentNode];
    c.style.background = '#ff9632';
    c.scrollIntoView(true);
    setLocation();
  }
  
  function draw(){
    var factor = getZoomFactor();
    var w = canvas.width = getScreenDimensions();
    var h = canvas.height = 45;

    var midHeight = h / 2;
    var iconSpace = (Math.min(w, 480)) / 4;
    var iconWidth = 20;
    var iconPadding = (iconSpace - iconWidth) / 2;
    var screenOffset = Math.max(0, w / 2 - 240);
    
    var context = canvas.getContext('2d');
      
    // Background
    var grad = context.createLinearGradient(0, 0, 0, h);
    var stops = (w > 480) ? colors.ipad.gradient : colors.iphone.gradient;

    for (var position in stops) {
        var color = stops[position];
        grad.addColorStop(position, color);
    }
  
    context.fillStyle = grad;
    context.fillRect(0,0,w,h);        
  
    context.fillStyle = 'rgba(0,0,0,0.8)';
    context.fillRect(0,0,w, 0.5);

    if (w > 480) {  
      context.fillStyle = colors.ipad.active_button;
      context.strokeStyle = colors.ipad.active_button;
      context.shadowOffsetY = 1; 
      context.shadowColor = "rgba(255, 255, 255, 0.8)";
    } else {
      context.fillStyle = colors.iphone.active_button;
      context.strokeStyle = colors.iphone.active_button;     
      context.shadowOffsetY = -1;    
      context.shadowColor = "rgba(0, 0, 0, 0.2)"; 
    }
  
  
    // Search icon
    context.shadowOffsetX = 0;    
    context.shadowBlur = 0;   
    context.lineWidth = 3;
    //context.beginPath();
    context.arc((iconSpace * 0 + iconPadding + 6 + screenOffset), midHeight-2, 6, 0, Math.PI*2, true); // Outer circle        
    context.moveTo((iconSpace * 0 + iconPadding + screenOffset)+ 6+3.5, midHeight+4);
    context.lineTo((iconSpace * 0 + iconPadding + screenOffset)+6+7, midHeight+9);
    context.stroke();
  
    // Close icon
    context.beginPath();
    context.moveTo((iconSpace * 3 + iconPadding + 10 + screenOffset), midHeight);
    context.arc((iconSpace * 3 + iconPadding + 10 + screenOffset), midHeight, 10, 0, Math.PI*2, true); // Outer circle
    context.fill();
  
    context.beginPath();
    context.strokeStyle = grad;
    context.moveTo((iconSpace * 3 + iconPadding + 5 + screenOffset), midHeight-5);
    context.lineTo((iconSpace * 3 + iconPadding + 15 + screenOffset), midHeight+5);
    context.moveTo((iconSpace * 3 + iconPadding + 15 + screenOffset), midHeight-5);
    context.lineTo((iconSpace * 3 + iconPadding + 5 + screenOffset), midHeight+5);
    context.stroke();
  
    if (w > 480) { 
      context.fillStyle = (buttonState == true) ? colors.ipad.active_button : colors.ipad.inactive_button;
      context.shadowColor = "rgba(255, 255, 255, 0.5)";
    } else { 
      context.fillStyle = (buttonState == true) ? colors.iphone.active_button : colors.iphone.inactive_button;
    }

    context.beginPath();

    // Draw a right triangle.
    context.lineTo((iconSpace * 1 + iconPadding + iconWidth + screenOffset), midHeight-10);
    context.lineTo((iconSpace * 1 + iconPadding + screenOffset), midHeight);
    context.lineTo((iconSpace * 1 + iconPadding + iconWidth + screenOffset), midHeight+10);

    // Draw a left triangle.
    context.moveTo((iconSpace * 2 + iconPadding + screenOffset), midHeight-10);
    context.lineTo((iconSpace * 2 + iconPadding + screenOffset), midHeight-10);
    context.lineTo((iconSpace * 2 + iconPadding + iconWidth + screenOffset), midHeight);
    context.lineTo((iconSpace * 2 + iconPadding + screenOffset), midHeight+10);
    context.fill();
  
    setLocation();
  }

  function getMatches(searchText){
    var nodes = new Array();
    var d = document;
    var x = d.evaluate('.//text()[normalize-space(.) != ""]', d.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var t;
    var p;
   
    for (var i = 0, n = x.snapshotLength; i < n; i++) {
      t = x.snapshotItem(i);
      p = t.parentNode;
      if (t.data.toLowerCase().indexOf(searchText.toLowerCase()) != -1 && !/^(?:html|head|style|title|link|meta|script|object|iframe|textarea)$/.test(p.nodeName.toLowerCase())  && (d.defaultView.getComputedStyle(p, null).getPropertyValue("visibility") != 'hidden')) {
        nodes.push(t);
      }
    }
   return nodes;
  }

  function quit(){
    if (!confirm("Are you sure you want to quit \u2318-F?")) return;
    resetSearch();
    window.removeEventListener('orientationchange', draw, false);        
    // window.removeEventListener('resize', draw, false); — desktop feature
    window.removeEventListener('scroll', setLocation, true);
    document.body.removeEventListener('touchstart', touchStart, true);
    document.body.removeEventListener('touchend', touchEnd, true);
    canvas.parentNode.removeChild(canvas);
  }

  function getZoomFactor() { return window.innerWidth / getScreenDimensions(); }

  function getScreenDimensions(){
    var deviceWidth;
    
    if (navigator.platform.indexOf('iP') != -1) {
      if (Math.abs(window.orientation) == 90) { 
        deviceWidth = Math.max(480, screen.height);
      } else { 
        deviceWidth = screen.width;
      }
    } else {
      deviceWidth = document.documentElement.clientWidth;
    }
    return deviceWidth;
  }

  function touchStart(e){ 
    if (e.target && e.target != canvas || e.type == "touchmove") canvas.style.opacity = '0'; 
  }
  
  function touchEnd(){ 
    window.setTimeout(function(){ canvas.style.opacity = '1';}, 100); 
  }
  
  function clickHandler(e){
      var deviceWidth = getScreenDimensions();
      var x = (e.pageX - window.pageXOffset) * (1/getZoomFactor());
      var iconSpace = ((Math.min(deviceWidth, 480)) / 4);
      var screenOffset = Math.max(0, deviceWidth / 2 - 240);
  
      if (x > screenOffset && x < screenOffset + iconSpace) {
        searchQuery(prompt('Find:') || "");
      }
      if ((x > screenOffset + (iconSpace)) && (x < screenOffset + (iconSpace*2)) && buttonState) findNext(-1);
      if ((x > screenOffset + (iconSpace*2)) && (x < screenOffset + (iconSpace*3)) && buttonState) findNext(1);
      if ((x > screenOffset + (iconSpace*3)) && (x < screenOffset + (iconSpace*4))) quit();
  }
  init();
})();