/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 May 2016     david.andre
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
function CopyLotInformationtoColumnField(type){
	
	// For each Item line, parse the inventory Assignments rows and copy the lot information & qty into a column field
	
	try {
	var count = nlapiGetLineItemCount('item');
	}
	catch (e){
		return false;
	}
	for(var i=1; i <= count; i++ ) {
		var bins = "";
		try {
		nlapiSelectLineItem('item', i);
		var rec= nlapiViewLineItemSubrecord('item', 'inventorydetail',i);
		var invcount = rec.getLineItemCount('inventoryassignment');	 
		
		  for(var x = 1; x <=invcount ; x++) {
		    rec.selectLineItem('inventoryassignment', x);
		    
		    var binID = rec.getCurrentLineItemText('inventoryassignment', 'binnumber');
		    var quantity = rec.getCurrentLineItemValue('inventoryassignment', 'quantity');
		    var inventorydetail = rec.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber');	
	    
		    bins += inventorydetail + ' ; '  + quantity +' !';
	    
		  }
		}
		catch (e){
			return false;
		}
	  nlapiSetCurrentLineItemValue('item', 'custcol_wag_ivdetails', bins);  
	  nlapiCommitLineItem('item');
	}
	
	
	
}
