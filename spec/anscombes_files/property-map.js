(function ($) {
	var fillColor = '#9FBFDC';
	var strokeColor = '#eb1d24';
	var strokeWeight = 2;
	var fillOpacity = 0.3;
	var markerIcon = "/img/icon-red.png";
	var soldMarkerIcon = "/img/icon-faded.png";
	var defaultOptions = {
		center: new google.maps.LatLng(51.47805, -1.83597),		// botton of the UK
		zoom: 7,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		maxZoom: 16
	};

	function mapPoints(){
		this.points = [];
	};

	var PropertyMap = function(container, options) {
		var options = $.extend({}, defaultOptions, options);
		var drawingmanager;
		var overlay;
		this.bounds = new google.maps.LatLngBounds();
		this.polygon;
		this.propertyMarkers = [];
		this.branchMarkers = [];
		this.infowindows = [];
		this.infowindow;
		this.circle;
		this.groupInfoWindow;
		this.map = new google.maps.Map(
			document.getElementById(container),
			options
		);

		this.map.setOptions({draggableCursor:'crosshair'});
		/* DRAWING STUFF */
		drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.POLYGON,
			drawingControl: false,
			polygonOptions: {
				editable: true,
				draggable: true,
				clickable: false,
				map: this.map,
				strokeWeight: strokeWeight,
				fillColor: fillColor,
				strokeColor: strokeColor,
				fillOpacity: fillOpacity,
				outline: true
			},
			map: this.map
		});
		me = this;
		google.maps.event.addListener(this.map, 'zoom_changed', function() {
			if(me.infowindow){
				me.infowindow.close();
			}
			if(me.groupInfoWindow){
				me.groupInfoWindow.close();
			}
		});

		me = this;
		this.noneEditable = function(){
			drawingManager.setDrawingMode(null);
			this.map.setOptions({draggableCursor:'hand'});
		}

		this.zoom = function(zoomLevel){
			this.map.setZoom(zoomLevel);
		}

		this.userMarker = function(lat,lng){
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(lat, lng),
				map: this.map,
				title: "your location",
				icon: markerIcon
			});
		}

		this.getPoints = function(){
			vertices = this.polygon.getPath();
			var points = [];
			// Iterate over the vertices.
			if(this.polygon.getMap() == null){
				return false;
			}

			for (var i =0; i < vertices.length; i++) {
				var xy = vertices.getAt(i);
				points.push(xy.lat() +"," + xy.lng());
			}
			return JSON.stringify({points: points});
		}

		this.setPoints = function(points, editable){
			var poly = [];
			$.each(points.points, function(point,val) {
				vals = val.split(",");
				poly.push(new google.maps.LatLng(vals[0], vals[1]));
				me.bounds.extend(new google.maps.LatLng(vals[0], vals[1]));
			});

			this.polygon = new google.maps.Polygon({
				editable: editable,
				draggable: true,
				clickable: false,
				map: this.map,
				strokeWeight: strokeWeight,
				fillColor: fillColor,
				strokeColor: strokeColor,
				fillOpacity: fillOpacity,
				outline: true,
				outline: true,
				paths : poly
			});
			this.noneEditable();
			this.map.panTo(this.bounds.getCenter());
			this.map.fitBounds( this.bounds );
			// google.maps.event.addListener(this.map,'rightclick',me.deleteNode);
			google.maps.event.addListener(this.polygon.getPath(),'set_at',me.pointUpdated);
			google.maps.event.addListener(this.polygon.getPath(),'insert_at',me.pointUpdated);
			me.addDeleteButton(me.polygon, 'http://i.imgur.com/RUrKV.png');
		}

		this.clearPoints = function(){
			this.polygon.points = [];
			this.polygon.setMap(null);
			drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
			$("#mapId").val(0);
		}

		me = this;
		this.pointUpdated = function pointUpdated(index, el) {
			var path = me.polygon.getPath();
			var btnDelete = $("img[src$='http://this.isfluent.com/media/1012948/delete_poly.png']");
			if(btnDelete.length === 0) 
			{
				var undoimg = $("img[src$='http://maps.gstatic.com/mapfiles/undo_poly.png']");
				
				undoimg.parent().css('height', '21px !important');
				undoimg.parent().parent().append('<div style="overflow-x: hidden; overflow-y: hidden; position: absolute; width: 30px; height: 27px;top:21px;"><img src="http://this.isfluent.com/media/1012948/delete_poly.png" class="deletePoly" style="height:auto; width:auto; position: absolute; left:0;"/></div>');
				
				// now get that button back again!
				btnDelete = $("img[src$='http://this.isfluent.com/media/1012948/delete_poly.png']");
				btnDelete.hover(function() { $(this).css('left', '-30px'); return false;}, 
								function() { $(this).css('left', '0px'); return false;});
				btnDelete.mousedown(function() { $(this).css('left', '-60px'); return false;});
			}
			
			  // if we've already attached a handler, remove it
			  if(path.btnDeleteClickHandler) 
			    btnDelete.unbind('click', path.btnDeleteClickHandler);
			    
			  // now add a handler for removing the passed in index
			  path.btnDeleteClickHandler = function() {
			    path.removeAt(index); 
			    return false;
			  };
			  btnDelete.click(path.btnDeleteClickHandler);
		}

		this.drawRadius = function(center,radius){
			/* we get the radius in miles */
			/*convery radius in miles to meters*/
			radius = radius * 1609.344;


			/*we dont get latlng as a google object*/
			center = center.split(",");
			this.circle = new google.maps.Circle({
				center: new google.maps.LatLng(center[0],center[1]),
				radius: radius,
				editable: false,
				fillColor: fillColor,
				strokeColor: strokeColor,
				strokeWeight: strokeWeight,
				fillOpacity: fillOpacity,
				clickable: false,
				map: this.map
			});
			drawingManager.setDrawingMode(null);
			
			this.map.panTo(this.circle.getCenter());
			this.map.fitBounds( this.circle.getBounds() );
		}

		this.changeRadius = function(radius){
			radius = radius * 1609.344;
			this.circle.setOptions({"fillOpacity":0.7, "strokeOpacity":0.4});
			this.circle.setRadius(radius);
		}		

		this.addDeleteButton = function(poly, imageUrl) {
			var path = poly.getPath();
			path["btnDeleteClickHandler"] = {};
			path["btnDeleteImageUrl"] = imageUrl;
		  
			google.maps.event.addListener(poly.getPath(),'set_at',this.pointUpdated);
			google.maps.event.addListener(poly.getPath(),'insert_at',this.pointUpdated);
		}

		this.clearProperties = function() {
			for (var i = 0; i < this.propertyMarkers.length; ++i) {
				this.propertyMarkers[i].setMap(null);
			}

			this.propertyMarkers = [];
		};

		this.displayOffice = function(office, popup){
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(office.branchLatitude, office.branchLongitude),
				map: this.map,
				title: office.officeName,
				icon: markerIcon
			});
			if(popup ==true){
				infowindow = new google.maps.InfoWindow({
					content: '<div class="property-map-container clearfix"><div class="content-property-map"><h3 class="price">' + office.branchSmallName + '</h3><h4>' + office.branchCounty + '</h4><h2><a href="' + office.branchUrl + '">' + office.branchAddress + '</a></h2><ul><li><a href="' + office.branchUrl + '"><i class="icon-arrow-blue"></i>Details</a></li></ul></div></div>'
				});

				this.branchMarkers.push(marker);
				this.infowindows.push(infowindow);
				
				marker.identifier = this.infowindows.length - 1;
				
				me = this;
				google.maps.event.addListener(this.branchMarkers[this.branchMarkers.length-1], 'click', function(){
					if(me.infowindow){
						me.infowindow.close();
					}
					if(me.groupInfoWindow){
						me.groupInfoWindow.close();
					}
					me.infowindows[this.identifier].open(me.map,this);
					me.infowindow = me.infowindows[this.identifier];
				});
			}
			this.bounds.extend(new google.maps.LatLng(office.branchLatitude, office.branchLongitude));
			this.centerMap(office.branchLatitude, office.branchLongitude);
		};

		this.displayOffices = function(offices){
			me = this;
			$.each(offices, function(x, office) {
				me.displayOffice(office, true);
			});
			this.map.panTo(this.bounds.getCenter());
			this.map.fitBounds( this.bounds );
		};

		this.displayProperties = function(properties, hideCluster) {

			var baseUrl = $("#baseUrl").val();
			var i, l, property;
			this.clearProperties();
			for (i = 0, l = properties.length; i < l; ++i) {
				property = properties[i];
				if(i==0){
					this.centerMap(property.latitude, property.longitude);
				}

				icon = markerIcon;
				if(property.status == true){
					icon = soldMarkerIcon;
				}
				this.bounds.extend(new google.maps.LatLng(property.latitude, property.longitude));
				marker = new google.maps.Marker({
					position: new google.maps.LatLng(property.latitude, property.longitude),
					map: this.map,
					// title: property.reference,
					icon: icon
				});
				marker.identifier = i;
				
				var url = document.URL;
				var queryString = url.substr(url.indexOf("?"));
				var buttonValue = "Save";
				if (property.saved == true){
					buttonValue = "Remove"
				}
				var saveForm = '<form method="post" class="form-inline" action="">';
				saveForm = saveForm + '<input type="hidden" name="action" value="saveProperty"/>';
				saveForm = saveForm + '<input type="hidden" name="propertyId" value="' + property.reference + '"/>';
				saveForm = saveForm + '<button type="submit" class="btn btn-save"><i class="icon-arrow-blue"></i>'+ buttonValue +'</button>';
				saveForm = saveForm + '</form>';
				

						//				    content: "&pound;" + property.price + "<br/>" + property.address + "<br/><img width=50 height=50 src='" + property.photo + "'>" + "<a href='" + property.url +"/" + queryString+"'>" +property.beds + " bedroom " + property.type + "</a><br/>" + saveForm + "<hr/>"

				var infowin = new google.maps.InfoWindow({
					content: '<div class="property-map-container clearfix"><a href="' + property.url + '"><img width=100 height=75 class="imgframe" src="' + property.photo + '"></a><div class="content-property-map"><h3 class="price">' + property.price + '</h3><h4>' + property.title + '</h4><h2><a href="' + property.url + '">' + property.address + '</a></h2><ul><li>' + saveForm + '</li><li><a href="' + property.url + '"><i class="icon-arrow-blue"></i>Details</a></li></ul></div></div>'
				});
				this.infowindows.push(infowin);
				this.propertyMarkers.push(marker);

				me = this;

				google.maps.event.addListener(this.propertyMarkers[i], 'click', function() {
					if(me.infowindow){
						me.infowindow.close();
					}
					if(me.groupInfoWindow){
						me.groupInfoWindow.close();
					}
					me.infowindows[this.identifier].open(me.map,this);
					me.infowindow = me.infowindows[this.identifier];
				});
			}
			this.map.panTo(this.bounds.getCenter());
			this.map.fitBounds(this.bounds);
			me = this;
			if(hideCluster!=true){
				mcOptions = {styles: [{
						height: 34,
						url: markerIcon,
						width: 30,
						textColor: 'white',
						backgroundPosition: '0 4px'
					},
					{
						height: 34,
						url: markerIcon,
						width: 30,
						textColor: 'white',
						backgroundPosition: '0 4px'
					},
					{
						height: 34,
						url: markerIcon,
						width: 30,
						textColor: 'white',
						backgroundPosition: '0 4px'
					},
					{
						height: 34,
						url: markerIcon,
						width: 30,
						textColor: 'white',
						backgroundPosition: '0 4px'
					},
					{
						height: 34,
						url: markerIcon,
						width: 30,
						textColor: 'white',
						backgroundPosition: '0 4px'
					}],"zoomOnClick":false,"gridSize":30,"maxZoom":16}


				var markerCluster = new MarkerClusterer(this.map, this.propertyMarkers, mcOptions);
				google.maps.event.addListener(markerCluster, 'clusterclick', function(cluster) {
					markers = cluster.getMarkers();
					info = "<h2 class='popuph2'>" + markers.length + " Properties</h2>";
					$.each(markers, function(x, marker) {
						if(me.infowindows[marker.identifier]){
							info = info + "<br/>" + me.infowindows[marker.identifier].content;
						}
					});
					if(me.groupInfoWindow){
						me.groupInfoWindow.close();
					}
					if(me.infowindow){
						me.infowindow.close();
					}
					me.groupInfoWindow = new google.maps.InfoWindow();
					me.groupInfoWindow.setContent(info);
	    			myLatlng = new google.maps.LatLng(cluster.getCenter().lat(), cluster.getCenter().lng());
	     			me.groupInfoWindow.setPosition(myLatlng);
	     			me.groupInfoWindow.open(me.map);
				});
			}
		};

		this.centerMap = function(lat, long){
			this.map.panTo(new google.maps.LatLng(lat, long));
		};

		this.clearMarkers = function() {
			for (var i = 0; i < this.polygonPoints.length; i++ ) {
				this.polygonPoints[i].setMap(null);
			}
		}
		me = this;
		google.maps.event.addListener(this.map, 'rightclick', function(click){
			me.deletePoint(click);
		});

		me = this;
		this.deletePoint = function(mev){
			var clickPoint = proj.fromLatLngToPoint(mev.latLng);
			var path = me.polygon.getPath();
			var minDist = 0.1;
			var nodeWidth = 6;
			var selectedIndex = -1;
			  
			  //point ready to store
			var nodeToDelete;
			  
			for (var n = 0 ; n < path.getLength() ; n++) {
				var nodePoint = proj.fromLatLngToPoint(path.getAt(n));
				var dist = Math.sqrt(Math.pow(Math.abs(clickPoint.x - nodePoint.x),2) + Math.pow(Math.abs(clickPoint.y - nodePoint.y),2));
				if (dist < minDist) {
				  minDist = dist;
				  selectedIndex = n;
				  
				  //store point
				  nodeToDelete = path.getAt(n);
				}
			}
		  
			var ovProj = overlay.getProjection();
			 
			var clickPx = overlay.getProjection().fromLatLngToContainerPixel(mev.latLng);
			var nodePx = overlay.getProjection().fromLatLngToContainerPixel(nodeToDelete);
			var xDist = Math.abs(nodePx.x - clickPx.x);
			var yDist = Math.abs(nodePx.y - clickPx.y);
			  
			if( xDist < nodeWidth && yDist < nodeWidth) {
				path.removeAt(selectedIndex);
			}
			return false;
		}

		me = this;
		google.maps.event.addListener(me.map,'projection_changed',function(){
			proj = me.map.getProjection();
			overlay = new google.maps.OverlayView();
			overlay.draw = function () { };
			overlay.setMap(me.map);
		});

		me = this;
		google.maps.event.addListener(drawingManager, 'polygoncomplete', function(poly) {
			me.polygon = poly;
			$('#drawMapSave').modal();
			drawingManager.setDrawingMode(null);      
			google.maps.event.addListener(poly.getPath(),'set_at',me.pointUpdated);
			google.maps.event.addListener(poly.getPath(),'insert_at',me.pointUpdated);
			me.addDeleteButton(me.polygon, 'http://i.imgur.com/RUrKV.png');
		});
	};

	window.PropertyMap = PropertyMap;
}(jQuery));

