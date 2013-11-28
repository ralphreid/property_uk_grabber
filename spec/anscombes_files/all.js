$(document).ready(function(){
		var url = "/ajax";
		var rpc= $.rpc(url);
		var cache = [];
		var names = [];

		var searchbar = $("#searchBar").val();
		if(searchbar){
			if(searchbar.indexOf(",") != -1){
				$("#checkbox-result").val("true");
				$("#checkbox-result").attr('checked','checked');
				$("#headerRadius").val(3);
			}else{
				$("#checkbox-result").attr('checked',false);
				$("#checkbox-result").val('false');
			}
		}

		var	$viewCount = $('.info .view-count');
		if ($viewCount.size()) {
			$viewCount.css('opacity', 0);
			setTimeout(function() {
				$viewCount.animate({ opacity: 1 }, 300);
			}, 3000);
		}
		
		$("#address1sale").change(function(){
			$("#postaladdress1sale").val($("#address1sale").val());
		});
		$("#address2sale").keyup(function(){
			$("#postaladdress2sale").val($("#address2sale").val());
		});
		$("#address3sale").keyup(function(){
			$("#postaladdress3sale").val($("#address3sale").val());
		});
		$("#address4sale").keyup(function(){
			$("#postaladdress4sale").val($("#address4sale").val());
		});
		$("#postcodesale").keyup(function(){
			$("#postalpostcdesale").val($("#postcodesale").val());
		});

		/*TODO change from body */
		$("body").delegate("#Loadmore", "click", function(e) {
		  	e.preventDefault();
			//now we make a request to get the results
			var link = $(this).attr("href");
			$(this).remove();
			$(".imgLoader").show();
			$.ajax({
				url: link,
				success: function(data) {
					$(".imgLoader").remove();
					var page = $("#currentPage").val();
					page++;
			    	$("#content").append(data);	
			    	$("#currentPage").val(page);
					var $links = $("a.propertyLink");
					$.each($links, function(){
						var href = $(this).attr("href");
						key = "page";
						value = page;
						var kvp = href.split('&');
						var i=kvp.length; var x; while(i--) 
					    {
					        x = kvp[i].split('=');
					        if (x[0]==key)
					        {
					            x[1] = value;
					            kvp[i] = x.join('=');
					            break;
					        }
					    }
					    if(i<0) {kvp[kvp.length] = [key,value].join('=');}
					    $(this).attr("href", kvp.join('&'));
					});
			  	}
			});
		});
	
		$('#searchBar').typeahead({
			source: function (typeahead, query) {
				/* firstly we do a rpc call to check if we have any matches */
				var url = "/ajax";
				var rpc= $.rpc(url);	
				rpc.invoke('getSearchResults',{
					term: query
				}, function(data) {
					// typeahead.process(data);
					cache = [];
					names = [];
					$.each(data, function(val, result){
						cache.push(result);
						names.push(result.name);				
					});
				});
				if(names.length != 0){
					typeahead.process(names);
					return;
				}
				return;
			},
			onselect: function (obj) {

				var distance = 1;
				var match = false;
				$.each(cache, function(val,result){
					if(result.name == obj){
						minDist = 5;
						if(result.name.indexOf(",") != -1){
							$("#checkbox-result").val("true");
							$("#checkbox-result").attr('checked','checked');
							minDist = 3;
						}else{
							// $("#checkbox-result").val("false");
							// $("#checkbox-result").attr('checked',false);
						}
						if(match === true){
							return;
						}
						match = true;
						if(result.longitude == 0 && result.latitude == 0){
							//we use google geocoder to get the lat and and lng
							var geocoder = new google.maps.Geocoder();
							var address = result.name + ', UK';
							geocoder.geocode({ 'address': address, 'region' : 'GB' }, function (results, status) {
								var options = new Object;
								if (status == google.maps.GeocoderStatus.OK) {
									var name = "";
									gresult = results[0];

									// name = gresult.formatted_address;
									var nrthEast = gresult.geometry.viewport.getNorthEast();
									var sthWest = gresult.geometry.viewport.getSouthWest();
									distance = google.maps.geometry.spherical.computeDistanceBetween(nrthEast,sthWest);
									//  1 609.344 is distance to meters
									distance = distance / 1609.344;
									distance = distance / 2;
									options.lat = gresult.geometry.location.lat();
									options.lng = gresult.geometry.location.lng();
									var url = "/ajax";
									var rpc= $.rpc(url);	
									rpc.invoke('updateSearchRadius',{
										name: result.name,
										latitude: gresult.geometry.location.lat(),
										longitude: gresult.geometry.location.lng(),
										radius: parseInt(distance<minDist?minDist:distance)
									});
									if($(".welcome-anscombes").css("display") == "block"){
										$("#headerRadius").val("1");
									}else{
										$("#headerRadius").val(distance<minDist?minDist:distance);
									}
									$("#longitude").val(options.lng);
									$("#latitude").val(options.lat);
								}
							});
						}

						$("#longitude").val(result.longitude);
						$("#latitude").val(result.latitude);
						if($(".welcome-anscombes").css("display") == "block"){
							$("#headerRadius").val("1");
						}else{
							$("#headerRadius").val(result.radius<minDist?minDist:result.radius);
						}

					}
				});	
				if($("#searchBar").hasClass("mobile")){
					$("#form-search").submit();
				}
			}
		});
		$('#searchBar').bind('keyup', function() { 
			 $("#longitude").val("");
			$("#latitude").val("");
		});

		$("#areaNotFoundButton").click(function(){
			var area = $("#areaNotFoundDropdown").val();
			var geocoder = new google.maps.Geocoder();
			var address = area + ', UK';
			geocoder.geocode({ 'address': address, 'region' : 'GB' }, function (results, status) {
				var options = new Object;
				if (status == google.maps.GeocoderStatus.OK) {
					var name = "";
					gresult = results[0];
					// name = gresult.formatted_address;
					var nrthEast = gresult.geometry.viewport.getNorthEast();
					var sthWest = gresult.geometry.viewport.getSouthWest();
					distance = google.maps.geometry.spherical.computeDistanceBetween(nrthEast,sthWest);
					//  1 609.344 is distance to meters
					distance = distance / 1609.344;
					distance = distance / 2;
					if(distance < 1){
						distance = 1;
					}
					/*Postcode distances go here*/
					if(area.match(/\d+/g)){
					//we have a postcode or a number
						search = area.replace(" ","");
						if(search.length == 3 || search.length == 4){
							distance  = 2;
						}
						if(search.length == 6 || search.length == 7){
							distance = 1;
						}
					}
					options.lat = gresult.geometry.location.lat();
					options.lng = gresult.geometry.location.lng();
					options.distance = distance;
					$("#areaNotFoundLongitude").val(options.lat);
					$("#areaNotFoundLatitude").val(options.lng);
					$("#areaNotFoundRadius").val(options.distance);
					$("#areaNotFound").submit();

				}else{
					return false;
				}
			});
			
		});	



		if ($("#slider-homepage ul").length) {
			$('#slider-homepage ul').bxSlider();
		}
		
		/*view property slider*/
		$(function(){
			var pause = true, sliderProduct;

			// initalise recommended slider
			
			if($("#list-recommended").length){
				$('#list-recommended').bxSlider({
					auto				: false,
					pager				: true,
					pagerType			: 'short',
					pagerShortSeparator	: 'of',
					pagerLocation		: 'top',
					infiniteLoop		: false,
					hideControlOnEnd	: true
				});
			}
				setTimeout(function(){
					$('#recommended').attr('style', '');
				}, 1);
			// }
			
			
			if($("#list-alsoviewed").length){
				$('#list-alsoviewed').bxSlider({
					auto				: false,
					pager				: true,
					pagerType			: 'short',
					pagerShortSeparator	: 'of',
					pagerLocation		: 'top',
					infiniteLoop		: false,
					hideControlOnEnd	: true
				});
				
			}
			
			if($("#slideshow-recently ul").length){
				if($("#slideshow-recently .item").length > 3){
					$("#slideshow-recently ul").bxSlider({
						displaySlideQty:3
						// nextSelector:"#next-recently-viewed",
						// prevSelector:"#prev-recently-viewed"
					});
				}
			}
			if($("#slider-product ul").length){
				sliderProduct = $("#slider-product ul").bxSlider({
					pager				: true,
					pagerType			: 'short',
					pagerShortSeparator	: 'of',
					auto				: true,
					autoStart			: false,
					autoControls		: true,
					autoControlsSelector: '#panel-slider-product',
					captions			: true,
					captionsSelector	: '.bx-caption'
				});
				$('#slider-product div.bx-pager').prepend('Photo&nbsp;');
				$('#panel-slider-product').append('<span class="tag-slideshow">Slideshow</span>');
			} else {
				sliderProduct = false
			}
			
			if($("#tabs-product ul").length){
				$("#tabs-product ul").bxSlider({
					displaySlideQty		: 4,
					infiniteLoop		: false
				});
				$('#tabs-product a.link-thumb').click( function(e) {
					e.preventDefault();
					if(sliderProduct) {
						var thumbIndex = $('#tabs-product a.link-thumb').index(this);
						sliderProduct.goToSlide(thumbIndex-1);
					}
				});
			}
		
		});
	});