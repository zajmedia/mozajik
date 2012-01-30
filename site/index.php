<?
////////////////////////////////////////////////////////////////////////////////
// !BEGIN CONFIGURATION

	////////////////////////////////////////////////////////////////////////////////
	// debug mode (default: false, except for localhost)
	////////////////////////////////////////////////////////////////////////////////
	// Debug mode is a special feature which enables a range of tools, error messages,
	//		and logs to help you during development. It is DANGEROUS and SLOW to use
	//		on production sites!!
	// – debug_mode is false by default for all domains except the ones specified by
	//	 debug_mode_domains array.
	// - you can use the optional debug_mode_domains to enable debug mode on certain
	//	 domains that you use for development (for example, localhost (default),
	//	 test.mydomain.com, etc.). see docs for more info on usage.
	////////////////////////////////////////////////////////////////////////////////
		$debug_mode = false; // CHANGING IS NOT RECOMMENDED! use debug_mode_domains!
		$debug_mode_domains = array("localhost");
	
	////////////////////////////////////////////////////////////////////////////////
	// root folder (default: "")
	////////////////////////////////////////////////////////////////////////////////
	// – automatically determined by default, but set it here to override
	////////////////////////////////////////////////////////////////////////////////
		$zaj_root_folder = "";
	
	////////////////////////////////////////////////////////////////////////////////
	// site folder  (default: "")
	////////////////////////////////////////////////////////////////////////////////
	// – needs to be set only if it is not the default /rootfolder/site
	// - note: current release does not allow for alternate locations!
	////////////////////////////////////////////////////////////////////////////////
		$zaj_site_folder = "";	// not completely supported yet!
	
	////////////////////////////////////////////////////////////////////////////////
	// default application (default: "main")
	////////////////////////////////////////////////////////////////////////////////
	// – this will be the default application, when no specific app is requested
	////////////////////////////////////////////////////////////////////////////////
		$zaj_default_app = "default";

	////////////////////////////////////////////////////////////////////////////////
	// default mode (default: "main")
	////////////////////////////////////////////////////////////////////////////////
	// – this will be the default application mode, when no specific mode requested
	// - do NOT include a trailing slash here! (slashes in general are alowed)
	////////////////////////////////////////////////////////////////////////////////
		$zaj_default_mode = "main";
	
	////////////////////////////////////////////////////////////////////////////////
	// plugin apps (default: none)
	////////////////////////////////////////////////////////////////////////////////
	// - this array should include a list of registered apps in your plugin folder
	// - processing happens in this order: local app, plugins, system
	// - processing within plugin apps happens in order set below
	////////////////////////////////////////////////////////////////////////////////
		$zaj_plugin_apps = array('_project');

	////////////////////////////////////////////////////////////////////////////////
	// system apps (default: _global, _mootools)
	////////////////////////////////////////////////////////////////////////////////
	// - this array should include a list of registered apps in your system/plugins folder
	// - you should only change this if you know what you are doing!
	////////////////////////////////////////////////////////////////////////////////
		$zaj_system_apps = array('_global', '_mootools');

	////////////////////////////////////////////////////////////////////////////////
	// database access
	////////////////////////////////////////////////////////////////////////////////
	// – mysql server, user, and pass
	// - note: only mysql connections are supported
	// - $zaj_mysql_ignore_tables allows you to define external tables. these will
	//		not be updated and will not be available within the model framework.
	////////////////////////////////////////////////////////////////////////////////
		$zaj_mysql_enabled = false;
		$zaj_mysql_server = "localhost";
		$zaj_mysql_user = "";
		$zaj_mysql_password = "";
		$zaj_mysql_db = "";
		$zaj_mysql_ignore_tables = array();

	////////////////////////////////////////////////////////////////////////////////
	// update access
	////////////////////////////////////////////////////////////////////////////////
	// – restrict username and password to update menu
	// - user name and password are required if not in debug_mode
	// - WARNING: changing update appname is not yet supported!
	////////////////////////////////////////////////////////////////////////////////
		$zaj_update_enabled = true;
		$zaj_update_appname = 'update';		
		$zaj_update_user = "";
		$zaj_update_password = "";

	////////////////////////////////////////////////////////////////////////////////
	// php error log
	////////////////////////////////////////////////////////////////////////////////
	// – enable/disable error logging
	// - for the log file name you can use a custom file name. this should be a
	//			full path. if empty, log will go to the server's phperror log.
	// - enabling notices could put strain on the server (unless you are careful
	//			about not generating notices in your code! (Mozajik is!)
	// - enabling backtraces will generate huge log files if you have lots of
	//			errors. This should only be used sparingly.
	// - enabling jserror will log all javascript errors (depending on browser support).
	//			This may be useful, but it will create extra AJAX requests each time a
	//			javascript error is detected.
	////////////////////////////////////////////////////////////////////////////////
		$zaj_error_log_enabled = true;
		$zaj_error_log_notices = false;
		$zaj_error_log_backtrace = false;
		$zaj_error_log_file = '';
		$zaj_jserror_log_enabled = false;
		$zaj_jserror_log_file = '';

	////////////////////////////////////////////////////////////////////////////////
	// locale and language
	////////////////////////////////////////////////////////////////////////////////
	// – make sure the locale is installed and enabled
	////////////////////////////////////////////////////////////////////////////////	
		date_default_timezone_set("Europe/Budapest");
		setlocale(LC_ALL, 'hu_HU');
		$zaj_locale = 'hu_HU';

	////////////////////////////////////////////////////////////////////////////////
	// external api access keys
	////////////////////////////////////////////////////////////////////////////////
	// – you need to register for API keys at the services' website
	////////////////////////////////////////////////////////////////////////////////	
		$api_google_maps_key = "";
		$api_recaptcha_public = "";
		$api_recaptcha_private = "";

// END OF CONFIGURATION
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// !BEGIN - DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU'RE DOING!

	////////////////////////////////////////////////////////////////////////////////
	// config file version (only update this if you know what you are doing!)
	////////////////////////////////////////////////////////////////////////////////
		$zaj_config_file_version = 303;

	// preload all system stuff
		require("../system/site/index.php");
	// done.

	////////////////////////////////
	// Load my settings
		
		// PLACE CUSTOM CONFIGURATION HERE! (this will be run each time any request is made)
			// IMPORTANT: typically, you should use __load() in controller files and __plugin()
			//	for plugins to perform any such custom configurations.

	// End of settings
	////////////////////////////////
	
	// now load the app request
		$zajlib->load->app($app_request);
	// if in debug mode add script with execution time
		$execution_time = round(microtime(true) - $GLOBALS['execute_start'], 5);
		$peak_memory = round((memory_get_peak_usage())/1024, 0);
		if($zajlib->debug_mode){
			$zajlib->js_log .= "zaj.log('$zajlib->num_of_notices notices during execution. to view them, add ?notice=on to the url.');";
			$zajlib->js_log .= "zaj.log('$zajlib->num_of_queries sql queries during execution. to view them, add ?query=on to the url.');";
		}
		else $zajlib->js_log = "";
		print "<script> if(typeof zaj != 'undefined') { zaj.execution_time = $execution_time; zaj.peak_meory = $peak_memory; zaj.log('exec time: $execution_time sec / peak memory: $peak_memory kb'); ".$zajlib->js_log." }\n</script>";

	// thats it, we're done without errors!
		exit(0);
// END
////////////////////////////////////////////////////////////////////////////////

?>