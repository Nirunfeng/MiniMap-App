/**
 * 全局参数
 */
 var map;
 var currentPoint;	//当前位置
 var traffic = new BMap.TrafficLayer();        // 创建交通流量图层实例 
 var tarpoint;											//获取选择的标记点
 var clickPoint;
 var locname;									//收藏地点
 
 /**
  * 初始化定位
  */
  function init() {
 	map= new BMap.Map("map");
	//获取定位
    getCurrentLocation();
	
  }
  
  /* 定位获取*/
  function getCurrentLocation(){
	  //定位组件
	   var geolocation = new BMap.Geolocation(); //百度包装好的定位库
	   //获取当前定位，返回位置
	   geolocation.getCurrentPosition(function(r) {
	       if(this.getStatus() == BMAP_STATUS_SUCCESS) {
	           //获取位置坐标
	           currentPoint=r.point;
	           map.centerAndZoom(currentPoint, 15);                 // 初始化地图，设置中心点坐标和地图级别
	           //自定义点形状
	           var marker=new BMap.Marker(currentPoint);
	        
	           //添加进图层
	           map.addOverlay(marker);
	           map.panTo(currentPoint);
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
  	map.addEventListener("touchmove", function (e) {
		console.log("开启拖拽")
  	    map.enableDragging();
  	});
  
  	map.addEventListener("touchend", function (e) {
  	    map.disableDragging();
  	});
 }
  
  /**
   * 单击地图事件
   */
  function clickMap(){
	map.addEventListener("click",function(e){
		map.clearOverlays();
		/* 1.获取单击点的位置 */
		clickPoint=new BMap.Point(e.point.lng, e.point.lat);
		//定义单击点的标记
		var clickMarker=new BMap.Marker(clickPoint);
		//将marker添加到图层上并移动至单击处
		map.addOverlay(clickMarker);
		map.panTo(clickPoint);
		
		/* 2.获取坐标附近的POI */
		//获取定位信息
		//获取地址解析实例
		var geoCoder=new BMap.Geocoder();
		geoCoder.getLocation(clickPoint,function(res){
			//获取地址名称
			locname=res.surroundingPois[0].title;
			//获取地址信息
			var address=res.surroundingPois[0].address;
			//经纬度
			lng=res.surroundingPois[0].point.lng;
			lat=res.surroundingPois[0].point.lat;
			

			/* 3.设置窗体信息 */
			var opts = {    
				width : 250,     // 信息窗口宽度    
				height: 120,     // 信息窗口高度    
				title : locname  ,// 信息窗口标题
				message:address
			} 
			
			/* html代码 */
			// 收藏方法
			var btn="<div>地址:"+address+"</br><button id='btn'>收藏</button>";
			var infoWindow = new BMap.InfoWindow(btn, opts);  // 创建信息窗口对象    
			map.openInfoWindow(infoWindow, clickPoint);      // 打开信息窗口
			
			var that=this;
			//判断信息窗口是否开启，是否执行收藏函数
			if(!infoWindow.isOpen()){
				console.log("开始执行真")
				infoWindow.addEventListener("open",function(e){
					document.getElementById("btn").onclick=function(){
						that.collectLocation();
					}
				});
			}else{
				console.log("开始执行假")
				var button=document.getElementById('btn');
				button.onclick = function(){
					that.collectLocation();
				}
			}
		});
	});
  }
  
  
  /**
   * 收藏事件
   */
  function collectLocation(){
  	  var userInfo=app.getUserGlobalInfo();
  	  console.log("执行了方法")
  	  console.log(locname);
  	 /* 向后端传输数据*/
  	  mui.ajax(app.serverUrl+'/map/CollectionLocation',{
  		//data
  		  data:{
  			  userid:userInfo.id,
  			  name:locname
  		  },
  		  dataType:'json',//服务器返回json格式数据
  		  type:'post',//HTTP请求类型
  		  timeout:10000,//超时时间设置为10秒；
  		  headers:{'Content-Type':'application/json'},	 
  		  success:function(data){
  			  console.log(data)
  			  if(data.status==200){
  				  app.showToast(data.msg,"success");
  			  }else{
  				  //登陆失败,状态码为500
  				  app.showToast(data.msg,"error");
  			  }
  		  }
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
  
  
  /* 搜索美食*/
  function SearchFood(){
	  var stringkey=$("#food").attr('value');
	  console.log(stringkey)
	  console.log("开始搜索")
	  //获取当前定位
	  map.clearOverlays();//清除地图覆盖物
	  	
	  getCurrentLocation();
	  var circle = new BMap.Circle(currentPoint,1000,{fillColor:"transparent", strokeColor:'transparent', strokeWeight: 0 ,fillOpacity: 0, strokeOpacity: 0});
	  map.addOverlay(circle);
	  var local=new BMap.LocalSearch(map,{
	  renderOptions:{
	  	map:map,
	  	autoViewport:true
	  }});
	  local.searchNearby(stringkey,currentPoint,1000);
  }
  
 function SearchViste(){
 	  var stringkey=$("#viste").attr('value');
 	  console.log(stringkey)
 	  console.log("开始搜索")
 	  //获取当前定位
 	  map.clearOverlays();//清除地图覆盖物
 	  	
 	  getCurrentLocation();
 	  var circle = new BMap.Circle(currentPoint,1000,{fillColor:"transparent", strokeColor:'transparent', strokeWeight: 0 ,fillOpacity: 0, strokeOpacity: 0});
 	  map.addOverlay(circle);
 	  var local=new BMap.LocalSearch(map,{
 	  renderOptions:{
 	  	map:map,
 	  	autoViewport:true
 	  }});
 	  local.searchNearby(stringkey,currentPoint,1000);
 }
 
 function SearchSupermarket(){
 	  var stringkey=$("#supermarket").attr('value');
 	  console.log(stringkey)
 	  console.log("开始搜索")
 	  //获取当前定位
 	  map.clearOverlays();//清除地图覆盖物
 	  	
 	  getCurrentLocation();
 	  var circle = new BMap.Circle(currentPoint,1000,{fillColor:"transparent", strokeColor:'transparent', strokeWeight: 0 ,fillOpacity: 0, strokeOpacity: 0});
 	  map.addOverlay(circle);
 	  var local=new BMap.LocalSearch(map,{
 	  renderOptions:{
 	  	map:map,
 	  	autoViewport:true
 	  }});
 	  local.searchNearby(stringkey,currentPoint,1000);
 }
 
 function SearchHospital(){
 	  var stringkey=$("#hospital").attr('value');
 	  console.log(stringkey)
 	  console.log("开始搜索")
 	  //获取当前定位
 	  map.clearOverlays();//清除地图覆盖物
 	  	
 	  getCurrentLocation();
 	  var circle = new BMap.Circle(currentPoint,1000,{fillColor:"transparent", strokeColor:'transparent', strokeWeight: 0 ,fillOpacity: 0, strokeOpacity: 0});
 	  map.addOverlay(circle);
 	  var local=new BMap.LocalSearch(map,{
 	  renderOptions:{
 	  	map:map,
 	  	autoViewport:true
 	  }});
 	  local.searchNearby(stringkey,currentPoint,1000);
 }
 
