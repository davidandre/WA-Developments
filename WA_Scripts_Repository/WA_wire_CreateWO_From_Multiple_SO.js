/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 May 2017     david.andre
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function genWOFromMultiSO(request, response){

    	var userid = null;
	var filters = null;
	var columns = null;
	var subsidiaryid = null;
	var itemsList  = null;
	var form = null;
	var itemsublist = null;
	var params = null;
	var paramvalue = null;
	var selecteditem = null;
	var selecteditemid = null;
	var subval = null;
	var workorder = null;
	var workorderid = null;
	var soid = null;
	var custid = null;
	var qty = null;
	var workorderinit = null;
	
	
	try {
	    
	    	
		nlapiLogExecution('DEBUG', 'Generate List of All Items to produce', 'Init Variables');
		nlapiLogExecution('DEBUG', 'Method', request.getMethod());		
		params = request.getAllParameters();
		for ( param in params ){
		    nlapiLogExecution('DEBUG', param, params[param]);
		}
		// Init variables
		userid = nlapiGetUser();
		subsidiaryid = nlapiGetSubsidiary();
		
		var form  = null;
		
		filters = [];
		columns = [];
		
		nlapiLogExecution('DEBUG', 'Generate List of All Items to produce', 'Prepare Form');
		
		form = nlapiCreateForm('Generate Work Order from multiple Sales Orders');
		
		switch ( request.getMethod()) {
			case 'GET':
		
                		nlapiLogExecution('DEBUG', 'Generate List of All Items to produce', 'Prepare Search');
                		
                		filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', "SalesOrd");
                		filters[1] = new nlobjSearchFilter( 'custcol_wag_itemtype', null, 'anyOf', "10");
                		filters[2] = new nlobjSearchFilter( 'custcol_work_order', null, 'anyOf', "@NONE@");
                		filters[3] = new nlobjSearchFilter( 'custcol_wag_ivdetails', null, 'isempty', "");
                		filters[4] = new nlobjSearchFilter( 'subsidiary', null, 'anyOf', subsidiaryid);
                		filters[5] = new nlobjSearchFilter( 'status', null, 'anyOf', "SalesOrd:B","SalesOrd:A","SalesOrd:D");		
                		filters[6] = new nlobjSearchFilter( 'shipdate', null, 'after', 'today');
                		
                        	columns[0] = new nlobjSearchColumn( 'item', null, "GROUP");
                        	columns[1] = new nlobjSearchColumn( 'quantity', null, "SUM");
                        	columns[2] = new nlobjSearchColumn( "salesdescription","item","GROUP");        	
        	
                        	
                		itemsList = nlapiSearchRecord("salesorder",null,filters,columns);
                		nlapiLogExecution('DEBUG', 'Generate List of All Items to produce', 'Scan Search');
                		
                		if (itemsList  && itemsList.length>0) {
                		    	// 	Add Submit button
                			form.addSubmitButton('Select an Item');
                			
                			// Step information
                			form.addField('custpage_waw_step1','label','Step 1 - Select which item to want to produce. Only the first selection will be used.');
                			
                			itemsublist = form.addSubList('custpage_waw_itemlist', 'list', "Items to manufacture");
                			itemsublist.addField('custfield_selected','checkbox',' ');
                			itemsublist.addField('custfield_itemid','text',"");
                			itemsublist.addField('custfield_item','text',"Item");
                			itemsublist.addField('custfield_desc','text',"Description");			
                			itemsublist.addField('custfield_qty','float',"Quantity on Sales Orders");			    
                			
                			for (var cpt=0; cpt<itemsList.length;cpt++) {
                			    nlapiLogExecution('DEBUG', 'Generate List of All Items to produce', 'Search result' + cpt);
                			    
                			    itemsublist.setLineItemValue('custfield_itemid',cpt+1,itemsList[cpt].getValue(columns[0]));
                			    itemsublist.setLineItemValue('custfield_item',cpt+1,itemsList[cpt].getText(columns[0]));                			    
                			    itemsublist.setLineItemValue('custfield_desc',cpt+1,itemsList[cpt].getValue(columns[2]));			    
                			    itemsublist.setLineItemValue('custfield_qty',cpt+1,itemsList[cpt].getValue(columns[1]));			    

                			}
                		    
                		}else {
                			form.addField('custpage_waw_noitemtoproduce','label','There is no Item to manufacture in the current Open Sales Orders list.');
                		}
                		break;
			case 'POST':
			    switch (params['submitter']) {
			    	case 'Select an Item':
			    
                			nlapiLogExecution('DEBUG', 'Generate List of Sales Order for selected Item', 'Prepare Search');
                            		
                			paramvalue = params['custpage_waw_itemlistdata'];
        				paramvalue = paramvalue.split('');
        				for (var cptv=0; cptv < paramvalue.length; cptv++) {
        					subval = paramvalue[cptv].split('');
        					if (subval[0] == 'T') {
        					    	selecteditem = subval[2];
        					    	selecteditemid = subval[1];					    	
        						break;
        					}
        				}
        				if (selecteditem) {
                                		filters[0] = new nlobjSearchFilter( 'type', null, 'anyOf', "SalesOrd");
                                		filters[1] = new nlobjSearchFilter( 'custcol_wag_itemtype', null, 'anyOf', "10");
                                		filters[2] = new nlobjSearchFilter( 'custcol_work_order', null, 'anyOf', "@NONE@");
                                		filters[3] = new nlobjSearchFilter( 'custcol_wag_ivdetails', null, 'isempty', "");
                                		filters[4] = new nlobjSearchFilter( 'subsidiary', null, 'anyOf', subsidiaryid);
                                		filters[5] = new nlobjSearchFilter( 'status', null, 'anyOf', "SalesOrd:B","SalesOrd:A","SalesOrd:D");		
                                		filters[6] = new nlobjSearchFilter( 'item', null, 'anyOf', selecteditemid);                    		
                                		filters[7] = new nlobjSearchFilter( 'shipdate', null, 'after', 'today');                        		
                                		filters[8] = new nlobjSearchFilter( 'quantity', null, 'greaterthan', '0');                        		
                                		
                                        	columns[0] = new nlobjSearchColumn( 'tranid', null, null);
                                        	columns[1] = new nlobjSearchColumn( 'quantity', null, null);
                                        	columns[2] = new nlobjSearchColumn( 'entity', null, null);
                                        	columns[3] = new nlobjSearchColumn( 'internalid', null, null);                                        	
                                        	
                                		itemsList = nlapiSearchRecord("salesorder",null,filters,columns);
                                		nlapiLogExecution('DEBUG', 'Generate List of All Sales Order for Selected Item', 'Scan Search');
                                		
                                		if (itemsList  && itemsList.length>0) {
                                		    	// Add Submit button
                                			form.addSubmitButton('Prepare Work Order');
                                			
                                			// Add field with Selected Item  + Quantity for stock
                                			form.addField('custpage_waw_step2','label','Step 2 - For each sales order in the list, enter the quantity you want to produce. You can also indicate a quantity to produce for stock purpose');
                                			
                                			form.addField('custpage_waw_selecteditem','label','Selected Item: '+ selecteditem);
                                			form.addField('custpage_waw_selecteditemid','text','Selected Item ID: ').setDefaultValue(selecteditemid);
                                			
                                			form.addField('custpage_waw_qtyforstock','float','Quantity to produce for stock');
                                			
                                			// Add list of sales order for this item with Qty requested + qty to produce.
                                			itemsublist = form.addSubList('custpage_waw_itemlist', 'inlineeditor', "Select Sales order(s) and quantity");
                                			itemsublist.addField('custfield_soid','text',"");                                			
                                			itemsublist.addField('custfield_so','text',"Sales Order");
                                			itemsublist.addField('custfield_customerid','text',"");
                                			itemsublist.addField('custfield_customer','text',"Customer");			
                                			itemsublist.addField('custfield_qty','float',"Requested quantity");
                                			itemsublist.addField('custfield_qtytoproduce','float',"Quantity to produce");
                                			
                                			for (var cpt=0; cpt<itemsList.length;cpt++) {
                                			    itemsublist.setLineItemValue('custfield_so',cpt+1,itemsList[cpt].getValue(columns[0]));
                                			    itemsublist.setLineItemValue('custfield_soid',cpt+1,itemsList[cpt].getValue(columns[3]));                                			    
                                			    itemsublist.setLineItemValue('custfield_customer',cpt+1,itemsList[cpt].getText(columns[2]));			    
                                			    itemsublist.setLineItemValue('custfield_customerid',cpt+1,itemsList[cpt].getValue(columns[2]));                                			    
                                			    itemsublist.setLineItemValue('custfield_qty',cpt+1,itemsList[cpt].getValue(columns[1]));			    
                                			}
                                		}else {
                                			form.addField('custpage_waw_noitemtoproduce','label','There is no Item to manufacture in the current Open Sales Orders list.');
                                		}
        				}
        				break;
			    	case 'Prepare Work Order':
        			    	nlapiLogExecution('DEBUG', 'Create Work Order', '--->   Start   <----');
        			    	
        			    	// Init variables - Get Params values
        			    	soid = [];
        			    	custid = [];
        			    	qty = parseFloat(params['custpage_waw_qtyforstock']);
        			    	selecteditemid = params['custpage_waw_selecteditemid'];
        			    	paramvalue = params['custpage_waw_itemlistdata'];
        				paramvalue = paramvalue.split('');
        				for (var cptv=0; cptv < paramvalue.length; cptv++) {
        					subval = paramvalue[cptv].split('');
        					soid[cptv] = subval[0];
        					custid[cptv] = subval[2];
        					qty = qty + parseFloat(subval[5]);
        				}
        				
			    		if (selecteditemid) {
			    		    if (qty>0) {
			    			nlapiLogExecution('DEBUG', 'Create Work Order', 'Prepare Work Order for: '+selecteditemid);	
			    			// Create Workorder
			    			workorderinit = [];
			    			workorderinit.assemblyitem = selecteditemid;
			    			workorderinit.customform = 111;  				// (Welding Alloy)
			    			nlapiLogExecution('DEBUG', 'Create Work Order', 'Create Work Order');

			    			workorder = nlapiCreateRecord('workorder', workorderinit);
			    			
			    			nlapiLogExecution('DEBUG', 'Create Work Order', 'Update Work Order');
			    			workorder.setFieldValue('quantity',qty);
			    			workorder.setFieldValue('subsidiary',subsidiaryid);
			    			workorder.setFieldValue('assemblyitem',selecteditemid);			    			
			    			workorder.setFieldValue('department',nlapiLookupField('salesorder',soid[0],'department'));
			    			workorder.setFieldValue('location',nlapiLookupField('salesorder',soid[0],'location'));
			    			nlapiLogExecution('DEBUG', 'Create Work Order', 'Submit Work Order');
			    			nlapiSubmitRecord(workorder,true);
			    			// Create Xref Work order
			    			
			    		    }else
			    			nlapiLogExecution('ERROR', 'Create Work Order', 'Quantity to produce <=0!!!');
			    		}else
			    		    nlapiLogExecution('ERROR', 'Create Work Order', 'No Item selected!!!');
        			    	
        			    	nlapiLogExecution('DEBUG', 'Create Work Order', '--->   End     <----');			    	
			    	    	break;
			    	default:
    			    		nlapiLogExecution('ERROR', 'Unknown submit button', 'Error');
			    	    	break;
			    	}	
			    	break;
			default:
			    	nlapiLogExecution('ERROR', 'Unknown Method POST/GET', 'Error');
			    	break;
		}
		if (form)
		    response.writePage(form);
		
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}

    
    

}
