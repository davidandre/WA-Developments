/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Mar 2017     david.andre
 *
 */

function addWireAssistantButton(type, form, request){
		
		var sUrl2 = nlapiResolveURL('SUITELET', 'customscript_waw_wireassistant', 'customdeploy_waw_wireassista');
		sUrl2 = sUrl2 + '&recordid=' + nlapiGetRecordId() +'&record=' + nlapiGetRecordType();
		
		form.addButton('custpage_btn_wireassistant', 'New Wire', 'window.open(\'' + sUrl2 + '\', \'_blank\' )');		
			
}


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function WireAssistant(request, response){
	
	/*
	 * Assistant which allow creation of an Item Wire from the current Product.
	 * 
	 * 
	 */
	var assistant = null;
	var filters = null;
	var columns = null;
	var segments = null;
	var productname = null;
	var prd = null;
	var rectype = null;
	var recid = null;
	var origrecord = null;
	var def = null;
	var desc = null;
	var units = null;
	var diametertxt = null;
	var versiontxt = null;
	var desctxt = null;
	var item = null;
	var itemname = null;
	var itemid = null;
	var segments = null;
	var prodornot = null;
		
	try {
		nlapiLogExecution('DEBUG', 'Wire Assistant', 'Entering Assistant');
	
		// get product info
		rectype = request.getParameter("record")?request.getParameter("record"):request.getParameter("inpt_record");
		recid = request.getParameter("recordid")?request.getParameter("recordid"):request.getParameter("inpt_recordid");		
		prd = nlapiLoadRecord(rectype,recid);
		
		if (prd)
			productname = prd.getFieldValue("name");
		else
			throw('Bad product');
		// Create Assistant
		
	
		 assistant = nlapiCreateAssistant("Wire Item Creation");
		 assistant.setOrdered(true);
		 assistant.setTitle("Wire Item Creation");
		 
	     // Add Steps
	     
		 def = assistant.addStep('Diameter','Wire Definition').setHelpText("Please select the diameter and the Version of the wire you want to create. <br><i>All fields are mandatory</i><br>The selected product is "+productname);
		 desc = assistant.addStep('Wire_Name','Wire Description').setHelpText("Please enter the description of the wire");		 
		 units = assistant.addStep('Units', 'Item Units of measure').setHelpText("Please select the units of measure for the wire");		 
	 
		 nlapiLogExecution('DEBUG', 'Wire Assistant', 'Assistant created');
		 nlapiLogExecution('DEBUG', 'Wire Assistant', 'Last action: '+assistant.getLastAction());
		 nlapiLogExecution('DEBUG', 'Wire Assistant', 'Method: '+request.getMethod());

		 	// Test actions
	     if (request.getMethod()!="GET")
		     switch (assistant.getLastAction()) {
		   		case 'next':
		   			
		   			break;
		        case 'finish':
			          
			            /* 
			             * Grab all information and create Item
			             * 
			             */
		        		nlapiLogExecution('DEBUG', 'Wire Assistant', 'Create Segments Array');
		        		segments = new Array();
		        		segments[0] = '3239';
		        		segments[1] = request.getParameter('_waw_wireproduced');
		        		segments[2] = nlapiLookupField(rectype,recid,'custrecord_waw_product_family');
		        		segments[3] = request.getParameter('_waw_wirediameter');
		        		segments[4] = request.getParameter('_waw_wiretype');
		        		segments[5] = request.getParameter('_waw_wireversion');		        		
		        		segments[6] = nlapiLookupField(rectype,recid,'custrecord_waw_products_name');
			            
		        		nlapiLogExecution('DEBUG', 'Wire Assistant', 'Create Item');
			            item = nlapiCreateRecord('lotnumberedassemblyitem',{customform: 46, recordmode: "dynamic"});
			            item.setFieldValue('custitem_nbswa_itemtype',10);  																			// Wire Production Finished Items
			            item.setFieldValue('custitem_waw_item_product',recid);   																	// Product Reference
			            item.setFieldValue('custitem_nbs_segment1',segments[0]);																	// Segment 1 : Wire
			            item.setFieldValue('custitem_nbs_segment2',segments[1]);																	// Segment 2 : Produced or purchased?
			            item.setFieldValue('custitem_nbs_segment3',segments[2]);																	// Segment 3 : Family			            
			            item.setFieldValue('custitem_nbs_segment4',segments[3]);																	// Segment 4 : Diameter
			            item.setFieldValue('custitem_nbs_segment5',segments[4]);																	// Segment 5 : Version
			            item.setFieldValue('custitem_nbs_segment6',segments[5]);																	// Segment 6 : Version ID
			            item.setFieldValue('custitem_nbs_segment7int',segments[6]);																	// Segment 7 : Product name
			            item.setFieldValue('custitem_waw_bomtype',1);																				// Bom Type		            
			            
			            // Create Item name
			            nlapiLogExecution('DEBUG', 'Wire Assistant', 'Generate Item name');
			            itemname='';
			            for (var cpt=0;cpt<6;cpt++) {
			            	nlapiLogExecution('DEBUG', 'Wire Assistant', 'Item name Element '+cpt);
			            	itemname = itemname + nlapiLookupField('customrecord_nbs_segment',segments[cpt],'custrecord_nbs_code');
			            	nlapiLogExecution('DEBUG', 'Wire Assistant', 'Item name Element value: '+nlapiLookupField('customrecord_nbs_segment',segments[cpt],'custrecord_nbs_code'));			            	
			            }
			            
			            //Add String segment for Segment 7
			            itemname = itemname + segments[6];
			            	
			            nlapiLogExecution('DEBUG', 'Wire Assistant', '      ==> '+itemname);
			            item.setFieldValue('itemid',itemname);
			            item.setFieldValue('displayname',request.getParameter('_waw_description'));
			            item.setFieldValue('description',request.getParameter('_waw_description'));			            

			            // Subsidiary
			            item.setFieldValue('subsidiary',30);

			            //Populate Extra fields
			            
			            
			            // Insert Dummy Component
			            nlapiLogExecution('DEBUG', 'Wire Assistant', 'Insert Dummy Component');
			            item.insertLineItem('member',1);
			            item.setLineItemValue('member','item',1,3104);
			            
			            nlapiLogExecution('DEBUG', 'Wire Assistant', 'Submit Record');
			            itemid = nlapiSubmitRecord(item,true);

			            if (itemid)
			            	assistant.setFinished("You have created a new Wire successfully."+itemid.toString());
			            else
			            	assistant.setFinished("Error while creating the wire.");
			            
			            /*
			             * End creation of Item
			             */
			            response.writePage(assistant);
			            assistant.sendRedirect(response);
			        break;
		        case "cancel":
		        break;
	
		     }     

	     // Display the correct step
	     
	     if (request.getMethod()=="GET")
	    	 assistant.setCurrentStep(assistant.getStep('Diameter'));
	     else
	    	 assistant.setCurrentStep(assistant.getNextStep());
	     
		 if (assistant.getCurrentStep() == null) {
			 assistant.setCurrentStep(assistant.getStep('Diameter'));              
		 }
		 
		// var params = request.getAllParameters()
	//	 for ( param in params )
			// nlapiLogExecution('DEBUG', 'parameter: '+ param, params[param]);

		 
     	var step = assistant.getCurrentStep();
        nlapiLogExecution('DEBUG', 'Wire Assistant', 'Current Step: '+step.getName());
		//Create all fields
        var rectypef = assistant.addField('record','text','Record type');
		var recidf = assistant.addField('recordid','text','Record ID');
		rectypef.setDefaultValue(rectype);
		rectypef.setDisplayType('hidden');
		recidf.setDefaultValue(recid);
		recidf.setDisplayType('hidden');   
		//For Step one
		var diam= assistant.addField('_waw_wirediameter', 'select', 'Diameter');
		var prodornot = assistant.addField('_waw_wireproduced', 'select', 'Type of Wire');
		var type= assistant.addField('_waw_wiretype', 'select', 'Version type');		            		
		var version= assistant.addField('_waw_wireversion', 'select', 'Version');
		//For step two
		var name= assistant.addField('_waw_description', 'text', 'Description');
		// For step three
		var baseunit= assistant.addField('_waw_baseunit', 'select', 'Units');
		
        switch (step.getName()) {
        	case 'Diameter':
        		filters = new Array();
				columns = new Array();
					
				filters[0] = new nlobjSearchFilter( 'custrecord_nbs_relateditemtype', null, 'anyOf', 10);
				filters[1] = new nlobjSearchFilter( 'custrecord_nbs_segmentno', null, 'any', [2, 4,5,6] );							
				columns[0] = new nlobjSearchColumn( 'internalid');
				columns[1] = new nlobjSearchColumn( 'name' );							
				columns[2] = new nlobjSearchColumn( 'custrecord_nbs_code' );							
				columns[3] = new nlobjSearchColumn( 'custrecord_nbs_segmentno' );							
				segments = nlapiSearchRecord('customrecord_nbs_segment', null,filters, columns);
        		
        		// Add values from segments into fields
        		if (segments) {
        			for (var cpt=0;cpt<segments.length;cpt++) {
        				switch (segments[cpt].getValue(columns[3])) {
        				case '2':
        					prodornot.addSelectOption(segments[cpt].getValue(columns[0]),segments[cpt].getValue(columns[1]));        					
        				case '4':
        					diam.addSelectOption(segments[cpt].getValue(columns[0]),segments[cpt].getValue(columns[1]));
        					break;
        				case '5':
        					type.addSelectOption(segments[cpt].getValue(columns[0]),segments[cpt].getValue(columns[1]));
        					break;
        				case '6':
        					version.addSelectOption(segments[cpt].getValue(columns[0]),segments[cpt].getValue(columns[1]));
        					break;
        					
        				}
        			}
        		}
        		prodornot.setMandatory(true);
                diam.setMandatory(true);
                type.setMandatory(true);
                version.setMandatory(true);
                name.setDisplayType('hidden');
                baseunit.setDisplayType('hidden');
        		break;
        	case 'Wire_Name':
        		diametertxt = request.getParameter('inpt__waw_wirediameter');
        		versiontxt = request.getParameter('inpt__waw_wireversion');
        		desc.setHelpText('Please enter the description of the wire.<br>Product: '+productname + '<br>Diameter: '+ diametertxt + '<br> ' + versiontxt);
        		diam.setDisplayType('hidden');
        		diam.setDefaultValue(request.getParameter('_waw_wirediameter'));
        		type.setDisplayType('hidden');
        		type.setDefaultValue(request.getParameter('_waw_wiretype'))
        		version.setDisplayType('hidden');
        		version.setDefaultValue(request.getParameter('_waw_wireversion'));
        		prodornot.setDefaultValue(request.getParameter('_waw_wireproduced'));        		
        		prodornot.setDisplayType('hidden');
        		baseunit.setDisplayType('hidden');
                name.setMandatory(true);		            		
        		break;
        	case 'Units':
        		diametertxt = nlapiLookupField("customrecord_nbs_segment",request.getParameter('_waw_wirediameter'),'name',false);
        		versiontxt = nlapiLookupField("customrecord_nbs_segment",request.getParameter('_waw_wireversion'),'name',false);
        		desctxt= request.getParameter('_waw_description');
        		units.setHelpText('Please enter the Units of the wire.<br>Product: '+productname + '<br>Diameter: '+ diametertxt +'<br>' + versiontxt +'<br>Description:'+desctxt);        		
        		diam.setDisplayType('hidden');
        		diam.setDefaultValue(request.getParameter('_waw_wirediameter'));
        		type.setDisplayType('hidden');
        		type.setDefaultValue(request.getParameter('_waw_wiretype'))
        		version.setDisplayType('hidden');
        		version.setDefaultValue(request.getParameter('_waw_wireversion'));        		
        		name.setDisplayType('hidden');
        		name.setDefaultValue(request.getParameter('_waw_description'));
        		prodornot.setDefaultValue(request.getParameter('_waw_wireproduced'));        		
        		prodornot.setDisplayType('hidden');
        		
        		// baseunit.setMandatory(true);		            		
                break;
        }  
        response.writePage(assistant);
		
	}
	catch (e) {
		if ( e instanceof nlobjError )
		    nlapiLogExecution( 'ERROR', 'system error', e.getCode() + '\n' + e.getDetails() )
		else
		      nlapiLogExecution( 'ERROR', 'unexpected error', e.toString() )
	}
	
	
}
