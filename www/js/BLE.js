var bluetoothle,id_notification,DEVICE_ADDRESS,DEVICE_NAME;
var messages = "";
var DEVELOPMENT=0;
var PRODUCTION=1;
var PROJECT_MODE=PRODUCTION;
var FILTER_DEVICE_NAME='DOORBELLSILENCER';
var ISLOGFINISHED="false";


		
var DOORBELL_SILENCER_SERVICES="cc58aa10-761d-11e5-8bcf-feff819cdc9f";
var DOORBELL_CURRENT_TIME_WITH_DST_SERVICES="073e0001-76e7-11e5-8bcf-feff819cdc9f";
var DOORBELL_BATTERY_SERVICES="180f";

var CHARACTERSTICS_DOORBELL_CONTROLL="cc58aa11-761d-11e5-8bcf-feff819cdc9f";
var CHARACTERSTICS_DOORBELL_ON_OFF_NOTIFY="cc58aa12-761d-11e5-8bcf-feff819cdc9f";
var CHARACTERSTICS_DOORBELL_PRESS_NOTIFY="cc58aa16-761d-11e5-8bcf-feff819cdc9f";
var CHARACTERSTICS_DOORBELL_TIME_INTERVAL="cc58aa15-761d-11e5-8bcf-feff819cdc9f";
var CHARACTERSTICS_DOORBELL_LOGS="cc58aa13-761d-11e5-8bcf-feff819cdc9f";
var CHARACTERSTICS_DOORBELL_CHANGE_PASSKEY="cc58aa14-761d-11e5-8bcf-feff819cdc9f";

var CHARACTERSTICS_DOORBELL_CUURENT_DATE_TIME="073e2a0a-76e7-11e5-8bcf-feff819cdc9f";
var CHARACTERSTICS_DOORBELL_DST="073e2a11-76e7-11e5-8bcf-feff819cdc9f";

var CHARACTERSTICS_DOORBELL_BATTERY_STATUS_NOTIFY="2a19";

var DOOR_BELL_ON="0";
var DOOR_BELL_OFF="1";
var DOOR_BELL_SWITCH_PRESS="2";
var DOOR_BELL_STREAM_EVENT_LOG_START="2";
var DOOR_BELL_STREAM_EVENT_LOG_READ_CONFIRM="5";



$( document ).ready(function() {
  if (document.URL.match(/^https?:/) || document.URL.match(/^file:/)) {
    init();
  } else {
    document.addEventListener("deviceready", init, false);
  }
	
});



function init() {
	
    document.addEventListener('pause', on_pause, false);
    document.addEventListener('resume', on_resume, false);
		document.addEventListener('backbutton', on_backbutton,false);


setTimeout(function(){ 

	if($("#home-page-content-container").attr("init-loaded")=="false"){
		$("#home-page-content-container").attr("init-loaded","true");
		iosAndroidLogger($("body").attr('ISLOGIN'));
		if($("body").attr('ISLOGIN')!='false'){
			iosAndroidLogger("ISLOGIN :"+$("body").attr('ISLOGIN'));
			if($("body").attr('DEVICE_ADDRESS')=="false"){
				iosAndroidLogger("DEVICE_ADDRESS :"+$("body").attr('DEVICE_ADDRESS'));
				$(".loading-container").hide();
				initialize();
			}else{
				iosAndroidLogger("ISLOGIN :"+$("body").attr('ISLOGIN'));
				iosAndroidLogger("DEVICE_ADDRESS :"+DEVICE_ADDRESS);
				iosAndroidLogger("DEVICE_NAME :"+DEVICE_NAME);
				if($("body").attr("ISCONNECTED")=="true"){
					pageWiseFunctionSwitcher();
				}else{
					iosAndroidLogger("BLE is Not Connected");
				}
			}
		}else{
			iosAndroidLogger("login false"+$("body").attr('ISLOGIN'));
		}
	}else{
		if($("body").attr("ISCONNECTED")=="true"){
			pageWiseFunctionSwitcher();
			iosAndroidLogger("already loaded"+$("#home-page-content-container").attr("init-loaded"));

		}else{
			setTimeout(function(){ $(".loading-container").hide(); },15000);
			iosAndroidLogger("BLE Not COnnected");
		}
	}

 }, 1000);


}

function pageWiseFunctionSwitcher(){
var page=$(".main-header").attr("page");

	switch(page) {
		  case "home":
									readOnOffState();
									break;
		  case "timer":
									if($(".timer-container").attr("ISTIMERDAYSREAD")=="false"){
										$(".timer-container").attr("ISTIMERDAYSREAD","true");
		     						readTimerDays();
									}
		      				break;

			case "settings":
									if($(".dstsettings-container").attr("ISDSTTIMESREAD")=="false"){
										$(".dstsettings-container").attr("ISDSTTIMESREAD","true");
		     						readDSTSettings();
									}
									break;
			case "deviceinfo":
									readBatteryStaus();
									break;
			case "devicelogs":
									streamDeviceLogsControls(DOOR_BELL_STREAM_EVENT_LOG_START);
									break;
		  
	} 
}



function on_backbutton(event){
  event.preventDefault(); 
	iosAndroidLogger("backbutton pressed");
	if (cordova.platformId === 'android') {
		setTimeout(function(){  
		disconnect();
		close();
		disable();
		console.log('disconnected');
		},100);
		setTimeout(function(){  navigator.app.exitApp();},500);
	}
}

function on_pause(){
// App in background
}

function on_resume(){
iosAndroidLogger('resume');
}

function enableDiscover(){
	if (cordova.platformId === 'android') {
		discover();
	}else{
		services();

	}
}


// Initializing Bluetooth.

function initialize() { 
	iosAndroidLogger('bluetooth init');
	setLoadingText("Initializing");
  var paramsObj = {request:true};
	iosAndroidLogger("Initialize : " + JSON.stringify(paramsObj));
	bluetoothle.initialize(initializeSuccess, initializeError, paramsObj);
	return false;
}

function initializeSuccess(obj) {
  iosAndroidLogger("Initialize Success : " + JSON.stringify(obj));

  if (obj.status == "enabled")
  {
    iosAndroidLogger("Enabled");
		//enabling bluetooth
		enable();
  }
  else
  {
    iosAndroidLogger("Unexpected Initialize Status");
  }
}




function initializeError(obj) {
  iosAndroidLogger("Initialize Error : " + JSON.stringify(obj));
	
	if(obj.message=="Bluetooth not enabled"){
		
		toast("Bluetooth not enabled");
	}else{
		setLoadingText("");
	}
}

//Enabling Bluetooth

function enable() {
  iosAndroidLogger("Enable");
	bluetoothle.enable(enableSuccess, enableError);
	return false;
}

function enableSuccess(obj) {
  iosAndroidLogger("Enable Success : " + JSON.stringify(obj));
	$(".loading-container").show();
	
  if (obj.status == "enabled")
  {
    iosAndroidLogger("Enabled");
		//start scan
		startScan();
  }
  else
  {
    iosAndroidLogger("Unexpected Enable Status");
  }
}

function enableError(obj) {
  iosAndroidLogger("Enable Error : " + JSON.stringify(obj));
	//start scan
	startScan();
}

function disable() {
  iosAndroidLogger("Disable");
	bluetoothle.disable(disableSuccess, disableError);
	return false;
}

function disableSuccess(obj) {
  iosAndroidLogger("Disable Success : " + JSON.stringify(obj));
	if (obj.status == "disabled")
  {
    iosAndroidLogger("Disabled");
  }
  else
  {
    iosAndroidLogger("Unexpected Disable Status");
  }
}

function disableError(obj) {
  iosAndroidLogger("Disable Error : " + JSON.stringify(obj));
}

function startScan() {
 	$("body").attr("ISSCANNING","true");
  var paramsObj = {serviceUuids:[], allowDuplicates: true};
	iosAndroidLogger("Start Scan : " + JSON.stringify(paramsObj));
	bluetoothle.startScan(startScanSuccess, startScanError, paramsObj);
	setTimeout(function(){
		isScanAlreadyInProgress();
	},20000);
	return false;
}

function startScanSuccess(obj) {
  iosAndroidLogger("Start Scan Success : " + JSON.stringify(obj));
	$(".loading-container").show();
	setLoadingText("Scanning");
  if (obj.status == "scanResult")
  {
    iosAndroidLogger("Scan Result");
		$(".loading-container").show();
    addDevice(obj.address, obj.name);
  }
  else if (obj.status == "scanStarted")
  {
    iosAndroidLogger("Scan Started");
  }
  else
  {
    iosAndroidLogger("Unexpected Start Scan Status");
  }
}

function startScanError(obj) {
 	$("body").attr("ISSCANNING","false");
	$(".donot-display-any-content-if-ble-is-not-connected").hide();
}

function isScanAlreadyInProgress(){
	if($("body").attr("ISCONNECTED")=="false"){
		toast("No Door Bell Device in Range Or Connected To Another Mobile.");
		$(".donot-display-any-content-if-ble-is-not-connected").hide();
		$("body").attr("ISSCANNING","true");
	}else if($("body").attr("ISCONNECTED")=="true"){
		$("body").attr("ISSCANNING","false");
		stopScan();
	}
}

function stopScan() {
  iosAndroidLogger("Stop Scan");
	bluetoothle.stopScan(stopScanSuccess, stopScanError);
	return false;
}

function stopScanSuccess(obj) {
  iosAndroidLogger("Stop Scan Success : " + JSON.stringify(obj));
	if (obj.status == "scanStopped")
  {
    logger("Scan Stopped");
  }
  else
  {
    logger("Unexpected Stop Scan Status");
  }
}

function stopScanError(obj) {
  logger("Stop Scan Error : " + JSON.stringify(obj));
}

function retrieveConnected() {
  var paramsObj = {serviceUuids:["180D"]};
	logger("Retrieve Connected : " + JSON.stringify(paramsObj));
	bluetoothle.retrieveConnected(retrieveConnectedSuccess, retrieveConnectedError, paramsObj);
	return false;
}

function retrieveConnectedSuccess(obj) {
  iosAndroidLogger("Retrieve Connected Success : " + JSON.stringify(obj));
	for (var i = 0; i < obj.length; i++)
  {
    var device = obj[i];
    addDevice(device.address, device.name);
  }
}

function retrieveConnectedError(obj) {
  iosAndroidLogger("Retrieve Connected Error : " + JSON.stringify(obj));
}

function isInitialized() {
  iosAndroidLogger("Is Initialized");
	bluetoothle.isInitialized(isInitializedSuccess);
	return false;
}

function isInitializedSuccess(obj) {
  iosAndroidLogger("Is Initialized Success : " + JSON.stringify(obj));
	if (obj.isInitialized)
  {
    iosAndroidLogger("Is Initialized : true");
  }
  else
  {
    iosAndroidLogger("Is Initialized : false");
  }
}

function isEnabled() {
  iosAndroidLogger("Is Enabled");
	bluetoothle.isEnabled(isEnabledSuccess);
	return false;
}

function isEnabledSuccess(obj) {
  iosAndroidLogger("Is Enabled Success : " + JSON.stringify(obj));
	if (obj.isEnabled)
  {
    iosAndroidLogger("Is Enabled : true");
  }
  else
  {
    iosAndroidLogger("Is Enabled : false");
  }
}

function isScanning() {
  iosAndroidLogger("Is Scanning");
	bluetoothle.isScanning(isScanningSuccess);
	return false;
}

function isScanningSuccess(obj) {
  iosAndroidLogger("Is Scanning Success : " + JSON.stringify(obj));
	if (obj.isScanning)
  {
    iosAndroidLogger("Is Scanning : true");
  }
  else
  {
    iosAndroidLogger("Is Scanning : false");
  }
}

function connect() {
	iosAndroidLogger('connect');
	hasPermission();
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS};
		iosAndroidLogger("Connect : " + JSON.stringify(paramsObj));
		setLoadingText("Connecting");
		bluetoothle.connect(connectSuccess, connectError, paramsObj);
		return false;
	}else{
		iosAndroidLogger('device address not defined');
	}
}

function connectSuccess(obj) {
  iosAndroidLogger("Connect Success : " + JSON.stringify(obj));
	if (obj.status == "connected")
  {
    iosAndroidLogger("Connected");
		enableDiscover();
		$("body").attr("DEVICEINRANGE","true");
		checkBleIsConnectedAndDeviceInRange();
	}
  else if (obj.status == "connecting")
  {
    iosAndroidLogger("Connecting");
  }
  else
  {
    iosAndroidLogger("Unexpected Connect Status");
  }
}

function connectError(obj) {
	if(obj.message=="Device previously connected, reconnect or close for new device" || obj.message=="Connection failed"){
		reconnect();
	}else{
		close();
	}
  iosAndroidLogger("Connect Error : " + JSON.stringify(obj));
}

function reconnect() {
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS};
		iosAndroidLogger("Reconnect : " + JSON.stringify(paramsObj));
		bluetoothle.reconnect(reconnectSuccess, reconnectError, paramsObj);
	}
  return false;
}

function reconnectSuccess(obj) {
  iosAndroidLogger("Reconnect Success : " + JSON.stringify(obj));
	if (obj.status == "connected")
  {
    iosAndroidLogger("Connected");
		enableDiscover();
		$("body").attr("ISCONNECTED","true");
		$("body").attr("DEVICEINRANGE","true");
		checkBleIsConnectedAndDeviceInRange();
		
  }
  else if (obj.status == "connecting")
  {
    iosAndroidLogger("Connecting");
  }
  else
  {
    iosAndroidLogger("Unexpected Reconnect Status");
  }
}

function reconnectError(obj) {
  iosAndroidLogger("Reconnect Error : " + JSON.stringify(obj));
}

function disconnect() {
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS};
		iosAndroidLogger("Disconnect : " + JSON.stringify(paramsObj));
		bluetoothle.disconnect(disconnectSuccess, disconnectError, paramsObj);
	}
  return false;
}

function disconnectSuccess(obj) {
  iosAndroidLogger("Disconnect Success : " + JSON.stringify(obj));
	if (obj.status == "disconnected")
  {
		iosAndroidLogger("Disconnected");
  }
  else if (obj.status == "disconnecting")
  {
    iosAndroidLogger("Disconnecting");
  }
  else
  {
    iosAndroidLogger("Unexpected Disconnect Status");
  }
}

function disconnectError(obj) {
  iosAndroidLogger("Disconnect Error : " + JSON.stringify(obj));
}

function close(address) {
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS};
		iosAndroidLogger("Close : " + JSON.stringify(paramsObj));
		bluetoothle.close(closeSuccess, closeError, paramsObj);
	}
  return false;
}

function closeSuccess(obj) {
  iosAndroidLogger("Close Success : " + JSON.stringify(obj));
	if (obj.status == "closed")
  {
    iosAndroidLogger("Closed");
  }
  else
  {
    iosAndroidLogger("Unexpected Close Status");
  }
}

function closeError(obj) {
  iosAndroidLogger("Close Error : " + JSON.stringify(obj));
}

function discover() {
	iosAndroidLogger("discover");
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS};
		iosAndroidLogger("Discover : " + JSON.stringify(paramsObj));
		bluetoothle.discover(discoverSuccess, discoverError, paramsObj);
		return false;
	}else{
		iosAndroidLogger("no device address");
	}
}

function discoverSuccess(obj) {
  if (obj.status == "discovered")
  {	
		iosAndroidLogger("Discover Success : " + JSON.stringify(obj));
		setTimeout(function(){ subscribeDoorBellSilencerServices(); },1000);
		
	}
  else
  {
    iosAndroidLogger("Unexpected Discover Status");
  }
}

function discoverError(obj) {
	iosAndroidLogger("Discover Error : " + JSON.stringify(obj));
}

function services() {
	if(DEVICE_ADDRESS!=''){
  var paramsObj = {address:DEVICE_ADDRESS, serviceUuids:[]};
	iosAndroidLogger("Services : " + JSON.stringify(paramsObj));
	bluetoothle.services(servicesSuccess, servicesError, paramsObj);
	}
  return false;
}

function servicesSuccess(obj) {
  iosAndroidLogger("Services Success : " + JSON.stringify(obj));
	if (obj.status == "services")
  {
    iosAndroidLogger("Services");
		var serviceUuids = obj.serviceUuids;
		var i;
    for ( i = 0; i < serviceUuids.length; i++)
    {
			characteristics(serviceUuids[i]);
			if(i==serviceUuids.length-1){
				iosAndroidLogger("services Found");
				setTimeout(function(){ subscribeDoorBellSilencerServices(); },3000);
	
			}
    }
	}
  else
  {
    iosAndroidLogger("Unexpected Services Status");
  }
}

function servicesError(obj) {
  iosAndroidLogger("Services Error : " + JSON.stringify(obj));
}

function rssi(address) {
  var paramsObj = {address:address};
	iosAndroidLogger("RSSI : " + JSON.stringify(paramsObj));
	bluetoothle.rssi(rssiSuccess, rssiError, paramsObj);
	return false;
}

function rssiSuccess(obj) {
  iosAndroidLogger("RSSI Success : " + JSON.stringify(obj));
	if (obj.status == "rssi")
  {
    iosAndroidLogger("RSSI");
  }
  else
  {
    iosAndroidLogger("Unexpected RSSI Status");
  }
}

function rssiError(obj) {
  iosAndroidLogger("RSSI Error : " + JSON.stringify(obj));
}

function mtu(address) {
  var paramsObj = {address:address, mtu: 10};
	iosAndroidLogger("MTU : " + JSON.stringify(paramsObj));
	bluetoothle.mtu(mtuSuccess, mtuError, paramsObj);
	return false;
}

function mtuSuccess(obj) {
  iosAndroidLogger("MTU Success : " + JSON.stringify(obj));
	if (obj.status == "mtu")
  {
    iosAndroidLogger("MTU");
  }
  else
  {
    iosAndroidLogger("Unexpected MTU Status");
  }
}

function mtuError(obj) {
  iosAndroidLogger("MTU Error : " + JSON.stringify(obj));
}



function isConnected() {
	if($("body").attr("ISSCANNING")=="false"){
		if(DEVICE_ADDRESS!=''){
			var paramsObj = {address:DEVICE_ADDRESS};
			iosAndroidLogger("Is Connected : " + JSON.stringify(paramsObj));
			bluetoothle.isConnected(isConnectedSuccess, isConnectedError, paramsObj);
			return false;
		}
		return false;
	}
}

function isConnectedSuccess(obj) {
 iosAndroidLogger("Is Connected Success : " + JSON.stringify(obj));
 if (obj.isConnected)
  {
		if($("body").attr("DEVICEINRANGE")=="false"){
			$("body").attr("DEVICEINRANGE","true");
			subscribeDoorBellSilencerServices();
		}
    iosAndroidLogger("Is Connected : true");
		$("body").attr("ISCONNECTED","true");
 }
 else
 {
	iosAndroidLogger("Is Connected : false");
	$("body").attr("DEVICEINRANGE","false");
	toast("No Door Bell Device in Range Or Connected To Another Mobile.");
	if($("body").attr("ISSCANNING")=="false"){iosAndroidLogger("ISSCANNING :false");
		setTimeout(function(){  startScan(); },2000);
	}else{
		iosAndroidLogger("ISSCANNING :true");
	}
 }
}




function isConnectedError(obj) {
	iosAndroidLogger("isConnectedError : " + JSON.stringify(obj));
	$("body").attr("ISCONNECTED","false");
	if(obj.message=="Never connected to connection"){
		if($("body").attr("ISSCANNING")=="false"){
			startScan();
		}else{
			$("body").attr("ISSCANNING","false");
			stopScan();
			setTimeout(function(){ startScan(); },2000);
		}
	}else	if(obj.message=="Bluetooth not enabled"){
		enable();
		toast("Bluetooth not enabled");
	}else{
		toast("No Door Bell Device in Range Or Connected To Another Mobile.");
	}
}

function checkDeviceInRange(){
	if($("body").attr("DEVICEINRANGE")=="false"){
		toast("No Door Bell Device in Range Or Connected To Another Mobile.");
	}
}

function toast(msg){
	setLoadingText(msg);
	$(".donot-display-any-content-if-ble-is-not-connected").hide();	
	$(".loading-container").show();
	$(".loading-img").hide();
	setTimeout(function(){ 
		$(".loading-container").hide();
		$(".loading-img").show();
	},5000);
}


function isDiscovered(address) {
  var paramsObj = {address:address};
	iosAndroidLogger("Is Discovered : " + JSON.stringify(paramsObj));
	bluetoothle.isDiscovered(isDiscoveredSuccess, paramsObj);
	return false;
}

function isDiscoveredSuccess(obj) {
  iosAndroidLogger("Is Discovered Success : " + JSON.stringify(obj));
	if (obj.isDiscovered)
  {
    iosAndroidLogger("Is Discovered : true");
  }
  else
  {
    iosAndroidLogger("Is Discovered : false");
  }
}

function requestConnectionPriority(address) {
  var paramsObj = {address:address, connectionPriority:"high"};
	iosAndroidLogger("Request Connection Priority : " + JSON.stringify(paramsObj));
	bluetoothle.requestConnectionPriority(requestConnectionPrioritySuccess, requestConnectionPriorityError, paramsObj);
	return false;
}

function requestConnectionPrioritySuccess(obj) {
  iosAndroidLogger("Request Connection Priority Success : " + JSON.stringify(obj));
	if (obj.status == "connectionPriorityRequested")
  {
    iosAndroidLogger("ConnectionPriorityRequested");
  }
  else
  {
    iosAndroidLogger("Unexpected Request Connection Priority Status");
  }
}

function requestConnectionPriorityError(obj) {
  iosAndroidLogger("Request Connection Priority Error : " + JSON.stringify(obj));
}

function characteristics(serviceUuid) {
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:serviceUuid, characteristicUuids:[]};
		iosAndroidLogger("Characteristics : " + JSON.stringify(paramsObj));
		bluetoothle.characteristics(characteristicsSuccess, characteristicsError, paramsObj);
		return false;
	}
  return false;
}

function characteristicsSuccess(obj) {
  iosAndroidLogger("Characteristics Success : " + JSON.stringify(obj));
	if (obj.status == "characteristics")
  {
    iosAndroidLogger("Characteristics");
		var characteristics = obj.characteristics;
		for (var i = 0; i < characteristics.length; i++)
    {
      descriptors(obj.serviceUuid, characteristics[i].characteristicUuid);
    }
  }
  else
  {
    iosAndroidLogger("Unexpected Characteristics Status");
  }
}

function characteristicsError(obj) {
  iosAndroidLogger("Characteristics Error : " + JSON.stringify(obj));
}

function descriptors(serviceUuid, characteristicUuid) {
  var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};
	iosAndroidLogger("Descriptors : " + JSON.stringify(paramsObj));
	bluetoothle.descriptors(descriptorsSuccess, descriptorsError, paramsObj);
	return false;
}

function descriptorsSuccess(obj) {
  iosAndroidLogger("Descriptors Success : " + JSON.stringify(obj));
	if (obj.status == "descriptors")
  {
    iosAndroidLogger("Descriptors");
	}
  else
  {
    iosAndroidLogger("Unexpected Descriptors Status");
  }
}

function descriptorsError(obj) {
  iosAndroidLogger("Descriptors Error : " + JSON.stringify(obj));
}

function readDSTSettings(){ 
	iosAndroidLogger("readDSTSettings ");
	if(DEVICE_ADDRESS!=''){
			var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_CURRENT_TIME_WITH_DST_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_DST};
			iosAndroidLogger("Read : " + JSON.stringify(paramsObj));
			bluetoothle.read(readDSTSettingsSuccess, readDSTSettingsError, paramsObj);
			return false;
		}
  return false;
}




function readDSTSettingsSuccess(obj) {
  iosAndroidLogger("readDSTSettingsSuccess : " + JSON.stringify(obj));
	if (obj.status == "read")
  {
		$(".timer-container").attr("ISDSTTIMESREAD","true");
		iosAndroidLogger(obj.value);
    notifySwitcher(obj);
  }
  else
  {
    iosAndroidLogger("Unexpected Read Status");
  }
}

function readDSTSettingsError(obj) {
	iosAndroidLogger("readDSTSettingsError : " + JSON.stringify(obj));
	$(".dstsettings-container").attr("ISDSTTIMESREAD","false");
	if(obj.message=="Unable to read"){
		readDSTSettings();
	}
}

function readBatteryStaus(){
  iosAndroidLogger("readBatteryStaus ");
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_BATTERY_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_BATTERY_STATUS_NOTIFY};
		iosAndroidLogger("Read : " + JSON.stringify(paramsObj));
		bluetoothle.read(readBatteryStausSuccess, readBatteryStausError, paramsObj);
		return false;
	}
  return false;
}

function readBatteryStausSuccess(obj) {
  iosAndroidLogger("readBatteryStausSuccess : " + JSON.stringify(obj));
	if (obj.status == "read")
  {
		notifySwitcher(obj);
  }
  else
  {
    iosAndroidLogger("Unexpected Read Status");
  }
}

function readBatteryStausError(obj) {
	iosAndroidLogger("readBatteryStausError : " + JSON.stringify(obj));
	if(obj.message=="Unable to read"){
		readBatteryStaus();
	}
}

function streamDeviceLogsControls(CONTROL){ 
	iosAndroidLogger("streamDeviceLogsControlsControls ");
	if($("#home-page-content-container").attr("logs-init")=="false"){
		$("#home-page-content-container").attr("logs-init","true");
		if(DEVICE_ADDRESS!=''){
			var bytes = bluetoothle.stringToBytes(CONTROL);
			var encodedString = bluetoothle.bytesToEncodedString(bytes);
			var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_CONTROLL, value:encodedString};
			iosAndroidLogger("Write : " + JSON.stringify(paramsObj));
			bluetoothle.write(streamDeviceLogsControlsSuccess, streamDeviceLogsControlsError, paramsObj);
			return false;
		}
	}
  return false;
}

function streamDeviceLogsControlsSuccess(obj) {
  iosAndroidLogger("streamDeviceLogsControlsSuccess : " + JSON.stringify(obj));
	if (obj.status == "written")
  {
    iosAndroidLogger(" streamDeviceLogsControlsSuccessWritten");
  }
  else
  {
    iosAndroidLogger("Unexpected Write Status");
  }
}

function streamDeviceLogsControlsError(obj) {
	iosAndroidLogger("streamDeviceLogsControlsError : " + JSON.stringify(obj));
}


function readOnOffState(){ 
	iosAndroidLogger("Read on off ");
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_ON_OFF_NOTIFY};
		iosAndroidLogger("Read : " + JSON.stringify(paramsObj));
		$("body").attr("call-back-function-called-for-subscribe","false");
		bluetoothle.read(readOnOffSuccess, readOnOffError, paramsObj);
		return false;
	}
  return false;
}


function read(address, serviceUuid, characteristicUuid) {
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid};
	iosAndroidLogger("Read : " + JSON.stringify(paramsObj));
	bluetoothle.read(readSuccess, readError, paramsObj);
	return false;
}

function readOnOffSuccess(obj) {
  iosAndroidLogger("ReadOnOffSuccess Success : " + JSON.stringify(obj));
	$("body").attr("call-back-function-called-for-subscribe","true");
	if (obj.status == "read")
  {
		notifySwitcher(obj);
    iosAndroidLogger("On / OFF status Read");
  }
  else
  {
    iosAndroidLogger("Unexpected Read Status");
  }
}

function readOnOffError(obj) {
	iosAndroidLogger("Read ON OFF Error : " + JSON.stringify(obj));
	if(obj.message=="Unable to read"){
		readOnOffState();
	}
}

function readError(obj) {
	iosAndroidLogger("Read Error : " + JSON.stringify(obj));
}


function subscribeDoorBellSilencerServices(){
	iosAndroidLogger('subscribeDoorBellSilencerServices');
	var DOORBELL_CHARACTERSTICS=new Array();
	var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_ON_OFF_NOTIFY};
	iosAndroidLogger("subscribeDoorBellSilencerServices : " + JSON.stringify(paramsObj));
	$("body").attr("call-back-function-called-for-subscribe","false");
	setLoadingText("Pairing");
  bluetoothle.subscribe(subscribeSuccess, subscribeError, paramsObj);
	return false;
}

function subscribeSuccess(obj) {
  iosAndroidLogger("Subscribe Success : " + JSON.stringify(obj));
	$("body").attr("call-back-function-called-for-subscribe","true");
	if (obj.status == "subscribedResult")
  { 
		iosAndroidLogger("Subscribe Success : " + JSON.stringify(obj));
		notifySwitcher(obj);
	}
  else if (obj.status == "subscribed")
  {
    iosAndroidLogger("Subscribed");
		readOnOffState();
		setTimeout(function(){ 	syncCurrentDateTimeToDevice(); }, 500);
		setTimeout(function(){ subscribeDoorBellPress(); }, 1000);
		setTimeout(function(){ 	subscribeDoorBellBatteryStatus(); }, 2000);
		setTimeout(function(){ 	subscribeDoorBellLogs(); }, 3500);
	}
  else
  {
    iosAndroidLogger("Unexpected Subscribe Status");
  }
}


function subscribeDoorBellLogs(){
	var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_LOGS};
	iosAndroidLogger("subscribeDoorBellLogs : " + JSON.stringify(paramsObj));
	bluetoothle.subscribe(subscribeDoorBellLogsSuccess, subscribeDoorBellLogsError, paramsObj);
	return false;
}

function subscribeDoorBellLogsSuccess(obj) {
  iosAndroidLogger("subscribeDoorBellLogs Success : " + JSON.stringify(obj));
	if (obj.status == "subscribedResult")
  { 
		iosAndroidLogger("subscribeDoorBellLogs Result"+obj.value);
		notifySwitcher(obj);
		
  }
  else if (obj.status == "subscribed")
  {
    iosAndroidLogger("Subscribed");
	}
  else
  {
    iosAndroidLogger("Unexpected Subscribe Status");
  }
}

function subscribeDoorBellLogsError(obj) {
	iosAndroidLogger("subscribeDoorBellLogserror  : " + JSON.stringify(obj));
}



function subscribeDoorBellPress(){
	var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_PRESS_NOTIFY};
	iosAndroidLogger("subscribeDoorBellPress : " + JSON.stringify(paramsObj));
	bluetoothle.subscribe(subscribeDoorBellPressSuccess, subscribeDoorBellPressError, paramsObj);
	return false;
}

function subscribeDoorBellPressSuccess(obj) {
  iosAndroidLogger("subscribeDoorBellPress Success : " + JSON.stringify(obj));
	if (obj.status == "subscribedResult")
  { 
		iosAndroidLogger("subscribeDoorBellPress Result"+obj.value);
		notifySwitcher(obj);
		
  }
  else if (obj.status == "subscribed")
  {
    iosAndroidLogger("Subscribed");
		
  }
  else
  {
    iosAndroidLogger("Unexpected Subscribe Status");
  }
}

function subscribeDoorBellPressError(obj) {
	iosAndroidLogger("subscribeDoorBellPressError  : " + JSON.stringify(obj));
}

function subscribeDoorBellBatteryStatus(){
	var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_BATTERY_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_BATTERY_STATUS_NOTIFY};
	iosAndroidLogger("subscribeDoorBellBatteryStatus : " + JSON.stringify(paramsObj));
	bluetoothle.subscribe(subscribeDoorBellBatteryStatusSuccess, subscribeDoorBellBatteryStatusError, paramsObj);
	return false;
}

function subscribeDoorBellBatteryStatusSuccess(obj) {
  iosAndroidLogger("subscribeDoorBellBatteryStatus Success : " + JSON.stringify(obj));
	if (obj.status == "subscribedResult")
  { 
		iosAndroidLogger("subscribeDoorBellBatteryStatus Result"+obj.value);
		notifySwitcher(obj);
		
  }
  else if (obj.status == "subscribed")
  {
    iosAndroidLogger("Subscribed");
		
  }
  else
  {
    iosAndroidLogger("Unexpected Subscribe Status");
  }
}

function subscribeDoorBellBatteryStatusError(obj) {
	iosAndroidLogger("subscribeDoorBellBatteryStatusError  : " + JSON.stringify(obj));
}

function notifySwitcher(obj){
 iosAndroidLogger("notifySwitcher"+ JSON.stringify(obj));
 switch(obj.characteristicUuid) {
    case CHARACTERSTICS_DOORBELL_ON_OFF_NOTIFY:
      	 setDoorBellOnOffState( obj.value);
       	 break;
    case CHARACTERSTICS_DOORBELL_PRESS_NOTIFY:
		      setDoorBellOnOffState( obj.value);
		      break;
		case CHARACTERSTICS_DOORBELL_BATTERY_STATUS_NOTIFY:
					setDoorBellBatteryStatus(obj.value);
		      break;
    case CHARACTERSTICS_DOORBELL_LOGS:
					setDoorBellLogs(obj.value);
		      break;
    case CHARACTERSTICS_DOORBELL_DST:
					setDSTSettings(obj.value);
		      break;
 }
}




function setDSTSettings(val){
	if($(".main-header").attr("page")=="settings"){
		var bytes = bluetoothle.encodedStringToBytes(val);
		var string = bluetoothle.bytesToString(bytes);
		iosAndroidLogger("setDoorBellLogs time :"+ string);
		if(string!="0000000000000"){
			var datetime=string.substr(1,12);
			var shift_offset=Number(string.substr(0,1));
			datetime=formatDateTime(datetime);
			clearDstTimeFields(true);
			$("#dstDateTimepicker").val(datetime);
			$("#dstDateTimepicker").mobiscroll('setValue', datetime);
			$("#dstShift").val(shift_offset);
		}else{
			showToast("No DST Settings Available.");
		}
		$(".loading-container").hide();
		$(".show-after-loading").show();
		$(".donot-display-any-content-if-ble-is-not-connected").show();
	}
}

function setDoorBellLogs(val){
	if($(".main-header").attr("page")=="devicelogs"){
		var bytes = bluetoothle.encodedStringToBytes(val);
		var string = bluetoothle.bytesToString(bytes);
		var month=string.substr(2,2);
		var day=string.substr(4,2);
		iosAndroidLogger("setDoorBellLogs time :"+ string);console.log("setDoorBellLogs time :"+ string);
		if(ISLOGFINISHED=='false'){
		
				if(string!="I5I5I5I5I5I5"){
					if(month!="00" && day!="00"){
						$(".logs-list").append("<li>"+formatDateTime(string)+"</li>");
					}
				}else if(string=="I5I5I5I5I5I5"){
					ISLOGFINISHED="true";
					showToast("No Logs on Device");
				}
 		}
		$(".loading-container").hide();
		$(".show-after-loading").show();
		$(".donot-display-any-content-if-ble-is-not-connected").show();
	}
}

function formatDateTime(date){
	if(date!=''){
		var year="20"+date.substr(0,2);
		var month=date.substr(2,2);
		var day=date.substr(4,2);
		var hr=date.substr(6,2);
		if(Number(hr) >= 12){
			if(Number(hr) > 12){
			hr=Number(hr)-12;
			}
			var AMPM=":PM";
		}else{
			var AMPM=":AM";
			if(hr=="00"){	
				hr="12";
			}
		}
		var mint=date.substr(8,2);
		return day +"-"+month+"-"+year+" "+hr+":"+mint+AMPM;
	}
}


function setDoorBellBatteryStatus(val){
	var fillcolor="red";
	var bytes = bluetoothle.encodedStringToBytes(val);
	var string = bluetoothle.bytesToString(bytes);
	iosAndroidLogger("setDoorBellBatteryStatus percentage :"+ string);
	if(Number(string)>10){
		 fillcolor="green";
	}
	$(".battery-percentage-text").html(Number(string)+"%");
	$(".batterylevel").css("width",Number(string)+"%");
	$(".batterylevel").css("background",fillcolor);
	$(".loading-container").hide();
	$(".show-after-loading").show();
	$(".donot-display-any-content-if-ble-is-not-connected").show();
}

function setDoorBellOnOffState(val){
	var bytes = bluetoothle.encodedStringToBytes(val);
	var string = bluetoothle.bytesToString(bytes);
	iosAndroidLogger("ON OFF State :"+string);
	if(string==DOOR_BELL_ON){
		$("#door-bell").attr('src',"img/doorbell_on.png?"+Math.random());
		$("#door-bell-on").attr('src',"img/doorbell_on_inactive.png?"+Math.random());
		$("#door-bell-off").attr('src',"img/doorbell_off_active.png?"+Math.random());
	}else if(string==DOOR_BELL_OFF){
		$("#door-bell").attr('src',"img/doorbell_off.png?"+Math.random());
		$("#door-bell-on").attr('src',"img/doorbell_on_active.png?"+Math.random());
		$("#door-bell-off").attr('src',"img/doorbell_off_inactive.png?"+Math.random());
	} else if(string==DOOR_BELL_SWITCH_PRESS){
		showNotification("Door Bell Switch Pressed.");
	}
	$(".loading-container").hide();
	$(".donot-display-any-content-if-ble-is-not-connected").show();
	$(".door-bell-container").show();
	$(".show-after-loading").show();
  iosAndroidLogger("On / OFF status Read");
}

function subscribeError(obj) {
  iosAndroidLogger("Subscribe Error : " + JSON.stringify(obj));
}

$("img#door-bell-off").off('click').on("click",function(){
	iosAndroidLogger('off');
	if(DEVICE_ADDRESS!=''){
		var bytes = bluetoothle.stringToBytes(DOOR_BELL_OFF);
		var encodedString = bluetoothle.bytesToEncodedString(bytes);
		iosAndroidLogger(DOOR_BELL_OFF+" converted :"+encodedString);
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_CONTROLL, value:encodedString};
		iosAndroidLogger("Write : " + JSON.stringify(paramsObj));
		bluetoothle.write(doorBellOnOffSuccess, writeError, paramsObj);
		return false;
	}
});

$("img#door-bell-on").off('click').on("click",function(){
	iosAndroidLogger('on');
	if(DEVICE_ADDRESS!=''){
		var bytes = bluetoothle.stringToBytes(DOOR_BELL_ON);
		var encodedString = bluetoothle.bytesToEncodedString(bytes);
		iosAndroidLogger(DOOR_BELL_ON+" converted :"+encodedString);
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_CONTROLL, value:encodedString};
		iosAndroidLogger("Write : " + JSON.stringify(paramsObj));
		bluetoothle.write(doorBellOnOffSuccess, writeError, paramsObj);
		return false;
	}
});


function doorBellOnOffSuccess(obj) {
  iosAndroidLogger("doorBellOnOff Write Success : " + JSON.stringify(obj));
	if (obj.status == "written")
  {
    iosAndroidLogger("doorBellOnOff Written");
		
  }
  else
  {
    iosAndroidLogger("Unexpected Write Status");
  }
}

function write(address, serviceUuid, characteristicUuid, value) {
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, value:value};
	iosAndroidLogger("Write : " + JSON.stringify(paramsObj));
	bluetoothle.write(writeSuccess, writeError, paramsObj);
	return false;
}

function writeSuccess(obj) {
  iosAndroidLogger("Write Success : " + JSON.stringify(obj));
	if (obj.status == "written")
  {
    iosAndroidLogger("Written");
  }
  else
  {
    iosAndroidLogger("Unexpected Write Status");
  }
}

function writeError(obj) {
  iosAndroidLogger("Write Error : " + JSON.stringify(obj));
}

function readDescriptor(address, serviceUuid, characteristicUuid, descriptorUuid) {
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, descriptorUuid:descriptorUuid};
	iosAndroidLogger("Read Descriptor : " + JSON.stringify(paramsObj));
	bluetoothle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);
	return false;
}

function readDescriptorSuccess(obj) {
  iosAndroidLogger("Read Descriptor Success : " + JSON.stringify(obj));
	if (obj.status == "readDescriptor")
  {
    iosAndroidLogger("Read Descriptor");
  }
  else
  {
    iosAndroidLogger("Unexpected Read Descriptor Status");
  }
}

function readDescriptorError(obj) {
  iosAndroidLogger("Read Descriptor Error : " + JSON.stringify(obj));
}

function writeDescriptor(address, serviceUuid, characteristicUuid, descriptorUuid, value) {
  var paramsObj = {address:address, serviceUuid:serviceUuid, characteristicUuid:characteristicUuid, descriptorUuid:descriptorUuid, value:value};
	iosAndroidLogger("Write Descriptor : " + JSON.stringify(paramsObj));
	bluetoothle.writeDescriptor(writeDescriptorSuccess, writeDescriptorError, paramsObj);
	return false;
}

function writeDescriptorSuccess(obj) {
  iosAndroidLogger("Write Descriptor Success : " + JSON.stringify(obj));
	if (obj.status == "writeDescriptor")
  {
    iosAndroidLogger("Write Descriptor");
  }
  else
  {
    iosAndroidLogger("Unexpected Write Descriptor Status");
  }
}

function writeDescriptorError(obj) {
  iosAndroidLogger("Write Descriptor Error : " + JSON.stringify(obj));
}

function addDevice(address, name) {
	if(name!=''){
		if(name.toUpperCase()==FILTER_DEVICE_NAME){
			DEVICE_ADDRESS = address;
			$("body").attr("DEVICE_ADDRESS",DEVICE_ADDRESS);
			DEVICE_NAME =name;
			$("body").attr("DEVICE_NAME",DEVICE_NAME);
			console.log("Allowed Device :"+name);
			$("body").attr("ISSCANNING","false");
			stopScan();
			setTimeout(function(){ connect(); }, 1000);
		}else{
			iosAndroidLogger("Not Allowed Device :"+name);
		}
	}
}


function logger(message) {
  console.log(message);

  messages += message + "\r\n";
}

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number)
  {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

function checkBleIsConnectedAndDeviceInRange(){
	if($("body").attr("ISCONNECTEDCHECKINGSTARTED")=="false"){
		setInterval(function(){ 
		$("body").attr("ISCONNECTEDCHECKINGSTARTED","true");
		isConnected();
		}, 6000);
	}
}

$(document).on("change focus blur input","input.txValue",function(){
if(Number($(this).val().length)>=20){
	iosAndroidLogger('limitCharacter :'+$(this).val().length);
	$(this).val($(this).val().substring(0,20));
}
});

function syncCurrentDateTimeToDevice(){
if(DEVICE_ADDRESS!=''){	
		var DateTimeDay=currentDateTimeDay();
		var bytes = bluetoothle.stringToBytes(DateTimeDay);
		iosAndroidLogger("currentDateTimeDay"+DateTimeDay);
		var encodedString = bluetoothle.bytesToEncodedString(bytes);
		iosAndroidLogger("currentDateTimeDay encoded :"+encodedString);
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_CURRENT_TIME_WITH_DST_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_CUURENT_DATE_TIME, value:encodedString};
		iosAndroidLogger("Write : " + JSON.stringify(paramsObj));
		bluetoothle.write(doorBellSyncCurrentDateTimeDaySuccess, doorBellSyncCurrentDateTimeDayError, paramsObj);
		return false;
	}
}

function doorBellSyncCurrentDateTimeDaySuccess(obj){
	iosAndroidLogger("currentdatetime Write Success : " + JSON.stringify(obj));
	if (obj.status == "written")
  {
    logger("Currentdatetime Written");
  }
  else
  {
    logger("Unexpected Write Status");
  }
}

function doorBellSyncCurrentDateTimeDayError(obj) {
	if(obj.message=="Unable to write"){
		setTimeout(function(){ 	syncCurrentDateTimeToDevice(); }, 500);
	}
  iosAndroidLogger("CurrentDateTime Write Error : " + JSON.stringify(obj));
}

function readTimerDays(){
  iosAndroidLogger("readTimerDays ");
	if(DEVICE_ADDRESS!=''){
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_TIME_INTERVAL};
		iosAndroidLogger("Read : " + JSON.stringify(paramsObj));
		bluetoothle.read(readTimerDaysSuccess, readTimerDaysError, paramsObj);
		return false;
	}
  return false;
}


function readTimerDaysSuccess(obj) {
 	iosAndroidLogger("Read Success : " + JSON.stringify(obj));
	if (obj.status == "read")
  {
		$(".timer-container").attr("ISTIMERDAYSREAD","true");
		$(".donot-display-any-content-if-ble-is-not-connected").show();
		$(".timer-cancel").removeAttr("disabled");
		$(".timer-save").removeAttr("disabled");
		setTimerPage(obj.value);
    iosAndroidLogger("Timer Days Read");
  }
  else
  {
    iosAndroidLogger("Unexpected Read Status");
  }
}

function readTimerDaysError(obj) {
	iosAndroidLogger("Read Timer DaysError: " + JSON.stringify(obj));
	if(obj.message=="Unable to read"){
		$(".timer-container").attr("ISTIMERDAYSREAD","false");
		readTimerDays();
	}
}

function  setTimerPage(timerobj){
var starttime="";
var endtime="";
var Days=new Array();
var bytes = bluetoothle.encodedStringToBytes(timerobj);
var timer = bluetoothle.bytesToString(bytes);
	if(timer!="000000000000000"){
		Days=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
		$.each(Days,function(i,day){ 
			$("#"+day).prop("checked",Number(timer[i]));
		});
		var starttime_hour=timer.toString().substr(7,2);
		var starttime_min=timer.toString().substr(9,2);
		if(Number(starttime_hour) >= 12){
			if(Number(starttime_hour) > 12){
			starttime_hour=Number(starttime_hour)-12;
			}
			starttime=starttime_hour+":"+starttime_min+":PM";
		}else{
			if(starttime_hour=="00"){
				starttime="12"+":"+starttime_min+":AM";
			}else{
				starttime=starttime_hour+":"+starttime_min+":AM";
			}
		}
		var endtime_hour=timer.toString().substr(11,2);
		var endtime_min=timer.toString().substr(13,2);
		if(Number(endtime_hour) >= 12){
			if(Number(endtime_hour) > 12){
				endtime_hour=Number(endtime_hour)-12;
			}
			endtime=endtime_hour+":"+endtime_min+":PM";
		}else{
			if(endtime_hour=="00"){
				endtime="12"+":"+endtime_min+":AM";
			}else{
				endtime=endtime_hour+":"+endtime_min+":AM";
			}
		}
		$("#starttimer").val(starttime);
		$("#endtimer").val(endtime);
		$("#starttimer").mobiscroll('setValue', starttime);
		$("#endtimer").mobiscroll('setValue', endtime);
		iosAndroidLogger("start time"+starttime);
		iosAndroidLogger("end time"+endtime);
	}
}

$(".timer-cancel").off("click").on("click",function(){
navigator.notification.confirm('Do you want to Cancel?',onConfirmQuit,'DoorBell','OK,Cancel');
		function onConfirmQuit(button){
			 if(button == "1"){
					redirectToHome();
				}
		}
});
 

$(".timer-save").off("click").on("click",function(){
var Days=new Array();
var smallDays=new Array();
var selectedDays=new Array();
var timer='';
var starttime="";
var endtime="";
var isDaySelected=false;
var j=0;
Days=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
smallDays=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
	$.each(Days,function(i,day){
	timer+=Number($("#"+day).prop("checked"));
		if($("#"+day).prop("checked")){
			isDaySelected=true;
			selectedDays[j]=smallDays[i];
			j++;
		}
	});
	if(isDaySelected==true){
	$(this).attr("selectedDays",selectedDays.toString()); 
		if($("#starttimer").val()==""){
		navigator.notification.alert('Please Select Start Time.',returnfalse,'DoorBell','OK');
		return false;
		}else{
			$(this).attr("starttime",$("#starttimer").val());
			starttime=$("#starttimer").val().split(":");
			if(starttime[2]=="PM"){
					if(starttime[0]=="12"){
						starttime=starttime[0]+""+starttime[1];
					}else{
						starttime=Number(starttime[0])+12+""+starttime[1];
					}
			}else{
				if(starttime[0]=="12"){
					starttime="00"+starttime[1];
				}else{
					starttime=starttime[0]+starttime[1];
				}
			}		
		}
	if($("#endtimer").val()==""){
	navigator.notification.alert('Please Select End Time.',returnfalse,'DoorBell','OK');
	return false;
	}else{
		$(this).attr("endtime",$("#endtimer").val());
		endtime=$("#endtimer").val().split(":");
		if(endtime[2]=="PM"){
				if(endtime[0]=="12"){
					endtime=endtime[0]+""+endtime[1];
				}else{
					endtime=Number(endtime[0])+12+""+endtime[1];
				}
			}else{
				if(endtime[0]=="12"){
					endtime="00"+endtime[1];
				}else{
					endtime=endtime[0]+endtime[1];
				}
			}		
	}
	timer+=starttime+endtime;
	}else{
	timer="000000000000000";
	}

	iosAndroidLogger(timer);
	if(timer=="000000000000000"){
		var timersetmessage="Do You Want To Reset the Timer.?";
		var buttonname='Reset,Cancel';
	}else{
		var timersetmessage="Timer Interval Selected is from "+$(".timer-save").attr("starttime")+" to "+$(".timer-save").attr("endtime")+"  for "+$(".timer-save").attr("selectedDays")+". Do You Want to Continue.?";
		var buttonname='Set,Cancel';
	}
	navigator.notification.confirm(timersetmessage,onConfirmTimerSet,'DoorBell',buttonname);
	function onConfirmTimerSet(button) {
		if (button === 1){
			setTimerForDoorBell(timer);
		}
	}
});

function returnfalse(){
return false;
}

function setTimerForDoorBell(timerIntervals){
if(DEVICE_ADDRESS!=''){	
		var bytes = bluetoothle.stringToBytes(timerIntervals);
		iosAndroidLogger("set timer"+timerIntervals);
		var encodedString = bluetoothle.bytesToEncodedString(bytes);
		iosAndroidLogger("set timer encoded :"+encodedString);
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_TIME_INTERVAL, value:encodedString};
		iosAndroidLogger("setTimerForDoorBell Write : " + JSON.stringify(paramsObj));
		bluetoothle.write(setTimerForDoorBellSuccess, writeError, paramsObj);
		return false;
	}
}

function setTimerForDoorBellSuccess(obj){
	iosAndroidLogger("set timer Write Success : " + JSON.stringify(obj));
	if (obj.status == "written")
  {
		var bytes = bluetoothle.encodedStringToBytes(obj.value);
		var string = bluetoothle.bytesToString(bytes);
		if(string=="000000000000000"){
			var timerSuccesMessage="Timer Interval Set Successfully.";
		}else{
			var timerSuccesMessage="Timer Interval Set Successfully.";
			$(".timer-save").attr("selectedDays","");
			$(".timer-save").attr("starttime","");
			$(".timer-save").attr("endtime","");
		}
		navigator.notification.alert(timerSuccesMessage,redirectToHome,'DoorBell','OK');
    iosAndroidLogger("set timer Written");
  }
  else
  {
    iosAndroidLogger("Unexpected Write Status");
  }
}


$(".dst-settings-save").off("click").on("click",function(){
	if($("#dstDateTimepicker").val()!=''){
		var date=$("#dstDateTimepicker").val();
	}else{
		$("#dstDateTimepicker").next().html("Please Select DST Time");
		return false;
	}
	if($("#dstShift").val()!=''){
		var shiftoffset=$("#dstShift").val();
	}else{
	$("#dstShift").next().html("Please Select DST Shift");
		return false;
	}
	var dstTime=currentDateTimeForDST(date,shiftoffset)
	setDSTTime(dstTime);
});


$(".dst-settings-reset").off("click").on("click",function(){
	clearDstTimeFields(true);
});

function clearDstTimeFields(all){
if(all!='' && all==true){
	$("#dstDateTimepicker").val("");
	$("#dstShift").val("");
}
$("#dstDateTimepicker").next().html("");
$("#dstShift").next().html("");
}


$(".changePasskey").on("click",function(){
if(DEVICE_ADDRESS!=''){	
		var passkey=$(".passkey").val();
		var bytes = bluetoothle.stringToBytes(passkey);
		iosAndroidLogger("passkey :"+passkey);
		var encodedString = bluetoothle.bytesToEncodedString(bytes);
		iosAndroidLogger("passkey encoded :"+encodedString);
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_SILENCER_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_CHANGE_PASSKEY, value:encodedString};
		iosAndroidLogger("passkey Write : " + JSON.stringify(paramsObj));
		bluetoothle.write(setPassKeySuccess, setPassKeyError, paramsObj);
		return false;
	}
});

function setPassKeySuccess(obj){
	iosAndroidLogger("setPassKeySuccesse Write Success : " + JSON.stringify(obj));
	if (obj.status == "written")
  {
		navigator.notification.alert('Passkey Changed Successfully.',redirectToHome,'DoorBell','OK');
    iosAndroidLogger(" PassKey Written");
  }
  else
  {
    iosAndroidLogger("Unexpected Write Status");
  }
}

function setPassKeyError(obj) {
  iosAndroidLogger("setPassKeyWrite Error : " + JSON.stringify(obj));
	navigator.notification.alert('Some Error Occur while Changing Passkey.Please Try Again',returnfalse,'DoorBell','OK');
}

function setDSTTime(dstTime){
if(DEVICE_ADDRESS!=''){	
		var bytes = bluetoothle.stringToBytes(dstTime);
		iosAndroidLogger("set dst time"+dstTime);
		var encodedString = bluetoothle.bytesToEncodedString(bytes);
		iosAndroidLogger("setdst  time encoded :"+encodedString);
		var paramsObj = {address:DEVICE_ADDRESS, serviceUuid:DOORBELL_CURRENT_TIME_WITH_DST_SERVICES, characteristicUuid:CHARACTERSTICS_DOORBELL_DST, value:encodedString};
		iosAndroidLogger("Write : " + JSON.stringify(paramsObj));
		bluetoothle.write(setDSTTimeSuccess, writeError, paramsObj);
		return false;
	}
}

function setDSTTimeSuccess(obj){
	iosAndroidLogger("set dst time Write Success : " + JSON.stringify(obj));
	if (obj.status == "written")
  {
		clearDstTimeFields(false);
		navigator.notification.alert('DST Time Set Successfully.',returnfalse,'DoorBell','OK');
    iosAndroidLogger(" dst time Written");
  }
  else
  {
    iosAndroidLogger("Unexpected Write Status");
  }
}


function currentDateTimeForDST(date,shiftoffset){
		var year=date.toString().substr(8,2);
		var month=date.toString().substr(3,2);
		var day=date.toString().substr(0,2);
		var sec="00";
		var mint=date.toString().substr(14,2);
		var time=date.toString().substr(11,8).split(":");
		if(time[2]=="PM"){
			if(time[0]=="12"){
				var hr=time[0];
			}else{
				var hr=Number(time[0])+12;
			}
		}else{
			if(time[0]=="12"){
				var hr="00";
			}else{
				var hr=time[0];
			}
		}		

	return shiftoffset + year + month + day + hr + mint + sec;
}


function currentDateTimeDay(){
   	var d = new Date();
		var month = d.getMonth();
    var day = d.getDate();
   	var year = d.getFullYear();
		var sec=d.getSeconds();
		var mint=d.getMinutes();
    var hr=d.getHours();
    var dayoffset=d.getDay();
   	year = year.toString().substr(2,2);
		month = month + 1;
    month = month + "";
		if (month.length == 1)
    {
        month = "0" + month;
    }
		day = day + "";
		if (day.length == 1)
    {
        day = "0" + day;
    }
		sec = sec + "";
    if(sec.length == 1)
    {
        sec ="0" + sec;
    }
    mint = mint + "";
    if(mint.length == 1)
    {
        mint ="0" + mint;
    }
   	hr = hr + "";
    if(hr.length == 1)
    {
        hr ="0" + hr;
    }
   	return dayoffset + year + month + day + hr + mint + sec;
}

function currentDateTime(){
var currentDateTime=new Date();
return currentDateTime.getDate()+'-'+Number(currentDateTime.getMonth()+1)+'-'+currentDateTime.getFullYear()+' '+currentDateTime.getHours()+':'+currentDateTime.getMinutes()+':'+currentDateTime.getSeconds();
}
function setLoadingText(loadingText){
iosAndroidLogger("loadingText"+loadingText);
$(".loading-text").html(loadingText);
}

function showToast(msg,sec){
sec = typeof sec !== 'undefined' ? sec : 2;
iosAndroidLogger("toast :"+msg);
if(sec!=''){
sec=Number(sec)*1000;
}
$(".content-wrapper").append('<div class="toast-container"><div id="toast" class="hide-me">'+msg+'</div></div>');
$("#toast").fadeIn("slow");
navigator.notification.beep(1);
setTimeout(function(){  $("#toast").fadeOut("slow"); $(".toast-container").remove(); },sec);
}

function redirectToHome(){
	window.location.href="#/";
}

hasPermission = function () {
  cordova.plugins.notification.local.hasPermission(function (granted) {
      if(!granted){
					iosAndroidLogger("no Permission");
					registerPermission();
			}else{
					iosAndroidLogger("Already hasPermission");
			}
  });
};

registerPermission = function () {
  cordova.plugins.notification.local.registerPermission(function (granted) {
     
			if(granted){
				iosAndroidLogger("registerPermission");
			}else{
				iosAndroidLogger("registerPermission error");

			}
  });
};


showNotification = function (notificationMessage) {
	 iosAndroidLogger("notificatoion called"+notificationMessage);
   var now = new Date().getTime(),
   _5_sec_from_now = new Date(now + 1 * 1000);
	 var notificationMessage=notificationMessage;
   //var sound = cordova.platformId == 'android' ? 'file://sound.mp3' : 'file://beep.caf';
	 if (cordova.platformId === 'android') {
		var notificationTitle="DoorBell";
	 }else{	
		var notificationTitle="";
	 }
	 id_notification = typeof id_notification !== 'undefined' ? Number(id_notification)+1 : 1;
 	 cordova.plugins.notification.local.schedule({
      id: id_notification,
      title: notificationTitle,
      text: notificationMessage,
      at: now
   });
};


function iosAndroidLogger(message){
if(PROJECT_MODE==DEVELOPMENT){
	if (cordova.platformId === 'android') {
		console.log(message);
	}else{
			alert(message);
	}
}
}
