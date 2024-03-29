//////////////////////////////////////////////////////////////////////////////
// class: zajfield
// version: 3.0
//////////////////////////////////////////////////////////////////////////////
// description: base class for for fields and validation
// requires: mootools, zaj.js
//////////////////////////////////////////////////////////////////////////////
// version history.
// - 3.0 - initial release, mootools support
//////////////////////////////////////////////////////////////////////////////

var zajField = new Class({
	Implements: [Options, Events],
	
	options: {
	},
	
	//////////////////////////////////////////////////////////////////////////////
	// constructor
		initialize: function(class_name, object_id, field_name, options){
			// set default variables
				this.class_name = class_name;
				this.object_id = object_id;
				this.field_name = field_name;
				this.formid = class_name+'_'+object_id;
		}

});	