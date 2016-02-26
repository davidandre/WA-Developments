/**

 * Default the departement value into each line 
 * if not empty 
 * copy the value of header's departement field into the sub record departement field each time a line is added
 * If value of departent is changed in the header, parse all lines and update the value
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Feb 2016     david.andre      Work on Raid ID 13 for WA DE
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function clientValidateField(type, name, linenum){
   
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function wa_DefaultDepartementToNewLine(type) {
     
	// Retreive the departement value from the header 
	//if not empty put the valuer into the departement of the new line
	
	try {
			var department = nlapiGetFieldValue('department');
	}
	catch (e) {
		wa_throwError('WA00001');
	}
	if (department != '') {
		alert(department);
			
	}
	
	
	
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type){
 
    return true;
}
