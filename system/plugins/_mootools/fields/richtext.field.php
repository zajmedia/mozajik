<?php
/**
 * Field definition richtext areas. This is basically an alias of textarea, but with a different control associated with it.
 * @package Fields
 * @subpackage BuiltinFields
 **/
$GLOBALS['zajlib']->load->file('/fields/textarea.field.php');

class zajfield_richtext extends zajfield_textarea {
	const edit_template = 'field/richtext.field.html';	// string - the edit template, false if not used
	const show_template = false;						// string - used on displaying the data via the appropriate tag (n/a)

	// alias of textarea
}


?>