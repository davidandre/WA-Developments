/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Mar 2017     david.andre
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum){
	
	var rec = null;
	var std = null;
	var filters = null;
	var columns = null;
	var partofstd = null;
	var fields = null;
	var res = null;
	var nam = null;
	var fam = null;
	var shieldtype = null;
	var nbl = null;
	var nb=null;
	
	try {
		
		switch (type) {
			case null:
				/*
				 *   Calculate Product Name based on familly and name field
				 */
				if ((name=='custrecord_waw_product_family') || (name=='custrecord_waw_products_name')) {
					fam = nlapiGetFieldText('custrecord_waw_product_family');
					nam = nlapiGetFieldValue('custrecord_waw_products_name');
					nlapiSetFieldValue('name', fam+' '+nam);
				}
				/*
				 * Calculate the Shielding type based on the last letter of the name
				 */
				if (name=='custrecord_waw_products_name') {
					nam = nlapiGetFieldValue('custrecord_waw_products_name').toUpperCase();
					shieldtype = nam.substring(nam.length-1);
					if ((shieldtype=='O') || (shieldtype=='G') || (shieldtype=='S'))
						nlapiSetFieldText('custrecord_waw_product_shieldingtype',shieldtype);
				}
			break;
			
			case 'recmachcustrecord_waw_itemspec_product':
				if (name=='custrecord_nbswag_balance') {
				//	nlapiLogExecution( 'DEBUG', 'Checking balance');
					if (nlapiGetCurrentLineItemValue(type,name)=='T') {					
						if (nlapiGetCurrentLineItemValue(type,'custrecord_nbswag_is_proptype') != '1')  {
							alert('Only Chemical elements/compounds can be used as balance');
							nlapiSetCurrentLineItemValue(type,name,'F');						
						}
						nbl = nlapiGetLineItemCount(type);
						nb = 0;
						if (nbl>1) {
							//nlapiLogExecution( 'DEBUG', 'Scanning '+nbl.toString()+' elements...');							
							for (var cpt=1;cpt<nbl+1;cpt++) {
								//nlapiLogExecution( 'DEBUG', 'Scanning ...'+cpt.toString(),nlapiGetLineItemValue(type,name,cpt));							
								if ((nlapiGetLineItemValue(type,name,cpt)=='T') && (cpt != linenum)) 
									nb++;
							}
							if (nb>=1) {
								alert('You cannot have more than one Element/Compound as Balance.');
								nlapiSetCurrentLineItemValue(type,name,'F');
							}
						}
					}
				}
			break;
			
			case 'recmachcustrecord_waw_wirestd_item':
			case 'recmachcustrecord_waw_itemstd_product':
				switch (name) {
					case 'custrecord_waw_wirestd_standard':
						/*
						 * Depending on the Standard chosen, enable or disable the fields in the list of component to define the standard 
						 */
				//		nlapiLogExecution( 'DEBUG', 'Entering The function for Standards setup');
						std = nlapiGetCurrentLineItemValue(type,name);
						filters = new Array();
						columns = new Array();
						fields = nlapiCreateRecord(nlapiGetRecordType()).getAllLineItemFields(type);
							
						filters[0] = new nlobjSearchFilter( 'custrecord_waw_stdpref_standard', null, 'anyOf', std);
						columns[0] = new nlobjSearchColumn( 'custrecord_waw_itemstd_fieldid', null, null);
						partofstd = nlapiSearchRecord('customrecord_waw_productstdpref', null,filters, columns);
						res = new Array();
						if (partofstd) {
			//				nlapiLogExecution( 'DEBUG', 'Scan all results from std preferences');
							for (var cpt=0;cpt<partofstd.length;cpt++) {
								// res[cpt] = nlapiLookupField('customrecord_waw_datafieldtype',partofstd[cpt].getValue(columns[0]),'custrecord_waw_datafieldtype_fieldid');
								res[cpt] = partofstd[cpt].getValue(columns[0])
							//	nlapiLogExecution( 'DEBUG', 'Field used',res[cpt]);
							}
					//		nlapiLogExecution( 'DEBUG', 'Search current field in the Standard preferences');
							for (var cpt=5;cpt<19;cpt++)
							{	
						//		nlapiLogExecution( 'DEBUG', 'Field find at ',res.indexOf(fields[cpt]));
								if (res.indexOf(fields[cpt])>-1) {
									nlapiDisableLineItemField(type,fields[cpt],false);
						//			nlapiLogExecution( 'DEBUG', 'DISABLE field ',fields[cpt]);
								}
								else {
								    nlapiDisableLineItemField(type,fields[cpt],true);
							//		nlapiLogExecution( 'DEBUG', 'ENABLE field ',fields[cpt]);									
								}
							}
						}
					break;
					case '':
						// For other field change, do the calculation of the text value
					break;
				}
			break;
		}
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )		
	}
 
}

/*
 * Add button on Item REceipt for Wire Raw materials (all atm)
 */

function addPropertiesButton(type, form, request){
	
	try {
		
		var sUrl2 = nlapiResolveURL('RECORD', 'customrecord_nbswa_properties');
		
		form.addButton('custpage_btn_printxml', 'Wire Raw Materials Validation', 'window.open(\'' + sUrl2 + '\', \'_blank\' )');		

	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )		
	}			
}


/**
 * on Validateline for Product Standard, Calculate the detailed name of the standard
 * 
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function calculStdText(type){
 
    	var rec = null;
	var std = null;
	var filters = null;
	var columns = null;
	var partofstd = null;
	var fields = null;
	var res = null;
	var resindex = null;
	var previndex =null;
	var sep = null;
	var stdtext = null;
	var elemtext = null;
	
	try {
	    stdtext = '';
	    
	    if (type==='recmachcustrecord_waw_itemstd_product') {
	        nlapiLogExecution( 'DEBUG', 'Calculate Standard Name after ValidateLine','>---START---<');    
		std = nlapiGetCurrentLineItemValue(type,'custrecord_waw_wirestd_standard');
        	fields = nlapiCreateRecord(nlapiGetRecordType()).getAllLineItemFields(type);

        	filters = [];
        	columns = [];
        	filters[0] = new nlobjSearchFilter( 'custrecord_waw_stdpref_standard', null, 'anyOf', std);
        	columns[0] = new nlobjSearchColumn( 'custrecord_waw_itemstd_fieldid', null, null);
        	columns[1] = new nlobjSearchColumn( 'custrecord_waw_stdpref_separator', null, null);        	
        	partofstd = nlapiSearchRecord('customrecord_waw_productstdpref', null,filters, columns);

        	res = [];
        	sep = [];
        	
        	if (partofstd) {
        	    	nlapiLogExecution( 'DEBUG', 'LIST FIELDS','---');
        		for (var cpt=0;cpt<partofstd.length;cpt++) {
        			res[cpt] = partofstd[cpt].getValue(columns[0])
        			switch (partofstd[cpt].getText(columns[1])) {
        				case 'SPACE':
        				    sep[cpt] = ' ';
        				    break;
        				case 'DASH':
        				    sep[cpt] = '-';
        				    break;
        				case 'NONE':
        				    sep[cpt] = '';
        				    break;        				    
        				default:
        				    sep[cpt] = '';
        				    break;
        			}
        			nlapiLogExecution( 'DEBUG', 'Field name',res[cpt]);
        		}
        		nlapiLogExecution( 'DEBUG', 'END LIST FIELDS','---');
        		nlapiLogExecution( 'DEBUG', 'START PARSING LINE','---');
        		for (var cpt=6;cpt<20;cpt++)
        		{	resindex = res.indexOf(fields[cpt]);
        			nlapiLogExecution( 'DEBUG', 'Field position in list', resindex.toString() + '/' + cpt.toString());
        			if (resindex>-1) {
        			    	elemtext = nlapiGetCurrentLineItemText(type,fields[cpt]);
        			    	nlapiLogExecution( 'DEBUG', 'Field text', elemtext);
        			    	nlapiLogExecution( 'DEBUG', 'Add Field', fields[cpt] + 'separator:'+ ((previndex!==null)?sep[previndex]:'NONE')+'!');        			    	
        			    	
        			    	stdtext = stdtext + ((previndex!==null)?sep[previndex]:'') + ((elemtext!==null)?elemtext.toString():'');
        			    	
        			    	nlapiLogExecution( 'DEBUG', 'Standard text', stdtext);
        				previndex = resindex;
        			}
        			else {

        				//nlapiLogExecution( 'DEBUG', 'ENABLE field ', fields[cpt]);									
        			}
        		}
        		nlapiLogExecution( 'DEBUG', 'END PARSING LINE','---');
        		nlapiLogExecution( 'DEBUG', 'Set Standard name=',stdtext);
        		if (stdtext)
        		    nlapiSetCurrentLineItemValue(type,'custrecord_waw_standardtext',stdtext);
        	}
	    }
	    nlapiLogExecution( 'DEBUG', 'Calculate Standard Name after ValidateLine','>---END---<');
	    return true;	    
	}
	catch (e) {
	    if ( e instanceof nlobjError )
		nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		    nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )		
	}			
}




/**
 * After Submit Item Receipt
 *    Create all Properties header for each Wire Material Item type and link to the IR & Item
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
function createWireRMProperties(type){
  
	var cpt = null;
	var cpt2 = null;	
	var cpt3 = null;
	var rec = null;
	var lotprop = null;
	var filters = null;
	var columns = null;
	var lots = null;
	var curritemid = null;
	var curritem = null;
	var invAssignmentCount = null;
	var invDetailSubrecord =null;
	var listexistingprop = null;
	var itemtype = null;
	var allfields = null;
	var property = null;
	var propertyid = null;
	var createprop = null;
	
	try {
	      nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'START' );
	      // init variables
	      	filters = [];
	      	columns = [];
	      	lots = [];
	      	
	      	rec = nlapiGetNewRecord();
	      	
	      // Scan all items 
	      for (cpt=1;cpt<=rec.getLineItemCount('item');cpt++) {
		      
	    	  // Init variable in the loop
	    	  
	    	  lots = [];
	    	  
	    	  //If Wire Raw material
    		  //Search if Lots properties already exist
	    	  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - get Item type['+cpt.toString()+']');
	    	  itemtype = rec.getLineItemValue('item','custcol_wag_itemtype',cpt);
    		  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - Item type='+ itemtype.toString());
	    	  if (itemtype == 9) {
	    		  curritemid = rec.getLineItemValue('item','item',cpt);
	    		  curritem = rec.getLineItemText('item','item',cpt);	
	    		  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - Is Wire material['+curritemid.toString()+','+curritem+']' );	    		  

	    		  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - Get Lots information');
	    		  invDetailSubrecord = rec.viewLineItemSubrecord('item', 'inventorydetail',cpt);
	  			  if (invDetailSubrecord) {
		  			  invAssignmentCount = invDetailSubrecord.getLineItemCount('inventoryassignment');
		  			  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - Number of lots: '+invAssignmentCount );
		  			  allfields = invDetailSubrecord.getAllLineItemFields('inventoryassignment');
		  			  
//		  			  for each(var f in allfields) {
//		  				  nlapiLogExecution('DEBUG','All fields', f);
//		  			  }
		  			  for (cpt2=1; cpt2<=invAssignmentCount; cpt2++) {
		  				  invDetailSubrecord.selectLineItem('inventoryassignment',cpt2);
		  				  lots[cpt2]=invDetailSubrecord.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
//			  			  for each(var f in allfields) {
//			  				nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Line['+cpt2.toString()+'] field['+f+'].value=: '+ invDetailSubrecord.getCurrentLineItemValue('inventoryassignment', f));
//			  				nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Line['+cpt2.toString()+'] field['+f+'].text=: '+ invDetailSubrecord.getCurrentLineItemText('inventoryassignment', f));		  				
//			  			  }		  				  
		  			  }
		  			  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - lots: '+lots.toString() );
		    		  //Scan each lot of the current Item line
		  			  filters[0] = new nlobjSearchFilter( 'name', null, 'any', lots);
		  			  filters[1] = new nlobjSearchFilter( 'custrecord_prop_item', null, 'anyOf', curritem);

		  			  columns[0] = new nlobjSearchColumn( 'name', null, null);
		  			  
		  			  listexistingprop= nlapiSearchRecord('customrecord_nbswa_properties', null,filters, columns);
		  			  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - Creating Properties loop ');
		  			  for (var cpt3=1;cpt3<lots.length;cpt3++) {
		  			      createprop = false;
		  			      property = null;
		  			      propertyid = null;
		  			      if (listexistingprop) { 
		  				  if (listexistingprop.indexOf(lots[cpt3]) === -1) 
		  				      createprop = true;
		  			      }else
		  				  createprop = true;
		  				  //Create New Properties
		  			      if (createprop) {
		  				  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - Creating Properties - lot:'+lots[cpt3]);
		  				  property = nlapiCreateRecord('customrecord_nbswa_properties');
		  			      	  if (property) {
		  					property.setFieldValue('name',lots[cpt3]);
//		  					property.setFieldValue('custrecord_prop_item',curritemid);
//		  					property.setFieldValue('custrecord_prop_location',rec.getCurrentLineItemValue('item','location'));		  					  
		  					propertyid = nlapiSubmitRecord(property, true);
		  					// nlapiSubmitField('customrecord_nbswa_properties',propertyid,'custrecord_nbswa_itemreceipt',rec.getFieldValue('id'));
		  				  }
		  			      }
		  			  }
	  			  }
	    		  
	    		  //if not create it
	    	  }
	    	  else
	    		  nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'Parsing Item Line - Non Wire material' );
	      }
	      
	      
	      nlapiLogExecution( 'DEBUG', 'CreateWireRMProperties', 'END' );

	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )		
	}	
	
}


