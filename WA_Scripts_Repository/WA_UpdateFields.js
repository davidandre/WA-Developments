/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Dec 2016     david.andre
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
		
	var sorec = null;
	var shipaddr = null;
    var salester = null;
	var filters = new Array();
	var columns = new Array();
	var sosearch =null;
	var soid = null;
	var sid = null;
	
    try {
		// Do search all where Sales territory is empty for WA DE only

		filters[0] = new nlobjSearchFilter( 'custbody_wag_sales_territory_so', null, 'anyof', '@NONE@');
		filters[1] = new nlobjSearchFilter( 'subsidiary', null, 'anyof', '5');
		filters[2] = new nlobjSearchFilter( 'type', null, 'anyof', 'SalesOrd');

		columns[0] = new nlobjSearchColumn('internalid',null,null);
		sosearch = nlapiSearchRecord('transaction', null, filters, columns);			
		
		for (var i = 0; sosearch!= null && i < sosearch.length;i++) {
			soid = sosearch[i].getValue(columns[0]);
			if (soid) {
				sorec = nlapiLoadRecord('salesorder',soid);
				if (sorec) { 
					
					// Get Customer record
					shipaddr = sorec.editSubrecord('shippingaddress');
					if (shipaddr) {
		                salester = shipaddr.getFieldValue('custrecord_wag_sales_territory');
						sorec.setFieldValue('custbody_wag_sales_territory_so',salester);
						
					    sid = nlapiSubmitRecord(sorec);
					}
				}
			}
		}
	}
	catch(e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
		
	}



}

function updatePOWithTaxID(type) {
	
	var sorec = null;
	var cusrec = null;
    var cusid = null;
	var filters = new Array();
	var columns = new Array();
	var sosearch =null;
	var soid = null;
	var sid = null;
	
    try {
		// Do search all where Sales territory is empty for WA DE only

		filters[0] = new nlobjSearchFilter( 'vatregnum', null, 'isempty', null);
		filters[1] = new nlobjSearchFilter( 'subsidiary', null, 'anyof', '5');
		filters[2] = new nlobjSearchFilter( 'type', null, 'anyof', 'SalesOrd');

		columns[0] = new nlobjSearchColumn('internalid',null,null);
		sosearch = nlapiSearchRecord('transaction', null, filters, columns);			
		
		for (var i = 0; sosearch!= null && i < sosearch.length;i++) {
			soid = sosearch[i].getValue(columns[0]);
			if (soid) {
				sorec = nlapiLoadRecord('salesorder',soid);
				if (sorec) { 
					cusid = sorec.getFieldValue('entity');
					if (cusid) {
						cusrec = nlapiLoadRecord('customer',cusid);
						if (cusrec) {
						// Get Customer record
								taxid = cusrec.getFieldValue('vatregnum');
								sorec.setFieldValue('vatregnum',taxid);
								sid = nlapiSubmitRecord(sorec);
						}
					}
				}
			}
		}
	}
	catch(e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() )
		
	}



}