/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jan 2017     david.andre
 *
 */

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
 * @param {String} name Field internal id
 * @returns {Void}
 */
function SourceWAFields(type, name) {
	 
	var vdr = null;
	var addr = null;
	
	
	try {
		nlapiLogExecution( 'DEBUG', 'Blanket PO', 'Enter SourceWAFields ('+ type +')');
		if (name=="entity") {
        	nlapiLogExecution( 'DEBUG', 'Blanket PO', 'Get Vendor address');
			vdr = nlapiLoadRecord('Vendor',nlapiGetFieldValue('entity'));
			if (vdr) {
                             addr = vdr.getFieldValue('defaultaddress');
                             nlapiLogExecution( 'DEBUG', 'Blanket PO', addr );
                             nlapiSetFieldValue('custbody_wa_vendor_address',addr);
			}
		}
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
	}
	
   
}
