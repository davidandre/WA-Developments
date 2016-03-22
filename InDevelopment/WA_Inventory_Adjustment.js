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
	
	// Switchs on type (sublist) & name (field)
	switch (type) {
		case "inventory" :
			switch (name) {
				case "custcol_wag_adjust_qty_sm":
					// if the field is the Adjust Qty by SM in the Adjustment list then		
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
					if ((platesizesm != null) && (platesizesm != undefined) && (platesizesm >0)) {
			//			alert("Plate Size:" + platesizesm);
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
						// Do we need to test if consumption is negative?
						
						// Check if the consumption is lower or equal to the plate size * quantity on hand
						if (consumption > (platesizesm*qtyonhand)) {
							wa_throwAlert('WA00012');
							return false;
						}else
						{
							percent = -(consumption / platesizesm)  ;
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
						}
						// calculate the ratio for 1 EA
					    // put the value in the adjustment by Qty column
					}	
					else {
						wa_throwAlert('WA00011');
						return false;
					}
				break;
			}
		break;
	}
	return true;

}

