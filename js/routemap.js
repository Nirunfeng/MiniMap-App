/**
 * 全局参数
 */
 var map;
 var clickPoint;
 var currentpoint;
 var start;
 var end;
 var tarpoint;
 
/**
 * 初始化定位
 */
 function Init() {
	map= new BMap.Map("routemap");
    //定位组件
    var geolocation = new BMap.Geolocation(); //百度包装好的定位库
    //获取当前定位，返回位置
    geolocation.getCurrentPosition(function(r) {
        if(this.getStatus() == BMAP_STATUS_SUCCESS) {
            //获取位置坐标
            currentpoint=r.point;
            map.centerAndZoom(currentpoint, 15);                 // 初始化地图，设置中心点坐标和地图级别
            //自定义点形状
            var marker=new BMap.Marker(currentpoint);
            map.addTileLayer(new BMap.TrafficLayer());                    // 将图层添加到地图上
            //添加进图层
            map.addOverlay(marker);
            map.panTo(currentpoint);
        }else{
            alert('failed' + this.getStatus());
        }
    },
	{
        //使浏览器获取高精度定位
        enableHighAccuracy: true,
        SDKLocation:true
    });
	
 }
 
 
 /**
  * 滑动地图事件
  */
 function moveMap(){
 	//TODO:解决移动端 click事件点击无效
 	map.addEventListener("touchmove", function (e) {
		console.log("开始滑动")
 	    map.enableDragging();
 	});
 	// TODO: 触摸结束时触发次此事件  此时开启禁止拖动
 	map.addEventListener("touchend", function (e) {
 	    map.disableDragging();
 	});
 }


 /**
  * 获取单击位置坐标
  */
function ClickPoint(){
	//进行位置解析
	map.addEventListener("click",function(e){
		map.clearOverlays();
		//获取单击点的位置
		clickPoint=new BMap.Point(e.point.lng, e.point.lat);
		//定义单击点的标记
		var clickMarker=new BMap.Marker(clickPoint);
		//将marker添加到图层上并移动至单击处
		map.addOverlay(clickMarker);
	});
	return clickPoint;
}


/**
 * 关键字搜索方法
 */
function searchPOI(){
	//建立自动完成对象
	var autoComplete=new BMap.Autocomplete({
		"input":"route_place",
		"location":map
	});
	//获取下拉列表对象
	var searchResultPanel=document.getElementById("searchResultPanel");
	
	//放在下拉列表上的事件
	 autoComplete.addEventListener("onhighlight",function(e){
		 var str = "";
		 //获取关键词模糊查询结果
		 var _value = e.fromitem.value;
		 var value = "";
		 if (e.fromitem.index > -1) {
		 	value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		 }    
		 str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;
		 		
		 value = "";
		 if (e.toitem.index > -1) {
		 	_value = e.toitem.value;
		 	value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		 }    
		str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
		searchResultPanel.innerHTML=str;
	 });
	 
	 //鼠标点击下拉列表后的事件
	 autoComplete.addEventListener("onconfirm",function(e){
		 var _value = e.item.value; 
		 myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
		 searchResultPanel.innerHTML="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
		 setPlace();
		 
		 //获取常驻关键词数据并写入后台
		 freqSearchData=_value.province +  _value.city 
	 });
	 
	 //TODO向后台传输数据
	 
}

/**
 * setPlaceToTargetPOI
 */
function setPlace(){
	map.clearOverlays();    //清除地图上所有覆盖物
	function myFun(){
		tarpoint = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
		map.centerAndZoom(tarpoint, 15);
		map.addOverlay(new BMap.Marker(tarpoint));    //添加标注
	}
	var local=new BMap.LocalSearch(map,{
		onSearchComplete: myFun
	});
	local.search(myValue);
	return tarpoint;
}

/**
 * 驾车工具方法
 */
function CarRoute(){
	//按钮更改颜色
	//按钮更改颜色
	$(".car_btn").css("background-color","green");
	$(".bike_btn").css("background-color","rgb(250,250,250)");
	$(".bus_btn").css("background-color","rgb(250,250,250)");
	$(".foot_btn").css("background-color","rgb(250,250,250)");
	map.clearOverlays();
	//声明起点终点
	/**
	 * if(输入点==null){
		 start=currentpoint;
		 end=clickPoint;
	 }else{
		 start=输入点
		 end=输入点
	 }
	 */
	start=currentpoint;
	end=clickPoint;
	
	var driving = new BMap.DrivingRoute(map, {
		renderOptions:{
			map: map, 
			autoViewport: true,
	},
	});
	driving.search(start, end);
}

/**
 * 公交工具方法
 */
function BusRoute(){
	//按钮更改颜色
	$(".bus_btn").css("background-color","green");
	$(".bike_btn").css("background-color","rgb(250,250,250)");
	$(".car_btn").css("background-color","rgb(250,250,250)");
	$(".foot_btn").css("background-color","rgb(250,250,250)");
	map.clearOverlays();
	//声明起点终点
	/**
	 * if(输入点==null){
		 start=currentpoint;
		 end=clickPoint;
	 }else{
		 start=输入点
		 end=输入点
	 }
	 */
	start=currentpoint;
	end=clickPoint;
	
	var transit = new BMap.TransitRoute(map, { 
	    renderOptions: { 
	        map: map, 
	        autoViewport: true 
	    } ,
		// 配置跨城公交的换成策略为优先出发早
		
		 intercityPolicy: BMAP_INTERCITY_POLICY_EARLY_START,
		
		// 配置跨城公交的交通方式策略为飞机优先
		
		transitTypePolicy: BMAP_TRANSIT_TYPE_POLICY_AIRPLANE
	});
	transit.search(start, end);
}

/**
 * 骑行工具方法
 */
function BikeRoute(){
	//按钮更改颜色
	$(".bike_btn").css("background-color","green");
	$(".car_btn").css("background-color","rgb(250,250,250)");
	$(".bus_btn").css("background-color","rgb(250,250,250)");
	$(".foot_btn").css("background-color","rgb(250,250,250)");
	map.clearOverlays();
	//声明起点终点
	/**
	 * if(输入点==null){
		 start=currentpoint;
		 end=clickPoint;
	 }else{
		 start=输入点
		 end=输入点
	 }
	 */
	start=currentpoint;
	end=clickPoint;
	
	var riding = new BMap.RidingRoute(map, { 
	    renderOptions: {map: map} 
	}); 
	riding.search(start, end);
}

/**
 * 步行工具方法
 */
function FootRoute(){
	//按钮更改颜色
	$(".foot_btn").css("background-color","green");
	$(".bike_btn").css("background-color","rgb(250,250,250)");
	$(".car_btn").css("background-color","rgb(250,250,250)");
	$(".bus_btn").css("background-color","rgb(250,250,250)");
	map.clearOverlays();
	//声明起点终点
	/**
	 * if(输入点==null){
		 start=currentpoint;
		 end=clickPoint;
	 }else{
		 start=输入点
		 end=输入点
	 }
	 */
	start=currentpoint;
	end=clickPoint;
	
	var walk = new BMap.WalkingRoute(map, { 
	    renderOptions: {map: map} 
	}); 
	walk.search(start, end);
}