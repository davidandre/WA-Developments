/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Dec 2016     david.andre
 *
 */

/**
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
function UpdateFields(type){
 
	
	var sorec = null;
	var shipaddr = null;
    var salester = null;
	var dterms = null;
	var pdterms = null;
	var cpyconfig = null;
	var location = null;
	var locaddr = null;
	var incoterm = null;
    var shiptotax = null;
    
	try {
	    if (type=='create' || type=='edit') {
			sorec = nlapiGetNewRecord();
			if (sorec) { 
			
				
				// update Sales Territory on SO
				// Retreive shipto Tax ID
				
				shipaddr = sorec.editSubrecord('shippingaddress');
				if (shipaddr) {
	                salester = shipaddr.getFieldValue('custrecord_wag_sales_territory');
					sorec.setFieldValue('custbody_wag_sales_territory_so',salester);
					shiptotax = shipaddr.getFieldValue('custrecord_wag_localtaxid');
					sorec.setFieldValue('custbody_wag_shiptotaxid',shiptotax);

				}			
			}

			// Calculate Delivery Terms printing.
			
			cpyconfig = nlapiLoadConfiguration('companyinformation');
			if (cpyconfig)
				incoterm = cpyconfig.getFieldValue('custrecord_wag_incotermtext');
			if (sorec) {
				dterms = sorec.getFieldText('custbody_nbs_printeddeliveryterms');
				pdterms = dterms;
				if (dterms =='ESX' || dterms=='FCA') {
					location = nlapiLoadRecord('location',sorec.getFieldValue('location'));
					if (location) {
						locaddr = location.editSubrecord('mainaddress');
						if (locaddr)
							pdterms = pdterms + " - "+ locaddr.getFieldValue('city');
					}
				}
				else
				{
					pdterms = pdterms + " - "+ sorec.getFieldValue('shipcity');
				}
				pdterms = pdterms + " " + incoterm;
				sorec.setFieldValue('custbody_wag_printed_deliverycity',pdterms);
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