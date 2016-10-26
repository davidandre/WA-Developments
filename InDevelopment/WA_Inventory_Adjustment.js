/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Mar 2016     david.andre
 * 
 * Manage the adjustment of plate  by Qty in square meter and calculate the adjustment in EA unit.
 * 
 *
 */

/* This contains the previous value of the department field in the header of the PO
 * This is used to compare and potentially update lines in the PO when the dept is changed and not affect lines where the dept has been put manually
 * 
 */
var previousIASelectedDepartment=""

	

	/**
	 * Page Init function to load the departement value into the global variable
	 * 
	 * @param {String} type Access mode: create, copy, edit
	 * @returns {Void}
	 */
	function wa_IAInitPage(type){
		var res=true;
		
		try {
			// Retreive the departement value from the header
			previousIASelectedDepartment = nlapiGetFieldValue('department');
	
		}
		catch (e) {
			res = false;
			wa_throwError('WA00006');
		}
		
	   
	}


/**
 * If the departement value has been changed on the header, update all existing items lines 
 * 
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType

 */

function wa_UpdateIADepartmentOnItemList() {

	   var cptitems = 0;
	   var itemcount = 0; 
	   var department ="";
	   var res = true;


	
	// Get the new departement value in the header 
	try {
		// Retreive the departement value from the header
		department = nlapiGetFieldValue('department');

	}
	catch (e) {
		res = false;
		wa_throwError('WA00006');
	}
	
	// If not empty then, update all rows of Items
	
	if (department != '') {

			// Get number of already filled line
		   itemcount = nlapiGetLineItemCount('inventory');
		  // alert(itemcount);
		   return true;
		   // if more than 0, ask if we need to update the dept information or not. Only those equal to previous dept in header will be update
		   if (itemcount>0) 
		   		if (!confirm("Do you want to update the department information on the Inventory Adjustment lines?"))
		   			return false;

		   for (cptitems = 1; cptitems <= itemcount; cptitems++)
		   {
			   try {
				   nlapiSelectLineItem('inventory',cptitems);
				   if (nlapiGetCurrentLineItemValue('inventory','department') == previousIASelectedDepartment)
				   {
				   		nlapiSetCurrentLineItemValue('inventory', 'department', department);
				   		nlapiCommitLineItem("inventory");
			   	   }
			   }
			   catch (e) {
					res = false;
				   wa_throwError('WA00007');
			   }
		  }
		   previousIASelectedDepartment = department
	}
	return res;
}


/**
 * If initiate a new item subrecord, then default the departement fro the header
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function wa_IADefaultDepartementToNewLine(type) {
     
 
	//alert("Enter the Defaulting dept function: "+ type );
	var department ="";
	var linedept = "";
	
	// Only if we are in the Items Tab
	if (type=="inventory") {
		
			try {
				// Retreive the departement value from the header
				department = nlapiGetFieldValue('department');
				//alert("Department value is :"+department);
			}
			catch (e) {
				wa_throwError('WA00006');
			}
			//if not empty put the value into the departement of the new line
			if (department != '') {
				//Check if the department on the current line is already set by user or not?
				try{
					linedept = nlapiGetCurrentLineItemValue('inventory','department');
					//alert("Current dept value :"+linedept);
				}
				catch (e) {
						wa_throwError('WA00009');
				}
				if (linedept=="") {
					try{
						//alert("Now setting the department "+department );
						nlapiSetCurrentLineItemValue('inventory', 'department', department);
						alert('after set department');
						return true;
					}
					catch (e) {
							wa_throwError('WA00008');
					}
			   }else
				   return true;
				
			}else
				wa_throwError('WA00010');

	}
	return false;
}	


	
	
/**
 * This script needs the following fields [Adjustment By Qty in SM] & [Plate Size in SM] (custcol_wag_adjust_qty_sm & custitem_nbs_platesqm) 
 * It take the value enter by user, compare with quantity on hand in the location and calculate the adjustement in 'EA' unit.
 * 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function WAInventoryAdjustment(type, name, linenum){
   
	var itemID; 		// Item ID
	var platesizesm;  	// value retreived in the Item record
	var qtyonhand;		// Qty on hand for maximum adjustment
	var consumption; 	// Value entered by the user
	var percent;   		// result of the calculation to put in the Qty field
	var res;
	
	// Switchs on type (sublist) & name (field)
	switch (type) {
		case "inventory" :
			switch (name) {
				case "custcol_wag_adjust_qty_sm":
					// if the field is the Adjust Qty by SM in the Adjustment list then
					// get the size entered
					try {
						consumption = nlapiGetCurrentLineItemValue('inventory','custcol_wag_adjust_qty_sm');
						if (consumption =="") {
							nlapiDisableLineItemField('inventory','adjustqtyby',false);
							return true;
						}	
						consumption = parseFloat(consumption);
						qtyonhand = parseFloat(nlapiGetCurrentLineItemValue('inventory','quantityonhand'));
					}
					catch (e) {
						wa_throwAlert('WA00014');
						return false;
					}
					// Get the Item ID
					itemID = nlapiGetCurrentLineItemValue('inventory','item');
					// alert("ItemID :"+ itemID);
					
					//Check if the Item type is the good one
					// get the current plate size
					try {
						platesizesm = parseFloat(nlapiLookupField('item', itemID, 'custitem_nbs_platesqm'));
					}
					catch (e){
						wa_throwAlert('WA00010');
						return false;
					}
					// Test if we have a value
					if ((platesizesm != null) && (platesizesm != undefined) && (platesizesm !=0.0) && (!isNaN(platesizesm)))  {
						//alert("Debug info : Plate Size:" + platesizesm);

						// Do we need to test if consumption is negative?
						
						// Check if the consumption is lower or equal to the plate size * quantity on hand
						// This test is now removed as we can do negative adjustement
//						if (consumption > (platesizesm*qtyonhand)) {
//							wa_throwAlert('WA00012');
//							return false;
//						}else
//						{
							// The result is rounded to two digits.
							percent = ((consumption / platesizesm).toFixed(2))  ;
							try {
								nlapiSetCurrentLineItemValue('inventory','adjustqtyby',percent);
							}
							catch (e) {
								wa_throwAlert('WA00013');
								return false;
							}
							// If this is ok, then we disable the field so the user can't modify it
							nlapiDisableLineItemField('inventory','adjustqtyby',true);
						    return true;
//						}
						// calculate the ratio for 1 EA
					    // put the value in the adjustment by Qty column
					}	
					else {
						wa_throwAlert('WA00011');
						nlapiSetCurrentLineItemValue('inventory','custcol_wag_adjust_qty_sm',"");
						return false;
					}
				break;
				case "item":
					// Get the Item ID
					itemID = nlapiGetCurrentLineItemValue('inventory','item');
					// alert("ItemID :"+ itemID);
					
					//Check if the Item type is the good one
					// get the current plate size
					try {
						platesizesm = parseFloat(nlapiLookupField('item', itemID, 'custitem_nbs_platesqm'));
					}
					catch (e){
						wa_throwAlert('WA00010');
						return false;
					}
					if ((platesizesm == null) || (platesizesm == undefined) || (platesizesm ==0) || (isNaN(platesizesm))) {
						nlapiDisableLineItemField('inventory','custcol_wag_adjust_qty_sm',true);
						nlapiDisableLineItemField('inventory','adjustqtyby',false);
					}
					else
					{
						nlapiDisableLineItemField('inventory','custcol_wag_adjust_qty_sm',false);
						nlapiDisableLineItemField('inventory','adjustqtyby',true);
					}
					
				break;
			}
		break;

		case null:
			switch (name) {
				case 'department':
					// If update the department field from the header only. type=null
				//	alert('entering update all lines');
				//	res = wa_UpdateIADepartmentOnItemList();
				break;
			}
		break;
		
	}
	return true;

}

