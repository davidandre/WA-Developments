/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Oct 2016     david.andre
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */

function PostSource(type, name){

	var hasspecific=null;
	
	try {
		if (type=="item") {
			if (name=="item") {
				var custdesc = nlapiGetCurrentLineItemValue("item","custcol_wag_customerdescription");
				if (custdesc == "") {
					var itemid = nlapiGetCurrentLineItemValue(type,name);
					var custid = nlapiGetFieldValue("entity");
					if (itemid && custid){
						var cusfilters = new Array();
						cusfilters[0] = new nlobjSearchFilter( 'custrecord_wag_std_itemid', null, 'anyOf', itemid);
						cusfilters[1] = new nlobjSearchFilter( 'custrecord_wag_customerid', null, 'anyOf', custid);

						var cuscolumns = new Array();
						cuscolumns[0] = new nlobjSearchColumn( 'name' );
						cuscolumns[1] = new nlobjSearchColumn( 'custrecord_wag_customerdescript2' );
						cuscolumns[2] = new nlobjSearchColumn( 'custrecord_wag_custitemnumber' );

						// execute the Warrenty search, passing all filters and return columns
						var cussearchresults = nlapiSearchRecord( 'customrecord_wag_custitemdesc', null, cusfilters, cuscolumns );
						if (cussearchresults) {
							var searchresult = cussearchresults[ 0 ];
							var record = searchresult.getId( );
							var name = searchresult.getValue( 'name' );
							nlapiSetCurrentLineItemValue('item', 'custcol_wag_customerdescription', name);
							hasspecific = 1;
						}
					}
					if (!hasspecific) {
						var itemid = nlapiGetCurrentLineItemValue(type,name);
						var custid = nlapiGetFieldValue("entity");
						if (itemid && custid) {
							var cusfilters = new Array();
							cusfilters[0] = new nlobjSearchFilter( 'custrecord_wag_std_itemid', null, 'anyOf', itemid);
							cusfilters[1] = new nlobjSearchFilter( 'custrecord_wag_customerid', null, 'anyOf', '@NONE@');
							cusfilters[2] = new nlobjSearchFilter( 'custrecord_wag_apply_to_all', null, 'is', 'T');	

							var cuscolumns = new Array();
							cuscolumns[0] = new nlobjSearchColumn( 'name' );
							cuscolumns[1] = new nlobjSearchColumn( 'custrecord_wag_customerdescript2' );
							cuscolumns[2] = new nlobjSearchColumn( 'custrecord_wag_custitemnumber' );

							// execute the Warrenty search, passing all filters and return columns
							var cussearchresults = nlapiSearchRecord( 'customrecord_wag_custitemdesc', null, cusfilters, cuscolumns );
							if (cussearchresults) {
								var searchresult = cussearchresults[ 0 ];
								var record = searchresult.getId( );
								var name = searchresult.getValue( 'name' );
								nlapiSetCurrentLineItemValue('item', 'custcol_wag_customerdescription', name);
							}
						}
					}
				}
			}
		}
	}
	catch(e) {
		if ( e instanceof nlobjError )
			nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
			nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
			
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * 
 * Chec kthat no other Apply to All for this Item & Subsidiary
 * 
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
function checkGenericItemDescExists(type, name){
	
	var itemid = null;
	var subsid = null;
	var applytoall = null;
	
	nlapiLogExecution( 'DEBUG', 'WA Customer Item Description', 'Enter Save record function');
	
	
	try {
		if (name=='custrecord_wag_apply_to_all') {
			applytoall = nlapiGetFieldValue('custrecord_wag_apply_to_all');
			if (applytoall=='T') {
				itemid = nlapiGetFieldValue('custrecord_wag_std_itemid');
				subsid= nlapiGetFieldValue('custrecord_wag_custitemdesc_subsidiaryid');			
				if (itemid && subsid) {
					
					nlapiLogExecution( 'DEBUG', 'WA Customer Item Description', 'Checking Generic for item '+ nlapiGetFieldText('custrecord_wag_std_itemid'));
					// Search in WA Cust Item desc if there is other global definition for this item & subsidiary
					
					var cusfilters = new Array();
					cusfilters[0] = new nlobjSearchFilter( 'custrecord_wag_std_itemid', null, 'anyOf', itemid);
					cusfilters[1] = new nlobjSearchFilter( 'custrecord_wag_customerid', null, 'anyOf', '@NONE@');
					cusfilters[2] = new nlobjSearchFilter( 'custrecord_wag_apply_to_all', null, 'is', 'T');	
					cusfilters[2] = new nlobjSearchFilter( 'custrecord_wag_custitemdesc_subsidiaryid', null, 'anyOf', subsid);	
				
					var cuscolumns = new Array();
					cuscolumns[0] = new nlobjSearchColumn( 'name' );
					
					// execute the Warrenty search, passing all filters and return columns
					var cussearchresults = nlapiSearchRecord( 'customrecord_wag_custitemdesc', null, cusfilters, cuscolumns );
					nlapiLogExecution( 'DEBUG', 'WA Customer Item Description', 'Length of search : '+ cussearchresults.length);
					if (cussearchresults && cussearchresults.length>0) {
						alert('There is already a Generic Customer Item Description for this Item.');
						return false;
					}
					else 
						return true;
				}
			}
		}
	}
	catch(e) {
		if ( e instanceof nlobjError )
			nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
			nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
			
	}
	return true;
}

