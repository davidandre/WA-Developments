/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Jan 2017     david.andre
 *
 */

/**
 * BeforeSubmit
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function SourceWAFields(type){
 
	var po = null;
	var vdr = null;
	var addr = null;
	
	
	try {
		nlapiLogExecution( 'DEBUG', 'Blanket PO', 'Enter SourceWAFields ('+ type +')');
		po = nlapiGetNewRecord();
		if (po) {
            nlapiLogExecution( 'DEBUG', 'Blanket PO', 'Get Vendor address');
			vdr = nlapiLoadRecord('Vendor',po.getFieldValue('entity'));
			if (vdr) {
                             addr = vdr.getFieldValue('defaultaddress');
                             nlapiLogExecution( 'DEBUG', 'Blanket PO', addr );
                             po.setFieldValue('custbody_wa_vendor_address',addr);
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
