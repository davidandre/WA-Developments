/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Nov 2016     david.andre
 *
 */

function checkItemLotFromFulfill(type, name, linenum) {
	

	
	var fulfill = null;
	var fulfilldesc = null;	
	var items = null;
	var itemid = null;
	var itemdesc = null;	
	var lots = null;
	var lotdesc = null;
	var lotid = null;	
	var found=false;
	var pallqtys=null;
	var qty=0;
	var reqqty = 0;
	var unit=null;
	var grossweight=0;
	var calcw = 0;
	var currw = 0;
	var maxw = 0;
	var palletid = null;
	var assqty=0;
	var unitweight=0;
	
	try
	{
			if (name=='custrecord_wag_pallet_item')
			{
			//    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Check  Item in fulfillment');				
				// Search if the item exists in the Fulfillment record
				// If not, throw an error.
				fulfill = nlapiGetFieldValue('custrecord_wag_pallet_fulfillment');
				fulfilldesc = nlapiGetFieldValue('custrecord_wag_pallet_fulfillment');				
				itemid = nlapiGetCurrentLineItemValue(type,name);
				itemdesc = nlapiGetCurrentLineItemText(type,name);				
				if (fulfill && itemid)
				{
//				    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Item to check:'+itemid);
					var filters = new Array();
					var columns = new Array();
					filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', 'ItemShip');
					filters[1] = new nlobjSearchFilter( 'internalid', null, 'anyOf', fulfill);	
					filters[2] = new nlobjSearchFilter( 'item', null, 'anyOf', itemid);			
					columns[0] = new nlobjSearchColumn( 'item', null, null);
					items = nlapiSearchRecord('transaction', null,filters, columns);

					found = false;
//					nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Number of results:'+items.length);
					if (items) 
					{
						for (var i = 0; items != null && i < items.length;i++)  
						{
	//						nlapiLogExecution( 'DEBUG', 'Pallet Log', 'checking Item Nr '+i+': '+items[i].getValue('Item'));						
							if (items[i].getValue('Item') == itemid)
								found = true;
						}
					}
					if (!found)
					{
//						nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Item is not in the fulfillment');						
						alert('The Item '+itemdesc + ' is not a member of the current fulfillment.');
						nlapiSetCurrentLineItemValue(type,name,null,false);
						return false;
					}
//					else
//					    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Item is present in the fulfillment');
				}
			}
			// TEST on the Lot Number
			
			if (name=='custrecord_wag_palletdetail_lotnr')
			{
		//	    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Check  lots for Item in fulfillment');
				// Search if the item exists in the Fulfillment record
				// Search if the lot is used in the fulfillment record
				// If not, throw an error.
				fulfill = nlapiGetFieldValue('custrecord_wag_pallet_fulfillment');
				fulfilldesc = nlapiGetFieldValue('custrecord_wag_pallet_fulfillment');				
				itemid = nlapiGetCurrentLineItemValue('recmachcustrecord_wag_palletdetail_palid','custrecord_wag_pallet_item');
				lotid = nlapiGetCurrentLineItemValue(type,name);	
				lotdesc = nlapiGetCurrentLineItemText(type,name);				
				itemdesc = nlapiGetCurrentLineItemText('recmachcustrecord_wag_palletdetail_palid','custrecord_wag_pallet_item');				
				if (fulfill && lotid)
				{
				//    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Lot to check:'+lotdesc);
					var filters = new Array();
					var columns = new Array();
					filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', 'ItemShip');
					filters[1] = new nlobjSearchFilter( 'internalid', null, 'anyOf', fulfill);	
					filters[2] = new nlobjSearchFilter( 'item', null, 'anyOf', itemid);			
					filters[3] = new nlobjSearchFilter( 'inventorynumber', 'inventoryDetail', 'anyOf', lotid);
					columns[0] = new nlobjSearchColumn( 'inventorynumber', 'inventoryDetail', null);
					lots = nlapiSearchRecord('transaction', null,filters, columns);

					found = false;

					if (lots) 
					{
						nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Lot number, Number of results:' + lots.length);
						for (var i = 0; lots != null && i < lots.length;i++)  
						{
	//						nlapiLogExecution( 'DEBUG', 'Pallet Log', 'checking Item Nr '+i+': '+items[i].getValue('Item'));						
							if (lots[i].getValue('inventorynumber', 'inventoryDetail') == lotid)
								found = true;
						}
					}
					if (!found || (!lots))
					{
//						nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Item is not in the fulfillment');						
						alert('The lot '+  lotdesc +' for Item '+ itemdesc + ' is not used in the current fulfillment.');
						nlapiSetCurrentLineItemValue(type,name,null,false);
						return false;
					}
//					else
//					    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Item is present in the fulfillment');
				}
			}			
			// TEST on the Quantity of Lot Number
			
			if (name=='custrecord_wag_palletdetail_qty')
			{
	//		    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Check  lots for Item in fulfillment');
				// Search if the item exists in the Fulfillment record
				// Search if the lot is used in the fulfillment record
			    // Check Quantity on lot, then check pallets for assigned qty and check if enough to add
			    // Search Unit of measure and Gross weight
			    // If unit of measure is Kg, calculate the weight base on qty
			    // If not, divide gross weight by qty
				// If not, throw an error.
			    
			    // Get Data from Pallet
			    fulfill = nlapiGetFieldValue('custrecord_wag_pallet_fulfillment');
				fulfilldesc = nlapiGetFieldValue('custrecord_wag_pallet_fulfillment');
				maxw = nlapiGetFieldValue('custrecord_wag_palletmaxweight');				
				palletid = nlapiGetFieldValue('id');
				itemid = nlapiGetCurrentLineItemValue('recmachcustrecord_wag_palletdetail_palid','custrecord_wag_pallet_item');
				lotid = nlapiGetCurrentLineItemValue(type,'custrecord_wag_palletdetail_lotnr');	
				lotdesc = nlapiGetCurrentLineItemText(type,'custrecord_wag_palletdetail_lotnr');				
				itemdesc = nlapiGetCurrentLineItemText('recmachcustrecord_wag_palletdetail_palid','custrecord_wag_pallet_item');				
				reqqty = nlapiGetCurrentLineItemValue(type,name);	
				
				// 1. Get Quantity from the fulfillment
				if (fulfill && lotid)
				{
		//		    nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Lot to check:'+lotdesc);
					var filters = new Array();
					var columns = new Array();
					filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', 'ItemShip');
					filters[1] = new nlobjSearchFilter( 'internalid', null, 'anyOf', fulfill);	
					filters[2] = new nlobjSearchFilter( 'item', null, 'anyOf', itemid);			
					filters[3] = new nlobjSearchFilter( 'inventorynumber', 'inventoryDetail', 'anyOf', lotid);
					columns[0] = new nlobjSearchColumn( 'inventorynumber', 'inventoryDetail', null);
					columns[1] = new nlobjSearchColumn( 'quantity', 'inventoryDetail', null);
					columns[2] = new nlobjSearchColumn( 'unit', null, null);
					columns[3] = new nlobjSearchColumn( 'custcol_wag_gross_weight', null, null);
					lots = nlapiSearchRecord('transaction', null,filters, columns);
					found = false;
					
					if (lots) 
					{
	//					nlapiLogExecution( 'DEBUG', 'Pallet Log', 'QTY : Lot number :' + lotid + ', Number of results:' + lots.length);
						for (var i = 0; lots != null && i < lots.length;i++)  
						{
							if (lots[i].getValue(columns[0]) == lotid) {
								qty = parseFloat(lots[i].getValue(columns[1]));
								nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Qty in column =' + lots[i].getValue(columns[1]) );	
								found = true;
								unit = lots[i].getValue(columns[2]);
								grossweight = lots[i].getValue(columns[3]);
								nlapiLogExecution( 'DEBUG', 'Pallet Log', 'LOT' + lotid + ' QTY=' + qty +' / Gross Weight='+grossweight);								
							}
						}
					}

					if (found)
					{
						// Look for weight already assigned to all pallets
						
						var filtersp = new Array();
						var columnsp = new Array();
						
						filtersp[0] = new nlobjSearchFilter( 'custrecord_wag_palletdetail_fulfill', null, 'anyOf', fulfilldesc);
						filtersp[1] = new nlobjSearchFilter( 'custrecord_wag_pallet_item', null, 'anyOf', itemid);	
						filtersp[2] = new nlobjSearchFilter( 'custrecord_wag_palletdetail_lotnr', null, 'anyOf', lotid);			
						columnsp[0] = new nlobjSearchColumn( 'custrecord_wag_palletdetail_grossweight', null);
						columnsp[1] = new nlobjSearchColumn( 'custrecord_wag_palletdetail_palid', null);						
						columnsp[2] = new nlobjSearchColumn( 'custrecord_wag_palletdetail_lotnr', null);
						
						pallqtys= nlapiSearchRecord('customrecord_wag_pallet_details', null,filtersp, columnsp);
						if (pallqtys) 
						{
							nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Existing in pallets, Number of results:' + pallqtys.length);
							for (var i = 0; pallqtys != null && i < pallqtys.length;i++)  
							{
								if ((pallqtys[i].getValue(columnsp[2]) == lotid) ) {								
									assqty = assqty + parseFloat(pallqtys[i].getValue(columnsp[0]));
									nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Pallet:' + pallqtys[i].getValue(columnsp[1]) + ' Lot: ' + lotid + ' removed QTY='+assqty);
									found = true;
								}
							}
						}						

						// Calculate and check unit weight

						unitweight = grossweight/qty;
						
						if (unit=='Kilogram') 
							unitweight = 1;

						nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Calculated weight:'+calcw);						
						// Get current weight of pallet
						var nbl = nlapiGetLineItemCount('recmachcustrecord_wag_palletdetail_palid');
						for (var cpt=1; cpt<=nbl;cpt++){
							if (cpt!=linenum)
								currw = currw + parseFloat(nlapiGetLineItemValue('recmachcustrecord_wag_palletdetail_palid','custrecord_wag_palletdetail_grossweight',cpt));
							
						}
						nlapiLogExecution( 'DEBUG', 'Pallet Log', 'Current Pallet Weight:'+currw);
						// Check if we can add this to the pallet
						calcw = reqqty*unitweight;
						
						if (calcw>(maxw-currw)) {
							alert('You have reach the maximum allowed weight on this pallet. The quantity of this Item will be adjusted');
							reqqty = (maxw-currw)*unitweight;
						}
						calcw = reqqty*unitweight;						
						if (qty<=0)
						{
							alert('There is no more quantity available for palleting for this Item');
							nlapiSetCurrentLineItemValue(type,name,0,false);
							return false;
						}
						else if ((qty-assqty)<reqqty) {
							alert('There is only '+qty+' available for '+ itemdesc +'. Quantity is adjusted automatically to the maximum available ');
							nlapiSetCurrentLineItemValue(type,name,(qty-assqty),false);
							calcw = (qty-assqty)*unitweight;
							nlapiSetCurrentLineItemValue(type,'custrecord_wag_palletdetail_grossweight',calcw,false);
							return false;							
						} else 
						{
							nlapiSetCurrentLineItemValue(type,name,reqqty,false);							
							nlapiSetCurrentLineItemValue(type,'custrecord_wag_palletdetail_grossweight',calcw,false);
							return false;
						}
					}
				}
			}	
	}
	catch(e)
	{
		if ( e instanceof nlobjError )
	          nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
	    else
	          nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
	}
	
	return true;
	
}