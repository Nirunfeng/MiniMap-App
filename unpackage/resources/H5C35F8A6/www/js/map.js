//全局变量
var map;	//地图组件
var currentPoint;	//当前位置
var opts = {offset: new BMap.Size(10, 120)}	//定位控件位置
var geolocationControl=new BMap.GeolocationControl(opts);// 定位控件 
var Locicon=new BMap.Icon("../images/locicon.png",new BMap.Size(35,35));
var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例 
//检索地点时定义target地点
var myValue;
//常驻关键词数据
var freqSearchData;

/**
  * 初始化展示地图
*/
function init(){
	map = new BMap.Map("map");   // 创建地图实例
	//获取当前定位
	getCurrentLocation();
	map.enableScrollWheelZoom(true);                 // 开启鼠标滚轮缩放
	map.addControl(geolocationControl); 			// 定位控件
}

/**
 * 获取定位方法
 */	  
function getCurrentLocation(){
	var geolocation = new BMap.Geolocation(); //百度包装好的定位库  
	//获取当前定位，返回位置
	geolocation.getCurrentPosition(function(r) {
		if(this.getStatus() == BMAP_STATUS_SUCCESS) {
			//获取位置坐标
			currentPoint=r.point;
			map.centerAndZoom(currentPoint, 15);                    // 初始化地图，设置中心点坐标和地图级别
			//进行标记点标记
			//自定义点形状
			var marker=new BMap.Marker(currentPoint);
			//添加进图层
			map.addOverlay(marker);
			map.panTo(currentPoint);
		}else{
			alert('failed' + this.getStatus());
		}
	},{
		//使浏览器获取高精度定位
		enableHighAccuracy: true,
		SDKLocation:true
	});
}

/**
 * 单击地图事件:获取单击地点的名称详情，位置等信息
 */
function clickMap(){
	//经纬度
	var lat="";
	var lng="";
	map.addEventListener("click",function(e){
		/* 1.获取单击标记点并移动到该位置 */
		//清除之前的标记点
		map.clearOverlays();
		//获取单击地图位置的point
		var clickPoint=new BMap.Point(e.point.lng, e.point.lat);
		//定义单击点的标记
		var clickMarker=new BMap.Marker(clickPoint);
		//将marker添加到图层上并移动至单击处
		map.addOverlay(clickMarker);
		map.panTo(clickPoint);
		
		/* 2.获取单击位置的信息 */
		//获取地址解析实例
		var geoCoder=new BMap.Geocoder();
		//获取定位信息
		geoCoder.getLocation(clickPoint,function(res){
			//获取地址名称
			var locname=res.surroundingPois[0].title;
			//获取地址信息
			var address=res.surroundingPois[0].address;
			//经纬度
			lng=res.surroundingPois[0].point.lng;
			lat=res.surroundingPois[0].point.lat;
			
			/* 3.设置窗体信息 */
			//TODO设置收藏，写入后端
			var opts = {    
			    width : 250,     // 信息窗口宽度    
			    height: 100,     // 信息窗口高度    
			    title : locname  // 信息窗口标题   
			}    
			var infoWindow = new BMap.InfoWindow(address, opts);  // 创建信息窗口对象    
			map.openInfoWindow(infoWindow, clickPoint);      // 打开信息窗口
		});	
	});
}

/**
 * 滑动地图事件
 */
function moveMap(){
	//TODO:解决移动端 click事件点击无效
	map.addEventListener("touchmove", function (e) {
	    map.enableDragging();
	});
	// TODO: 触摸结束时触发次此事件  此时开启禁止拖动
	map.addEventListener("touchend", function (e) {
	    map.disableDragging();
	});
}

/**
 * 关键字搜索方法
 */
function searchPOI(){
	//建立自动完成对象
	var autoComplete=new BMap.Autocomplete({
		"input":"header-text",
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
		var tarpoint = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
		map.centerAndZoom(tarpoint, 15);
		map.addOverlay(new BMap.Marker(tarpoint));    //添加标注
	}
	var local=new BMap.LocalSearch(map,{
		onSearchComplete: myFun
	});
	local.search(myValue);
}

/**
 * 搜索分类美食方法
 */
function SearchFood(){
	var mainKey=document.getElementById("food").getAttribute("value");
	console.log(mainKey);
	SearchNear(mainKey);
}

/**
 * 搜索分类景点方法
 */
function SearchViste(){
	var mainKey=document.getElementById("viste").getAttribute("value");
	console.log(mainKey);
	SearchNear(mainKey);
}

/**
 * 搜索分类超市方法
 */
function SearchSupermarket(){
	var mainKey=document.getElementById("supermarket").getAttribute("value");
	console.log(mainKey);
	SearchNear(mainKey);
}

/**
 * 搜索分类医院方法
 */
function SearchHospital(){
	var mainKey=document.getElementById("hospital").getAttribute("value");
	console.log(mainKey);
	SearchNear(mainKey);
}

//TODO:进行地点搜索
/**
 * 进行地点检索
 */
function SearchNear(stringkey){
	console.log("开始搜索")
	//获取当前定位
	map.clearOverlays();//清除地图覆盖物
	//禁用地图单击事件
	OrrideFunc(function(){
		//什么也不做
		console.log(" 单击事件已禁用")
	});
	
	getCurrentLocation();
	var circle = new BMap.Circle(currentPoint,1000,{fillColor:"transparent", strokeColor:'transparent', strokeWeight: 0 ,fillOpacity: 0, strokeOpacity: 0});
	map.addOverlay(circle);
	var local=new BMap.LocalSearch(map,{
		renderOptions:{
			map:map,
			autoViewport:true
		}
	});
	
	local.searchNearby(stringkey,currentPoint,1000);
}

/**
 * 重写单击方法，令其无效
 */
function OrrideFunc(func){
	clickMap=func;
}