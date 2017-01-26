/**

 * Default the departement value into each line 
 * if not empty 
 * copy the value of header's departement field into the sub record departement field each time a line is added
 * If value of departent is changed in the header, parse all lines and update the value
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Feb 2016     david.andre      Work on Raid ID 13 for WA DE
 *
 */

/* This contains the previous value of the department field in the header of the PO
 * This is used to compare and potentially update lines in the PO when the dept is changed and not affect lines where the dept has been put manually
 * 
 */
var previousSelectedDepartment=""

	

	/**
	 * Page Init function to load the departement value into the global variable
	 * 
	 * @param {String} type Access mode: create, copy, edit
	 * @returns {Void}
	 */
	function wa_POInitPage(type){
		
		if (type === "edit") {
			try {
				// Retreive the departement value from the header
				previousSelectedDepartment = nlapiGetFieldValue('department');
		
			}
			catch (e) {
				res = false;
				wa_throwError('WA00001');
			}
		}
	   
	}


	
/**
 * Switch on the field name modified and start the approriate functions.
 * 
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function wa_PurchaseOrderFieldChanged(type, name, linenum){
	var res = true;
	
	switch (name) {
	case 'department':
		// If update the department field from the header only. type=null
		if (type==null) 
			res= wa_UpdateDepartmentOnItemList();
		break;
	}
	return res;
}
/**
 * If the departement value has been changed on the header, update all existing items lines 
 * 
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType

 */

function wa_UpdateDepartmentOnItemList() {

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
		wa_throwError('WA00001');
	}
	
	// If not empty then, update all rows of Items
	
	if (department != '') {

			// Get number of already filled line
		   itemcount = nlapiGetLineItemCount('item');
		   // if more than 0, ask if we need to update the dept information or not. Only those equal to previous dept in header will be update
		   if (itemcount>0) 
		   		if (!confirm("Do you want to update the department information on the purchase order lines?"))
		   			return false;

		   for (cptitems = 1; cptitems <= itemcount; cptitems++)
		   {
			   try {
				   nlapiSelectLineItem('item',cptitems);
				   if (nlapiGetCurrentLineItemValue('item','department') == previousSelectedDepartment)
				   {
				   		nlapiSetCurrentLineItemValue('item', 'department', department);
				   		nlapiCommitLineItem("item");
			   	   }
			   }
			   catch (e) {
					res = false;
				   wa_throwError('WA00002');
			   }
		  }
		   previousSelectedDepartment = department
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
function wa_DefaultDepartementToNewLine(type) {
     
 
	//alert("Enter the Defaulting dept function: "+ type );
	var department ="";
	var linedept = "";
	
	// Only if we are in the Items Tab
	if (type=="item") {
		
			try {
				// Retreive the departement value from the header
				department = nlapiGetFieldValue('department');
				//alert("Department value is :"+department);
			}
			catch (e) {
				wa_throwError('WA00001');
			}
			//if not empty put the value into the departement of the new line
			if (department != '') {
				//Check if the department on the current line is already set by user or not?
				try{
					linedept = nlapiGetCurrentLineItemValue('item','department');
				}
				catch (e) {
						wa_throwError('WA00004');
				}
				if (linedept=="") {
					try{
					//	alert("Now setting the department "+department )
						nlapiSetCurrentLineItemValue('item', 'department', department);
						return true;
					}
					catch (e) {
							wa_throwError('WA00003');
					}
			   }else
				   return true;
				
			}else
				wa_throwError('WA00005');

	}
	return false;
}
