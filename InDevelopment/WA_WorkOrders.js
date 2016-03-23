/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Mar 2016     david.andre
 *
 */


/**
 * After Submit Event : To add the number of coils from the Item row of the SO into the Work order if automatically created
 * 
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function populateWOWithNumberOfCoilsFromSOLine(type){
	
	var cptitem;   	// Counter for item rows of the SO
	var soid;    	// Work order ID for the current Item
	var ncoils;		// Number of coils for the current Item
	var fields = new Array();
	var values = new Array();
	var updatefields;

	// Test the type ??
	if (type=='create') {
		// Get the SO ID from the Workorder
		// Check the SO for the item number in the line, based on Qty, Item number, Work Order tick
		soid = nlapigetFieldValue('createdfrom');
		alert("SO ID :"+soid);
		
		
	} // ENDIF type = create
	
}

function populateWOWithNumberOfCoilsFromSOLineOLD(type){
	
	var cptitem;   	// Counter for item rows of the SO
	var soid;    	// Work order ID for the current Item
	var ncoils;		// Number of coils for the current Item
	var fields = new Array();
	var values = new Array();
	var updatefields;

	// Test the type ??
	if (type=='create') {
		// Get the SO ID from the Workorder

		// Parse each line with a WO different to null and to value 'Work Ord.' which means WO has been created automatically		
		for (cptitem=1;cptitem<=nlapiGetLineItemCount('item');cptitem++) {
			// Get the WO ID
			try {
				woid = nlapiGetLineItemValue('item','woid',cptitem);
				alert(" WO ID "+woid );
			}
			catch (e) {
				wa_throwError('WA00015');
			}
			if (woid!="" && woid != null & woid != undefined) {
				// Get the Number of coil of the item line
				try {
					ncoils= nlapiGetLineItemValue('item','custcol_wag_number_of_coils',cptitem);
					alert("Coils number "+ncoils+" WO ID "+woid );
				}
				catch (e) {
					wa_throwError('WA00016');					
				}
				// What to do if Number of coils is 0 ??
				// Check if the item & qty in the line is the same than on the WO ??
		
				try {
					// Get the WO Record
					//worec = nlapiLoadRecord('workorder', woid, initializeValues);
					// Set the number of coils in the header
					//worec.setFieldValue('custbody_wag_number_coils',ncoils);
					// Save record after change
					//if (nlapiSubmitRecord(worec) != woid)
					//{
					//	wa_throwError('WA00019');						
					//}
					fields[0]='custbody_wag_number_coils';
					values[0] = ncoils;
					updatefields = nlapiSubmitField('workorder', woid, fields, values);
				}
				catch (e) {
					wa_throwError('WA00017');
				}
			}
		}
	}// ENDIF type = create

}	
